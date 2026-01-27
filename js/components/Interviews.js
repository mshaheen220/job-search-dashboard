window.Interviews = ({ jobs, onEditJob, initialCompany, highlightInterviewId }) => {
    const { useState, useMemo, useEffect } = React;
    const [viewType, setViewType] = useState('upcoming'); // upcoming, past
    const [selectedCompany, setSelectedCompany] = useState(initialCompany || '');

    useEffect(() => {
        setSelectedCompany(initialCompany || '');
    }, [initialCompany]);

    useEffect(() => {
        if (highlightInterviewId) {
            const interview = interviews.find(i => i.id === highlightInterviewId);
            if (interview) {
                const isPast = interview.date && new Date(interview.date) < new Date();
                if (isPast && viewType !== 'past') setViewType('past');
                else if (!isPast && viewType !== 'upcoming') setViewType('upcoming');
            }
        }
    }, [highlightInterviewId, interviews]);

    useEffect(() => {
        if (highlightInterviewId) {
            setTimeout(() => {
                const el = document.getElementById(`interview-${highlightInterviewId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.remove('highlight-pulse');
                    void el.offsetWidth; // trigger reflow
                    el.classList.add('highlight-pulse');
                }
            }, 300);
        }
    }, [highlightInterviewId, displayList]);

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
                <h1 className="page-title">Interview Schedule</h1>
                <div className="filters">
                    <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} className="filter-select filter-select-inline"><option value="">All companies</option>{companies.map(c => <option key={c} value={c}>{c}</option>)}</select>
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
                <div className="interviews-grid">
                    {displayList.map(interview => {
                        const interviewDate = interview.date ? new Date(interview.date) : null;
                        const now = new Date();
                        const tomorrow = new Date(now);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        
                        let dateClass = '';
                        if (interviewDate) {
                            const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
                            if (isSameDay(interviewDate, now)) {
                                const duration = interview.duration || 30;
                                const endTime = new Date(interviewDate.getTime() + duration * 60000);
                                if (now <= endTime) dateClass = ' interview-today';
                            }
                            else if (isSameDay(interviewDate, tomorrow)) { dateClass = ' interview-tomorrow'; }
                        }

                        const isPhone = interview.connectionDetails && /^[+\d\s\-().]+$/.test(interview.connectionDetails) && (interview.connectionDetails.match(/\d/g) || []).length >= 7;

                        return (
                        <div key={interview.id} id={`interview-${interview.id}`} className={`stat-card interview-card${dateClass}`}>
                            <div className="interview-card-header">
                                <div>
                                    <div className="interview-meta">
                                        <window.Tooltip text={interview.format || 'Video Call'}><span style={{ cursor: 'help', fontSize: '1.1em' }}>{window.getFormatIcon(interview.format)}</span></window.Tooltip>
                                        {interview.date ? new Date(interview.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date TBD'}
                                    </div>
                                    <h3 className="interview-type">{interview.type}</h3>
                                    <div className="interview-company">{interview.company}</div>
                                    <div className="interview-role">{interview.role}</div>
                                </div>
                               <div className={`interview-time-container${viewType === 'past' ? ' past-time' : ''}`}>
                                    {interview.date && <div className="interview-time-box">
                                        <div className="time-text">{new Date(interview.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
                                        <div className="duration-text">{interview.duration}m</div>
                                    </div>}
                                </div>
                            </div>
                            
                            {interview.connectionDetails && (!interviewDate || now <= new Date(interviewDate.getTime() + (interview.duration || 30) * 60000)) && (
                                <div className="connection-details">
                                    {interview.connectionDetails.startsWith('http') ? (
                                        <a href={interview.connectionDetails} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-join">📹 Join Meeting</a>
                                    ) : isPhone ? (
                                        <a href={`tel:${interview.connectionDetails}`} className="btn btn-sm btn-join">📞 Call</a>
                                    ) : (
                                        <div className="location-box">
                                            <span>📍</span><span>{interview.connectionDetails}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {interview.interviewers && interview.interviewers.length > 0 && (
                                <div className="interviewers-container">
                                    <div className="section-title">Interviewers</div>
                                    <div className="interviewers-list">
                                        {interview.interviewers.map((iv, idx) => (
                                            <div key={idx} className="interviewer-item">
                                                <span>{iv.name}</span>
                                                {iv.title && <span className="text-xs-secondary">{iv.title}</span>}
                                                {iv.linkedin && <a href={iv.linkedin} target="_blank" rel="noopener noreferrer" className="link-linkedin">in</a>}
                                                {iv.email && <a href={`mailto:${iv.email}`} className="link-email">✉️</a>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {interview.notes && <div className="notes-container"><div className="section-title">Notes</div>
{interview.notes}</div>}

                            <div className="card-footer">
                                {interview.sentiment ? (
                                    <window.Tooltip text={'This interview round went ' + interview.sentiment}><div className="sentiment-display">
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