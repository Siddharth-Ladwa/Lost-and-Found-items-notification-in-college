import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Topbar from '../components/Topbar'
import ItemCard from '../components/ItemCard'
import api from '../api/axios'
import { PlusCircle, Search, AlertCircle, CheckSquare, Megaphone } from 'lucide-react'

export default function HomePage() {
  const [recentLost,  setRecentLost]  = useState([])
  const [recentFound, setRecentFound] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [events,      setEvents]      = useState([])
  const [stats,       setStats]       = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/items?type=LOST&size=4').then(r => setRecentLost(r.data.content || [])).catch(()=>{})
    api.get('/items?type=FOUND&size=4').then(r => setRecentFound(r.data.content || [])).catch(()=>{})
    api.get('/announcements').then(r => setAnnouncements((r.data || []).slice(0,3))).catch(()=>{})
    api.get('/events/upcoming').then(r => setEvents((r.data || []).slice(0,3))).catch(()=>{})
    api.get('/items/stats').then(r => setStats(r.data)).catch(()=>{})
  }, [])

  return (
    <>
      <Topbar title="Home" />
      <div className="page-wrapper">
        {/* Hero Banner */}
        <div className="home-hero">
          <div>
            <h1>Lost something?<br/>We'll help you find it.</h1>
            <p>Report lost or found items and connect with your community.</p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/report')}>
                <PlusCircle size={18}/> Report Item
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/search')}>
                <Search size={18}/> Quick Search
              </button>
            </div>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-val text-lost">{stats.totalLost || 0}</span>
              <span>Lost Reports</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-val text-found">{stats.totalFound || 0}</span>
              <span>Found Items</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-val text-accent">{stats.matched || 0}</span>
              <span>Reunited</span>
            </div>
          </div>
        </div>

        {/* Recent Lost */}
        <section className="mt-32">
          <div className="flex-between mb-16">
            <h2 className="section-title"><AlertCircle size={20} className="text-lost"/> Recent Lost Items</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/lost')}>View All →</button>
          </div>
          {recentLost.length ? (
            <div className="grid-4">
              {recentLost.map(item => <ItemCard key={item.id} item={item}/>)}
            </div>
          ) : <p className="text-muted">No lost items reported yet.</p>}
        </section>

        {/* Recent Found */}
        <section className="mt-32">
          <div className="flex-between mb-16">
            <h2 className="section-title"><CheckSquare size={20} className="text-found"/> Recent Found Items</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/found')}>View All →</button>
          </div>
          {recentFound.length ? (
            <div className="grid-4">
              {recentFound.map(item => <ItemCard key={item.id} item={item}/>)}
            </div>
          ) : <p className="text-muted">No found items yet.</p>}
        </section>

        <section className="mt-32">
          <h2 className="section-title mb-16">🎉 Upcoming MonthHistory</h2>
          {events.length ? events.map(ev => (
            <div key={ev.id} className="announcement-item">
              <div className="font-bold">{ev.title}</div>
              {ev.location && <p className="text-sm text-muted mt-4">📍 {ev.location}</p>}
              {ev.eventDate && <p className="text-sm text-muted">🗓 {ev.eventDate?.split('T')[0]}</p>}
            </div>
          )) : <p className="text-muted text-sm">No upcoming history.</p>}
        </section>
      </div>

      <style>{`
        .home-hero {
          background: linear-gradient(135deg, var(--bg2) 0%, var(--surface) 100%);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 40px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 32px;
          background-image: radial-gradient(ellipse at 0% 100%, rgba(108,99,255,0.12) 0%, transparent 60%);
        }
        .home-hero h1 { font-size: 32px; font-weight: 800; line-height: 1.15; margin-bottom: 12px; }
        .home-hero p  { color: var(--text2); margin-bottom: 24px; }
        .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .hero-stats { display: flex; gap: 24px; flex-shrink: 0; }
        .hero-stat { text-align: center; padding: 16px 20px; background: var(--bg3); border-radius: var(--radius); border: 1px solid var(--border); }
        .hero-stat-val { display: block; font-family: var(--font-head); font-size: 32px; font-weight: 800; }
        .hero-stat span:last-child { font-size: 12px; color: var(--text3); }
        .section-title { display: flex; align-items: center; gap: 8px; font-size: 18px; }
        .announcement-item { padding: 14px; background: var(--bg3); border-radius: var(--radius-sm); border: 1px solid var(--border); margin-bottom: 10px; }
        @media (max-width:900px) { .home-hero { flex-direction: column; } .hero-stats { justify-content: center; } }
      `}</style>
    </>
  )
}
