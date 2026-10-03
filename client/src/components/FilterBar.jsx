const CATEGORIES = [
  'ID Card', 'Electronics', 'Wallet', 'Bag', 'Books',
  'Keys', 'Documents', 'Clothing', 'Accessories', 'Other',
];

const FilterBar = ({ filters, onChange, showType = false }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="filter-bar">
      {showType && (
        <select
          className="filter-select"
          value={filters.type || ''}
          onChange={(e) => handleChange('type', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="LOST">Lost</option>
          <option value="FOUND">Found</option>
        </select>
      )}

      <select
        className="filter-select"
        value={filters.category || ''}
        onChange={(e) => handleChange('category', e.target.value)}
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        className="filter-select"
        value={filters.status || ''}
        onChange={(e) => handleChange('status', e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="RESOLVED">Resolved</option>
      </select>

      <select
        className="filter-select"
        value={filters.sort || 'newest'}
        onChange={(e) => handleChange('sort', e.target.value)}
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
      </select>

      <button
        className="btn btn-outline btn-sm"
        onClick={() => onChange({ sort: 'newest' })}
      >
        Clear Filters
      </button>
    </div>
  );
};

export default FilterBar;
