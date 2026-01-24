window.JobsTable = ({ jobs, filters, setFilters, categoryColors, existingCategories, companies, onUpdateCompany, setDeletedCategories, onAdd, onEdit, onUpdateJob, onDelete, onExport, onBackup, requestSort, getSortIcon, onViewInterviews }) => {
    const { useState, useRef, useEffect } = React;
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewModalJob, setViewModalJob] = useState(null);
    const [viewModalEdit, setViewModalEdit] = useState(false);
    const [editedJobData, setEditedJobData] = useState(null);
    const notesTextareaRef = useRef(null);
    const autoExpandTextarea = () => { if (notesTextareaRef.current) { notesTextareaRef.current.style.height = 'auto'; notesTextareaRef.current.style.height = Math.max(notesTextareaRef.current.scrollHeight, 120) + 'px'; } };
    useEffect(() => { autoExpandTextarea(); }, [viewModalJob, editedJobData, viewModalEdit]);
    const viewFieldStyle = viewModalEdit ? {} : { background: 'var(--bg-tertiary)', border: '1px dashed var(--border-primary)', color: 'var(--text-secondary)', cursor: 'not-allowed' };
    const [visibleColumns, setVisibleColumns] = useState({ company: true, role: true, status: true, priority: false, dateApplied: true, salary: false, closeReason: false, progression: true, followUp: false, notes: false, resumeUrl: false, coverLetterUrl: false, fitLevel: true, categories: true });
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' });
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [selectedPriorities, setSelectedPriorities] = useState([]);
    const [selectedFitLevels, setSelectedFitLevels] = useState([]);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
    const [showFitLevelDropdown, setShowFitLevelDropdown] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showStatusDropdown && !event.target.closest('.filter-select') && !event.target.closest('[data-dropdown="status"]')) setShowStatusDropdown(false);
            if (showPriorityDropdown && !event.target.closest('.filter-select') && !event.target.closest('[data-dropdown="priority"]')) setShowPriorityDropdown(false);
            if (showFitLevelDropdown && !event.target.closest('.filter-select') && !event.target.closest('[data-dropdown="fitlevel"]')) setShowFitLevelDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showStatusDropdown, showPriorityDropdown, showFitLevelDropdown]);
    const filteredJobs = jobs.filter(job => {
        if (selectedStatuses.length > 0 && !selectedStatuses.includes(job.status)) return false;
        if (selectedPriorities.length > 0 && !selectedPriorities.includes(job.priority)) return false;
        if (selectedFitLevels.length > 0) { const jobFitLabel = window.getFitLevelLabel(job.fitLevel || null); if (!selectedFitLevels.includes(jobFitLabel)) return false; }
        if (dateRangeFilter.start || dateRangeFilter.end) {
            const jobDate = new Date(job.dateApplied);
            if (dateRangeFilter.start && jobDate < new Date(dateRangeFilter.start)) return false;
            if (dateRangeFilter.end && jobDate > new Date(dateRangeFilter.end)) return false;
        }
        return true;
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);
    useEffect(() => { setCurrentPage(1); }, [filters.search, selectedStatuses.length, selectedPriorities.length, selectedFitLevels.length, dateRangeFilter]);
    const activeFiltersCount = [filters.search, selectedStatuses.length > 0, selectedPriorities.length > 0, selectedFitLevels.length > 0, dateRangeFilter.start || dateRangeFilter.end].filter(Boolean).length;
    const clearFilters = () => { setFilters({ status: 'all', priority: 'all', company: '', search: '' }); setSelectedStatuses([]); setSelectedPriorities([]); setSelectedFitLevels([]); setDateRangeFilter({ start: '', end: '' }); };
    const handleQuickClose = (job) => {
        const today = new Date().toISOString().split('T')[0];
        if (!confirm(`Close "${job.role}" at ${job.company} as Rejected today?`)) return;
        onUpdateJob({ ...job, status: window.JOB_STATUSES.CLOSED, closeReason: window.CLOSE_REASONS.REJECTED, followUp: today });
    };
    const toggleColumn = (key) => { setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] })); };
    const toggleStatus = (status) => { setSelectedStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]); };
    const togglePriority = (priority) => { setSelectedPriorities(prev => prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]); };
    const toggleFitLevel = (level) => { setSelectedFitLevels(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]); };
    const getAgeIcon = (dateStr, status) => {
        if (!dateStr) return null;
        const applied = new Date(dateStr + 'T00:00:00');
        const now = new Date();
        const diffTime = now - applied;
        const diffHours = diffTime / (1000 * 60 * 60);
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        let className = 'status-dot';
        let title = '';

        if (diffHours < 36) {
            className += ' new';
            title = "New application (< 36 hours)";
        } else if (status !== 'Closed') {
            if (diffDays >= 14) {
                className += ' stale';
                title = "Stale (> 2 weeks)";
            } else if (diffDays >= 7) {
                className += ' warning';
                title = "Warning (> 1 week)";
            }
        }
        
        if (className === 'status-dot') return <span className="status-dot" style={{ backgroundColor: 'transparent' }} />;

        return <span className={className} title={title} />;
    };

    const handleAddCategory = (name, color) => { 
        if (!name.trim()) return; 
        if (existingCategories.includes(name)) { alert('Category already exists'); return; } 
        setDeletedCategories(prev => prev.filter(cat => cat !== name)); 
        onUpdateCompany(null, { newCategory: name, newCategoryColor: color }); 
    };
    const handleDeleteCategory = (categoryName) => { if (categoryName === 'None') { alert("You can't delete the \"None\" category."); return; } if (!confirm(`Delete category "${categoryName}"? Companies in this category will be moved to "None".`)) return; onUpdateCompany(null, { deleteCategory: categoryName }); };
    const handleRenameCategory = (oldName, newName, newColor) => { 
        if (!newName.trim()) return; 
        if (existingCategories.includes(newName) && newName !== oldName) { alert('Category name already exists'); return; } 
        if (oldName !== newName) onUpdateCompany(null, { renameCategory: { oldName, newName } }); 
        if (newColor) onUpdateCompany(null, { updateCategoryColor: { category: newName, color: newColor } });
    };
    const columns = [
        { key: 'company', label: 'Company' }, { key: 'role', label: 'Role' }, { key: 'status', label: 'Status' }, { key: 'priority', label: 'Priority' }, { key: 'dateApplied', label: 'Date applied' }, { key: 'salary', label: 'Salary' }, { key: 'closeReason', label: 'Reason' }, { key: 'progression', label: 'Progress' }, { key: 'followUp', label: 'Close date' }, { key: 'notes', label: 'Notes' }, { key: 'resumeUrl', label: 'Resume' }, { key: 'coverLetterUrl', label: 'Cover letter' }, { key: 'fitLevel', label: 'Fit Level' }, { key: 'categories', label: 'Categories' }
    ];
    return (
        <div>
            <div className="action-bar">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><h1 style={{ color: "var(--accent-primary)", fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.75rem" }}>Applications</h1><span style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>{filteredJobs.length === jobs.length ? `${jobs.length} ${jobs.length === 1 ? 'application' : 'applications'}` : `${filteredJobs.length} of ${jobs.length}`}</span></div>
                <div style={{ display: "flex", gap: "0.5rem" }}><button className="btn btn-secondary" onClick={onExport}>📊 Export CSV</button><button className="btn" onClick={onAdd}>Add application</button></div>
            </div>
            <div className="action-bar" style={{ marginTop: "1rem" }}>
                <div className="filters-section" data-filter-group="applications-filters" style={{ flex: 1 }}>
                    <div className="filters-row" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                        <div className="search-container"><input type="text" className="search-input" placeholder="Search applications by role or company" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />{filters.search && (<button className="clear-search" onClick={() => setFilters({ ...filters, search: "" })}>×</button>)}</div>
                        <div style={{ position: "relative" }}>
                            <button className="filter-select" onClick={() => setShowStatusDropdown(!showStatusDropdown)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", minWidth: "160px", cursor: "pointer" }}><span>{selectedStatuses.length === 0 ? 'All statuses' : `Status (${selectedStatuses.length})`}</span><span style={{ fontSize: "0.7rem" }}>▼</span></button>
                            {showStatusDropdown && (
                                <div data-dropdown="status" style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: "var(--bg-elevated)", border: "1px solid var(--border-primary)", borderRadius: "10px", padding: "0.5rem", boxShadow: "var(--shadow-lg)", zIndex: 1000, minWidth: "200px", maxHeight: "300px", overflowY: "auto" }}>
                                    <button onClick={() => setSelectedStatuses([])} style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem", background: "var(--bg-hover)", border: "1px solid var(--border-primary)", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500", transition: "all 0.2s" }}>Clear all</button>
                                    {window.STATUSES.map(status => (<label key={status} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem", cursor: "pointer", borderRadius: "6px", transition: "background 0.2s", fontSize: "0.9rem", color: "var(--text-primary)" }}><input type="checkbox" checked={selectedStatuses.includes(status)} onChange={() => toggleStatus(status)} style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--accent-primary)" }} /><span>{status}</span></label>))}
                                </div>
                            )}
                        </div>
                        <div style={{ position: "relative" }}>
                            <button className="filter-select" onClick={() => setShowPriorityDropdown(!showPriorityDropdown)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", minWidth: "160px", cursor: "pointer" }}><span>{selectedPriorities.length === 0 ? 'All priorities' : `Priority (${selectedPriorities.length})`}</span><span style={{ fontSize: "0.7rem" }}>▼</span></button>
                            {showPriorityDropdown && (
                                <div data-dropdown="priority" style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: "var(--bg-elevated)", border: "1px solid var(--border-primary)", borderRadius: "10px", padding: "0.5rem", boxShadow: "var(--shadow-lg)", zIndex: 1000, minWidth: "200px" }}>
                                    <button onClick={() => setSelectedPriorities([])} style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem", background: "var(--bg-hover)", border: "1px solid var(--border-primary)", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500", transition: "all 0.2s" }}>Clear all</button>
                                    {window.PRIORITIES.map(priority => (<label key={priority} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem", cursor: "pointer", borderRadius: "6px", transition: "background 0.2s", fontSize: "0.9rem", color: "var(--text-primary)" }}><input type="checkbox" checked={selectedPriorities.includes(priority)} onChange={() => togglePriority(priority)} style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--accent-primary)" }} /><span>{priority}</span></label>))}
                                </div>
                            )}
                        </div>
                        {visibleColumns.fitLevel && (<div style={{ position: "relative" }}>
                            <button className="filter-select" onClick={() => setShowFitLevelDropdown(!showFitLevelDropdown)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", minWidth: "160px", cursor: "pointer" }}><span>{selectedFitLevels.length === 0 ? 'All fit levels' : `Fit level (${selectedFitLevels.length})`}</span><span style={{ fontSize: "0.7rem" }}>▼</span></button>
                            {showFitLevelDropdown && (
                                <div data-dropdown="fitlevel" style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: "var(--bg-elevated)", border: "1px solid var(--border-primary)", borderRadius: "10px", padding: "0.5rem", boxShadow: "var(--shadow-lg)", zIndex: 1000, minWidth: "200px" }}>
                                    <button onClick={() => setSelectedFitLevels([])} style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem", background: "var(--bg-hover)", border: "1px solid var(--border-primary)", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500", transition: "all 0.2s" }}>Clear all</button>
                                    {[window.FIT_LEVELS.HIGH.label, window.FIT_LEVELS.MEDIUM.label, window.FIT_LEVELS.LOW.label, window.FIT_LEVELS.UNSET.label].map(level => (<label key={level} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem", cursor: "pointer", borderRadius: "6px", transition: "background 0.2s", fontSize: "0.9rem", color: "var(--text-primary)" }}><input type="checkbox" checked={selectedFitLevels.includes(level)} onChange={() => toggleFitLevel(level)} style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--accent-primary)" }} /><span>{level}</span></label>))}
                                </div>
                            )}
                        </div>)}
                        <button className={`advanced-filters-toggle ${showAdvancedFilters ? 'active' : ''}`} onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} style={{ background: showAdvancedFilters ? "var(--accent-primary)" : "var(--bg-tertiary)", color: showAdvancedFilters ? "white" : "var(--text-secondary)", border: "1px solid var(--border-primary)", padding: "0.6rem 1rem", borderRadius: "10px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "500", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s ease" }}>📅 Application date {activeFiltersCount > 0 && ` (${activeFiltersCount})`}</button>
                        {(filters.search || selectedStatuses.length > 0 || selectedPriorities.length > 0 || selectedFitLevels.length > 0 || dateRangeFilter.start || dateRangeFilter.end) && (<button onClick={clearFilters} style={{ background: "transparent", color: "var(--accent-primary)", border: "none", padding: "0.6rem 0.75rem", borderRadius: "10px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "500", transition: "all 0.2s ease", whiteSpace: "nowrap" }}>Clear all</button>)}
                    </div>
                </div>
                <button className="btn btn-secondary" onClick={() => setShowColumnSelector(!showColumnSelector)}>⚙️ Columns</button>
            </div>
            {showAdvancedFilters && (
                <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem", boxShadow: "var(--shadow-md)", animation: "slideDown 0.3s ease" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        <div className="filter-group"><label className="filter-label" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500", marginBottom: "0.5rem", display: "block" }}>Date from</label><input type="date" className="filter-select" value={dateRangeFilter.start} onChange={(e) => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))} /></div>
                        <div className="filter-group"><label className="filter-label" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500", marginBottom: "0.5rem", display: "block" }}>Date to</label><input type="date" className="filter-select" value={dateRangeFilter.end} onChange={(e) => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))} /></div>
                    </div>
                </div>
            )}
            {showColumnSelector && (
                <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "1rem", color: "var(--text-primary)" }}>Visible columns</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem" }}>
                        {columns.map(col => (<label key={col.key} className="checkbox-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", color: "var(--text-secondary)", padding: "0.5rem", borderRadius: "6px", transition: "all 0.2s ease" }}><input type="checkbox" checked={visibleColumns[col.key]} onChange={() => toggleColumn(col.key)} style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--accent-primary)" }} /><span>{col.label}</span></label>))}
                    </div>
                </div>
            )}
            {filteredJobs.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">🔍</div><h3>No applications. Let's change that!</h3><p>Add an application or adjust your filters</p></div>
            ) : (
                <>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    {visibleColumns.company && (<th onClick={() => requestSort('company')} style={{ cursor: 'pointer' }}>Company{getSortIcon('company')}</th>)}
                                    {visibleColumns.role && (<th onClick={() => requestSort('role')} style={{ cursor: 'pointer' }}>Role{getSortIcon('role')}</th>)}
                                    {visibleColumns.status && (<th onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>Status{getSortIcon('status')}</th>)}
                                    {visibleColumns.categories && (<th><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Categories<button onClick={(e) => { e.stopPropagation(); setShowCategoryManager(true); }} title="Manage categories" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem', padding: '0', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}>⚙️</button></div></th>)}
                                    {visibleColumns.priority && (<th onClick={() => requestSort('priority')} style={{ cursor: 'pointer' }}>Priority{getSortIcon('priority')}</th>)}
                                    {visibleColumns.fitLevel && (<th onClick={() => requestSort('fitLevel')} style={{ cursor: 'pointer' }}>Fit Level{getSortIcon('fitLevel')}</th>)}
                                    {visibleColumns.dateApplied && (<th onClick={() => requestSort('dateApplied')} style={{ cursor: 'pointer' }}>Date applied{getSortIcon('dateApplied')}</th>)}
                                    {visibleColumns.salary && (<th onClick={() => requestSort('salary')} style={{ cursor: 'pointer' }}>Salary{getSortIcon('salary')}</th>)}
                                    {visibleColumns.closeReason && (<th onClick={() => requestSort('closeReason')} style={{ cursor: 'pointer' }}>Reason{getSortIcon('closeReason')}</th>)}
                                    {visibleColumns.progression && (<th onClick={() => requestSort('progression')} style={{ cursor: 'pointer' }}>Progress{getSortIcon('progression')}</th>)}
                                    {visibleColumns.followUp && (<th onClick={() => requestSort('followUp')} style={{ cursor: 'pointer' }}>Close date{getSortIcon('followUp')}</th>)}
                                    {visibleColumns.notes && (<th>Notes</th>)}
                                    {visibleColumns.resumeUrl && (<th>Resume</th>)}
                                    {visibleColumns.coverLetterUrl && (<th>Cover letter</th>)}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedJobs.map(job => (
                                    <tr key={job.id}>
                                        {visibleColumns.company && <td><strong>{job.company}</strong></td>}
                                        {visibleColumns.role && (<td style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><button className="icon-btn" title="View" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", color: "var(--text-secondary)", fontSize: "1.1rem" }} onClick={() => { setViewModalJob(job); setViewModalOpen(true); setViewModalEdit(false); }}><span role="img" aria-label="View">👁️</span></button>{job.url ? (<a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>{job.role}&nbsp;<span style={{ fontSize: '0.85em', marginLeft: '0.25rem' }}>↗</span></a>) : job.role}</td>)}
                                        {visibleColumns.status && <td><window.StatusBadge status={job.status} /></td>}
                                        {visibleColumns.categories && (
                                            <td>
                                                <window.CategoryList categories={job.categories || []} categoryColors={categoryColors} />
                                            </td>
                                        )}
                                        {visibleColumns.priority && <td><window.PriorityBadge priority={job.priority} /></td>}
                                        {visibleColumns.fitLevel && <td>{window.getFitLevelLabel(job.fitLevel)}</td>}
                                        {visibleColumns.dateApplied && <td>{job.dateApplied ? <div style={{ display: 'flex', alignItems: 'center' }}>{getAgeIcon(job.dateApplied, job.status)} {new Date(job.dateApplied + 'T00:00:00').toLocaleDateString()}</div> : '-'}</td>}
                                        {visibleColumns.salary && <td>{job.salary || "-"}</td>}
                                        {visibleColumns.closeReason && <td>{job.closeReason || "-"}</td>}
                                        {visibleColumns.progression && <td>{job.progression || "-"}</td>}
                                        {visibleColumns.followUp && <td>{job.followUp ? new Date(job.followUp + 'T00:00:00').toLocaleDateString() : "-"}</td>}
                                        {visibleColumns.notes && (<td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.notes || "-"}</td>)}
                                        {visibleColumns.resumeUrl && (<td>{job.resumeUrl ? (<a href={job.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>📄&nbsp;View</a>) : "-"}</td>)}
                                        {visibleColumns.coverLetterUrl && (<td>{job.coverLetterUrl ? (<a href={job.coverLetterUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>📝&nbsp;View</a>) : "-"}</td>)}
                                        <td>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button className="icon-btn" onClick={() => onEdit(job)} title="Edit" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", color: "var(--text-secondary)", fontSize: "0.9rem" }}>✏️</button>
                                                <button className="icon-btn" onClick={() => handleQuickClose(job)} title="Close as rejected today" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", color: "var(--text-secondary)", fontSize: "0.9rem" }}>🚫</button>
                                                <button className="icon-btn danger" onClick={() => onDelete(job.id)} title="Delete" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", color: "var(--text-secondary)", fontSize: "0.9rem" }}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "2rem", padding: "1rem" }}>
                            <button className="pagination-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", padding: "0.5rem 1rem", borderRadius: "8px", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "0.9rem", transition: "all 0.2s ease", opacity: currentPage === 1 ? 0.4 : 1 }}>««</button>
                            <button className="pagination-btn" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", padding: "0.5rem 1rem", borderRadius: "8px", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "0.9rem", transition: "all 0.2s ease", opacity: currentPage === 1 ? 0.4 : 1 }}>‹</button>
                            <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Page {currentPage} of {totalPages} ({filteredJobs.length} total)</span>
                            <button className="pagination-btn" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", padding: "0.5rem 1rem", borderRadius: "8px", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontSize: "0.9rem", transition: "all 0.2s ease", opacity: currentPage === totalPages ? 0.4 : 1 }}>›</button>
                            <button className="pagination-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", padding: "0.5rem 1rem", borderRadius: "8px", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontSize: "0.9rem", transition: "all 0.2s ease", opacity: currentPage === totalPages ? 0.4 : 1 }}>»»</button>
                        </div>
                    )}
                </>
            )}
            {viewModalOpen && (
                <div className="modal-overlay" onClick={() => setViewModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>Application details</h2>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {viewModalEdit ? (<button className="btn" onClick={() => { onUpdateJob(editedJobData); setViewModalOpen(false); setViewModalEdit(false); setEditedJobData(null); }}>Save & close</button>) : (<button className="icon-btn" title="Edit" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '1.1rem' }} onClick={() => { if (!viewModalEdit) { setEditedJobData({ ...viewModalJob }); } setViewModalEdit(true); }}><span role="img" aria-label="Edit">✏️</span></button>)}
                                <button className="modal-close" onClick={() => setViewModalOpen(false)}>×</button>
                            </div>
                        </div>
                        <div className="modal-body">
                            {viewModalJob ? (
                                <div style={{ borderBottom: '1px solid var(--border-primary)', marginBottom: '1.5rem', paddingBottom: '1.5rem' }}>
                                    <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>{viewModalEdit ? editedJobData?.role : viewModalJob.role} @ {viewModalEdit ? editedJobData?.company : viewModalJob.company}</h3>
                                    <div className="form-row">
                                        <div className="form-group"><label>Company</label><input type="text" value={viewModalEdit ? editedJobData?.company || '' : viewModalJob.company} readOnly={!viewModalEdit} onChange={e => { setEditedJobData({ ...editedJobData, company: e.target.value }); }} style={viewFieldStyle} /></div>
                                        <div className="form-group"><label>Role</label><input type="text" value={viewModalEdit ? editedJobData?.role || '' : viewModalJob.role} readOnly={!viewModalEdit} onChange={e => { setEditedJobData({ ...editedJobData, role: e.target.value }); }} style={viewFieldStyle} /></div>
                                    </div>
                                    <div className="form-group"><label>Job URL</label>{viewModalEdit ? (<input type="url" value={editedJobData?.url || ''} onChange={e => { setEditedJobData({ ...editedJobData, url: e.target.value }); }} />) : (viewModalJob.url ? (<div style={{ ...viewFieldStyle, cursor: 'default', padding: '0.75rem', wordBreak: 'break-all' }}><a href={viewModalJob.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }} onClick={(e) => e.stopPropagation()}>{viewModalJob.url}</a></div>) : (<div style={viewFieldStyle}>-</div>))}</div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Resume URL</label>{viewModalEdit ? (<input type="url" value={editedJobData?.resumeUrl || ''} onChange={e => { setEditedJobData({ ...editedJobData, resumeUrl: e.target.value }); }} />) : (viewModalJob.resumeUrl ? (<div style={{ ...viewFieldStyle, cursor: 'default', padding: '0.75rem', wordBreak: 'break-all' }}><a href={viewModalJob.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }} onClick={(e) => e.stopPropagation()}>{viewModalJob.resumeUrl}</a></div>) : (<div style={viewFieldStyle}>-</div>))}</div>
                                        <div className="form-group"><label>Cover letter URL</label>{viewModalEdit ? (<input type="url" value={editedJobData?.coverLetterUrl || ''} onChange={e => { setEditedJobData({ ...editedJobData, coverLetterUrl: e.target.value }); }} />) : (viewModalJob.coverLetterUrl ? (<div style={{ ...viewFieldStyle, cursor: 'default', padding: '0.75rem', wordBreak: 'break-all' }}><a href={viewModalJob.coverLetterUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }} onClick={(e) => e.stopPropagation()}>{viewModalJob.coverLetterUrl}</a></div>) : (<div style={viewFieldStyle}>-</div>))}</div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Status</label><input type="text" value={viewModalEdit ? editedJobData?.status || '' : viewModalJob.status || ''} readOnly={!viewModalEdit} onChange={e => { setEditedJobData({ ...editedJobData, status: e.target.value }); }} style={viewFieldStyle} /></div>
                                        <div className="form-group"><label>Date applied</label><input type="date" value={viewModalEdit ? editedJobData?.dateApplied || '' : viewModalJob.dateApplied || ''} readOnly={!viewModalEdit} onChange={e => { setEditedJobData({ ...editedJobData, dateApplied: e.target.value }); }} style={viewFieldStyle} /></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Progression</label><input type="text" value={viewModalEdit ? editedJobData?.progression || '' : viewModalJob.progression || ''} readOnly={!viewModalEdit} onChange={e => { setEditedJobData({ ...editedJobData, progression: e.target.value }); }} style={viewFieldStyle} /></div>
                                        <div className="form-group"><label>Priority</label><input type="text" value={viewModalEdit ? editedJobData?.priority || '' : viewModalJob.priority || ''} readOnly={!viewModalEdit} onChange={e => { setEditedJobData({ ...editedJobData, priority: e.target.value }); }} style={viewFieldStyle} /></div>
                                    </div>
                                    {viewModalJob.interviews && viewModalJob.interviews.length > 0 && (
                                        <div className="form-group">
                                            <label>Interviews</label>
                                            <div style={{ background: 'var(--bg-tertiary)', border: '1px dashed var(--border-primary)', padding: '0.75rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: 'var(--text-primary)' }}>{viewModalJob.interviews.length} round{viewModalJob.interviews.length !== 1 ? 's' : ''}</span>
                                                <button onClick={() => { setViewModalOpen(false); onViewInterviews(viewModalJob.company); }} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem', padding: 0 }}>View details →</button>
                                            </div>
                                        </div>
                                    )}
                                    {(viewModalJob.closeReason || viewModalJob.followUp) && (
                                        <div className="form-row">
                                            <div className="form-group"><label>Close reason</label><input type="text" value={viewModalEdit ? editedJobData?.closeReason || '' : viewModalJob.closeReason || ''} readOnly={!viewModalEdit} onChange={e => { setEditedJobData({ ...editedJobData, closeReason: e.target.value }); }} style={viewFieldStyle} /></div>
                                            <div className="form-group"><label>Close date</label><input type="date" value={viewModalEdit ? editedJobData?.followUp || '' : viewModalJob.followUp || ''} readOnly={!viewModalEdit} onChange={e => { setEditedJobData({ ...editedJobData, followUp: e.target.value }); }} style={viewFieldStyle} /></div>
                                        </div>
                                    )}
                                    <div className="form-row">
                                        <div className="form-group"><label>Salary</label><input type="text" value={viewModalEdit ? editedJobData?.salary || '' : viewModalJob.salary || ''} readOnly={!viewModalEdit} onChange={e => { setEditedJobData({ ...editedJobData, salary: e.target.value }); }} style={viewFieldStyle} /></div>
                                        <div className="form-group"><label>Location</label><input type="text" value={viewModalEdit ? editedJobData?.location || '' : viewModalJob.location || ''} readOnly={!viewModalEdit} onChange={e => { setEditedJobData({ ...editedJobData, location: e.target.value }); }} style={viewFieldStyle} /></div>
                                    </div>
                                    <div className="form-group"><label>Contact name</label><input type="text" value={viewModalEdit ? editedJobData?.contact || '' : viewModalJob.contact || ''} readOnly={!viewModalEdit} onChange={e => { setEditedJobData({ ...editedJobData, contact: e.target.value }); }} style={viewFieldStyle} /></div>
                                    <div className="form-group"><label>Notes</label>{viewModalEdit ? (<textarea value={editedJobData?.notes || ''} onChange={e => { setEditedJobData({ ...editedJobData, notes: e.target.value }); autoExpandTextarea(); }} ref={notesTextareaRef} style={{ minHeight: '120px', resize: 'vertical', overflow: 'hidden' }} />) : (<div style={{ ...viewFieldStyle, cursor: 'default', minHeight: '120px', padding: '0.75rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: viewModalJob.notes ? window.UIUtil.linkify(viewModalJob.notes) : '-' }}></div>)}</div>
                                    {viewModalEdit && (<div className="modal-footer" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-primary)', paddingTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}><button className="btn btn-secondary" onClick={() => { setViewModalEdit(false); setEditedJobData(null); }}>Cancel</button><button className="btn" onClick={() => { onUpdateJob(editedJobData); setViewModalOpen(false); setViewModalEdit(false); setEditedJobData(null); }}>Save & Close</button></div>)}
                                </div>
                            ) : (<div>No job found.</div>)}
                        </div>
                    </div>
                </div>
            )}
            {showCategoryManager && (
                <window.CategoryManagerModal 
                    onClose={() => setShowCategoryManager(false)}
                    categories={existingCategories}
                    categoryColors={categoryColors}
                    categoryCounts={existingCategories.reduce((acc, cat) => ({ ...acc, [cat]: companies[cat]?.length || 0 }), {})}
                    onAddCategory={handleAddCategory}
                    onRenameCategory={handleRenameCategory}
                    onDeleteCategory={handleDeleteCategory}
                />
            )}
        </div>
    );
};