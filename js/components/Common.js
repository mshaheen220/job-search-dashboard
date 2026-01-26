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
                <div className="error-boundary-container">
                    <h1 className="error-title">Something went wrong</h1>
                    <p>Error: {this.state.error?.message}</p>
                    <button onClick={() => window.location.reload()} className="error-reload-btn">Reload Page</button>
                    <pre className="error-stack">{this.state.error?.stack}</pre>
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
            className="fit-level-select"
        >
            {Object.values(window.FIT_LEVELS).map(level => (
                <option key={level.label} value={level.label}>{level.label}</option>
            ))}
        </select>
    );
};

window.CategoryList = ({ categories, categoryColors }) => {
    const { useState, useRef, useLayoutEffect } = React;
    const [expanded, setExpanded] = useState(false);
    const [showToggle, setShowToggle] = useState(false);
    const containerRef = useRef(null);

    const getCategoryClassName = (category) => {
        return 'category-pill';
    };
    
    const getCategoryStyle = (category) => {
        const color = window.CategoryUtil.getColor(category, categoryColors);
        const bg = color.startsWith('#') ? color + '20' : `color-mix(in srgb, ${color}, transparent 85%)`;
        return { backgroundColor: bg, color: color, border: `1px solid ${color}` };
    };

    useLayoutEffect(() => {
        if (containerRef.current) {
            if (containerRef.current.scrollHeight > containerRef.current.clientHeight) {
                setShowToggle(true);
            } else if (!expanded) {
                setShowToggle(false);
            }
        }
    }, [categories, expanded]);

    return (
        <div className="category-list-container">
            <div 
                ref={containerRef}
                className="category-list-wrapper" style={{ maxHeight: expanded ? 'none' : '60px' }}
            >
                {categories.map(cat => (
                    <span key={cat} className={getCategoryClassName(cat)} style={getCategoryStyle(cat)}>{cat}</span>
                ))}
            </div>
            {(showToggle || expanded) && (
                <button 
                    onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                    className="show-more-btn"
                >
                    {expanded ? 'Show less' : 'Show more'}
                </button>
            )}
        </div>
    );
};

window.Tooltip = ({ text, children, style }) => {
    const [show, setShow] = React.useState(false);
    const [coords, setCoords] = React.useState({ top: 0, left: 0 });
    const [placement, setPlacement] = React.useState('top');
    const wrapperRef = React.useRef(null);

    const handleMouseEnter = () => {
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            if (rect.top < 40) {
                setCoords({ top: rect.bottom + 8, left: rect.left + (rect.width / 2) });
                setPlacement('bottom');
            } else {
                setCoords({ top: rect.top - 8, left: rect.left + (rect.width / 2) });
                setPlacement('top');
            }
            setShow(true);
        }
    };

    // Clone the child element to add aria-label for accessibility (replaces title attribute functionality)
    const childWithAria = React.isValidElement(children) 
        ? React.cloneElement(children, { 'aria-label': text }) 
        : children;

    return (
        <div 
            ref={wrapperRef}
            className="tooltip-wrapper"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setShow(false)}
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', ...style }}
        >
            {childWithAria}
            {show && text && ReactDOM.createPortal(
                <div className="tooltip-popup" style={{ position: 'fixed', top: coords.top, left: coords.left, transform: placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)', margin: 0, bottom: 'auto', zIndex: 10000 }}>
                    {text}
                </div>,
                document.body
            )}
        </div>
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
    const { useState, useRef, useLayoutEffect } = React;
    const [newCategory, setNewCategory] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
    const [expanded, setExpanded] = useState(false);
    const [showToggle, setShowToggle] = useState(false);
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        if (containerRef.current) {
            if (containerRef.current.scrollHeight > containerRef.current.clientHeight) {
                setShowToggle(true);
            } else if (!expanded) {
                setShowToggle(false);
            }
        }
    }, [allCategories, expanded]);

    const handleAdd = () => {
        if (!newCategory.trim()) return;
        onAddCategory(newCategory.trim(), newCategoryColor);
        setNewCategory('');
        setNewCategoryColor('#3b82f6');
    };

    return (
        <div className="form-group">
            <div className="category-selector-header">
                <label className="mb-0">Categories</label>
                {onClear && <button type="button" onClick={onClear} className="clear-btn">Clear</button>}
            </div>
            <div 
                ref={containerRef}
                className="category-selector-wrapper" style={{ maxHeight: expanded ? 'none' : '85px' }}
            >
                {allCategories.map(cat => {
                    const isSelected = selectedCategories.includes(cat);
                    const color = window.CategoryUtil.getColor(cat, categoryColors);
                    const bgColor = color.startsWith('#') ? color + '20' : `color-mix(in srgb, ${color}, transparent 85%)`;
                    return (
                        <button 
                            type="button" 
                            key={cat} 
                            onClick={() => onToggleCategory(cat)}
                            className="category-selector-btn"
                            style={{
                                border: isSelected ? `2px solid ${color}` : undefined,
                                background: isSelected ? bgColor : undefined,
                                color: isSelected ? color : undefined
                            }}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>
            {(showToggle || expanded) && (
                <button 
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="show-more-btn-lg"
                >
                    {expanded ? 'Show less' : 'Show more'}
                </button>
            )}
            <div className="category-add-row">
                <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Or create new category..." className="flex-1" />
                {newCategory && <window.Tooltip text="Choose category color"><input type="color" value={newCategoryColor} onChange={(e) => setNewCategoryColor(e.target.value)} className="color-picker-btn" /></window.Tooltip>}
                <button type="button" onClick={handleAdd} className="btn btn-sm" disabled={!newCategory.trim()}>Add</button>
            </div>
        </div>
    );
};