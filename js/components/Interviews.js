window.Interviews = ({ jobs, onEditJob, initialCompany }) => {
    const { useState, useMemo, useEffect } = React;
    const [viewType, setViewType] = useState('upcoming'); // upcoming, past
    const [selectedCompany, setSelectedCompany] = useState(initialCompany || '');

    useEffect(() => {
        setSelectedCompany(initialCompany || '');
    }, [initialCompany]);

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

    const getSentimentIcon = (sentiment) => {
        if (!sentiment) return null;
        const s = sentiment.toLowerCase();
        if (s.includes('fantastic')) return '💯';
        if (s.includes('great')) return '🔥';
        if (s.includes('ok') || s.includes('well')) return '👍';
        if (s.includes('neutral') || s.includes('ok')) return '🤷';
        if (s.includes('poor')) return '👎';
        if (s.includes('terribl') || s.includes('bad')) return '🤢';
        return null;
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
                    {displayList.map(interview => {
                        const interviewDate = interview.date ? new Date(interview.date) : null;
                        const now = new Date();
                        const tomorrow = new Date(now);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        
                        let dateClass = '';
                        if (interviewDate) {
                            const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
                            if (isSameDay(interviewDate, now)) { dateClass = ' interview-today'; }
                            else if (isSameDay(interviewDate, tomorrow)) { dateClass = ' interview-tomorrow'; }
                        }

                        return (
                        <div key={interview.id} className={`stat-card interview-card${dateClass}`}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <window.Tooltip text={interview.format || 'Video Call'}><span style={{ cursor: 'help', fontSize: '1.1em' }}>{window.getFormatIcon(interview.format)}</span></window.Tooltip>
                                        {interview.date ? new Date(interview.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date TBD'}
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-primary)' }}>{interview.type}</h3>
                                    <div style={{ fontSize: '1rem', fontWeight: '500', marginTop: '0.25rem' }}>{interview.company}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{interview.role}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    {interview.date && <div style={{ background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '8px', textAlign: 'center', minWidth: '60px', border: '1px solid var(--border-primary)' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{new Date(interview.date).getHours()}:{new Date(interview.date).getMinutes().toString().padStart(2, '0')}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{interview.duration}m</div>
                                    </div>}
                                </div>
                            </div>
                            
                            {interview.connectionDetails && (
                                <div style={{ width: '100%', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                                    {interview.connectionDetails.startsWith('http') ? (
                                        <a href={interview.connectionDetails} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ width: '100%', justifyContent: 'center', background: 'var(--accent-primary)', color: 'white', textDecoration: 'none' }}>📹 Join Meeting</a>
                                    ) : (
                                        <div style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-primary)', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span>📍</span><span>{interview.connectionDetails}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {interview.interviewers && interview.interviewers.length > 0 && (
                                <div style={{ width: '100%', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem' }}>
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
                            {interview.notes && <div style={{ width: '100%', background: 'var(--bg-tertiary)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.9rem', whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto' }}><div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Notes</div>
{interview.notes}</div>}

                            <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {interview.sentiment ? (
                                    <window.Tooltip text={'This interview round went ' + interview.sentiment}><div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '2.0rem', color: 'var(--text-secondary)' }}>
                                        <span>{getSentimentIcon(interview.sentiment)}</span>
                                        {/* <span>{interview.sentiment}</span> */}
                                    </div></window.Tooltip>
                                ) : <div></div>}
                                <window.Tooltip text="Edit interview details"><button className="btn btn-secondary btn-sm" onClick={() => onEditJob(jobs.find(j => j.id === interview.jobId), interview.id)}><span role="img" aria-label="Edit">✏️</span></button></window.Tooltip>
                            </div>
                        </div>
                    );})}
                </div>
            )}
        </div>
    );
};