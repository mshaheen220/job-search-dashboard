window.KeyMetricsGrid = ({ metrics }) => {
    return (
        <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="stat-card">
                <div className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Total applications</div>
                <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{metrics.totalApplications}</div>
                <div className="stat-detail" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{metrics.byTimeWindow.thisMonth} this month</div>
            </div>
            <div className="stat-card">
                <div className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Callback rate</div>
                <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)', marginBottom: '0.25rem' }}>{metrics.responseRate.percentage}%</div>
                <div className="stat-detail" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{metrics.responseRate.count} engagements</div>
            </div>
            <div className="stat-card">
                <div className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Interview rate</div>
                <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>{metrics.interviewConversionRate.percentage}%</div>
                <div className="stat-detail" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{metrics.interviewConversionRate.count} reached interviews</div>
            </div>
            <div className="stat-card">
                <div className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Active pipeline</div>
                <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{metrics.pipeline.total}</div>
                <div className="stat-detail" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{metrics.pipeline.byStatus.Applied} idle · {metrics.pipeline.byStatus["In Progress"]} in progress</div>
            </div>
            <div className="stat-card">
                <div className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Offers</div>
                <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)', marginBottom: '0.25rem' }}>{metrics.offerRate.count}</div>
                <div className="stat-detail" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{metrics.offerRate.percentage}% of applications</div>
            </div>
            <div className="stat-card">
                <div className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>This week</div>
                <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{metrics.byTimeWindow.thisWeek}</div>
                <div className="stat-detail" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>applications submitted</div>
            </div>
        </div>
    );
};

