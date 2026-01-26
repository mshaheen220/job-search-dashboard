window.JobsTable = ({ jobs, filters, setFilters, categoryColors, existingCategories, companies, onUpdateCompany, setDeletedCategories, onAdd, onEdit, onViewJob, onUpdateJob, onDelete, onExport, onBackup, requestSort, getSortIcon, onViewInterviews }) => {
    const { useState, useEffect } = React;
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
    useEffect(() => { setCurrentPage(1); }, [filters.search, filters.company, selectedStatuses.length, selectedPriorities.length, selectedFitLevels.length, dateRangeFilter]);
    const activeFiltersCount = [filters.search, filters.company, selectedStatuses.length > 0, selectedPriorities.length > 0, selectedFitLevels.length > 0, dateRangeFilter.start || dateRangeFilter.end].filter(Boolean).length;
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

        return <window.Tooltip text={title}><span className={className} /></window.Tooltip>;
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
            <div className="page-header">
                <div className="page-title-group"><h1 className="page-title">Applications</h1><span className="text-tertiary-sm">{filteredJobs.length === jobs.length ? `${jobs.length} ${jobs.length === 1 ? 'application' : 'applications'}` : `${filteredJobs.length} of ${jobs.length}`}</span></div>
                <div className="page-controls"><button className="btn btn-secondary" onClick={onExport}>📊 Export CSV</button><button className="btn" onClick={onAdd}>Add application</button></div>
            </div>
            <div className="action-bar mt-4">
                <div className="filters-section" data-filter-group="applications-filters" style={{ flex: 1 }}>
                    <div className="filters-row">
                        <div className="search-container"><input type="text" className="search-input" placeholder="Search applications by role or company" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />{filters.search && (<button className="clear-search" onClick={() => setFilters({ ...filters, search: "" })}>×</button>)}</div>
                        {filters.company && (
                            <div className="filter-pill">
                                <span>Company: <strong>{filters.company}</strong></span>
                                <button onClick={() => setFilters({ ...filters, company: '' })} className="filter-pill-remove">×</button>
                            </div>
                        )}
                        <div style={{ position: "relative" }}>
                            <button className="filter-select filter-select-btn" onClick={() => setShowStatusDropdown(!showStatusDropdown)}><span>{selectedStatuses.length === 0 ? 'All statuses' : `Status (${selectedStatuses.length})`}</span><span style={{ fontSize: "0.7rem" }}>▼</span></button>
                            {showStatusDropdown && (
                                <div data-dropdown="status" className="dropdown-menu" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                    <button onClick={() => setSelectedStatuses([])} className="dropdown-action-btn">Clear all</button>
                                    {window.STATUSES.map(status => (<label key={status} className="dropdown-item"><input type="checkbox" checked={selectedStatuses.includes(status)} onChange={() => toggleStatus(status)} className="checkbox-input" /><span>{status}</span></label>))}
                                </div>
                            )}
                        </div>
                        <div style={{ position: "relative" }}>
                            <button className="filter-select filter-select-btn" onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}><span>{selectedPriorities.length === 0 ? 'All priorities' : `Priority (${selectedPriorities.length})`}</span><span style={{ fontSize: "0.7rem" }}>▼</span></button>
                            {showPriorityDropdown && (
                                <div data-dropdown="priority" className="dropdown-menu">
                                    <button onClick={() => setSelectedPriorities([])} className="dropdown-action-btn">Clear all</button>
                                    {window.PRIORITIES.map(priority => (<label key={priority} className="dropdown-item"><input type="checkbox" checked={selectedPriorities.includes(priority)} onChange={() => togglePriority(priority)} className="checkbox-input" /><span>{priority}</span></label>))}
                                </div>
                            )}
                        </div>
                        {visibleColumns.fitLevel && (<div style={{ position: "relative" }}>
                            <button className="filter-select filter-select-btn" onClick={() => setShowFitLevelDropdown(!showFitLevelDropdown)}><span>{selectedFitLevels.length === 0 ? 'All fit levels' : `Fit level (${selectedFitLevels.length})`}</span><span style={{ fontSize: "0.7rem" }}>▼</span></button>
                            {showFitLevelDropdown && (
                                <div data-dropdown="fitlevel" className="dropdown-menu">
                                    <button onClick={() => setSelectedFitLevels([])} className="dropdown-action-btn">Clear all</button>
                                    {[window.FIT_LEVELS.HIGH.label, window.FIT_LEVELS.MEDIUM.label, window.FIT_LEVELS.LOW.label, window.FIT_LEVELS.UNSET.label].map(level => (<label key={level} className="dropdown-item"><input type="checkbox" checked={selectedFitLevels.includes(level)} onChange={() => toggleFitLevel(level)} className="checkbox-input" /><span>{level}</span></label>))}
                                </div>
                            )}
                        </div>)}
                        <button className={`advanced-filters-toggle ${showAdvancedFilters ? 'active' : ''}`} onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>📅 Application date {activeFiltersCount > 0 && ` (${activeFiltersCount})`}</button>
                        {(filters.search || filters.company || selectedStatuses.length > 0 || selectedPriorities.length > 0 || selectedFitLevels.length > 0 || dateRangeFilter.start || dateRangeFilter.end) && (<button onClick={clearFilters} className="clear-filters-btn">Clear all</button>)}
                    </div>
                </div>
                <button className="btn btn-secondary" onClick={() => setShowColumnSelector(!showColumnSelector)}>⚙️ Columns</button>
            </div>
            {showAdvancedFilters && (
                <div className="advanced-filters-panel">
                    <div className="grid-responsive">
                        <div className="filter-group"><label className="filter-label">Date from</label><input type="date" className="filter-select" value={dateRangeFilter.start} onChange={(e) => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))} /></div>
                        <div className="filter-group"><label className="filter-label">Date to</label><input type="date" className="filter-select" value={dateRangeFilter.end} onChange={(e) => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))} /></div>
                    </div>
                </div>
            )}
            {showColumnSelector && (
                <div className="column-selector-panel">
                    <h4 className="panel-title">Visible columns</h4>
                    <div className="grid-columns">
                        {columns.map(col => (<label key={col.key} className="column-selector-item"><input type="checkbox" checked={visibleColumns[col.key]} onChange={() => toggleColumn(col.key)} className="checkbox-input" /><span>{col.label}</span></label>))}
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
                                    {visibleColumns.company && (<th onClick={() => requestSort('company')} className="sortable-header">Company{getSortIcon('company')}</th>)}
                                    {visibleColumns.role && (<th onClick={() => requestSort('role')} className="sortable-header">Role{getSortIcon('role')}</th>)}
                                    {visibleColumns.status && (<th onClick={() => requestSort('status')} className="sortable-header">Status{getSortIcon('status')}</th>)}
                                    {visibleColumns.categories && (<th><div className="sortable-header-content">Categories<button onClick={(e) => { e.stopPropagation(); setShowCategoryManager(true); }} title="Manage categories" className="btn-icon-text">⚙️</button></div></th>)}
                                    {visibleColumns.priority && (<th onClick={() => requestSort('priority')} className="sortable-header">Priority{getSortIcon('priority')}</th>)}
                                    {visibleColumns.fitLevel && (<th onClick={() => requestSort('fitLevel')} className="sortable-header">Fit Level{getSortIcon('fitLevel')}</th>)}
                                    {visibleColumns.dateApplied && (<th onClick={() => requestSort('dateApplied')} className="sortable-header">Date applied{getSortIcon('dateApplied')}</th>)}
                                    {visibleColumns.salary && (<th onClick={() => requestSort('salary')} className="sortable-header">Salary{getSortIcon('salary')}</th>)}
                                    {visibleColumns.closeReason && (<th onClick={() => requestSort('closeReason')} className="sortable-header">Reason{getSortIcon('closeReason')}</th>)}
                                    {visibleColumns.progression && (<th onClick={() => requestSort('progression')} className="sortable-header">Progress{getSortIcon('progression')}</th>)}
                                    {visibleColumns.followUp && (<th onClick={() => requestSort('followUp')} className="sortable-header">Close date{getSortIcon('followUp')}</th>)}
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
                                        {visibleColumns.role && (<td className="flex-center-gap"><button className="icon-btn" title="View" onClick={() => onViewJob(job)}><span role="img" aria-label="View">👁️</span></button>{job.url ? (<a href={job.url} target="_blank" rel="noopener noreferrer" className="link">{job.role}&nbsp;<span className="link-arrow">↗</span></a>) : job.role}</td>)}
                                        {visibleColumns.status && <td><window.StatusBadge status={job.status} /></td>}
                                        {visibleColumns.categories && (
                                            <td>
                                                <window.CategoryList categories={job.categories || []} categoryColors={categoryColors} />
                                            </td>
                                        )}
                                        {visibleColumns.priority && <td><window.PriorityBadge priority={job.priority} /></td>}
                                        {visibleColumns.fitLevel && <td>{window.getFitLevelLabel(job.fitLevel)}</td>}
                                        {visibleColumns.dateApplied && <td>{job.dateApplied ? <div className="flex-center-gap">{getAgeIcon(job.dateApplied, job.status)} {new Date(job.dateApplied + 'T00:00:00').toLocaleDateString()}</div> : '-'}</td>}
                                        {visibleColumns.salary && <td>{job.salary || "-"}</td>}
                                        {visibleColumns.closeReason && <td>{job.closeReason || "-"}</td>}
                                        {visibleColumns.progression && <td>{job.progression || "-"}</td>}
                                        {visibleColumns.followUp && <td>{job.followUp ? new Date(job.followUp + 'T00:00:00').toLocaleDateString() : "-"}</td>}
                                        {visibleColumns.notes && (<td className="notes-cell">{job.notes || "-"}</td>)}
                                        {visibleColumns.resumeUrl && (<td>{job.resumeUrl ? (<a href={job.resumeUrl} target="_blank" rel="noopener noreferrer" className="link">📄&nbsp;View</a>) : "-"}</td>)}
                                        {visibleColumns.coverLetterUrl && (<td>{job.coverLetterUrl ? (<a href={job.coverLetterUrl} target="_blank" rel="noopener noreferrer" className="link">📝&nbsp;View</a>) : "-"}</td>)}
                                        <td>
                                            <div className="flex-gap">
                                            <window.Tooltip text="Edit"><button className="icon-btn" onClick={() => onEdit(job)}>✏️</button></window.Tooltip>
                                            <window.Tooltip text="Close as rejected today"><button className="icon-btn" onClick={() => handleQuickClose(job)}>🚫</button></window.Tooltip>
                                            <window.Tooltip text="Delete"><button className="icon-btn danger" onClick={() => onDelete(job.id)}>🗑️</button></window.Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button className="pagination-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>««</button>
                            <button className="pagination-btn" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>‹</button>
                            <span className="text-secondary-sm">Page {currentPage} of {totalPages} ({filteredJobs.length} total)</span>
                            <button className="pagination-btn" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>›</button>
                            <button className="pagination-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»»</button>
                        </div>
                    )}
                </>
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