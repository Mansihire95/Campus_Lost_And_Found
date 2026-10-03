import { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import api from '../services/api';
import '../components/ItemCard.css';
import './Items.css';

const ItemsPage = ({ type }) => {
  const isLost = type === 'LOST';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ sort: 'newest' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        type,
        page,
        limit: 12,
        search: search || undefined,
        category: filters.category || undefined,
        status: filters.status || undefined,
        sort: filters.sort || 'newest',
      };
      const res = await api.get('/items', { params });
      setItems(res.data.items);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      setError('Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [type, page, search, filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div className="page-header">
          <h1>{isLost ? '🔴 Lost Items' : '🟢 Found Items'}</h1>
          <p>
            {isLost
              ? `${total} lost item${total !== 1 ? 's' : ''} reported by the KJO University community`
              : `${total} found item${total !== 1 ? 's' : ''} reported by the KJO University community`}
          </p>
        </div>

        <div className="items-controls">
          <SearchBar
            onSearch={handleSearch}
            placeholder={isLost ? 'Search lost items...' : 'Search found items...'}
          />
          <FilterBar filters={filters} onChange={handleFilterChange} />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{isLost ? '🔍' : '📦'}</div>
            <h3>No {isLost ? 'lost' : 'found'} items found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>‹ Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} style={{ padding: '0 4px' }}>…</span>
                ) : (
                  <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>
                    {p}
                  </button>
                )
              )}
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next ›</button>
          </div>
        )}
      </div>
    </div>
  );
};

const LostItems = () => <ItemsPage type="LOST" />;
export default LostItems;
