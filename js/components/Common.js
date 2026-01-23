window.StatusBadge = ({ status }) => {
    if (!status) {
        console.warn("StatusBadge received undefined status");
        return <span className="status-badge status-not-applied">Unknown</span>;
    }
    const className = `status-badge status-${status.toLowerCase().replace(/\s+/g, "-")}`;
    return <span className={className}>{status}</span>;
};

window.PriorityBadge = ({ priority }) => {
    if (!priority) {
        console.warn("PriorityBadge received undefined priority");
        return <span className="priority-badge priority-tier2">No priority</span>;
    }
    const className = `priority-badge priority-${priority.toLowerCase().replace(/\s+/g, "")}`;
    return <span className={className}>{priority}</span>;
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { console.error('React Error Boundary caught:', error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: '#e4e6eb', background: '#0a0e1a', minHeight: '100vh' }}>
                    <h1 style={{ color: '#ff6b6b' }}>Something went wrong</h1>
                    <p>Error: {this.state.error?.message}</p>
                    <button onClick={() => window.location.reload()} style={{ background: '#6b8aff', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', marginTop: '1rem' }}>Reload Page</button>
                    <pre style={{ marginTop: '1rem', padding: '1rem', background: '#1a1f35', borderRadius: '6px', overflow: 'auto' }}>{this.state.error?.stack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}
window.ErrorBoundary = ErrorBoundary;

window.FitLevelSelect = ({ value, onChange }) => {
    return (
        <select
            value={window.getFitLevelLabel(value)}
            onChange={(e) => onChange(window.getFitLevelValue(e.target.value))}
            style={{
                width: '100%',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
            }}
        >
            {Object.values(window.FIT_LEVELS).map(level => (
                <option key={level.label} value={level.label}>{level.label}</option>
            ))}
        </select>
    );
};

window.CategorySelector = ({ 
    allCategories, 
    selectedCategories, 
    categoryColors, 
    onToggleCategory, 
    onAddCategory,
    onClear
}) => {
    const { useState } = React;
    const [newCategory, setNewCategory] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');

    const handleAdd = () => {
        if (!newCategory.trim()) return;
        onAddCategory(newCategory.trim(), newCategoryColor);
        setNewCategory('');
        setNewCategoryColor('#3b82f6');
    };

    return (
        <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ marginBottom: 0 }}>Categories</label>
                {onClear && <button type="button" onClick={onClear} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Clear</button>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {allCategories.map(cat => {
                    const isSelected = selectedCategories.includes(cat);
                    const color = categoryColors && categoryColors[cat] ? categoryColors[cat] : 'var(--accent-primary)';
                    return (
                        <button 
                            type="button" 
                            key={cat} 
                            onClick={() => onToggleCategory(cat)}
                            className="category-selector-btn"
                            style={{
                                border: isSelected ? `2px solid ${color}` : undefined,
                                background: isSelected ? (categoryColors && categoryColors[cat] ? color + '20' : 'var(--bg-secondary)') : undefined,
                                color: isSelected ? color : undefined
                            }}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Or create new category..." style={{ flex: 1 }} />
                {newCategory && <input type="color" value={newCategoryColor} onChange={(e) => setNewCategoryColor(e.target.value)} style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'none' }} title="Choose category color" />}
                <button type="button" onClick={handleAdd} className="btn btn-sm" disabled={!newCategory.trim()}>Add</button>
            </div>
        </div>
    );
};