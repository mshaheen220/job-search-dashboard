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

const InterviewManager = ({ interviews, onChange, initialEditingInterviewId }) => {
    const { useState, useEffect, useRef } = React;
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newInterview, setNewInterview] = useState({ type: 'Recruiter Screen', format: window.INTERVIEW_FORMATS.VIDEO_OTHER, sentiment: '', date: '', duration: 30, connectionDetails: '', interviewers: [], notes: '' });
    const [tempInterviewer, setTempInterviewer] = useState({ name: '', title: '', email: '', linkedin: '' });
    const formRef = useRef(null);

    useEffect(() => {
        if (initialEditingInterviewId) {
            const interview = interviews.find(i => i.id === initialEditingInterviewId);
            if (interview) {
                setNewInterview({ ...interview });
                setEditingId(initialEditingInterviewId);
                setIsAdding(true);
                // Scroll to form
                setTimeout(() => {
                    if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
    }, []);

    const handleSave = () => {
        if (editingId) {
            onChange(interviews.map(i => i.id === editingId ? { ...newInterview, id: editingId } : i));
        } else {
            onChange([...interviews, { ...newInterview, id: Date.now().toString(36) + Math.random().toString(36).substr(2) }]);
        }
        setIsAdding(false);
        setEditingId(null);
        setNewInterview({ type: 'Recruiter Screen', format: window.INTERVIEW_FORMATS.VIDEO_OTHER, sentiment: '', date: '', duration: 30, connectionDetails: '', interviewers: [], notes: '' });
        setTempInterviewer({ name: '', title: '', email: '', linkedin: '' });
    };

    const handleEdit = (interview) => {
        setNewInterview({ ...interview });
        setEditingId(interview.id);
        setIsAdding(true);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setNewInterview({ type: 'Recruiter Screen', format: window.INTERVIEW_FORMATS.VIDEO_OTHER, sentiment: '', date: '', duration: 30, connectionDetails: '', interviewers: [], notes: '' });
        setTempInterviewer({ name: '', title: '', email: '', linkedin: '' });
    };

    const addInterviewer = () => {
        if (!tempInterviewer.name.trim()) return;
        setNewInterview(prev => ({ ...prev, interviewers: [...prev.interviewers, tempInterviewer] }));
        setTempInterviewer({ name: '', title: '', email: '', linkedin: '' });
    };

    const handleDelete = (id) => {
        onChange(interviews.filter(i => i.id !== id));
    };

    return (
        <div className="form-group" style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label style={{ marginBottom: 0 }}>Interviews ({interviews.length})</label>
                {!isAdding && <button type="button" onClick={() => setIsAdding(true)} style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>+ Add Round</button>}
            </div>
            
            {interviews.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: isAdding ? '1rem' : 0 }}>
                    {interviews.sort((a, b) => new Date(a.date) - new Date(b.date)).map((interview, idx) => (
                        <div key={interview.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-primary)' }}>
                            <div>
                                <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{interview.type}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{interview.date ? new Date(interview.date).toLocaleString() : 'No date'} · {interview.format || 'Video Call'} · {interview.duration}m</div>
                                {interview.interviewers && interview.interviewers.length > 0 && (
                                    <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                        {interview.interviewers.map((iv, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <span>👤 {iv.name}</span>
                                                {iv.title && <span style={{ color: 'var(--text-tertiary)' }}>- {iv.title}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <window.Tooltip text="Edit round"><button type="button" onClick={() => handleEdit(interview)} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>✏️</button></window.Tooltip>
                                <window.Tooltip text="Delete round"><button type="button" onClick={() => handleDelete(interview.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>×</button></window.Tooltip>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isAdding && (
                <div ref={formRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px dashed var(--accent-primary)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <select value={newInterview.type} onChange={e => setNewInterview({...newInterview, type: e.target.value})} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}><option>Recruiter Screen</option><option>Technical Screen</option><option>Hiring Manager</option><option>System Design</option><option>Coding Round</option><option>Behavioral</option><option>Final Round</option></select>
                        <select value={newInterview.format} onChange={e => setNewInterview({...newInterview, format: e.target.value})} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{Object.values(window.INTERVIEW_FORMATS).map(f => <option key={f} value={f}>{f}</option>)}</select>
                    </div>
                    <input type="text" placeholder="Meeting link, phone number, or location" value={newInterview.connectionDetails} onChange={e => setNewInterview({...newInterview, connectionDetails: e.target.value})} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                        <input type="datetime-local" value={newInterview.date} onChange={e => setNewInterview({...newInterview, date: e.target.value})} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                        <input type="number" placeholder="Mins" value={newInterview.duration} onChange={e => setNewInterview({...newInterview, duration: e.target.value})} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>
                    
                    <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-primary)' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>Interviewers</div>
                        {newInterview.interviewers.map((iv, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', padding: '0.25rem', background: 'color-mix(in srgb, var(--accent-primary), transparent 90%)', borderRadius: '4px' }}>
                                <span>{iv.name} {iv.title && `(${iv.title})`}</span>
                                <button type="button" onClick={() => setNewInterview(prev => ({ ...prev, interviewers: prev.interviewers.filter((_, i) => i !== idx) }))} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', marginRight: '0.25rem' }}>×</button>
                            </div>
                        ))}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem', marginTop: '1.0rem', borderTop: '1px dashed var(--border-primary)', paddingTop: '0.5rem' }}>
                            <input type="text" placeholder="Name" value={tempInterviewer.name} onChange={e => setTempInterviewer({...tempInterviewer, name: e.target.value})} style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border-primary)', fontSize: '0.85rem' }} />
                            <input type="text" placeholder="Title" value={tempInterviewer.title} onChange={e => setTempInterviewer({...tempInterviewer, title: e.target.value})} style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border-primary)', fontSize: '0.85rem' }} />
                            <input type="email" placeholder="Email" value={tempInterviewer.email} onChange={e => setTempInterviewer({...tempInterviewer, email: e.target.value})} style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border-primary)', fontSize: '0.85rem' }} />
                            <input type="url" placeholder="LinkedIn URL" value={tempInterviewer.linkedin} onChange={e => setTempInterviewer({...tempInterviewer, linkedin: e.target.value})} style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border-primary)', fontSize: '0.85rem' }} />
                        </div>
                        <button type="button" onClick={addInterviewer} disabled={!tempInterviewer.name} style={{ width: '100%', padding: '0.3rem', background: 'var(--bg-hover)', border: '1px solid var(--border-primary)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>+ Add Interviewer</button>
                    </div>

                    <textarea placeholder="Notes / Focus areas" value={newInterview.notes} onChange={e => setNewInterview({...newInterview, notes: e.target.value})} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', minHeight: '60px' }} />
                    <select value={newInterview.sentiment} onChange={e => setNewInterview({...newInterview, sentiment: e.target.value})} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}><option value="">How did it go?</option>{Object.values(window.INTERVIEW_SENTIMENTS).map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}><button type="button" onClick={handleCancel} className="btn btn-sm btn-secondary">Cancel</button><button type="button" onClick={handleSave} className="btn btn-sm">{editingId ? 'Update' : 'Add'}</button></div>
                </div>
            )}
        </div>
    );
};

window.JobModal = ({ job, onSave, onClose, existingCategories, categoryColors, companyCategories, initialEditingInterviewId }) => {
    const { useState, useMemo } = React;
    const [newCategoryColors, setNewCategoryColors] = useState({});
    const [formData, setFormData] = useState(() => {
        const today = new Date().toISOString().split('T')[0];
        const defaults = { company: "", role: "", url: "", status: "Applied", priority: "Tier 2", salary: "", location: "", contact: "", notes: "", followUp: "", dateApplied: today, closeReason: "", progression: "Application", resumeUrl: "", coverLetterUrl: "", fitLevel: null, categories: [], interviews: [] };
        const categories = job?.categories?.length ? job.categories : (companyCategories || []);
        return job ? { ...defaults, ...job, categories, status: job.status || "Applied", priority: job.priority || "Tier 2", progression: job.progression || "Application", dateApplied: job.dateApplied || today, fitLevel: job.fitLevel || null, interviews: job.interviews || [] } : defaults;
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
                    <InterviewManager interviews={formData.interviews} onChange={(newInterviews) => setFormData(prev => ({ ...prev, interviews: newInterviews }))} initialEditingInterviewId={initialEditingInterviewId} />
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
                            <window.Tooltip text="Choose category color"><input type="color" value={newCategoryColor} onChange={(e) => setNewCategoryColor(e.target.value)} style={{ width: '36px', height: '36px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} /></window.Tooltip>
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
                                                <div style={{ display: 'flex', alignItems: 'center', flex: 1, marginRight: '0.5rem' }}><input type="text" value={editingCategoryNewName} onChange={(e) => setEditingCategoryNewName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleRename(category)} style={{ flex: 1, padding: "0.5rem", background: "var(--bg-primary)", border: "1px solid var(--accent-primary)", borderRadius: "4px", color: "var(--text-primary)", marginRight: "0.5rem" }} autoFocus /><input type="color" value={editingCategoryColor} onChange={(e) => setEditingCategoryColor(e.target.value)} style={{ width: '32px', height: '32px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} title="Choose color" /></div>
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