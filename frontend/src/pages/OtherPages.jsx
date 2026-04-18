import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Topbar from '../components/Topbar'
import ItemCard from '../components/ItemCard'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Search as SearchIcon, Bell, Send, User, BarChart2, MessageSquare,
         Headphones, MessageCircle, Megaphone, Calendar, Info, MapPin, Star } from 'lucide-react'

// ── SEARCH ────────────────────────────────────────────────────
export function SearchPage() {
  const [params] = useSearchParams()
  const [items, setItems]   = useState([])
  const [categories, setCats] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    keyword: params.get('q') || '', type:'', categoryId:'', location:''
  })

  useEffect(() => { api.get('/items/categories').then(r => setCats(r.data || [])).catch(()=>{}) },[])

  const search = () => {
    setLoading(true)
    const p = new URLSearchParams()
    Object.entries(form).forEach(([k,v]) => { if(v) p.append(k,v) })
    p.append('size','20')
    api.get(`/items?${p}`).then(r => setItems(r.data.content || [])).catch(()=>{}).finally(()=>setLoading(false))
  }

  useEffect(() => { if(form.keyword) search() }, [])

  return (
    <>
      <Topbar title="Search"/>
      <div className="page-wrapper">
        <div className="page-header"><h1>Search Items</h1><p>Find lost or found items across the system</p></div>
        <div className="card mb-24" style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="search-bar">
            <SearchIcon size={16} className="search-icon"/>
            <input className="form-input" placeholder="Search by keyword, description…"
              value={form.keyword} onChange={e => setForm({...form, keyword: e.target.value})}
              onKeyDown={e => e.key==='Enter' && search()}/>
          </div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <select className="form-select" style={{flex:1,minWidth:140}} value={form.type}
              onChange={e => setForm({...form, type:e.target.value})}>
              <option value="">All Types</option>
              <option value="LOST">Lost</option>
              <option value="FOUND">Found</option>
            </select>
            <select className="form-select" style={{flex:1,minWidth:160}} value={form.categoryId}
              onChange={e => setForm({...form, categoryId:e.target.value})}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className="form-input" style={{flex:1,minWidth:160}} placeholder="Location…"
              value={form.location} onChange={e => setForm({...form, location:e.target.value})}/>
            <button className="btn btn-primary" onClick={search}><SearchIcon size={15}/> Search</button>
          </div>
        </div>
        {loading
          ? <div className="loading-page"><div className="spinner"/></div>
          : items.length
            ? <><p className="text-muted text-sm mb-16">{items.length} result(s) found</p>
                <div className="grid-4">{items.map(i => <ItemCard key={i.id} item={i}/>)}</div></>
            : form.keyword && <div className="empty-state"><SearchIcon size={48}/><h3>No results</h3><p>Try different keywords</p></div>
        }
      </div>
    </>
  )
}

// ── NOTIFICATIONS ─────────────────────────────────────────────
export function NotificationsPage() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.get('/notifications').then(r => setNotifs(r.data || [])).finally(()=>setLoading(false))
  }

  useEffect(load, [])

  const markAll = () => {
    api.put('/notifications/read-all').then(() => { toast.success('All marked as read'); load() })
  }
  const markOne = id => {
    api.put(`/notifications/${id}/read`).then(load)
  }

  const typeColor = { CLAIM:'var(--warning)', MATCH:'var(--found)', SYSTEM:'var(--accent2)', ALERT:'var(--lost)' }

  return (
    <>
      <Topbar title="Notifications"/>
      <div className="page-wrapper">
        <div className="page-header flex-between">
          <div><h1>Notifications</h1></div>
          <button className="btn btn-outline btn-sm" onClick={markAll}>Mark All as Read</button>
        </div>
        {loading ? <div className="loading-page"><div className="spinner"/></div>
          : notifs.length === 0 ? <div className="empty-state"><Bell size={48}/><h3>No notifications</h3></div>
          : notifs.map(n => (
            <div key={n.id} className={`notif-row ${!n.read?'unread':''}`} onClick={() => !n.read && markOne(n.id)}>
              <div className="notif-dot" style={{background: typeColor[n.type] || 'var(--accent2)'}}/>
              <div style={{flex:1}}>
                <div className="font-bold">{n.title}</div>
                <div className="text-sm text-muted">{n.message}</div>
                <div className="text-xs mt-4">{n.createdAt?.split('T')[0]}</div>
              </div>
              <span className="badge" style={{background:`${typeColor[n.type]}22`, color:typeColor[n.type]}}>{n.type}</span>
            </div>
          ))
        }
      </div>
      <style>{`
        .notif-row{display:flex;align-items:flex-start;gap:14px;padding:14px 16px;border-radius:var(--radius-sm);margin-bottom:8px;background:var(--bg2);border:1px solid var(--border);cursor:pointer;transition:border-color 0.15s;}
        .notif-row.unread{border-color:var(--accent);background:var(--surface);}
        .notif-row:hover{border-color:var(--accent2);}
        .notif-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:5px;}
      `}</style>
    </>
  )
}

