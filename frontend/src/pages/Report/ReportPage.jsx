import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Topbar from '../../components/Topbar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Upload, X } from 'lucide-react'

export default function ReportPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [form, setForm] = useState({
    type: 'LOST', title:'', description:'', location:'',
    categoryId:'', dateLostFound:'', color:'', brand:'', image: null
  })

  useEffect(() => {
    api.get('/items/categories').then(r => setCategories(r.data || [])).catch(()=>{})
  }, [])

  const f = (k,v) => setForm({...form, [k]:v})

  const handleImage = e => {
    const file = e.target.files[0]
    if (!file) return
    setForm({...form, image: file})
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k,v]) => {
        if (k !== 'image') {
          // Send empty string if null/undefined, ensures parameter reaches backend
          fd.append(k, v === null || v === undefined ? '' : v)
        }
      })
      if (form.image) fd.append('image', form.image)
      const { data } = await api.post('/items', fd)
      toast.success('Item reported successfully!')
      navigate(`/items/${data.id}`)
    } catch {
      toast.error('Failed to report item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Topbar title="Report Item"/>
      <div className="page-wrapper">
        <div className="page-header">
          <h1>Report an Item</h1>
          <p>Fill in the details below to report a lost or found item</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="report-grid">
            <div style={{display:'flex', flexDirection:'column', gap:20}}>
              {/* Type Toggle */}
              <div className="card">
                <label className="form-label">Item Type *</label>
                <div className="tabs mt-8">
                  <button type="button" className={`tab ${form.type==='LOST'?'active':''}`}
                    onClick={() => f('type','LOST')}
                    style={form.type==='LOST'?{background:'var(--lost)'}:{}}>
                    🔴 I Lost Something
                  </button>
                  <button type="button" className={`tab ${form.type==='FOUND'?'active':''}`}
                    onClick={() => f('type','FOUND')}
                    style={form.type==='FOUND'?{background:'var(--found)'}:{}}>
                    🟢 I Found Something
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <div className="card" style={{display:'flex', flexDirection:'column', gap:16}}>
                <h3>Item Information</h3>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" placeholder="e.g. Black leather wallet"
                    value={form.title} onChange={e => f('title', e.target.value)} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Describe the item in detail…"
                    value={form.description} onChange={e => f('description', e.target.value)}/>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input className="form-input" placeholder="e.g. Samsung"
                      value={form.brand} onChange={e => f('brand', e.target.value)}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <input className="form-input" placeholder="e.g. Black"
                      value={form.color} onChange={e => f('color', e.target.value)}/>
                  </div>
                </div>
              </div>

              {/* Location + Date */}
              <div className="card" style={{display:'flex', flexDirection:'column', gap:16}}>
                <h3>Where & When</h3>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input className="form-input" placeholder="e.g. City Bus Stand, Platform 3"
                    value={form.location} onChange={e => f('location', e.target.value)}/>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input className="form-input" type="date"
                      value={form.dateLostFound} onChange={e => f('dateLostFound', e.target.value)}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.categoryId}
                      onChange={e => f('categoryId', e.target.value)}>
                      <option value="">Select…</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <div className="card">
                <h3 className="mb-16">Upload Image</h3>
                <label className="upload-zone">
                  <input type="file" accept="image/*" onChange={handleImage} style={{display:'none'}}/>
                  {preview
                    ? <>
                        <img src={preview} alt="preview" className="img-fit-contain" style={{borderRadius:8, maxHeight:'280px', marginBottom:12}}/>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => {setPreview(null); f('image',null)}}>
                          <X size={14}/> Remove
                        </button>
                      </>
                    : <>
                        <Upload size={36} color="var(--text3)" style={{margin:'0 auto 12px'}}/>
                        <p className="text-muted text-sm">Click to upload image</p>
                        <p className="text-xs">PNG, JPG up to 5MB</p>
                      </>
                  }
                </label>
              </div>

              <div className="card mt-16">
                <h3 className="mb-12">Tips</h3>
                <ul className="tips-list">
                  <li>Be as specific as possible in your description</li>
                  <li>Include unique identifiers (serial numbers, initials)</li>
                  <li>Add a clear photo if available</li>
                  <li>Mention the exact location and time</li>
                </ul>
              </div>

              <button className="btn btn-primary btn-full btn-lg mt-16" type="submit" disabled={loading}>
                {loading ? 'Submitting…' : `📤 Submit ${form.type === 'LOST' ? 'Lost' : 'Found'} Report`}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .report-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 24px; }
        .upload-zone {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          border: 2px dashed var(--border2); border-radius: var(--radius);
          padding: 32px 16px; cursor: pointer; transition: border-color 0.18s;
          min-height: 200px;
        }
        .upload-zone:hover { border-color: var(--accent); }
        .tips-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .tips-list li { font-size: 13px; color: var(--text2); padding-left: 20px; position: relative; }
        .tips-list li::before { content: '✓'; position: absolute; left: 0; color: var(--found); font-weight: 700; }
        @media (max-width: 900px) { .report-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  )
}
