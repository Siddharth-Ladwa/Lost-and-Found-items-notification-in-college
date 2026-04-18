import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import { LoginPage, RegisterPage } from './pages/Auth/AuthPages'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/Home'
import Dashboard from './pages/Dashboard'
import { AllItemsPage, LostItemsPage, FoundItemsPage, ItemDetailPage } from './pages/Items/ItemPages'
import ReportPage from './pages/Report/ReportPage'
import AdminPage from './pages/Admin/AdminPage'
import {
  SearchPage, NotificationsPage, MessagesPage, ProfilePage,
  FeedbackPage, SupportPage, AnnouncementsPage, MonthHistoryPage, AboutPage
} from './pages/OtherPages'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div className="loading-page"><div className="spinner"/></div>
  if (!user) return <Navigate to="/login"/>
  if (adminOnly && !isAdmin()) return <Navigate to="/dashboard"/>
  return (
    <div className="app-layout">
      <Sidebar/>
      <div className="main-content">{children}</div>
    </div>
  )
}

function RoleBasedRedirect({ children, inverse = false }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <div className="loading-page"><div className="spinner"/></div>
  
  if (inverse) { // For login/register pages
    if (!user) return children
    return isAdmin() ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
  } else { // For the landing page '/'
    if (!user) return children
    return isAdmin() ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
  }
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage/>}/>
      <Route path="/register" element={<RegisterPage/>}/>
      
      {/* Public Landing Page */}
      <Route path="/"              element={<LandingPage/>}/>
      
      {/* Internal Protected Pages */}
      <Route path="/home"          element={<ProtectedRoute><HomePage/></ProtectedRoute>}/>
      <Route path="/dashboard"     element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
      <Route path="/items"         element={<ProtectedRoute><AllItemsPage/></ProtectedRoute>}/>
      <Route path="/items/:id"     element={<ProtectedRoute><ItemDetailPage/></ProtectedRoute>}/>
      <Route path="/search"        element={<ProtectedRoute><SearchPage/></ProtectedRoute>}/>
      <Route path="/report"        element={<ProtectedRoute><ReportPage/></ProtectedRoute>}/>
      <Route path="/lost"          element={<ProtectedRoute><LostItemsPage/></ProtectedRoute>}/>
      <Route path="/found"         element={<ProtectedRoute><FoundItemsPage/></ProtectedRoute>}/>
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage/></ProtectedRoute>}/>
      <Route path="/messages"      element={<ProtectedRoute><MessagesPage/></ProtectedRoute>}/>
      <Route path="/profile"       element={<ProtectedRoute><ProfilePage/></ProtectedRoute>}/>
      <Route path="/feedback"      element={<ProtectedRoute><FeedbackPage/></ProtectedRoute>}/>
      <Route path="/support"       element={<ProtectedRoute><SupportPage/></ProtectedRoute>}/>
      <Route path="/announcements" element={<ProtectedRoute><AnnouncementsPage/></ProtectedRoute>}/>
      <Route path="/monthhistory"        element={<ProtectedRoute><MonthHistoryPage/></ProtectedRoute>}/>
      <Route path="/about"         element={<ProtectedRoute><AboutPage/></ProtectedRoute>}/>
      <Route path="/admin"         element={<ProtectedRoute adminOnly><AdminPage/></ProtectedRoute>}/>
      
      {/* Catch-All */}
      <Route path="*" element={<Navigate to="/"/>}/>
    </Routes>
  )
}

export default function App() {
  return <AuthProvider><AppRoutes/></AuthProvider>
}

