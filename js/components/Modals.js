window.JobModal = ({ job, onSave, onClose }) => {
    const { useState } = React;
    const [formData, setFormData] = useState(() => {
        const today = new Date().toISOString().split('T')[0];
        const defaults = {
            company: "", role: "", url: "", status: "Applied", priority: "Tier 2", salary: "", location: "", contact: "", notes: "", followUp: "", dateApplied: today, closeReason: "", progression: "Application", resumeUrl: "", coverLetterUrl: "", fitLevel: null
        };
        if (job) {
            return { ...defaults, ...job, status: job.status || "Applied", priority: job.priority || "Tier 2", progression: job.progression || "Application", dateApplied: job.dateApplied || today, fitLevel: job.fitLevel || null };
        }
        return defaults;
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            if (!formData.company.trim() || !formData.role.trim()) { alert("Company and Role are required"); return; }
            const jobToSave = { ...formData, status: formData.status || "Applied", priority: formData.priority || "Tier 2", progression: formData.progression || "Application" };
            onSave(jobToSave);
        } catch (error) { console.error("Error submitting job:", error); alert("Error saving job: " + error.message); }
    };
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{job?.id ? "Edit application" : "Add application"}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-row">
                            <div className="form-group"><label>Company *</label><input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} /></div>
                            <div className="form-group"><label>Role title *</label><input type="text" required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} /></div>
                        </div>
                        <div className="form-group"><label>Job URL</label><input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} /></div>
                        <div className="form-row">
                            <div className="form-group"><label>Resume URL</label><input type="url" placeholder="Link to resume used for this application" value={formData.resumeUrl} onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })} /></div>
                            <div className="form-group"><label>Cover letter URL</label><input type="url" placeholder="Link to cover letter used for this application" value={formData.coverLetterUrl} onChange={(e) => setFormData({ ...formData, coverLetterUrl: e.target.value })} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Status *</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>{window.STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                            <div className="form-group"><label>Date applied</label><input type="date" value={formData.dateApplied} onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })} /></div>
                        </div>
                        <div className="form-row">
                            {(formData.status === "In Progress" || formData.status === "Closed") && (
                                <div className="form-group"><label>Progression {formData.status === "Closed" && "(final stage)"}</label><select value={formData.progression || ""} onChange={(e) => setFormData({ ...formData, progression: e.target.value })}><option value="">Select progression...</option>{window.PROGRESSIONS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                            )}
                            <div className="form-group"><label>Priority</label><select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>{window.PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Fit Level</label><window.FitLevelSelect value={formData.fitLevel} onChange={(val) => setFormData({ ...formData, fitLevel: val })} /></div>
                        </div>
                        {formData.status === "Closed" && (
                            <div className="form-row">
                                <div className="form-group"><label>Close reason *</label><select required value={formData.closeReason || ""} onChange={(e) => setFormData({ ...formData, closeReason: e.target.value })}><option value="">Select a reason...</option>{Object.values(window.CLOSE_REASONS).map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                                <div className="form-group"><label>Close date</label><input type="date" value={formData.followUp} onChange={(e) => setFormData({ ...formData, followUp: e.target.value })} /></div>
                            </div>
                        )}
                        <div className="form-row">
                            <div className="form-group"><label>Salary range</label><input type="text" placeholder="e.g., $150k-$180k" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} /></div>
                            <div className="form-group"><label>Location</label><input type="text" placeholder="Remote, Pittsburgh, etc." value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></div>
                        </div>
                        <div className="form-group"><label>Contact name</label><input type="text" placeholder="Recruiter or hiring manager" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} /></div>
                        <div className="form-group"><label>Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Interview notes, referral info, etc." /></div>
                    </div>
                    <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn">Save application</button></div>
                </form>
            </div>
        </div>
    );
};

window.CompanyModal = ({ onSave, onClose, existingCategories }) => {
    const { useState } = React;
    const [formData, setFormData] = useState({ name: "", url: "", category: existingCategories[0] || "", newCategory: "", fitLevel: null });
    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            const category = formData.newCategory.trim() || formData.category;
            if (!category || !formData.name.trim() || !formData.url.trim()) { alert("Please fill in all required fields"); return; }
            onSave({ name: formData.name.trim(), url: formData.url.trim(), category: category.trim(), fitLevel: formData.fitLevel });
        } catch (error) { console.error("Error submitting company:", error); alert("Error saving company. Please try again."); }
    };
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header"><h2>Add company</h2><button className="modal-close" onClick={onClose}>×</button></div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group"><label>Company name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Acme Corp" /></div>
                        <div className="form-group"><label>Careers page URL *</label><input type="url" required value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://company.com/careers/jobs" /></div>
                        <div className="form-group"><label>Category *</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value, newCategory: "" })} required={!formData.newCategory}>{existingCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}<option value="">Create new category</option></select></div>
                        {formData.category === "" && (<div className="form-group"><label>New category name *</label><input type="text" required={formData.category === ""} value={formData.newCategory} onChange={(e) => setFormData({ ...formData, newCategory: e.target.value })} placeholder="e.g., SaaS Platforms" /></div>)}
                        <div className="form-group"><label>Fit Level</label><window.FitLevelSelect value={formData.fitLevel} onChange={(val) => setFormData({ ...formData, fitLevel: val })} /></div>
                    </div>
                    <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn">Add company</button></div>
                </form>
            </div>
        </div>
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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                <div className="modal-header"><h2>Import backup</h2><button className="modal-close" onClick={onClose}>×</button></div>
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
            </div>
        </div>
    );
};