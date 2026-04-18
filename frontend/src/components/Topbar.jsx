import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, MessageSquare, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Topbar({ title }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifCount, setNotifCount] = useState(0)
  const [msgCount,   setMsgCount]   = useState(0)

  useEffect(() => {
    if (!user) return
    api.get('/notifications/unread/count').then(r => setNotifCount(r.data.count)).catch(() => {})
    api.get('/messages/unread/count').then(r => setMsgCount(r.data.count)).catch(() => {})
  }, [user])

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions">
        <button className="topbar-btn" onClick={() => navigate('/search')}>
          <Search size={18} />
        </button>
        <button className="topbar-btn" onClick={() => navigate('/notifications')}>
          <Bell size={18} />
          {notifCount > 0 && <span className="badge-dot">{notifCount}</span>}
        </button>
        <button className="topbar-btn" onClick={() => navigate('/messages')}>
          <MessageSquare size={18} />
          {msgCount > 0 && <span className="badge-dot">{msgCount}</span>}
        </button>
        <div className="topbar-avatar" onClick={() => navigate('/profile')}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>

      <style>{`
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 32px;
          background: var(--bg2);
          border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 50;
        }
        .topbar-title {
          font-family: var(--font-head);
          font-size: 18px; font-weight: 700;
        }
        .topbar-actions { display: flex; align-items: center; gap: 8px; }
        .topbar-btn {
          position: relative;
          width: 38px; height: 38px;
          border: 1px solid var(--border);
          background: var(--bg3);
          border-radius: var(--radius-sm);
          display: flex; align-items: center; justify-content: center;
          color: var(--text2); cursor: pointer;
          transition: all 0.15s;
        }
        .topbar-btn:hover { border-color: var(--accent); color: var(--accent2); }
        .badge-dot {
          position: absolute; top: -4px; right: -4px;
          min-width: 18px; height: 18px;
          background: var(--lost);
          border-radius: 99px;
          font-size: 10px; font-weight: 700; color: #fff;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px;
        }
        .topbar-avatar {
          width: 38px; height: 38px;
          background: var(--accent);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px; color: #fff;
          cursor: pointer;
          transition: box-shadow 0.15s;
        }
        .topbar-avatar:hover { box-shadow: 0 0 0 3px var(--accent-glow); }
      `}</style>
    </header>
  )
}
