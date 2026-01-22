window.Stats = ({ jobs }) => {
    const statusCounts = window.STATUSES.reduce((acc, status) => {
        acc[status] = jobs.filter(j => j.status === status).length;
        return acc;
    }, {});
    const priorityCounts = window.PRIORITIES.reduce((acc, priority) => {
        acc[priority] = jobs.filter(j => j.priority === priority).length;
        return acc;
    }, {});
    return (
        <div>
            <h2 style={{ marginBottom: "1rem", color: "#6b8aff" }}>Application statuses</h2>
            <div className="table-container" style={{ marginBottom: "2rem" }}>
                <table className="table">
                    <thead><tr><th>Status</th><th>Count</th><th>Percentage</th></tr></thead>
                    <tbody>{window.STATUSES.map(status => (<tr key={status}><td><window.StatusBadge status={status} /></td><td>{statusCounts[status]}</td><td>{jobs.length > 0 ? Math.round((statusCounts[status] / jobs.length) * 100) : 0}%</td></tr>))}</tbody>
                </table>
            </div>
            <h2 style={{ marginBottom: "1rem", color: "#6b8aff" }}>Priority Breakdown</h2>
            <div className="table-container">
                <table className="table">
                    <thead><tr><th>Priority</th><th>Count</th><th>Percentage</th></tr></thead>
                    <tbody>{window.PRIORITIES.map(priority => (<tr key={priority}><td><window.PriorityBadge priority={priority} /></td><td>{priorityCounts[priority]}</td><td>{jobs.length > 0 ? Math.round((priorityCounts[priority] / jobs.length) * 100) : 0}%</td></tr>))}</tbody>
                </table>
            </div>
        </div>
    );
};