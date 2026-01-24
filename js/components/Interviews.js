window.Interviews = ({ jobs, onEditJob }) => {
    const { useState, useMemo } = React;
    const [viewType, setViewType] = useState('upcoming'); // upcoming, past
    const [selectedCompany, setSelectedCompany] = useState('');

    const interviews = useMemo(() => {
        const list = [];
        jobs.forEach(job => {
            if (job.interviews && Array.isArray(job.interviews)) {
                job.interviews.forEach(interview => {
                    list.push({
                        ...interview,
                        company: job.company,
                        role: job.role,
                        jobId: job.id,
                        jobStatus: job.status
                    });
                });
            }
        });
        return list;
    }, [jobs]);

    const companies = useMemo(() => [...new Set(interviews.map(i => i.company))].sort(), [interviews]);

    const filteredInterviews = useMemo(() => {
        if (!selectedCompany) return interviews;
        return interviews.filter(i => i.company === selectedCompany);
    }, [interviews, selectedCompany]);

    const upcomingInterviews = filteredInterviews
        .filter(i => i.date && new Date(i.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const pastInterviews = filteredInterviews
        .filter(i => i.date && new Date(i.date) < new Date())
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const unscheduledInterviews = filteredInterviews.filter(i => !i.date);

    // For upcoming view, show upcoming + unscheduled (TBD). For past, just show past.
    const displayList = viewType === 'upcoming' ? [...upcomingInterviews, ...unscheduledInterviews] : pastInterviews;

    const getFormatIcon = (format) => {
        if (!format) return '❓';
        if (format === window.INTERVIEW_FORMATS.IN_PERSON) return '👨‍💼';
        if (format === window.INTERVIEW_FORMATS.PHONE) return '☎️';
        if ([window.INTERVIEW_FORMATS.VIDEO_ZOOM, window.INTERVIEW_FORMATS.VIDEO_TEAMS, window.INTERVIEW_FORMATS.VIDEO_MEET, window.INTERVIEW_FORMATS.VIDEO_OTHER, 'Video Call', 'Other Video Call'].includes(format)) return '📹';
        return '❓';
    };

    return (
        <div className="interviews-view">
            <div className="action-bar">
                <h1 style={{ color: "var(--accent-primary)", fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.75rem" }}>Interview Schedule</h1>
                <div className="filters">
                    <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', marginRight: '0.5rem', cursor: 'pointer' }}><option value="">All companies</option>{companies.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    <button className={`btn ${viewType === 'upcoming' ? '' : 'btn-secondary'}`} onClick={() => setViewType('upcoming')}>Upcoming ({upcomingInterviews.length + unscheduledInterviews.length})</button>
                    <button className={`btn ${viewType === 'past' ? '' : 'btn-secondary'}`} onClick={() => setViewType('past')}>Past ({pastInterviews.length})</button>
                </div>
            </div>

            {displayList.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📅</div>
                    <h3>No {viewType} interviews found</h3>
                    <p>Add interviews to your applications to track them here.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                    {displayList.map(interview => (
                        <div key={interview.id} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span title={interview.format || 'Video Call'} style={{ cursor: 'help', fontSize: '1.1em' }}>{getFormatIcon(interview.format)}</span>
                                        {interview.date ? new Date(interview.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date TBD'}
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-primary)' }}>{interview.type}</h3>
                                    <div style={{ fontSize: '1rem', fontWeight: '500', marginTop: '0.25rem' }}>{interview.company}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{interview.role}</div>
                                </div>
                                {interview.date && <div style={{ background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '8px', textAlign: 'center', minWidth: '60px', border: '1px solid var(--border-primary)' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{new Date(interview.date).getHours()}:{new Date(interview.date).getMinutes().toString().padStart(2, '0')}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{interview.duration}m</div>
                                </div>}
                            </div>
                            
                            {((interview.interviewers && interview.interviewers.length > 0) || interview.notes) && (
                                <div style={{ width: '100%', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                                    {interview.interviewers && interview.interviewers.length > 0 && (
                                        <div style={{ marginBottom: interview.notes ? '0.5rem' : 0 }}>
                                            <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Interviewers</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                {interview.interviewers.map((iv, idx) => (
                                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span>{iv.name}</span>
                                                        {iv.title && <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{iv.title}</span>}
                                                        {iv.linkedin && <a href={iv.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5', textDecoration: 'none' }}>in</a>}
                                                        {iv.email && <a href={`mailto:${iv.email}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>✉️</a>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {interview.notes && <div style={{ whiteSpace: 'pre-wrap' }}>{interview.notes}</div>}
                                </div>
                            )}

                            <button className="btn btn-secondary btn-sm" title="Edit application" style={{ marginTop: 'auto', alignSelf: 'flex-end' }} onClick={() => onEditJob(jobs.find(j => j.id === interview.jobId))}><span role="img" aria-label="Edit">✏️</span></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};