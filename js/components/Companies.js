window.Companies = ({ companies, jobs, blockedCompanies, deletedCategories, categoryColors, setDeletedCategories, onUpdateCompany, onDeleteCompany, onRemoveCompany, onAddJob, onAddCompany, onViewCompanyJobs, onUnhideCompany }) => {
    const { useState, useEffect } = React;
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'company', direction: 'asc' });
    const [editingCompany, setEditingCompany] = useState(null);
    const [editUrl, setEditUrl] = useState('');
    const [editCompanyName, setEditCompanyName] = useState('');
    const [editCategories, setEditCategories] = useState([]);
    const [editFitLevel, setEditFitLevel] = useState(null);
    const [showHidden, setShowHidden] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [appliedFilter, setAppliedFilter] = useState('all');
    const [showAppliedDropdown, setShowAppliedDropdown] = useState(false);
    const [selectedFitLevels, setSelectedFitLevels] = useState([]);
    const [showFitLevelDropdown, setShowFitLevelDropdown] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [bulkCategory, setBulkCategory] = useState('');
    const [bulkNewCategory, setBulkNewCategory] = useState('');
    if (!companies || typeof companies !== 'object') { console.error("Invalid companies prop:", companies); return <div className="empty-state"><h3>Error loading companies</h3></div>; }
    const allCategories = Object.keys(companies).sort();
    const allCompaniesList = Object.values(companies).flat().filter((company, index, self) => index === self.findIndex(c => c.name === company.name)).filter(company => showHidden || !blockedCompanies.includes(company.name));
    const filteredCompaniesList = allCompaniesList.filter(company => {
        const matchesSearch = company && company.name && company.name.toLowerCase().includes(searchTerm.toLowerCase());
        if (selectedCategories.length === 0 && appliedFilter === 'all' && selectedFitLevels.length === 0) return matchesSearch;
        
        const companyCategories = company.categories || (company.category ? [company.category] : ['None']);
        
        if (selectedCategories.length > 0 && !companyCategories.some(c => selectedCategories.includes(c))) return false;
        if (appliedFilter !== 'all') {
            const applicationCount = jobs.filter(j => j.company === company.name).length;
            if (appliedFilter === 'applied' && applicationCount === 0) return false;
            if (appliedFilter === 'not-applied' && applicationCount > 0) return false;
        }
        if (selectedFitLevels.length > 0) {
            const companyFitLabel = window.getFitLevelLabel(company.fitLevel || null);
            if (!selectedFitLevels.includes(companyFitLabel)) return false;
        }
        return matchesSearch;
    });
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        if (key === 'fitLevel' && sortConfig.key !== 'fitLevel') direction = 'desc';
        setSortConfig({ key, direction });
    };
    const getSortIcon = (columnKey) => { if (sortConfig.key !== columnKey) return ' ⇅'; return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'; };
    const handleAddCategory = (name, color) => { if (!name.trim()) return; if (allCategories.includes(name)) { alert('Category already exists'); return; } setDeletedCategories(prev => prev.filter(cat => cat !== name)); onUpdateCompany(null, { newCategory: name, newCategoryColor: color }); };
    const handleDeleteCategory = (categoryName) => { if (categoryName === 'None') { alert("You can't delete the \"None\" category."); return; } if (!confirm(`Delete category "${categoryName}"? Companies in this category will be moved to "None".`)) return; onUpdateCompany(null, { deleteCategory: categoryName }); };
    const handleRenameCategory = (oldName, newName, newColor) => { if (!newName.trim()) return; if (allCategories.includes(newName) && newName !== oldName) { alert('Category name already exists'); return; } if (oldName !== newName) onUpdateCompany(null, { renameCategory: { oldName, newName } }); if (newColor) onUpdateCompany(null, { updateCategoryColor: { category: newName, color: newColor } }); };
    const handleSelectAll = () => { const allCompanyNames = sortedCompaniesList.map(c => c.name); setSelectedCompanies(allCompanyNames); };
    const handleDeselectAll = () => { setSelectedCompanies([]); };
    const handleToggleCompany = (companyName) => { setSelectedCompanies(prev => prev.includes(companyName) ? prev.filter(n => n !== companyName) : [...prev, companyName]); };
    const handleBulkCategoryUpdate = () => { if (!bulkCategory && !bulkNewCategory) { alert('Please select or enter a category'); return; } const category = bulkCategory === '' ? bulkNewCategory : bulkCategory; selectedCompanies.forEach(companyName => { onUpdateCompany(companyName, { category }); }); setSelectedCompanies([]); setShowBulkActions(false); setBulkCategory(''); setBulkNewCategory(''); };
    const handleBulkHide = () => { if (!confirm(`Hide ${selectedCompanies.length} selected companies?`)) return; selectedCompanies.forEach(companyName => { onDeleteCompany(companyName); }); setSelectedCompanies([]); };
    const sortedCompaniesList = [...filteredCompaniesList].sort((a, b) => {
        if (!sortConfig.key) return 0;
        let aVal, bVal;
        if (sortConfig.key === 'applications') { aVal = jobs.filter(j => j.company === a.name).length; bVal = jobs.filter(j => j.company === b.name).length; }
        else if (sortConfig.key === 'company') { aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase(); }
        else if (sortConfig.key === 'category') {
            const aCats = (a.categories || []).join(', ').toLowerCase();
            const bCats = (b.categories || []).join(', ').toLowerCase();
            aVal = aCats; bVal = bCats;
        } else if (sortConfig.key === 'fitLevel') { return window.sortByFitLevel(a.fitLevel || null, b.fitLevel || null, sortConfig.direction); }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const toggleEditCategory = (cat) => {
        setEditCategories(prev => {
            return prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat];
        });
    };

    const handleAddEditCategory = (name, color) => {
        onUpdateCompany(null, { newCategory: name, newCategoryColor: color });
        toggleEditCategory(name);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showCategoryDropdown && !event.target.closest('.filter-select') && !event.target.closest('[data-dropdown="category"]')) setShowCategoryDropdown(false);
            if (showAppliedDropdown && !event.target.closest('.filter-select') && !event.target.closest('[data-dropdown="applied"]')) setShowAppliedDropdown(false);
            if (showFitLevelDropdown && !event.target.closest('.filter-select') && !event.target.closest('[data-dropdown="fitlevel"]')) setShowFitLevelDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showCategoryDropdown, showAppliedDropdown, showFitLevelDropdown]);
    return (
        <div>
            <div className="page-header">
                <div className="page-title-group"><h1 className="page-title">Target companies</h1><span className="text-tertiary-sm">{filteredCompaniesList.length} {filteredCompaniesList.length === 1 ? 'company' : 'companies'}</span>{selectedCompanies.length > 0 && (<span className="text-accent-sm font-medium ml-2">({selectedCompanies.length} selected)</span>)}</div>
                <div className="page-controls"><label className="checkbox-label"><input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} className="checkbox-input" />Show hidden ({blockedCompanies.length})</label><button className="btn" onClick={onAddCompany}>Add company</button></div>
            </div>
            {selectedCompanies.length > 0 && (
                <div className="bulk-actions-bar">
                    <div className="bulk-selection-info"><span className="font-medium">{selectedCompanies.length} companies selected</span><button onClick={handleDeselectAll} className="bulk-clear-btn">Clear selection</button></div>
                    <div className="flex-gap"><button onClick={() => setShowBulkActions(!showBulkActions)} className="bulk-action-btn">Change category</button><button onClick={handleBulkHide} className="bulk-action-btn secondary">Hide</button></div>
                </div>
            )}
            {showBulkActions && (
                <div className="bulk-edit-panel">
                    <h3 className="panel-title">Change category for {selectedCompanies.length} companies</h3>
                    <div className="flex-gap items-end">
                        <div className="flex-1"><label className="filter-label">Category</label><select value={bulkCategory} onChange={(e) => { setBulkCategory(e.target.value); setBulkNewCategory(''); }} className="form-select"><option value="">Select category...</option>{allCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}<option value="">Create new category</option></select></div>
                        {bulkCategory === '' && (<div className="flex-1"><label className="filter-label">New category name</label><input type="text" value={bulkNewCategory} onChange={(e) => setBulkNewCategory(e.target.value)} placeholder="e.g., AI/ML" className="form-input" /></div>)}
                        <button onClick={handleBulkCategoryUpdate} className="btn">Apply</button><button onClick={() => setShowBulkActions(false)} className="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            )}
            <div className="action-bar mb-8">
                <div className="filters flex-1">
                    <div className="search-container"><input type="text" className="search-input" placeholder="Search companies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />{searchTerm && (<button className="clear-search" onClick={() => setSearchTerm("")}>×</button>)}</div>
                    <div className="relative">
                        <button className="filter-select filter-select-btn" onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}><span>{selectedCategories.length === 0 ? 'All categories' : `Categories (${selectedCategories.length})`}</span><span className="text-xs">▼</span></button>
                        {showCategoryDropdown && (
                            <div data-dropdown="category" className="dropdown-menu">
                                <div className="flex-gap mb-2"><button onClick={() => setSelectedCategories([])} className="dropdown-action-btn flex-1 mb-0">Clear all</button><button onClick={() => { setShowCategoryDropdown(false); setShowCategoryManager(true); }} title="Manage categories" className="dropdown-action-btn w-9 flex-center justify-center mb-0">⚙️</button></div>
                                {allCategories.map(category => (<label key={category} className="dropdown-item"><input type="checkbox" checked={selectedCategories.includes(category)} onChange={(e) => { if (e.target.checked) { setSelectedCategories([...selectedCategories, category]); } else { setSelectedCategories(selectedCategories.filter(c => c !== category)); } }} className="checkbox-input" /><span>{category}</span></label>))}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button className="filter-select filter-select-btn" onClick={() => setShowFitLevelDropdown(!showFitLevelDropdown)}><span>{selectedFitLevels.length === 0 ? 'All fit levels' : `Fit level (${selectedFitLevels.length})`}</span><span className="text-xs">▼</span></button>
                        {showFitLevelDropdown && (
                            <div data-dropdown="fitlevel" className="dropdown-menu">
                                <button onClick={() => setSelectedFitLevels([])} className="dropdown-action-btn">Clear all</button>
                                {[window.FIT_LEVELS.HIGH.label, window.FIT_LEVELS.MEDIUM.label, window.FIT_LEVELS.LOW.label, window.FIT_LEVELS.UNSET.label].map(level => (<label key={level} className="dropdown-item"><input type="checkbox" checked={selectedFitLevels.includes(level)} onChange={(e) => { if (e.target.checked) { setSelectedFitLevels([...selectedFitLevels, level]); } else { setSelectedFitLevels(selectedFitLevels.filter(l => l !== level)); } }} className="checkbox-input" /><span>{level}</span></label>))}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button className="filter-select filter-select-btn" onClick={() => setShowAppliedDropdown(!showAppliedDropdown)}><span>{appliedFilter === 'all' ? 'Applied or not' : (appliedFilter === 'applied' ? 'Applied' : 'Not applied')}</span><span className="text-xs">▼</span></button>
                        {showAppliedDropdown && (
                            <div data-dropdown="applied" className="dropdown-menu" style={{ minWidth: "160px" }}>
                                {['All companies', 'Applied', 'Not applied'].map(option => { const value = option === 'All companies' ? 'all' : (option === 'Applied' ? 'applied' : 'not-applied'); return (<label key={option} className="dropdown-item" style={{ background: appliedFilter === value ? "var(--bg-hover)" : "transparent" }}><input type="radio" name="applied-filter" checked={appliedFilter === value} onChange={() => { setAppliedFilter(value); setShowAppliedDropdown(false); }} className="checkbox-input" /><span>{option}</span></label>); })}
                            </div>
                        )}
                    </div>
                    {(searchTerm || selectedCategories.length > 0 || selectedFitLevels.length > 0 || appliedFilter !== 'all') && (<button onClick={() => { setSearchTerm(''); setSelectedCategories([]); setSelectedFitLevels([]); setAppliedFilter('all'); }} className="clear-filters-btn">Clear all</button>)}
                </div>
            </div>
            {filteredCompaniesList.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">🔍</div><h3>No companies found</h3><p>Try adjusting your search</p></div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}><window.Tooltip text={selectedCompanies.length === sortedCompaniesList.length ? 'Deselect all' : 'Select all'}><input type="checkbox" checked={selectedCompanies.length === sortedCompaniesList.length && sortedCompaniesList.length > 0} onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()} className="checkbox-input" /></window.Tooltip></th>
                                <th onClick={() => requestSort('company')} className="sortable-header">Company{getSortIcon('company')}</th>
                                <th onClick={() => requestSort('category')} className="sortable-header"><div className="sortable-header-content">Category{getSortIcon('category')}<button onClick={(e) => { e.stopPropagation(); setShowCategoryManager(true); }} title="Manage categories" className="btn-icon-text">⚙️</button></div></th>
                                <th onClick={() => requestSort('fitLevel')} className="sortable-header"><window.Tooltip text="Fit level reflects how well this company tends to match your goals based on role availability, location, hiring patterns, or past experience. It's subjective and can change over time.">Fit level{getSortIcon('fitLevel')}</window.Tooltip></th>
                                <th onClick={() => requestSort('applications')} className="sortable-header">Applications{getSortIcon('applications')}</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedCompaniesList.map(company => {
                                const isHidden = blockedCompanies.includes(company.name);
                                const companyCategories = company.categories || (company.category ? [company.category] : ['None']);

                                return (
                                    <tr key={company.name} className={isHidden ? "row-hidden" : ""}>
                                        <td><input type="checkbox" checked={selectedCompanies.includes(company.name)} onChange={() => handleToggleCompany(company.name)} className="checkbox-input" onClick={(e) => e.stopPropagation()} /></td>
                                        <td><a href={company.url} target="_blank" rel="noopener noreferrer" className="link">{company.name}&nbsp;<span style={{ fontSize: '0.85em', marginLeft: '0.25rem' }}>↗</span></a></td>
                                        <td>
                                            <window.CategoryList categories={companyCategories} categoryColors={categoryColors} />
                                        </td>
                                        <td><span style={{ fontSize: '0.875rem', fontWeight: company.fitLevel === 3 ? '600' : '400', opacity: company.fitLevel === 1 ? 0.7 : 1 }}>{window.getFitLevelLabel(company.fitLevel || null)}</span></td>
                                        <td>{jobs.filter(j => j.company === company.name).length > 0 ? (<button onClick={() => onViewCompanyJobs(company.name)} style={{ background: 'none', border: 'none', color: "var(--accent-primary)", cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit', padding: 0 }}>{jobs.filter(j => j.company === company.name).length}</button>) : (<span style={{ color: '#6b7280' }}>0</span>)}</td>
                                        <td>
                                            {isHidden ? (
                                                <window.Tooltip text="Unhide company"><button className="icon-btn warning" onClick={() => onUnhideCompany(company.name)} style={{ marginRight: '0.5rem' }}>💡</button></window.Tooltip>
                                            ) : (
                                                <>
                                                    <window.Tooltip text={"Add application to " + company.name}><button className="icon-btn" onClick={() => onAddJob(company)} style={{ marginRight: '0.5rem' }}>➕</button></window.Tooltip>
                                                    <window.Tooltip text="Hide company"><button className="icon-btn" onClick={() => { if (confirm(`Hide ${company.name} from this list?`)) { onDeleteCompany(company.name); } }} style={{ marginRight: '0.5rem' }}>⛔</button></window.Tooltip>
                                                </>
                                            )}
                                            <window.Tooltip text="Edit company"><button className="icon-btn" onClick={() => { setEditingCompany(company); setEditUrl(company.url); setEditCompanyName(company.name); setEditCategories(companyCategories); setEditFitLevel(company.fitLevel || null); }}>✏️</button></window.Tooltip>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            {editingCompany && (
                <div className="modal-overlay" onClick={() => setEditingCompany(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h2>Edit company</h2></div>
                        <div className="modal-body">
                            <div className="form-group"><label>Company name</label><input type="text" value={editCompanyName} onChange={(e) => setEditCompanyName(e.target.value)} placeholder="Company name" /></div>
                            <div className="form-group"><label>URL</label><input type="url" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} placeholder="https://company.com/careers" /></div>
                            
                            <window.CategorySelector 
                                allCategories={allCategories}
                                selectedCategories={editCategories}
                                categoryColors={categoryColors}
                                onToggleCategory={toggleEditCategory}
                                onAddCategory={handleAddEditCategory}
                                onClear={() => setEditCategories([])}
                            />

                            <div className="form-group"><label>Fit Level</label><window.FitLevelSelect value={editFitLevel} onChange={(val) => setEditFitLevel(val)} /></div>
                        </div>
                        <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setEditingCompany(null)}>Cancel</button><button className="btn" onClick={() => { 
                            onUpdateCompany(editingCompany.name, { 
                                name: editCompanyName, 
                                url: editUrl, 
                                categories: editCategories, 
                                fitLevel: editFitLevel
                            }); 
                            setEditingCompany(null); 
                        }}>Save</button></div>
                    </div>
                </div>
            )}
            {showCategoryManager && (
                <window.CategoryManagerModal 
                    onClose={() => setShowCategoryManager(false)}
                    categories={allCategories}
                    categoryColors={categoryColors}
                    categoryCounts={allCategories.reduce((acc, cat) => ({ ...acc, [cat]: companies[cat]?.length || 0 }), {})}
                    onAddCategory={handleAddCategory}
                    onRenameCategory={handleRenameCategory}
                    onDeleteCategory={handleDeleteCategory}
                />
            )}
        </div>
    );
};