import { useState, useEffect } from 'react'
import Topbar from '../components/Topbar'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { AlertCircle, CheckSquare, FileText, CheckCircle2, Bell } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats,   setStats]   = useState({})
  const [myItems, setMyItems] = useState([])
  const [notifs,  setNotifs]  = useState([])

  useEffect(() => {
    api.get('/items/stats').then(r => setStats(r.data)).catch(()=>{})
    api.get('/items/my?size=5').then(r => setMyItems(r.data.content || [])).catch(()=>{})
    api.get('/notifications').then(r => setNotifs((r.data || []).slice(0,5))).catch(()=>{})
  }, [])

  const statCards = [
    { label: 'Total Lost',    val: stats.totalLost    || 0, icon: AlertCircle,  color: 'var(--lost)',    bg: 'var(--lost-dim)'  },
    { label: 'Total Found',   val: stats.totalFound   || 0, icon: CheckSquare,  color: 'var(--found)',   bg: 'var(--found-dim)' },
    { label: 'Active Claims', val: stats.activeClaims || 0, icon: FileText,     color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Matched',       val: stats.matched      || 0, icon: CheckCircle2, color: 'var(--accent2)', bg: 'var(--accent-glow)' },
  ]

  return (
    <>
      <Topbar title="Dashboard"/>
      <div className="page-wrapper">
        <div className="page-header">
          <h1>Welcome back, {user?.name} 👋</h1>
          <p>Here's your activity overview</p>
        </div>

        {/* Stats */}
        <div className="grid-4">
          {statCards.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{background: s.bg}}>
                <s.icon size={22} color={s.color}/>
              </div>
              <div>
                <div className="stat-value" style={{color: s.color}}>{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* My Recent Reports */}
        <div className="card mt-32">
          <h3 className="mb-16">My Recent Reports</h3>
          {myItems.length === 0
            ? <p className="text-muted text-sm">You haven't reported any items yet.</p>
            : myItems.map(item => (
              <div key={item.id} className="dash-item-row">
                <div>
                  <div className="font-bold text-sm">{item.title}</div>
                  <div className="text-xs">{item.location || 'No location'}</div>
                </div>
                <div style={{display:'flex', gap:6, alignItems:'center'}}>
                  <span className={`badge badge-${item.type?.toLowerCase()}`}>{item.type}</span>
                  <span className={`badge badge-${item.status?.toLowerCase()}`}>{item.status}</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      <style>{`
        .dash-item-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
          gap: 12px;
        }
        .dash-item-row:last-child { border-bottom: none; }
        .unread-row { padding: 10px 8px; margin: 0 -8px; border-radius: var(--radius-sm); background: var(--surface); }
      `}</style>
    </>
  )
}
