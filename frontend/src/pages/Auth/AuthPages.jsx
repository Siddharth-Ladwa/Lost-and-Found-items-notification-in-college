import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Package, LogIn } from 'lucide-react'

export function LoginPage() {
  const [form, setForm]   = useState({ email: '', password: '' })
  const [show, setShow]   = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login({ id: data.id, name: data.name, email: data.email, role: data.role }, data.token)
      toast.success(`Welcome back, ${data.name}!`)
      if (data.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-icon"><Package size={24} color="#fff"/></div>
          <h1>Lost & Found</h1>
          <p>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{position:'relative'}}>
              <input className="form-input" type={show ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                style={{paddingRight:42}} required />
              <button type="button" onClick={() => setShow(!show)}
                style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text3)',cursor:'pointer'}}>
                {show ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            <LogIn size={17}/> {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
      <AuthStyle/>
    </div>
  )
}

export function RegisterPage() {
  const [form, setForm]   = useState({ name:'', email:'', phone:'', password:'', confirm:'' })
  const [loading, setLoading] = useState(false)
  const navigate  = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      toast.success('Registered! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const f = (k,v) => setForm({...form, [k]:v})

  return (
    <div className="auth-page">
      <div className="auth-card" style={{maxWidth:480}}>
        <div className="auth-brand">
          <div className="auth-icon"><Package size={24} color="#fff"/></div>
          <h1>Create Account</h1>
          <p>Join the Lost & Found community</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="John Doe"
                value={form.name} onChange={e => f('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="+91 9876543210"
                value={form.phone} onChange={e => f('phone', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => f('email', e.target.value)} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min 6 chars"
                value={form.password} onChange={e => f('password', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm</label>
              <input className="form-input" type="password" placeholder="Repeat password"
                value={form.confirm} onChange={e => f('confirm', e.target.value)} required />
            </div>
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
      <AuthStyle/>
    </div>
  )
}

function AuthStyle() {
  return (
    <style>{`
      .auth-page {
        min-height: 100vh;
        background: var(--bg);
        display: flex; align-items: center; justify-content: center;
        padding: 24px;
        background-image: radial-gradient(ellipse at 20% 50%, rgba(108,99,255,0.08) 0%, transparent 60%),
                          radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.05) 0%, transparent 50%);
      }
      .auth-card {
        background: var(--bg2);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 36px;
        width: 100%; max-width: 420px;
        box-shadow: var(--shadow-lg);
      }
      .auth-brand { text-align: center; margin-bottom: 28px; }
      .auth-icon {
        width: 52px; height: 52px;
        background: var(--accent);
        border-radius: 14px;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 14px;
        box-shadow: 0 0 24px var(--accent-glow);
      }
      .auth-brand h1 { font-size: 22px; margin-bottom: 4px; }
      .auth-brand p  { color: var(--text2); font-size: 14px; }
      .auth-form { display: flex; flex-direction: column; gap: 16px; }
      .auth-footer { text-align: center; margin-top: 20px; color: var(--text2); font-size: 14px; }
    `}</style>
  )
}
