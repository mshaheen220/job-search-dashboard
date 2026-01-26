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
        <div className="form-group interview-manager-container">
            <div className="interview-manager-header">
                <label className="mb-0">Interviews ({interviews.length})</label>
                {!isAdding && <button type="button" onClick={() => setIsAdding(true)} className="btn-text-action">+ Add Round</button>}
            </div>
            
            {interviews.length > 0 && (
                <div className={`interview-list ${isAdding ? 'mb-4' : ''}`}>
                    {interviews.sort((a, b) => new Date(a.date) - new Date(b.date)).map((interview, idx) => (
                        <div key={interview.id} className="interview-item">
                            <div>
                                <div className="interview-item-title">{interview.type}</div>
                                <div className="interview-item-details">{interview.date ? new Date(interview.date).toLocaleString() : 'No date'} · {interview.format || 'Video Call'} · {interview.duration}m</div>
                                {interview.interviewers && interview.interviewers.length > 0 && (
                                    <div className="interview-item-interviewers">
                                        {interview.interviewers.map((iv, i) => (
                                            <div key={i} className="interviewer-item-row">
                                                <span>👤 {iv.name}</span>
                                                {iv.title && <span className="text-tertiary">- {iv.title}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="interview-item-actions">
                                <window.Tooltip text="Edit round"><button type="button" onClick={() => handleEdit(interview)} className="icon-btn-sm">✏️</button></window.Tooltip>
                                <window.Tooltip text="Delete round"><button type="button" onClick={() => handleDelete(interview.id)} className="icon-btn-sm danger">×</button></window.Tooltip>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isAdding && (
                <div ref={formRef} className="interview-form">
                    <div className="form-grid-2">
                        <select value={newInterview.type} onChange={e => setNewInterview({...newInterview, type: e.target.value})} className="form-input-sm"><option>Recruiter Screen</option><option>Technical Screen</option><option>Hiring Manager</option><option>System Design</option><option>Coding Round</option><option>Behavioral</option><option>Final Round</option></select>
                        <select value={newInterview.format} onChange={e => setNewInterview({...newInterview, format: e.target.value})} className="form-input-sm">{Object.values(window.INTERVIEW_FORMATS).map(f => <option key={f} value={f}>{f}</option>)}</select>
                    </div>
                    <input type="text" placeholder="Meeting link, phone number, or location" value={newInterview.connectionDetails} onChange={e => setNewInterview({...newInterview, connectionDetails: e.target.value})} className="form-input-sm" />
                    <div className="form-grid-2-1">
                        <input type="datetime-local" value={newInterview.date} onChange={e => setNewInterview({...newInterview, date: e.target.value})} className="form-input-sm" />
                        <input type="number" placeholder="Mins" value={newInterview.duration} onChange={e => setNewInterview({...newInterview, duration: e.target.value})} className="form-input-sm" />
                    </div>
                    
                    <div className="interviewer-section">
                        <div className="section-title">Interviewers</div>
                        {newInterview.interviewers.map((iv, idx) => (
                            <div key={idx} className="interviewer-tag">
                                <span>{iv.name} {iv.title && `(${iv.title})`}</span>
                                <button type="button" onClick={() => setNewInterview(prev => ({ ...prev, interviewers: prev.interviewers.filter((_, i) => i !== idx) }))} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', marginRight: '0.25rem' }}>×</button>
                            </div>
                        ))}
                        <div className="interviewer-inputs">
                            <input type="text" placeholder="Name" value={tempInterviewer.name} onChange={e => setTempInterviewer({...tempInterviewer, name: e.target.value})} className="form-input-sm form-input-compact" />
                            <input type="text" placeholder="Title" value={tempInterviewer.title} onChange={e => setTempInterviewer({...tempInterviewer, title: e.target.value})} className="form-input-sm form-input-compact" />
                            <input type="email" placeholder="Email" value={tempInterviewer.email} onChange={e => setTempInterviewer({...tempInterviewer, email: e.target.value})} className="form-input-sm form-input-compact" />
                            <input type="url" placeholder="LinkedIn URL" value={tempInterviewer.linkedin} onChange={e => setTempInterviewer({...tempInterviewer, linkedin: e.target.value})} className="form-input-sm form-input-compact" />
                        </div>
                        <button type="button" onClick={addInterviewer} disabled={!tempInterviewer.name} className="btn-add-interviewer">+ Add Interviewer</button>
                    </div>

                    <textarea placeholder="Notes / Focus areas" value={newInterview.notes} onChange={e => setNewInterview({...newInterview, notes: e.target.value})} className="form-input-sm textarea-compact" />
                    <select value={newInterview.sentiment} onChange={e => setNewInterview({...newInterview, sentiment: e.target.value})} className="form-input-sm"><option value="">How did it go?</option>{Object.values(window.INTERVIEW_SENTIMENTS).map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <div className="form-actions"><button type="button" onClick={handleCancel} className="btn btn-sm btn-secondary">Cancel</button><button type="button" onClick={handleSave} className="btn btn-sm">{editingId ? 'Update' : 'Add'}</button></div>
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

window.JobDetailsModal = ({ job, onClose, onUpdateJob, onViewInterviews }) => {
    const { useState, useRef, useEffect } = React;
    const [isEditing, setIsEditing] = useState(false);
    const [editedJobData, setEditedJobData] = useState(null);
    const notesTextareaRef = useRef(null);

    const autoExpandTextarea = () => { 
        if (notesTextareaRef.current) { 
            notesTextareaRef.current.style.height = 'auto'; 
            notesTextareaRef.current.style.height = Math.max(notesTextareaRef.current.scrollHeight, 120) + 'px'; 
        } 
    };

    useEffect(() => { autoExpandTextarea(); }, [job, editedJobData, isEditing]);

    const handleSave = () => {
        onUpdateJob(editedJobData);
        setIsEditing(false);
        setEditedJobData(null);
    };

    const startEditing = () => {
        setEditedJobData({ ...job });
        setIsEditing(true);
    };

    const currentJob = isEditing ? editedJobData : job;
    const update = (field) => (e) => setEditedJobData(prev => ({ ...prev, [field]: e.target.value }));

    return (
        <BaseModal title="Application details" onClose={onClose} maxWidth="700px">
            <div className="modal-header" style={{ display: 'none' }}></div> {/* Hidden because BaseModal has header, but we want custom controls in body or we use BaseModal's header? BaseModal has header. We can inject buttons there? BaseModal doesn't support custom header actions easily. Let's use the pattern from Applications.js but adapted for BaseModal structure or just put actions in body top? Actually BaseModal renders title and close. We can put the edit button in the body top right absolutely positioned or just below header. Let's stick to the previous layout by putting controls in the body if needed or just use the footer. The previous layout had edit button in header. BaseModal doesn't support that. Let's just put the edit button in the top of the body. */}
            
            <div className="modal-body">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    {isEditing ? (<button className="btn btn-sm" onClick={handleSave}>Save & close</button>) : (<window.Tooltip text="Edit"><button className="icon-btn" onClick={startEditing}>✏️</button></window.Tooltip>)}
                </div>
                <div className="job-details-header">
                    <h3 className="job-details-title">{currentJob.role} @ {currentJob.company}</h3>
                    <div className="form-row">
                        <div className="form-group"><label>Company</label><input type="text" value={currentJob.company || ''} readOnly={!isEditing} onChange={update('company')} className={isEditing ? '' : 'view-field'} /></div>
                        <div className="form-group"><label>Role</label><input type="text" value={currentJob.role || ''} readOnly={!isEditing} onChange={update('role')} className={isEditing ? '' : 'view-field'} /></div>
                    </div>
                    <div className="form-group"><label>Job URL</label>{isEditing ? (<input type="url" value={currentJob.url || ''} onChange={update('url')} />) : (currentJob.url ? (<div className="view-field job-url-display"><a href={currentJob.url} target="_blank" rel="noopener noreferrer" className="link" onClick={(e) => e.stopPropagation()}>{currentJob.url}</a></div>) : (<div className="view-field">-</div>))}</div>
                    <div className="form-row">
                        <div className="form-group"><label>Resume URL</label>{isEditing ? (<input type="url" value={currentJob.resumeUrl || ''} onChange={update('resumeUrl')} />) : (currentJob.resumeUrl ? (<div className="view-field job-url-display"><a href={currentJob.resumeUrl} target="_blank" rel="noopener noreferrer" className="link" onClick={(e) => e.stopPropagation()}>{currentJob.resumeUrl}</a></div>) : (<div className="view-field">-</div>))}</div>
                        <div className="form-group"><label>Cover letter URL</label>{isEditing ? (<input type="url" value={currentJob.coverLetterUrl || ''} onChange={update('coverLetterUrl')} />) : (currentJob.coverLetterUrl ? (<div className="view-field job-url-display"><a href={currentJob.coverLetterUrl} target="_blank" rel="noopener noreferrer" className="link" onClick={(e) => e.stopPropagation()}>{currentJob.coverLetterUrl}</a></div>) : (<div className="view-field">-</div>))}</div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label>Status</label><input type="text" value={currentJob.status || ''} readOnly={!isEditing} onChange={update('status')} className={isEditing ? '' : 'view-field'} /></div>
                        <div className="form-group"><label>Date applied</label><input type="date" value={currentJob.dateApplied || ''} readOnly={!isEditing} onChange={update('dateApplied')} className={isEditing ? '' : 'view-field'} /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label>Progression</label><input type="text" value={currentJob.progression || ''} readOnly={!isEditing} onChange={update('progression')} className={isEditing ? '' : 'view-field'} /></div>
                        <div className="form-group"><label>Priority</label><input type="text" value={currentJob.priority || ''} readOnly={!isEditing} onChange={update('priority')} className={isEditing ? '' : 'view-field'} /></div>
                    </div>
                    {job.interviews && job.interviews.length > 0 && (<div className="form-group"><label>Interviews</label><div className="modal-interviews-summary"><span className="text-primary">{job.interviews.length} round{job.interviews.length !== 1 ? 's' : ''}</span><button onClick={() => { onClose(); onViewInterviews(job.company); }} className="btn-link">View details →</button></div></div>)}
                    {(currentJob.closeReason || currentJob.followUp) && (<div className="form-row"><div className="form-group"><label>Close reason</label><input type="text" value={currentJob.closeReason || ''} readOnly={!isEditing} onChange={update('closeReason')} className={isEditing ? '' : 'view-field'} /></div><div className="form-group"><label>Close date</label><input type="date" value={currentJob.followUp || ''} readOnly={!isEditing} onChange={update('followUp')} className={isEditing ? '' : 'view-field'} /></div></div>)}
                    <div className="form-row"><div className="form-group"><label>Salary</label><input type="text" value={currentJob.salary || ''} readOnly={!isEditing} onChange={update('salary')} className={isEditing ? '' : 'view-field'} /></div><div className="form-group"><label>Location</label><input type="text" value={currentJob.location || ''} readOnly={!isEditing} onChange={update('location')} className={isEditing ? '' : 'view-field'} /></div></div>
                    <div className="form-group"><label>Contact name</label><input type="text" value={currentJob.contact || ''} readOnly={!isEditing} onChange={update('contact')} className={isEditing ? '' : 'view-field'} /></div>
                    <div className="form-group"><label>Notes</label>{isEditing ? (<textarea value={currentJob.notes || ''} onChange={update('notes')} ref={notesTextareaRef} className="notes-edit" />) : (<div className="view-field notes-view" dangerouslySetInnerHTML={{ __html: currentJob.notes ? window.UIUtil.linkify(currentJob.notes) : '-' }}></div>)}</div>
                    {isEditing && (<div className="modal-footer-custom"><button className="btn btn-secondary" onClick={() => { setIsEditing(false); setEditedJobData(null); }}>Cancel</button><button className="btn" onClick={handleSave}>Save & Close</button></div>)}
                </div>
            </div>
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
                <div className="modal-body modal-body-scrollable">
                    <div className="category-manager-add">
                        <h3 style={{ marginBottom: "1rem", fontSize: "0.95rem", fontWeight: "600" }}>Add new category</h3>
                        <div className="category-manager-row">
                            <input type="text" placeholder="Category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAdd()} className="category-manager-input" autoFocus />
                            <window.Tooltip text="Choose category color"><input type="color" value={newCategoryColor} onChange={(e) => setNewCategoryColor(e.target.value)} className="category-manager-color" /></window.Tooltip>
                            <button onClick={handleAdd} className="btn btn-nowrap">Add</button>
                        </div>
                    </div>
                    <div>
                        <h3 style={{ marginBottom: "1rem", fontSize: "0.95rem", fontWeight: "600" }}>Categories ({categories.length})</h3>
                        {categories.length === 0 ? (<p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No categories yet</p>) : (
                            <div className="category-list">
                                {categories.map(category => {
                                    const companyCount = categoryCounts[category] || 0;
                                    const isEditing = editingCategoryName === category;
                                    const currentColor = window.CategoryUtil.getColor(category, categoryColors);
                                    return (
                                        <div key={category} className="category-list-item">
                                            {isEditing ? (
                                                <div className="category-edit-container"><input type="text" value={editingCategoryNewName} onChange={(e) => setEditingCategoryNewName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleRename(category)} className="category-manager-input category-edit-input" autoFocus /><input type="color" value={editingCategoryColor} onChange={(e) => setEditingCategoryColor(e.target.value)} className="color-picker-sm" title="Choose color" /></div>
                                            ) : (
                                                <div className="flex-center"><div className="category-dot" style={{ backgroundColor: currentColor }}></div><div><span className="font-medium">{category}</span><span className="text-sm-secondary">({companyCount} {companyCount === 1 ? 'company' : 'companies'})</span></div></div>
                                            )}
                                            <div className="flex-gap-2">
                                                {isEditing ? (<><button onClick={() => handleRename(category)} className="btn-xs primary">Save</button><button onClick={() => setEditingCategoryName(null)} className="btn-xs secondary">Cancel</button></>) : (<><button onClick={(e) => { e.stopPropagation(); if (category !== 'None') { setEditingCategoryName(category); setEditingCategoryNewName(category); setEditingCategoryColor(categoryColors[category] || '#3b82f6'); } }} disabled={category === 'None'} title={category === 'None' ? "Can't edit default category" : ""} className={`btn-xs secondary ${category === 'None' ? 'btn-disabled-look' : ''}`}>Edit</button><button onClick={(e) => { e.stopPropagation(); if (category !== 'None') { onDeleteCategory(category); } }} disabled={category === 'None'} title={category === 'None' ? "Can't delete default category" : ""} className={`btn-xs danger-light ${category === 'None' ? 'btn-disabled-look' : ''}`}>Delete</button></>)}
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
                            <input type="file" accept=".json" onChange={handleFileInput} className="hidden" id="backup-file-input" />
                            <label htmlFor="backup-file-input"><span className="btn">Choose file</span></label>
                        </div>
                    ) : (
                        <>
                            <div className="preview-box">
                                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>📊 Preview</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Jobs to import</div><div style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>{preview.jobCount}</div></div>
                                    <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Custom categories</div><div style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>{preview.companyCount}</div></div>
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Backup created: {preview.exportDate}</div>
                                {preview.companies.length > 0 && (<div style={{ marginTop: '1rem' }}><div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Companies (first 10):</div><div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{preview.companies.join(', ')}{preview.jobCount > 10 && '...'}</div></div>)}
                            </div>
                            <div className="preview-box">
                                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Import mode</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label className={`import-option ${importMode === 'merge' ? 'selected' : ''}`}>
                                        <input type="radio" name="importMode" value="merge" checked={importMode === 'merge'} onChange={(e) => setImportMode(e.target.value)} className="radio-input" />
                                        <div><div className="import-text-title">🔄 Merge (recommended for historical data)</div><div className="import-text-desc">Adds new jobs and companies without deleting existing data. Skips duplicates based on company + role + date.</div></div>
                                    </label>
                                    <label className={`import-option ${importMode === 'replace' ? 'selected' : ''}`}>
                                        <input type="radio" name="importMode" value="replace" checked={importMode === 'replace'} onChange={(e) => setImportMode(e.target.value)} className="radio-input" />
                                        <div><div className="import-text-title">⚠️ Replace all</div><div className="import-text-desc">Deletes all current data and replaces with backup. Use when restoring from backup.</div></div>
                                    </label>
                                </div>
                            </div>
                            <button className="btn btn-secondary w-full" onClick={() => { setPreview(null); setSelectedFile(null); setFileContent(null); }}>← Choose different file</button>
                        </>
                    )}
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>{preview && (<button type="button" className="btn" onClick={handleImport}>{importMode === 'merge' ? '🔄 Merge data' : '⚠️ Replace all data'}</button>)}</div>
        </BaseModal>
    );
};