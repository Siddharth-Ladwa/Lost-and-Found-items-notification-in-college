import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Topbar from '../../components/Topbar'
import ItemCard from '../../components/ItemCard'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { MapPin, Calendar, Tag, User, Package, Trash2, Edit } from 'lucide-react'

// ── Shared Items List ─────────────────────────────────────────
function ItemsList({ type, title }) {
  const [items,      setItems]      = useState([])
  const [categories, setCategories] = useState([])
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading,    setLoading]    = useState(false)
  const [filters, setFilters] = useState({ categoryId:'', location:'', keyword:'' })

  useEffect(() => { api.get('/items/categories').then(r => setCategories(r.data || [])).catch(()=>{}) }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ ...(type && {type}), page, size:12,
      ...(filters.categoryId && {categoryId: filters.categoryId}),
      ...(filters.location   && {location:   filters.location}),
      ...(filters.keyword    && {keyword:     filters.keyword}),
    })
    api.get(`/items?${params}`)
      .then(r => { setItems(r.data.content || []); setTotalPages(r.data.totalPages || 0) })
      .catch(()=>{})
      .finally(() => setLoading(false))
  }, [type, page, filters])

  const f = (k,v) => { setFilters({...filters,[k]:v}); setPage(0) }

  return (
    <>
      <Topbar title={title}/>
      <div className="page-wrapper">
        <div className="page-header flex-between">
          <div><h1>{title}</h1></div>
        </div>

        {/* Filters */}
        <div className="filters-bar card mb-24">
          <div className="search-bar" style={{flex:2}}>
            <span className="search-icon">🔍</span>
            <input className="form-input" placeholder="Search by keyword…" value={filters.keyword}
              onChange={e => f('keyword', e.target.value)}/>
          </div>
          <select className="form-select" style={{flex:1}} value={filters.categoryId}
            onChange={e => f('categoryId', e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="form-input" style={{flex:1}} placeholder="Location…"
            value={filters.location} onChange={e => f('location', e.target.value)}/>
        </div>

        {loading
          ? <div className="loading-page"><div className="spinner"/></div>
          : items.length
            ? <div className="grid-4">{items.map(i => <ItemCard key={i.id} item={i}/>)}</div>
            : <div className="empty-state"><Package size={48}/><h3>No items found</h3><p>Try adjusting your filters</p></div>
        }

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(p=>p-1)} disabled={page===0}>‹</button>
            {[...Array(totalPages)].map((_,i) => (
              <button key={i} className={page===i?'active':''} onClick={() => setPage(i)}>{i+1}</button>
            ))}
            <button onClick={() => setPage(p=>p+1)} disabled={page===totalPages-1}>›</button>
          </div>
        )}
      </div>
      <style>{`.filters-bar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;}`}</style>
    </>
  )
}

export function AllItemsPage()   { return <ItemsList title="All Items" /> }
export function LostItemsPage()  { return <ItemsList type="LOST"  title="Lost Items"  /> }
export function FoundItemsPage() { return <ItemsList type="FOUND" title="Found Items" /> }

// ── Item Detail ───────────────────────────────────────────────
export function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [item,      setItem]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [claiming,  setClaiming]  = useState(false)
  const [claimText, setClaimText] = useState('')
  const [showClaim, setShowClaim] = useState(false)

  useEffect(() => {
    api.get(`/items/${id}`)
      .then(r => setItem(r.data))
      .catch(()=> navigate('/items'))
      .finally(()=> setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Delete this item?')) return
    await api.delete(`/items/${id}`)
    toast.success('Item deleted')
    navigate('/activity')
  }

  const handleClaim = async () => {
    setClaiming(true)
    try {
      await api.post('/claims', { itemId: id, proofText: claimText })
      toast.success('Claim submitted successfully!')
      setShowClaim(false)
    } catch(err) {
      toast.error(err.response?.data?.error || 'Claim failed')
    } finally {
      setClaiming(false)
    }
  }

  if (loading) return <div className="loading-page"><div className="spinner"/></div>
  if (!item)   return null

  const isOwner = user?.id === item.user?.id

  return (
    <>
      <Topbar title="Item Details"/>
      <div className="page-wrapper">
        <button className="btn btn-ghost btn-sm mb-16" onClick={() => navigate(-1)}>← Back</button>

        <div className="item-detail-grid">
          {/* Image */}
          <div className="item-detail-img card flex-center" style={{background:'var(--bg3)', overflow:'hidden'}}>
            {item.imageUrl
              ? <img src={item.imageUrl} alt={item.title} className="img-fit-contain" style={{maxHeight:'500px'}}/>
              : <Package size={80} color="var(--text3)"/>
            }
          </div>

          {/* Info */}
          <div>
            <div className="flex-gap mb-16">
              <span className={`badge badge-${item.type?.toLowerCase()}`}>{item.type}</span>
              <span className={`badge badge-${item.status?.toLowerCase()}`}>{item.status}</span>
              {item.category && <span className="badge badge-open">{item.category.name}</span>}
            </div>
            <h1 style={{fontSize:26, marginBottom:12}}>{item.title}</h1>
            {item.description && <p className="text-muted mb-16">{item.description}</p>}

            <div className="detail-meta">
              {item.location && <div><MapPin size={15}/> {item.location}</div>}
              {item.dateLostFound && <div><Calendar size={15}/> {item.dateLostFound}</div>}
              {item.brand && <div><Tag size={15}/> {item.brand}</div>}
              {item.color && <div>🎨 {item.color}</div>}
              {item.user && <div><User size={15}/> Reported by {item.user.name}</div>}
            </div>

            {/* Actions */}
            <div className="flex-gap mt-24" style={{flexWrap:'wrap'}}>
              {!isOwner && item.type === 'FOUND' && item.status === 'OPEN' && (
                <button className="btn btn-primary" onClick={() => setShowClaim(true)}>
                  Claim This Item
                </button>
              )}
              {!isOwner && (
                <button className="btn btn-outline" onClick={() => navigate(`/messages?to=${item.user?.id}`)}>
                  Message Owner
                </button>
              )}
              {isOwner && (
                <>
                  <button className="btn btn-outline" onClick={() => navigate(`/items/${id}/edit`)}>
                    <Edit size={15}/> Edit
                  </button>
                  <button className="btn btn-danger" onClick={handleDelete}>
                    <Trash2 size={15}/> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Claim Modal */}
        {showClaim && (
          <div className="modal-overlay" onClick={() => setShowClaim(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Submit Claim</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowClaim(false)}>✕</button>
              </div>
              <p className="text-muted mb-16">Describe how this item belongs to you (proof of ownership)</p>
              <textarea className="form-textarea" rows={4} placeholder="e.g. My wallet has a red card inside with my name…"
                value={claimText} onChange={e => setClaimText(e.target.value)}/>
              <div className="flex-gap mt-16">
                <button className="btn btn-primary" onClick={handleClaim} disabled={claiming || !claimText}>
                  {claiming ? 'Submitting…' : 'Submit Claim'}
                </button>
                <button className="btn btn-outline" onClick={() => setShowClaim(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .item-detail-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 28px; }
        .item-detail-img  { min-height: 280px; }
        .detail-meta { display: flex; flex-direction: column; gap: 10px; color: var(--text2); font-size: 14px; }
        .detail-meta > div { display: flex; align-items: center; gap: 8px; }
        @media (max-width: 768px) { .item-detail-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  )
}