// ── MESSAGES ─────────────────────────────────────────────────
export function MessagesPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [chatUsers, setChatUsers] = useState([])
  const [selected, setSelected] = useState(searchParams.get('to') ? Number(searchParams.get('to')) : null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')

  useEffect(() => { api.get('/messages/chats').then(r => setChatUsers(r.data || [])).catch(()=>{}) },[])

  useEffect(() => {
    if (!selected) return
    api.get(`/messages/conversation/${selected}`).then(r => setMessages(r.data || [])).catch(()=>{})
    const t = setInterval(() => {
      api.get(`/messages/conversation/${selected}`).then(r => setMessages(r.data || [])).catch(()=>{})
    }, 3000)
    return () => clearInterval(t)
  }, [selected])

  const sendMsg = async () => {
    if (!text.trim() || !selected) return
    await api.post('/messages', { receiverId: selected, content: text })
    setText('')
    api.get(`/messages/conversation/${selected}`).then(r => setMessages(r.data || []))
  }

  return (
    <>
      <Topbar title="Messages"/>
      <div className="page-wrapper" style={{padding:0}}>
        <div className="messages-layout">
          <div className="chat-sidebar">
            <div className="chat-sidebar-head">Messages</div>
            {chatUsers.length === 0 && <p className="text-muted text-sm" style={{padding:'16px'}}>No conversations yet</p>}
            {chatUsers.map(u => (
              <div key={u.id} className={`chat-user ${selected===u.id?'active':''}`} onClick={() => setSelected(u.id)}>
                <div className="chat-user-avatar">{u.name?.charAt(0)}</div>
                <div>
                  <div className="font-bold text-sm">{u.name}</div>
                  <div className="text-xs text-muted">{u.email}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="chat-main">
            {selected
              ? <>
                  <div className="chat-messages">
                    {messages.map(m => (
                      <div key={m.id} className={`chat-bubble ${m.sender?.id===user?.id?'mine':'theirs'}`}>
                        {m.content}
                        <span className="bubble-time">{m.sentAt?.split('T')[1]?.slice(0,5)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chat-input">
                    <input className="form-input" placeholder="Type a message…"
                      value={text} onChange={e => setText(e.target.value)}
                      onKeyDown={e => e.key==='Enter' && sendMsg()}/>
                    <button className="btn btn-primary" onClick={sendMsg}><Send size={16}/></button>
                  </div>
                </>
              : <div className="flex-center" style={{flex:1,flexDirection:'column',gap:12,color:'var(--text3)'}}>
                  <MessageSquare size={48}/><p>Select a conversation</p>
                </div>
            }
          </div>
        </div>
      </div>
      <style>{`
        .messages-layout{display:flex;height:calc(100vh - 65px);}
        .chat-sidebar{width:260px;border-right:1px solid var(--border);overflow-y:auto;background:var(--bg2);}
        .chat-sidebar-head{padding:16px;font-weight:700;font-family:var(--font-head);border-bottom:1px solid var(--border);}
        .chat-user{display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;transition:background 0.15s;}
        .chat-user:hover{background:var(--surface);}
        .chat-user.active{background:var(--accent-glow);border-right:2px solid var(--accent);}
        .chat-user-avatar{width:36px;height:36px;background:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;flex-shrink:0;}
        .chat-main{flex:1;display:flex;flex-direction:column;background:var(--bg);}
        .chat-messages{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:8px;}
        .chat-bubble{max-width:65%;padding:10px 14px;border-radius:14px;font-size:14px;position:relative;}
        .chat-bubble.mine{align-self:flex-end;background:var(--accent);color:#fff;border-bottom-right-radius:4px;}
        .chat-bubble.theirs{align-self:flex-start;background:var(--surface);border-bottom-left-radius:4px;}
        .bubble-time{display:block;font-size:10px;opacity:0.6;margin-top:4px;text-align:right;}
        .chat-input{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--border);background:var(--bg2);}
      `}</style>
    </>
  )
}

export function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState({})
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // We still load the initial data from the API
    api.get('/profile').then(r => { 
      // Merging with any local changes that might exist in AuthContext
      const merged = { ...r.data, ...user }
      setProfile(merged); 
      setForm(merged) 
    }).finally(()=>setLoading(false))
  }, [])

  const save = async () => {
    // REMOVED: api.put('/profile', ...)
    updateUser({ name: form.name, phone: form.phone, address: form.address })
    setProfile({...profile, ...form})
    setEdit(false)
    toast.success('Profile updated (Local Browser Only)!')
  }

  if (loading) return <div className="loading-page"><div className="spinner"/></div>

  return (
    <>
      <Topbar title="Profile"/>
      <div className="page-wrapper">
        <div style={{maxWidth:600}}>
          <div className="card" style={{textAlign:'center',padding:'36px 24px'}}>
            <div className="profile-avatar">{profile.name?.charAt(0)}</div>
            <h2 style={{marginTop:16}}>{profile.name}</h2>
            <p className="text-muted">{profile.email}</p>
            <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:12}}>
              <span className="badge badge-open">{profile.role}</span>
              {profile.verified && <span className="badge badge-found">✓ Verified</span>}
            </div>
          </div>

          <div className="card mt-16" style={{display:'flex',flexDirection:'column',gap:16}}>
            <div className="flex-between">
              <h3>Personal Information</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setEdit(!edit)}>
                {edit ? 'Cancel' : '✏️ Edit'}
              </button>
            </div>
            {['name','phone','address'].map(k => (
              <div key={k} className="form-group">
                <label className="form-label">{k.charAt(0).toUpperCase()+k.slice(1)}</label>
                {edit
                  ? <input className="form-input" value={form[k]||''} onChange={e => setForm({...form,[k]:e.target.value})}/>
                  : <div className="profile-field">{profile[k] || <span className="text-muted">Not set</span>}</div>
                }
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Member Since</label>
              <div className="profile-field">{profile.createdAt?.split('T')[0]}</div>
            </div>
            {edit && <button className="btn btn-primary" onClick={save}>Save Changes</button>}
          </div>
        </div>
      </div>
      <style>{`
        .profile-avatar{width:80px;height:80px;background:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#fff;margin:0 auto;box-shadow:0 0 30px var(--accent-glow);}
        .profile-field{padding:10px 14px;background:var(--bg3);border-radius:var(--radius-sm);font-size:14px;border:1px solid var(--border);}
      `}</style>
    </>
  )
}


// ── FEEDBACK ──────────────────────────────────────────────────
export function FeedbackPage() {
  const [form, setForm] = useState({ type:'FEEDBACK', subject:'', message:'', rating: 5 })
  const [loading, setLoading] = useState(false)
  const f = (k,v) => setForm({...form,[k]:v})

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/feedback', form)
      toast.success('Feedback submitted! Thank you 🙏')
      setForm({ type:'FEEDBACK', subject:'', message:'', rating:5 })
    } catch { toast.error('Failed to submit') } finally { setLoading(false) }
  }

  return (
    <>
      <Topbar title="Feedback"/>
      <div className="page-wrapper">
        <div className="page-header"><h1>Submit Feedback</h1><p>Help us improve the system</p></div>
        <div style={{maxWidth:560}}>
          <form className="card" style={{display:'flex',flexDirection:'column',gap:16}} onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={e => f('type',e.target.value)}>
                <option value="FEEDBACK">General Feedback</option>
                <option value="SUGGESTION">Suggestion</option>
                <option value="BUG">Bug Report</option>
                <option value="COMPLAINT">Complaint</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input className="form-input" value={form.subject} onChange={e => f('subject',e.target.value)} placeholder="Brief subject…"/>
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea className="form-textarea" rows={5} value={form.message} onChange={e => f('message',e.target.value)} placeholder="Tell us your thoughts…" required/>
            </div>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div style={{display:'flex',gap:8}}>
                {[1,2,3,4,5].map(n => (
                  <button type="button" key={n} onClick={() => f('rating',n)}
                    style={{fontSize:24,background:'none',border:'none',cursor:'pointer',opacity:form.rating>=n?1:0.3}}>⭐</button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
              {loading ? 'Submitting…' : '📤 Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

// ── SUPPORT ───────────────────────────────────────────────────
export function SupportPage() {
  const faqs = [
    { q: 'How do I report a lost item?', a: 'Click "Report Item" in the sidebar, select "I Lost Something", fill in the details and submit.' },
    { q: 'How do I claim a found item?', a: 'Browse found items, open the detail page, and click "Claim This Item". Provide proof of ownership.' },
    { q: 'How long are items kept in the system?', a: 'Items remain active until marked as closed by the owner or admin.' },
    { q: 'Can I message the person who found my item?', a: 'Yes! Use the "Message Owner" button on any item detail page.' },
    { q: 'How do I change my password?', a: 'Currently password changes require contacting admin. Self-service will be available soon.' },
  ]

  return (
    <>
      <Topbar title="Support"/>
      <div className="page-wrapper">
        <div className="page-header"><h1>Help & Support</h1><p>Find answers to common questions</p></div>
        <div style={{maxWidth:680}}>
          <h2 className="mb-16">Frequently Asked Questions</h2>
          {faqs.map((f,i) => <FaqItem key={i} q={f.q} a={f.a}/>)}
          <div className="card mt-32" style={{textAlign:'center',padding:'32px'}}>
            <Headphones size={40} color="var(--accent2)" style={{margin:'0 auto 12px'}}/>
            <h3>Still need help?</h3>
            <p className="text-muted mt-8 mb-16">Contact our support team</p>
            <a className="btn btn-primary" href="mailto:support@lostandfound.com">📧 Email Support</a>
          </div>
        </div>
      </div>
    </>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item" onClick={() => setOpen(!open)}>
      <div className="flex-between"><span className="font-bold">{q}</span><span>{open ? '−' : '+'}</span></div>
      {open && <p className="text-muted text-sm mt-8">{a}</p>}
      <style>{`.faq-item{padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;cursor:pointer;transition:border-color 0.15s;}.faq-item:hover{border-color:var(--accent2);}`}</style>
    </div>
  )
}

// ── ANNOUNCEMENTS ─────────────────────────────────────────────
export function AnnouncementsPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.get('/announcements').then(r => setList(r.data || [])).finally(()=>setLoading(false)) },[])

  const typeColor = { UPDATE:'var(--found)', NOTICE:'var(--accent2)', MAINTENANCE:'var(--warning)', GOVERNMENT:'var(--lost)' }

  return (
    <>
      <Topbar title="Announcements"/>
      <div className="page-wrapper">
        <div className="page-header"><h1>Announcements</h1><p>Latest updates and notices</p></div>
        {loading ? <div className="loading-page"><div className="spinner"/></div>
          : list.length === 0 ? <div className="empty-state"><Megaphone size={48}/><h3>No announcements</h3></div>
          : list.map(a => (
            <div key={a.id} className="card mb-16" style={{borderLeft:`3px solid ${typeColor[a.type]||'var(--border2)'}`}}>
              <div className="flex-between mb-8">
                <span className="badge" style={{background:`${typeColor[a.type]}22`,color:typeColor[a.type]}}>{a.type}</span>
                <span className="text-xs">{a.createdAt?.split('T')[0]}</span>
              </div>
              <h3>{a.title}</h3>
              <p className="text-muted mt-8">{a.content}</p>
            </div>
          ))
        }
      </div>
    </>
  )
}

// ── MONTH HISTORY (FORMERLY EVENTS) ───────────────────────────
export function MonthHistoryPage() {
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [tab, setTab] = useState('upcoming')

  useEffect(() => {
    api.get('/events/upcoming').then(r => setUpcoming(r.data || [])).catch(()=>{})
    api.get('/events/past').then(r => setPast(r.data || [])).catch(()=>{})
  },[])

  const list = tab === 'upcoming' ? upcoming : past

  return (
    <>
      <Topbar title="MonthHistory"/>
      <div className="page-wrapper">
        <div className="page-header"><h1>MonthHistory</h1></div>
        <div className="tabs mb-24" style={{maxWidth:320}}>
          <button className={`tab ${tab==='upcoming'?'active':''}`} onClick={() => setTab('upcoming')}>Upcoming</button>
          <button className={`tab ${tab==='past'?'active':''}`} onClick={() => setTab('past')}>Past</button>
        </div>
        {list.length === 0
          ? <div className="empty-state"><Calendar size={48}/><h3>No month history items</h3></div>
          : <div className="grid-3">{list.map(ev => (
              <div key={ev.id} className="card card-hover">
                <div className="font-bold" style={{fontSize:16}}>{ev.title}</div>
                {ev.location && <p className="text-sm text-muted mt-8 flex flex-gap gap-4"><MapPin size={13}/>{ev.location}</p>}
                {ev.eventDate && <p className="text-sm text-muted flex flex-gap gap-4"><Calendar size={13}/>{ev.eventDate?.split('T')[0]}</p>}
                {ev.description && <p className="text-sm text-muted mt-8">{ev.description?.substring(0,120)}</p>}
              </div>
            ))}</div>
        }
      </div>
    </>
  )
}

// ── ABOUT ─────────────────────────────────────────────────────
export function AboutPage() {
  return (
    <>
      <Topbar title="About"/>
      <div className="page-wrapper">
        <div style={{maxWidth:680}}>
          <div className="page-header"><h1>About Lost & Found</h1></div>
          <div className="card mb-16">
            <h3 className="mb-12">🏛️ How It Works</h3>
            <ol style={{paddingLeft:20, lineHeight:2, color:'var(--text2)', fontSize:14}}>
              <li>Register and create your account</li>
              <li>Report a lost or found item with details and photos</li>
              <li>The system matches similar lost and found reports</li>
              <li>Users submit claims with proof of ownership</li>
              <li>Owner verifies and hands over the item</li>
            </ol>
          </div>
          <div className="card mb-16">
            <h3 className="mb-12">📋 Terms & Conditions</h3>
            <p className="text-muted text-sm" style={{lineHeight:1.8}}>
              By using this platform, you agree to provide accurate information about lost and found items. Misuse of the system, including false claims, is prohibited and may result in account suspension. All transactions are between users; the system acts only as a facilitator.
            </p>
          </div>
          <div className="card mb-16">
            <h3 className="mb-12">🔒 Privacy Policy</h3>
            <p className="text-muted text-sm" style={{lineHeight:1.8}}>
              Your personal information is used solely to operate the Lost & Found service. We do not sell data to third parties. Contact information is shared only when both parties agree to proceed with a return.
            </p>
          </div>
          <div className="card">
            <h3 className="mb-12">👥 Our Team</h3>
            <p className="text-muted text-sm">Built with ❤️ to help communities reunite with their belongings.</p>
          </div>
        </div>
      </div>
    </>
  )
}
