import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Tag } from 'lucide-react'
import { Package } from 'lucide-react'

export default function ItemCard({ item }) {
  const navigate = useNavigate()
  const typeClass = item.type === 'LOST' ? 'badge-lost' : 'badge-found'
  const statusClass = `badge-${item.status?.toLowerCase()}`

  return (
    <div className="item-card" onClick={() => navigate(`/items/${item.id}`)}>
      <div className="item-card-img">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.title} />
          : <Package size={40} color="var(--text3)" />
        }
      </div>
      <div className="item-card-body">
        <div className="flex-between mb-8">
          <span className={`badge ${typeClass}`}>{item.type}</span>
          <span className={`badge ${statusClass}`}>{item.status}</span>
        </div>
        <div className="item-card-title truncate">{item.title}</div>
        <div className="item-card-meta mt-8">
          {item.location && (
            <span className="flex flex-gap gap-4"><MapPin size={12}/> {item.location}</span>
          )}
          {item.category && (
            <span className="flex flex-gap gap-4"><Tag size={12}/> {item.category.name}</span>
          )}
          {item.dateLostFound && (
            <span className="flex flex-gap gap-4"><Calendar size={12}/> {item.dateLostFound}</span>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-muted mt-8" style={{
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {item.description}
          </p>
        )}
      </div>
    </div>
  )
}
