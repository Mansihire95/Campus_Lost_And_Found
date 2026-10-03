import { Link } from 'react-router-dom';

const PLACEHOLDER = 'https://placehold.co/400x220/e8edf2/aab4be?text=No+Image';

const ItemCard = ({ item }) => {
  const imageUrl = item.image
    ? item.image
    : PLACEHOLDER;

  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="item-card card">
      <div className="item-card-img">
        <img
          src={imageUrl}
          alt={item.title}
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        <span className={`badge badge-${item.type.toLowerCase()} item-type-badge`}>
          {item.type}
        </span>
      </div>
      <div className="card-body">
        <h3 className="item-title">{item.title}</h3>
        <div className="item-meta">
          <span>📂 {item.category}</span>
          <span>📍 {item.location}</span>
          <span>📅 {formattedDate}</span>
        </div>
        <div className="item-card-footer">
          <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
          <Link to={`/items/${item._id}`} className="btn btn-primary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
