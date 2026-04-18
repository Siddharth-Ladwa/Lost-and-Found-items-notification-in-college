import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Topbar from '../../components/Topbar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Users, Package, AlertCircle, CheckSquare, FileText, Trash2, PlusCircle, ShieldCheck, Edit, X, Bell, Send } from 'lucide-react'

export default function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'dashboard'
  
  const [tab, setTab] = useState(initialTab)
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [items, setItems] = useState([])
  const [notifications, setNotifications] = useState([])
  const [feedback, setFeedback] = useState([])
  const [itemTypeFilter, setItemTypeFilter] = useState('ALL')
  
  const [editingItem, setEditingItem] = useState(null)
  const [evForm,  setEvForm]  = useState({ title:'', description:'', location:'', eventDate:'' })
  const [brForm,  setBrForm]  = useState({ title:'', message:'', type:'SYSTEM' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t) setTab(t)
    api.get('/admin/dashboard').then(r => setStats(r.data)).catch(()=>{})
  }, [searchParams])

  const loadUsers = () => api.get('/admin/users').then(r => setUsers(r.data || [])).catch(()=>{})
  const loadItems = () => api.get('/admin/items').then(r => setItems(r.data || [])).catch(()=>{})
  const loadNotifications = () => api.get('/notifications').then(r => setNotifications(r.data || [])).catch(()=>{})
  const loadFeedback = () => api.get('/admin/feedback').then(r => setFeedback(r.data || [])).catch(()=>{})

  useEffect(() => {
    if (tab === 'users') loadUsers()
    if (tab === 'items') loadItems()
    if (tab === 'notifications') loadNotifications()
    if (tab === 'feedback') loadFeedback()
  }, [tab])

  const deleteUser = async id => {
    if (!window.confirm('Delete user?')) return
    await api.delete(`/admin/users/${id}`); toast.success('Deleted'); loadUsers()
  }

  const handleDeleteItem = async id => {
    if (!window.confirm('Delete this item?')) return
    try {
      await api.delete(`/admin/items/${id}`)
      toast.success('Item deleted')
      loadItems()
    } catch { toast.error('Failed to delete item') }
  }

  const handleUpdateItem = async e => {
    e.preventDefault()
    try {
      await api.put(`/admin/items/${editingItem.id}`, editingItem)
      toast.success('Item updated')
      setEditingItem(null)
      loadItems()
    } catch { toast.error('Failed to update item') }
  }

  const sendBroadcast = async e => {
    e.preventDefault()
    setSending(true)
    try {
      await api.post('/admin/notifications/broadcast', brForm)
      toast.success('Broadcast sent to all users!')
      setBrForm({ title:'', message:'', type:'SYSTEM' })
      loadNotifications()
    } catch { toast.error('Failed to send broadcast') }
    finally { setSending(false) }
  }

  const createEvent = async e => {
    e.preventDefault()
    await api.post('/admin/events', evForm)
    toast.success('Event created!')
    setEvForm({ title:'', description:'', location:'', eventDate:'' })
  }

  const deleteFeedback = async id => {
    if (!window.confirm('Delete this feedback?')) return
    try {
      await api.delete(`/admin/feedback/${id}`)
      toast.success('Feedback deleted')
      loadFeedback()
    } catch { toast.error('Failed to delete feedback') }
  }

  const statCards = [
    { label:'Total Users',   val: stats.totalUsers   || 0, icon: Users,       color:'var(--accent2)' },
    { label:'Pending Claims',val: stats.activeClaims || 0, icon: FileText,    color:'var(--warning)' },
    { label:'Resolved',      val: stats.resolved     || 0, icon: ShieldCheck, color:'var(--found)'   },
  ]

  const TABS = [
    {id:'dashboard', label:'Dashboard'},
    {id:'users',     label:'Users'},
    {id:'items',     label:'Items'},
    {id:'notifications', label:'Notifications'},
    {id:'feedback',      label:'Feedback'},
    {id:'monthhistory',  label:'MonthHistory'},
  ]

  const filteredItems = items.filter(i => {
    if (itemTypeFilter === 'ALL') return true
    return i.type === itemTypeFilter
  })

  return (
    <>
      <Topbar title="Admin Panel"/>
      <div className="page-wrapper">
        <div className="page-header"><h1>⚙️ Admin Panel</h1><p>Manage the entire Lost & Found system</p></div>

        {/* Admin Tabs */}
        <div className="admin-tabs mb-24">
          {TABS.map(t => (
            <button key={t.id} className={`admin-tab ${tab===t.id?'active':''}`} 
              onClick={() => { setTab(t.id); setSearchParams({tab: t.id}) }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {tab === 'dashboard' && (
          <div className="grid-3">
            {statCards.map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{background:`${s.color}22`}}>
                  <s.icon size={22} color={s.color}/>
                </div>
                <div>
                  <div className="stat-value" style={{color:s.color}}>{s.val}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="card table-wrap">
            <h3 className="mb-16">All Users ({users.length})</h3>
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead>
              <tbody>{users.map(u => (
                <tr key={u.id}>
                  <td className="font-bold">{u.name}</td>
                  <td className="text-muted">{u.email}</td>
                  <td className="text-muted">{u.phone || '—'}</td>
                  <td><span className={`badge ${u.role==='ADMIN'?'badge-claimed':'badge-open'}`}>{u.role}</span></td>
                  <td className="text-muted">{u.createdAt?.split('T')[0]}</td>
                  <td>
                    {u.role !== 'ADMIN' && (
                      <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>
                        <Trash2 size={13}/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {/* Items Management */}
        {tab === 'items' && (
          <div className="card table-wrap">
            <div className="flex-between mb-16">
              <h3>Items Management ({filteredItems.length})</h3>
              <div className="flex-gap">
                <button className={`btn btn-sm ${itemTypeFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setItemTypeFilter('ALL')}>All</button>
                <button className={`btn btn-sm ${itemTypeFilter === 'LOST' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setItemTypeFilter('LOST')}>Lost</button>
                <button className={`btn btn-sm ${itemTypeFilter === 'FOUND' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setItemTypeFilter('FOUND')}>Found</button>
              </div>
            </div>
            <table>
              <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Reporter</th><th>Location</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>{filteredItems.map(i => (
                <tr key={i.id}>
                  <td className="font-bold">{i.title}</td>
                  <td><span className={`badge badge-${i.type?.toLowerCase()}`}>{i.type}</span></td>
                  <td><span className={`badge badge-${i.status?.toLowerCase()}`}>{i.status}</span></td>
                  <td className="text-muted">{i.user?.name}</td>
                  <td className="text-muted">{i.location || '—'}</td>
                  <td className="text-muted">{i.createdAt?.split('T')[0]}</td>
                  <td>
                    <div className="flex-gap">
                      <button className="btn btn-outline btn-sm" onClick={() => setEditingItem(i)}>
                        <Edit size={13}/>
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteItem(i.id)}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {/* Notifications */}
        {tab === 'notifications' && (
          <div className="grid-2">
            <div>
              <form className="card" style={{display:'flex',flexDirection:'column',gap:16}} onSubmit={sendBroadcast}>
                <h3 className="flex flex-gap gap-8"><Send size={18}/> Broadcast Notification</h3>
                <p className="text-muted text-sm">Send a message to all registered users</p>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={brForm.title} onChange={e => setBrForm({...brForm,title:e.target.value})} required placeholder="e.g. System Update"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={brForm.type} onChange={e => setBrForm({...brForm,type:e.target.value})}>
                    <option value="SYSTEM">System Notification</option>
                    <option value="ALERT">Alert / Emergency</option>
                    <option value="INFO">Information</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea className="form-textarea" rows={4} value={brForm.message} onChange={e => setBrForm({...brForm,message:e.target.value})} required placeholder="Write your message here..."/>
                </div>
                <button className="btn btn-primary" type="submit" disabled={sending}>
                  {sending ? 'Sending Broadcast...' : 'Broadcast to All Users'}
                </button>
              </form>
            </div>
            <div className="card">
              <h3 className="mb-16 flex flex-gap gap-8"><Bell size={18}/> My Recent Notifications</h3>
              <div className="notif-list-admin">
                {notifications.length === 0 ? <p className="text-muted text-center py-24">No notifications yet</p> : 
                  notifications.slice(0, 10).map(n => (
                    <div key={n.id} className={`notif-item-admin ${!n.read?'unread':''}`}>
                      <div className="font-bold text-sm">{n.title}</div>
                      <div className="text-xs text-muted mb-4">{n.message?.substring(0, 80)}...</div>
                      <div className="text-xs" style={{opacity:0.6}}>{n.createdAt?.split('T')[0]}</div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* MonthHistory */}
        {tab === 'monthhistory' && (
          <div style={{maxWidth:560}}>
            <form className="card" style={{display:'flex',flexDirection:'column',gap:16}} onSubmit={createEvent}>
              <h3 className="flex flex-gap gap-8"><PlusCircle size={18}/> Create MonthHistory</h3>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={evForm.title} onChange={e => setEvForm({...evForm,title:e.target.value})} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" value={evForm.location} onChange={e => setEvForm({...evForm,location:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Date & Time</label>
                <input className="form-input" type="datetime-local" value={evForm.eventDate} onChange={e => setEvForm({...evForm,eventDate:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={3} value={evForm.description} onChange={e => setEvForm({...evForm,description:e.target.value})}/>
              </div>
              <button className="btn btn-primary" type="submit">Create MonthHistory</button>
            </form>
          </div>
        )}

        {/* Feedback Management */}
        {tab === 'feedback' && (
          <div className="card table-wrap">
            <h3 className="mb-16">User Feedback ({feedback.length})</h3>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Rating</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map(f => (
                  <tr key={f.id}>
                    <td className="font-bold">{f.user?.name || 'Anonymous'}</td>
                    <td><span className={`badge badge-${f.type?.toLowerCase() === 'bug' ? 'lost' : 'found'}`}>{f.type}</span></td>
                    <td>{f.subject || '—'}</td>
                    <td title={f.message} style={{maxWidth:250}} className="truncate">{f.message}</td>
                    <td>
                      <div style={{color:'#fbbf24'}}>
                        {'⭐'.repeat(f.rating || 0)}
                      </div>
                    </td>
                    <td className="text-muted">{f.createdAt?.split('T')[0]}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteFeedback(f.id)}>
                        <Trash2 size={13}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {feedback.length === 0 && <p className="text-center text-muted py-24">No feedback received yet.</p>}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Item</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingItem(null)}><X size={18}/></button>
            </div>
            <form onSubmit={handleUpdateItem} style={{display:'flex',flexDirection:'column',gap:16}}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={editingItem.type} onChange={e => setEditingItem({...editingItem, type: e.target.value})}>
                  <option value="LOST">Lost</option>
                  <option value="FOUND">Found</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={editingItem.status} onChange={e => setEditingItem({...editingItem, status: e.target.value})}>
                  <option value="OPEN">Open</option>
                  <option value="CLAIMED">Claimed</option>
                  <option value="MATCHED">Matched</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" value={editingItem.location || ''} onChange={e => setEditingItem({...editingItem, location: e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={3} value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})}/>
              </div>
              <div className="flex-gap mt-16">
                <button className="btn btn-primary" type="submit">Save Changes</button>
                <button className="btn btn-outline" type="button" onClick={() => setEditingItem(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-tabs{display:flex;gap:4px;background:var(--bg3);padding:4px;border-radius:var(--radius-sm);flex-wrap:wrap;}
        .admin-tab{padding:8px 16px;border:none;background:transparent;color:var(--text2);font-family:var(--font-body);font-size:14px;border-radius:6px;cursor:pointer;transition:all 0.15s;}
        .admin-tab:hover{color:var(--text);background:var(--surface);}
        .admin-tab.active{background:var(--accent);color:#fff;}
        .notif-item-admin { padding: 12px 0; border-bottom: 1px solid var(--border); }
        .notif-item-admin:last-child { border-bottom: none; }
        .notif-item-admin.unread { border-left: 2px solid var(--accent); padding-left: 10px; background: var(--surface); margin: 0 -12px; }
      `}</style>
    </>
  )
}
