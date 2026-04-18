import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import {
  Home, LayoutDashboard, Package, Search, PlusCircle,
  AlertCircle, CheckSquare, Bell, MessageSquare, User,
  BarChart2, Headphones, MessageCircle, Megaphone, Calendar,
  Info, ShieldCheck, LogOut, ChevronRight
} from 'lucide-react'

const NAV = [
  { group: 'Main',
    items: [
      { to: '/',          icon: Home,          label: 'Home'        },
      { to: '/dashboard', icon: LayoutDashboard,label: 'Dashboard'  },
    ]
  },
  { group: 'Items',
    items: [
      { to: '/items',     icon: Package,       label: 'All Items'   },
      { to: '/search',    icon: Search,        label: 'Search'      },
      { to: '/report',    icon: PlusCircle,    label: 'Report Item' },
      { to: '/lost',      icon: AlertCircle,   label: 'Lost Items'  },
      { to: '/found',     icon: CheckSquare,   label: 'Found Items' },
    ]
  },
  { group: 'Communication',
    items: [
      { to: '/notifications', icon: Bell,         label: 'Notifications' },
    ]
  },
  { group: 'Account',
    items: [
      { to: '/profile',  icon: User,       label: 'Profile'    },
    ]
  },
  { group: 'Info',
    items: [
      { to: '/support',       icon: Headphones,    label: 'Support'       },
      { to: '/feedback',      icon: MessageCircle, label: 'Feedback'      },
      { to: '/monthhistory',  icon: Calendar,      label: 'MonthHistory'  },
      { to: '/about',         icon: Info,          label: 'About'         },
    ]
  },
]

