const BaseModal = ({ title, onClose, children, maxWidth }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()} style={maxWidth ? { maxWidth } : {}}>
            <div className="modal-header"><h2>{title}</h2><button className="modal-close" onClick={onClose}>×</button></div>
            {children}
        </div>
    </div>
);

const Input = ({ label, type = "text", ...p }) => <div className="form-group"><label>{label}</label><input type={type} {...p} /></div>;
const Select = ({ label, children, ...p }) => <div className="form-group"><label>{label}</label><select {...p}>{children}</select></div>;

window.JobModal = ({ job, onSave, onClose, existingCategories, categoryColors, companyCategories }) => {
    const { useState, useMemo } = React;
    const [newCategoryColors, setNewCategoryColors] = useState({});
    const [formData, setFormData] = useState(() => {
        const today = new Date().toISOString().split('T')[0];
        const defaults = { company: "", role: "", url: "", status: "Applied", priority: "Tier 2", salary: "", location: "", contact: "", notes: "", followUp: "", dateApplied: today, closeReason: "", progression: "Application", resumeUrl: "", coverLetterUrl: "", fitLevel: null, categories: [] };
        const categories = job?.categories?.length ? job.categories : (companyCategories || []);
        return job ? { ...defaults, ...job, categories, status: job.status || "Applied", priority: job.priority || "Tier 2", progression: job.progression || "Application", dateApplied: job.dateApplied || today, fitLevel: job.fitLevel || null } : defaults;
    });

    const toggleCategory = (cat) => setFormData(prev => ({ ...prev, categories: prev.categories.includes(cat) ? prev.categories.filter(c => c !== cat) : [...prev.categories, cat] }));
    const handleAddCategory = (name, color) => { toggleCategory(name); if (color) setNewCategoryColors(prev => ({ ...prev, [name]: color })); };
    const update = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.company.trim() || !formData.role.trim()) return alert("Company and Role are required");
        onSave({ ...formData, newCategoryColors });
    };

    const displayCategories = useMemo(() => Array.from(new Set([...(existingCategories || []), ...(formData.categories || [])])).sort(), [existingCategories, formData.categories]);
    const displayColors = useMemo(() => ({ ...categoryColors, ...newCategoryColors }), [categoryColors, newCategoryColors]);

    return (
        <BaseModal title={job?.id ? "Edit application" : "Add application"} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="modal-body">
                    <div className="form-row">
                        <Input label="Company *" required value={formData.company} onChange={update('company')} />
                        <Input label="Role title *" required value={formData.role} onChange={update('role')} />
                    </div>
                    <Input label="Job URL" type="url" value={formData.url} onChange={update('url')} />
                    <div className="form-row">
                        <Input label="Resume URL" type="url" placeholder="Link to resume" value={formData.resumeUrl} onChange={update('resumeUrl')} />
                        <Input label="Cover letter URL" type="url" placeholder="Link to cover letter" value={formData.coverLetterUrl} onChange={update('coverLetterUrl')} />
                    </div>
                    <div className="form-row">
                        <Select label="Status *" value={formData.status} onChange={update('status')}>{window.STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</Select>
                        <Input label="Date applied" type="date" value={formData.dateApplied} onChange={update('dateApplied')} />
                    </div>
                    <window.CategorySelector allCategories={displayCategories} selectedCategories={formData.categories} categoryColors={displayColors} onToggleCategory={toggleCategory} onAddCategory={handleAddCategory} onClear={() => setFormData(prev => ({ ...prev, categories: [] }))} />
                    <div className="form-row">
                        {(formData.status === "In Progress" || formData.status === "Closed") && (
                            <Select label={`Progression ${formData.status === "Closed" ? "(final stage)" : ""}`} value={formData.progression || ""} onChange={update('progression')}><option value="">Select progression...</option>{window.PROGRESSIONS.map(p => <option key={p} value={p}>{p}</option>)}</Select>
                        )}
                        <Select label="Priority" value={formData.priority} onChange={update('priority')}>{window.PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</Select>
                    </div>
                    <div className="form-row"><div className="form-group"><label>Fit Level</label><window.FitLevelSelect value={formData.fitLevel} onChange={(val) => setFormData(prev => ({ ...prev, fitLevel: val }))} /></div></div>
                    {formData.status === "Closed" && (
                        <div className="form-row">
                            <Select label="Close reason *" required value={formData.closeReason || ""} onChange={update('closeReason')}><option value="">Select a reason...</option>{Object.values(window.CLOSE_REASONS).map(r => <option key={r} value={r}>{r}</option>)}</Select>
                            <Input label="Close date" type="date" value={formData.followUp} onChange={update('followUp')} />
                        </div>
                    )}
                    <div className="form-row">
                        <Input label="Salary range" placeholder="e.g., $150k-$180k" value={formData.salary} onChange={update('salary')} />
                        <Input label="Location" placeholder="Remote, Pittsburgh, etc." value={formData.location} onChange={update('location')} />
                    </div>
                    <Input label="Contact name" placeholder="Recruiter or hiring manager" value={formData.contact} onChange={update('contact')} />
                    <div className="form-group"><label>Notes</label><textarea value={formData.notes} onChange={update('notes')} placeholder="Interview notes, referral info, etc." /></div>
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn">Save application</button></div>
            </form>
        </BaseModal>
    );
};

window.CategoryManagerModal = ({ onClose, categories, categoryColors, categoryCounts, onAddCategory, onRenameCategory, onDeleteCategory }) => {
    const { useState } = React;
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
    const [editingCategoryName, setEditingCategoryName] = useState(null);
    const [editingCategoryNewName, setEditingCategoryNewName] = useState('');
    const [editingCategoryColor, setEditingCategoryColor] = useState('#3b82f6');

    const handleAdd = () => {
        onAddCategory(newCategoryName, newCategoryColor); setNewCategoryName(''); setNewCategoryColor('#3b82f6');
    };

    const handleRename = (oldName) => { onRenameCategory(oldName, editingCategoryNewName, editingCategoryColor); setEditingCategoryName(null); };

    return (
        <BaseModal title="Manage categories" onClose={onClose}>
                <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                    <div style={{ marginBottom: "2rem", padding: "1rem", background: "var(--bg-elevated)", borderRadius: "10px" }}>
                        <h3 style={{ marginBottom: "1rem", fontSize: "0.95rem", fontWeight: "600" }}>Add new category</h3>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <input type="text" placeholder="Category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAdd()} style={{ flex: 1, padding: "0.5rem", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.9rem" }} autoFocus />
                            <input type="color" value={newCategoryColor} onChange={(e) => setNewCategoryColor(e.target.value)} style={{ width: '36px', height: '36px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} title="Choose category color" />
                            <button onClick={handleAdd} className="btn" style={{ whiteSpace: "nowrap" }}>Add</button>
                        </div>
                    </div>
                    <div>
                        <h3 style={{ marginBottom: "1rem", fontSize: "0.95rem", fontWeight: "600" }}>Categories ({categories.length})</h3>
                        {categories.length === 0 ? (<p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No categories yet</p>) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {categories.map(category => {
                                    const companyCount = categoryCounts[category] || 0;
                                    const isEditing = editingCategoryName === category;
                                    const currentColor = category === 'None' ? '#9ca3af' : (categoryColors[category] || '#3b82f6');
                                    return (
                                        <div key={category} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "var(--bg-elevated)", borderRadius: "8px", border: "1px solid var(--border-primary)" }}>
                                            {isEditing ? (
                                                <div style={{ display: 'flex', alignItems: 'center', flex: 1, marginRight: '0.5rem' }}><input type="text" value={editingCategoryNewName} onChange={(e) => setEditingCategoryNewName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleRename(category)} style={{ flex: 1, padding: "0.5rem", background: "var(--bg-primary)", border: "1px solid var(--accent-primary)", borderRadius: "4px", color: "var(--text-primary)", marginRight: "0.5rem" }} autoFocus /><input type="color" value={editingCategoryColor} onChange={(e) => setEditingCategoryColor(e.target.value)} style={{ width: '32px', height: '32px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} /></div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: currentColor, marginRight: '0.5rem' }}></div><div><span style={{ fontWeight: "500", color: "var(--text-primary)" }}>{category}</span><span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginLeft: "0.5rem" }}>({companyCount} {companyCount === 1 ? 'company' : 'companies'})</span></div></div>
                                            )}
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                {isEditing ? (<><button onClick={() => handleRename(category)} style={{ padding: "0.4rem 0.8rem", background: "var(--accent-primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>Save</button><button onClick={() => setEditingCategoryName(null)} style={{ padding: "0.4rem 0.8rem", background: "var(--bg-hover)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>Cancel</button></>) : (<><button onClick={(e) => { e.stopPropagation(); if (category !== 'None') { setEditingCategoryName(category); setEditingCategoryNewName(category); setEditingCategoryColor(categoryColors[category] || '#3b82f6'); } }} disabled={category === 'None'} title={category === 'None' ? "Can't edit default category" : ""} style={{ padding: "0.4rem 0.8rem", background: category === 'None' ? "var(--bg-primary)" : "var(--bg-hover)", color: category === 'None' ? "var(--text-tertiary)" : "var(--text-secondary)", border: "1px solid var(--border-primary)", borderRadius: "4px", cursor: category === 'None' ? "not-allowed" : "pointer", fontSize: "0.8rem", opacity: category === 'None' ? 0.5 : 1 }}>Edit</button><button onClick={(e) => { e.stopPropagation(); if (category !== 'None') { onDeleteCategory(category); } }} disabled={category === 'None'} title={category === 'None' ? "Can't delete default category" : ""} style={{ padding: "0.4rem 0.8rem", background: category === 'None' ? "var(--bg-primary)" : "rgba(255, 0, 0, 0.1)", color: category === 'None' ? "var(--text-tertiary)" : "#ff4444", border: "1px solid var(--border-primary)", borderRadius: "4px", cursor: category === 'None' ? "not-allowed" : "pointer", fontSize: "0.8rem", opacity: category === 'None' ? 0.5 : 1 }}>Delete</button></>)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-footer"><button className="btn" onClick={onClose}>Close</button></div>
        </BaseModal>
    );
};

window.CompanyModal = ({ onSave, onClose, existingCategories, categoryColors }) => {
    const { useState } = React;
    const [formData, setFormData] = useState({ name: "", url: "", categories: [], fitLevel: null });
    const [newCategoryColors, setNewCategoryColors] = useState({});
    
    const toggleCategory = (cat) => {
        setFormData(prev => {
            const exists = prev.categories.includes(cat);
            return { ...prev, categories: exists ? prev.categories.filter(c => c !== cat) : [...prev.categories, cat] };
        });
    };

    const handleAddCategory = (name, color) => {
        toggleCategory(name);
        setNewCategoryColors(prev => ({ ...prev, [name]: color }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            if (formData.categories.length === 0 || !formData.name.trim() || !formData.url.trim()) { alert("Please fill in all required fields"); return; }
            
            onSave({ 
                name: formData.name.trim(), 
                url: formData.url.trim(), 
                categories: formData.categories, 
                fitLevel: formData.fitLevel,
                newCategoryColors: newCategoryColors
            });
        } catch (error) { console.error("Error submitting company:", error); alert("Error saving company. Please try again."); }
    };
    return (
        <BaseModal title="Add company" onClose={onClose}>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                    <Input label="Company name *" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Acme Corp" />
                    <Input label="Careers page URL *" type="url" required value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://company.com/careers/jobs" />
                    <window.CategorySelector allCategories={existingCategories} selectedCategories={formData.categories} categoryColors={categoryColors} onToggleCategory={toggleCategory} onAddCategory={handleAddCategory} onClear={() => setFormData(prev => ({ ...prev, categories: [] }))} />
                    <div className="form-group"><label>Fit Level</label><window.FitLevelSelect value={formData.fitLevel} onChange={(val) => setFormData({ ...formData, fitLevel: val })} /></div>
                    </div>
                    <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn">Add company</button></div>
                </form>
        </BaseModal>
    );
};

window.ImportModal = ({ onImport, onClose }) => {
    const { useState } = React;
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState(null);
    const [preview, setPreview] = useState(null);
    const [importMode, setImportMode] = useState('replace');
    const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setDragActive(true); else if (e.type === "dragleave") setDragActive(false); };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); };
    const handleFileInput = (e) => { if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]); };
    const handleFile = (file) => {
        if (!file.name.endsWith('.json')) { alert('Please select a JSON backup file'); return; }
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const parsed = JSON.parse(content);
                const data = parsed.data || parsed;
                if (!data.jobs || !Array.isArray(data.jobs)) { alert('Invalid backup file: missing jobs data'); return; }
                setFileContent(content);
                setPreview({
                    jobCount: data.jobs.length,
                    companyCount: data.customCompanies ? Object.keys(data.customCompanies).length : 0,
                    exportDate: parsed.exportDate || data.exportDate ? new Date(parsed.exportDate || data.exportDate).toLocaleString() : 'Unknown',
                    companies: data.jobs.map(j => j.company).filter((v, i, a) => a.indexOf(v) === i).slice(0, 10)
                });
            } catch (error) { alert('Error reading file: ' + error.message); }
        };
        reader.readAsText(file);
    };
    const handleImport = () => { if (fileContent) onImport(fileContent, importMode); };
    return (
        <BaseModal title="Import backup" onClose={onClose} maxWidth="700px">
                <div className="modal-body">
                    {!preview ? (
                        <div style={{ border: `2px dashed ${dragActive ? 'var(--accent-primary)' : 'var(--border-primary)'}`, borderRadius: '8px', padding: '3rem 2rem', textAlign: 'center', background: dragActive ? 'var(--bg-hover)' : 'var(--bg-tertiary)', transition: 'all 0.3s' }} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
                            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Drop your backup file here</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>or click to browse</p>
                            <input type="file" accept=".json" onChange={handleFileInput} style={{ display: 'none' }} id="backup-file-input" />
                            <label htmlFor="backup-file-input"><span className="btn">Choose file</span></label>
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-primary)' }}>
                                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>📊 Preview</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Jobs to import</div><div style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>{preview.jobCount}</div></div>
                                    <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Custom categories</div><div style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>{preview.companyCount}</div></div>
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Backup created: {preview.exportDate}</div>
                                {preview.companies.length > 0 && (<div style={{ marginTop: '1rem' }}><div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Companies (first 10):</div><div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{preview.companies.join(', ')}{preview.jobCount > 10 && '...'}</div></div>)}
                            </div>
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-primary)' }}>
                                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Import mode</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', padding: '0.75rem', background: importMode === 'merge' ? 'var(--bg-hover)' : 'transparent', borderRadius: '6px', border: `1px solid ${importMode === 'merge' ? 'var(--accent-primary)' : 'var(--border-primary)'}` }}>
                                        <input type="radio" name="importMode" value="merge" checked={importMode === 'merge'} onChange={(e) => setImportMode(e.target.value)} style={{ marginRight: '0.75rem', marginTop: '0.25rem' }} />
                                        <div><div style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.25rem' }}>🔄 Merge (recommended for historical data)</div><div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Adds new jobs and companies without deleting existing data. Skips duplicates based on company + role + date.</div></div>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', padding: '0.75rem', background: importMode === 'replace' ? 'var(--bg-hover)' : 'transparent', borderRadius: '6px', border: `1px solid ${importMode === 'replace' ? 'var(--accent-primary)' : 'var(--border-primary)'}` }}>
                                        <input type="radio" name="importMode" value="replace" checked={importMode === 'replace'} onChange={(e) => setImportMode(e.target.value)} style={{ marginRight: '0.75rem', marginTop: '0.25rem' }} />
                                        <div><div style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.25rem' }}>⚠️ Replace all</div><div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Deletes all current data and replaces with backup. Use when restoring from backup.</div></div>
                                    </label>
                                </div>
                            </div>
                            <button className="btn btn-secondary" onClick={() => { setPreview(null); setSelectedFile(null); setFileContent(null); }} style={{ width: '100%' }}>← Choose different file</button>
                        </>
                    )}
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>{preview && (<button type="button" className="btn" onClick={handleImport}>{importMode === 'merge' ? '🔄 Merge data' : '⚠️ Replace all data'}</button>)}</div>
        </BaseModal>
    );
};