window.InsightsPanel = ({ insights }) => {
    if (!insights || insights.length === 0) return null;
    return (
        <div className="insights-panel">
            <h3>Insights & recommendations</h3>
            <div className="insights-list">
                {insights.map((insight, index) => (
                    <div key={index} className={`insight-item insight-${insight.type}`}>
                        <div className="insight-icon">{insight.type === 'success' && '✓'}{insight.type === 'warning' && '⚠'}{insight.type === 'info' && 'ℹ'}</div>
                        <div className="insight-content"><div className="insight-title">{insight.title}</div><div className="insight-description">{insight.description}</div></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

window.generateInsights = (metrics, timeData, companyData) => {
    const insights = [];
    if (metrics.waiting.byDuration["60+ days"] > 0) {
        insights.push({ type: 'warning', title: 'Stale Applications', description: `${metrics.waiting.byDuration["60+ days"]} applications have been waiting 60+ days. Consider following up or marking as closed.` });
    }
    const topCompanies = companyData.mostResponsiveCompanies.slice(0, 3);
    if (topCompanies.length > 0 && topCompanies[0].responseRate > 50) {
        insights.push({ type: 'success', title: 'Responsive Companies', description: `${topCompanies[0].name} has a ${topCompanies[0].responseRate}% response rate from your ${topCompanies[0].total} applications. Consider applying to more roles there.` });
    }
    return insights;
};

window.UpcomingInterviews = ({ jobs, onEditJob }) => {
    const upcoming = React.useMemo(() => {
        const list = [];
        const now = new Date();
        jobs.forEach(job => {
            if (job.interviews && Array.isArray(job.interviews)) {
                job.interviews.forEach(i => {
                    if (i.date && new Date(i.date) >= now) {
                        list.push({ ...i, company: job.company, role: job.role, jobId: job.id });
                    }
                });
            }
        });
        return list.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);
    }, [jobs]);

    if (upcoming.length === 0) return null;

    const getFormatIcon = (format) => {
        if (!format) return '❓';
        if (format === window.INTERVIEW_FORMATS.IN_PERSON) return '👨‍💼';
        if (format === window.INTERVIEW_FORMATS.PHONE) return '☎️';
        if ([window.INTERVIEW_FORMATS.VIDEO_ZOOM, window.INTERVIEW_FORMATS.VIDEO_TEAMS, window.INTERVIEW_FORMATS.VIDEO_MEET, window.INTERVIEW_FORMATS.VIDEO_OTHER, 'Video Call', 'Other Video Call'].includes(format)) return '📹';
        return '❓';
    };

    return (
        <div className="stat-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>Upcoming Interviews</h3>
            <div className="table-container" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
                <table className="table">
                    <thead><tr><th></th><th>Date</th><th>Time</th><th>Company</th><th>Role</th><th>Type</th></tr></thead>
                    <tbody>
                        {upcoming.map(i => (
                            <tr key={i.id}>
                                <td><window.Tooltip text={i.format || 'Video Call'}><span style={{ cursor: 'help', fontSize: '1.2em' }}>{getFormatIcon(i.format)}</span></window.Tooltip></td>
                                <td><button onClick={() => onEditJob(jobs.find(j => j.id === i.jobId), i.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 'inherit', textAlign: 'left' }}>{new Date(i.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</button></td>
                                <td>{new Date(i.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</td>
                                <td><strong>{i.company}</strong></td>
                                <td><button onClick={() => onEditJob(jobs.find(j => j.id === i.jobId))} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 'inherit', textAlign: 'left' }}>{i.role}</button></td>
                                <td>{i.type}</td>
                                <td>
                                    {i.connectionDetails && i.connectionDetails.startsWith('http') && (
                                        <a href={i.connectionDetails} target="_blank" rel="noopener noreferrer" title="Join Meeting" style={{ textDecoration: 'none', fontSize: '1.2rem' }}>📹</a>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

window.AnalyticsDashboard = ({ jobs, onEditJob }) => {
    const { useMemo, useState } = React;
    const [timeRange, setTimeRange] = useState('all');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    if (typeof Chart === 'undefined') return (<div style={{ padding: '2rem', color: '#ef4444' }}><h2>Chart.js library not loaded</h2></div>);
    const filterDataByTimeRange = (data, range) => {
        const now = new Date();
        let startDate = null;
        let endDate = null;
        switch (range) {
            case 'past30': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
            case 'past12months': startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); break;
            case 'thisYear': startDate = new Date(now.getFullYear(), 0, 1); break;
            case 'lastYear': startDate = new Date(now.getFullYear() - 1, 0, 1); endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59); break;
            case 'custom': if (customStart) startDate = new Date(customStart); break;
            case 'all': default: return data;
        }
        if (!startDate) return data;
        return data.filter(item => {
            const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const labelLower = item.label.toLowerCase();
            const yearMatch = item.label.match(/\d{4}/);
            const year = yearMatch ? parseInt(yearMatch[0]) : null;
            let month = null;
            for (let i = 0; i < monthNames.length; i++) { if (labelLower.includes(monthNames[i])) { month = i; break; } }
            if (!year || month === null) return true;
            const itemDate = new Date(year, month, 1);
            if (itemDate < startDate) return false;
            if (endDate && itemDate > endDate) return false;
            return true;
        });
    };
    const shouldUseDailyData = (data) => {
        if (data.length <= 3) return true;
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const parseMonthYear = (label) => {
            const labelLower = label.toLowerCase();
            const yearMatch = label.match(/\d{4}/);
            const year = yearMatch ? parseInt(yearMatch[0]) : null;
            let month = null;
            for (let i = 0; i < monthNames.length; i++) { if (labelLower.includes(monthNames[i])) { month = i; break; } }
            return { year, month };
        };
        const first = parseMonthYear(data[0].label);
        const last = parseMonthYear(data[data.length - 1].label);
        if (!first.year || first.month === null || !last.year || last.month === null) return false;
        const firstDate = new Date(first.year, first.month, 1);
        const lastDate = new Date(last.year, last.month, 1);
        const diffTime = Math.abs(lastDate - firstDate);
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
        return diffMonths < 1;
    };
    const { overview, timeData, companyData, insights } = useMemo(() => {
        const overview = window.analytics.getJobSearchOverview(jobs);
        const timeData = window.analytics.getTimeBasedAnalytics(jobs);
        const companyData = window.analytics.getCompanyPriorityAnalytics(jobs);
        const insights = window.generateInsights(overview, timeData, companyData);
        return { overview, timeData, companyData, insights };
    }, [jobs]);
    const pipelineChartData = (() => {
        const stages = ['Application', 'Recruiter Screen', 'Partial Loop', 'Full Loop', 'Offer'];
        const activeJobs = jobs.filter(j => j.status === 'In Progress' || j.status === 'Applied');
        return stages.map(stage => ({ label: stage, value: activeJobs.filter(j => j.progression === stage).length }));
    })();
    const closureChartData = Object.entries(overview.closureReasons.counts).filter(([_, count]) => count > 0).map(([reason, count]) => ({ label: reason, value: count }));
    const progressionChartData = window.analytics.getProgressionBreakdownForResponded(jobs);
    const appsByMonth = {};
    (timeData.applicationsPerMonth.byMonth || []).forEach(item => { appsByMonth[item.month] = { label: item.label, applications: item.count }; });
    const respByMonth = {};
    (timeData.responseRateByMonth || []).forEach(item => { respByMonth[item.month] = { label: item.label, followUps: item.followUps || 0, responded: item.responded || 0 }; });
    const monthKeys = Array.from(new Set([...Object.keys(appsByMonth), ...Object.keys(respByMonth)])).sort();
    const combinedChartData = monthKeys.map(monthKey => {
        const app = appsByMonth[monthKey] || { label: (() => { const [y, m] = monthKey.split('-'); return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }); })(), applications: 0 };
        const resp = respByMonth[monthKey] || { followUps: 0, responded: 0 };
        return { label: app.label, applications: app.applications, followUps: resp.followUps, responded: resp.responded };
    });
    const filteredChartData = filterDataByTimeRange(combinedChartData, timeRange);
    return (
        <div className="analytics-dashboard">
            <window.KeyMetricsGrid metrics={overview} />
            <window.UpcomingInterviews jobs={jobs} onEditJob={onEditJob} />
            <div className="charts-section">
                <div className="chart-large">
                    <window.ChartCard title="Applications & response activity">
                        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {['past30', 'past12months', 'thisYear', 'lastYear', 'all'].map(range => (
                                <button key={range} onClick={() => setTimeRange(range)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: '6px', border: timeRange === range ? '2px solid var(--accent-primary)' : '1px solid var(--border-primary)', background: timeRange === range ? 'var(--accent-primary)' : 'var(--bg-tertiary)', color: timeRange === range ? 'white' : 'var(--text-primary)', cursor: 'pointer', fontWeight: timeRange === range ? '600' : '500', transition: 'all 0.2s' }}>{range === 'past30' ? 'Past 30 days' : range === 'past12months' ? 'Past 12 months' : range === 'thisYear' ? 'This Year' : range === 'lastYear' ? 'Last Year' : 'All time'}</button>
                            ))}
                        </div>
                        {filteredChartData.length === 0 ? (<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No data available for this time range</div>) : (<window.TripleLineChartComponent data={filteredChartData} label1="Applications" label2="Responses and rejections" label3="Actual callbacks" color1="#6b8aff" color2="#f59e0b" color3="#10b981" useDailyData={shouldUseDailyData(filteredChartData)} />)}
                    </window.ChartCard>
                </div>
                <div className="chart-row">
                    <div className="chart-medium"><window.ChartCard title="Active pipeline status"><window.FunnelChartComponent data={pipelineChartData} /></window.ChartCard></div>
                    <div className="chart-medium"><window.ChartCard title="Closure reasons"><window.PieChartComponent data={closureChartData} /></window.ChartCard></div>
                </div>
                <div className="chart-row">
                    <div className="chart-medium"><window.ChartCard title="Responses by progression"><window.PieChartComponent data={progressionChartData} /></window.ChartCard></div>
                    <div className="chart-medium">
                        <div className="stat-card">
                            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>Application statuses</h3>
                            <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
                                <table className="table">
                                    <thead><tr><th>Status</th><th>Count</th><th>Percentage</th></tr></thead>
                                    <tbody>{window.STATUSES.map(status => { const count = jobs.filter(j => j.status === status).length; return (<tr key={status}><td><window.StatusBadge status={status} /></td><td><strong>{count}</strong></td><td>{jobs.length > 0 ? Math.round((count / jobs.length) * 100) : 0}%</td></tr>); })}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <window.InsightsPanel insights={insights} />
        </div>
    );
};