const ADMIN_ITEM = { to: '/admin', icon: ShieldCheck, label: 'Admin Panel' }

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return
    const fetchUnread = () => api.get('/notifications/unread/count').then(r => setUnreadCount(r.data.count || 0)).catch(()=>{})
    fetchUnread()
    const t = setInterval(fetchUnread, 30000)
    return () => clearInterval(t)
  }, [user])

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Package size={20} color="#fff" />
        </div>
        <div>
          <div className="brand-name">Lost & Found</div>
          <div className="brand-sub">City Portal</div>
        </div>
      </div>

      {/* User pill */}
      {user && (
        <div className="sidebar-user">
          <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name truncate">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="sidebar-nav">
        {NAV.map(group => {
          const filteredItems = group.items.filter(item => {
            if (isAdmin()) {
              const toHide = ['All Items', 'Search', 'Report Item', 'Lost Items', 'Found Items', 'Messages', 'Feedback']
              return !toHide.includes(item.label)
            }
            return true
          })

          if (filteredItems.length === 0) return null

          return (
            <div key={group.group} className="nav-group">
              <div className="nav-group-label">{group.group}</div>
              {filteredItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={17} />
                  <span>{item.label}</span>
                  {item.label === 'Notifications' && unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount}</span>
                  )}
                  <ChevronRight size={13} className="nav-chevron" />
                </NavLink>
              ))}
            </div>
          )
        })}

        {isAdmin() && (
          <div className="nav-group">
            <div className="nav-group-label">Admin</div>
            <NavLink
              to={ADMIN_ITEM.to}
              className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}
            >
              <ADMIN_ITEM.icon size={17} />
              <span>{ADMIN_ITEM.label}</span>
              <ChevronRight size={13} className="nav-chevron" />
            </NavLink>
            <NavLink
              to="/admin?tab=items"
              className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}
            >
              <Package size={17} />
              <span>Manage Items</span>
              <ChevronRight size={13} className="nav-chevron" />
            </NavLink>
          </div>
        )}
      </nav>

      {/* Logout */}
      <button className="sidebar-logout" onClick={handleLogout}>
        <LogOut size={16} />
        <span>Logout</span>
      </button>

      <style>{`
        .sidebar {
          position: fixed; left: 0; top: 0; bottom: 0;
          width: var(--nav-width);
          background: hsla(222, 92%, 52%, 1.00); /* Vibrant blue from image */
          border-right: none;
          display: flex; flex-direction: column;
          overflow-y: auto; overflow-x: hidden;
          z-index: 100;
          box-shadow: 4px 0 24px rgba(0,0,0,0.1);
        }
        .sidebar-brand {
          display: flex; align-items: center; gap: 12px;
          padding: 24px 20px 20px;
          flex-shrink: 0;
          color: #ffffff;
        }
        .brand-icon {
          width: 40px; height: 40px;
          background: #ffffff;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: #1459f5;
        }
        .brand-name { font-family: var(--font-head); font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: 0.2px; }
        .brand-sub  { display: none; }

        .sidebar-user {
          display: flex; align-items: center; gap: 12px;
          padding: 16px 20px;
          flex-shrink: 0;
        }
        .user-avatar {
          width: 40px; height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; color: #fff;
          flex-shrink: 0;
        }
        .user-name { font-size: 14px; font-weight: 600; max-width: 140px; color: #ffffff; }
        .user-role { font-size: 12px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }

        .sidebar-nav { flex: 1; padding: 12px 14px; overflow-y: auto; }

        .nav-group { margin-bottom: 12px; }
        .nav-group-label {
          font-size: 12px; font-weight: 500;
          color: rgba(255, 255, 255, 0.6);
          padding: 12px 10px 8px;
        }
        .nav-item {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 16px;
          border-radius: 14px;
          color: rgba(255, 255, 255, 0.75);
          font-size: 14px;
          font-weight: 500;
          transition: all 0.25s ease;
          position: relative;
          margin-bottom: 2px;
          overflow: hidden;
        }
        
        .nav-item:hover { 
          color: #ffffff; 
          background: rgba(255, 255, 255, 0.1);
        }
        
        /* Active Component based on image */
        .nav-item.active { 
          color: #ffffff; 
          background: rgba(255, 255, 255, 0.15); /* Soft white overlay */
          font-weight: 600;
          border: none;
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.1), 0 2px 10px rgba(0,0,0,0.05);
          animation: glowPulse 2.5s infinite alternate;
        }
        
        @keyframes glowPulse {
          0% { box-shadow: inset 0 1px 1px rgba(255,255,255,0.1), 0 2px 10px rgba(0,0,0,0.05); background: rgba(255, 255, 255, 0.15); }
          100% { box-shadow: inset 0 1px 2px rgba(255,255,255,0.3), 0 4px 16px rgba(255,255,255,0.2); background: rgba(255, 255, 255, 0.2); }
        }

        .nav-item.admin-item.active { 
          background: rgba(255, 255, 255, 0.2); 
          color: #fff; 
        }

        .nav-item svg { position: relative; z-index: 1; transition: transform 0.2s ease; opacity: 0.9; }
        .nav-item.active svg { transform: scale(1.05); opacity: 1; }
        .nav-item span { position: relative; z-index: 1; }

        .nav-chevron { margin-left: auto; opacity: 0; transition: all 0.2s ease; position: relative; z-index: 1; }
        .nav-item:hover .nav-chevron, .nav-item.active .nav-chevron { opacity: 1; transform: translateX(2px); }
        
        .notif-badge {
          background: #ffffff; color: #1459f5; font-size: 11px; font-weight: 700;
          padding: 3px 8px; border-radius: 12px; margin-left: auto;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          position: relative; z-index: 1;
        }

        .sidebar-logout {
          display: flex; align-items: center; gap: 14px;
          padding: 18px 24px;
          background: transparent;
          color: rgba(255, 255, 255, 0.75);
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s ease;
          border: none;
          width: 100%;
          flex-shrink: 0;
        }
        .sidebar-logout:hover { 
          background: rgba(255, 255, 255, 0.1); 
          color: #e6e3e3ff; 
        }
        .sidebar-logout svg { opacity: 0.9; transition: transform 0.2s ease; }
        .sidebar-logout:hover svg { transform: translateX(2px); opacity: 1; }
      `}</style>
    </aside>
  )
}
