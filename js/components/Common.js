window.ChartCard = ({ title, children }) => {
    return (
        <div className="chart-card">
            <h3>{title}</h3>
            <div className="chart-content">{children}</div>
        </div>
    );
};

window.DualLineChartComponent = ({ data, label1, label2, color1 = '#6b8aff', color2 = '#10b981', isPercentage = false }) => {
    const { useEffect, useRef } = React;
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    useEffect(() => {
        if (!canvasRef.current) return;
        if (chartRef.current) chartRef.current.destroy();
        const ctx = canvasRef.current.getContext('2d');
        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.label),
                datasets: [
                    { label: label1, data: data.map(d => d.value1), borderColor: color1 + '60', backgroundColor: color1 + '10', tension: 0.4, fill: false, borderWidth: 2, pointRadius: 3, pointBackgroundColor: color1 + '60' },
                    { label: label2, data: data.map(d => d.value2), borderColor: color2, backgroundColor: color2 + '20', tension: 0.4, fill: true, borderWidth: 3, pointRadius: 4, pointBackgroundColor: color2 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
                plugins: { legend: { labels: { color: '#9ca3af', usePointStyle: true, padding: 15 } }, tooltip: { callbacks: { label: function (context) { const value = context.parsed.y; return context.dataset.label + ': ' + value + (isPercentage ? '%' : ''); } } } },
                scales: { y: { beginAtZero: true, max: isPercentage ? 100 : undefined, ticks: { color: '#9ca3af', stepSize: isPercentage ? undefined : 1, callback: (value) => value + (isPercentage ? '%' : '') }, grid: { color: '#2a3248' } }, x: { ticks: { color: '#9ca3af' }, grid: { color: '#2a3248' } } }
            }
        });
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [data, label1, label2, color1, color2, isPercentage]);
    return <canvas ref={canvasRef} style={{ maxHeight: '300px' }}></canvas>;
};

window.TripleLineChartComponent = ({ data, label1, label2, label3, color1 = '#6b8aff', color2 = '#f59e0b', color3 = '#10b981', isPercentage = false, useDailyData = false }) => {
    const { useEffect, useRef } = React;
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        const labels = data.map(d => d.label);
        const dataset1 = data.map(d => d.value1 ?? d.applications ?? 0);
        const dataset2 = data.map(d => d.value2 ?? d.followUps ?? 0);
        const dataset3 = data.map(d => d.value3 ?? d.responded ?? 0);
        if (chartRef.current) chartRef.current.destroy();
        const pointRadius = useDailyData ? 5 : 2;
        const pointHoverRadius = useDailyData ? 7 : 3;
        const maxValue = Math.max(...dataset1, ...dataset2, ...dataset3);
        let stepSize;
        if (maxValue <= 10) stepSize = 1; else if (maxValue <= 20) stepSize = 2; else if (maxValue <= 50) stepSize = 5; else if (maxValue <= 100) stepSize = 10; else stepSize = 20;
        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label: label1, data: dataset1, borderColor: color1, backgroundColor: color1 + '33', fill: false, tension: 0.2, pointRadius: pointRadius, pointHoverRadius: pointHoverRadius },
                    { label: label2, data: dataset2, borderColor: color2, backgroundColor: color2 + '33', fill: false, tension: 0.2, pointRadius: pointRadius, pointHoverRadius: pointHoverRadius },
                    { label: label3, data: dataset3, borderColor: color3, backgroundColor: color3 + '33', fill: false, tension: 0.2, pointRadius: pointRadius, pointHoverRadius: pointHoverRadius }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, stacked: false,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: stepSize, callback: function (value) { return isPercentage ? value + '%' : value; } } } }
            }
        });
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [data, label1, label2, label3, color1, color2, color3, isPercentage, useDailyData]);
    return <canvas ref={canvasRef} style={{ maxHeight: '200px' }}></canvas>;
};

window.LineChartComponent = ({ data, label, color = '#6b8aff' }) => {
    const { useEffect, useRef } = React;
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    useEffect(() => {
        if (!canvasRef.current) return;
        if (chartRef.current) chartRef.current.destroy();
        const ctx = canvasRef.current.getContext('2d');
        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.label),
                datasets: [{ label: label, data: data.map(d => d.value), borderColor: color, backgroundColor: color + '20', tension: 0.4, fill: true }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#9ca3af' } } },
                scales: { y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: '#2a3248' } }, x: { ticks: { color: '#9ca3af' }, grid: { color: '#2a3248' } } }
            }
        });
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [data, label, color]);
    return <canvas ref={canvasRef} style={{ maxHeight: '300px' }}></canvas>;
};

window.BarChartComponent = ({ data, color = '#6b8aff' }) => {
    const { useEffect, useRef } = React;
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    useEffect(() => {
        if (!canvasRef.current) return;
        if (chartRef.current) chartRef.current.destroy();
        const ctx = canvasRef.current.getContext('2d');
        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.label),
                datasets: [{ label: 'Count', data: data.map(d => d.value), backgroundColor: color, borderRadius: 4 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { color: '#9ca3af', stepSize: 1 }, grid: { color: '#2a3248' } }, x: { ticks: { color: '#9ca3af' }, grid: { display: false } } }
            }
        });
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [data, color]);
    return <canvas ref={canvasRef} style={{ maxHeight: '300px' }}></canvas>;
};

window.PieChartComponent = ({ data }) => {
    const { useEffect, useRef } = React;
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    useEffect(() => {
        if (!canvasRef.current) return;
        if (chartRef.current) chartRef.current.destroy();
        const colors = ['#6b8aff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const ctx = canvasRef.current.getContext('2d');
        chartRef.current = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(d => d.label),
                datasets: [{ data: data.map(d => d.value), backgroundColor: colors.slice(0, data.length), borderWidth: 2, borderColor: '#0a0e1a' }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { color: '#9ca3af', padding: 15 } } }
            }
        });
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [data]);
    return <canvas ref={canvasRef} style={{ maxHeight: '300px' }}></canvas>;
};

window.FunnelChartComponent = ({ data }) => {
    const { useEffect, useRef } = React;
    const containerRef = useRef(null);
    useEffect(() => {
        if (!containerRef.current || !data || data.length === 0) return;
        const funnelOrder = ['Application', 'Recruiter Screen', 'Partial Loop', 'Full Loop', 'Offer'];
        const sortedData = funnelOrder.map(stage => data.find(d => d.label === stage)).filter(item => item && item.value > 0);
        if (sortedData.length === 0) return;
        const totalValue = sortedData.reduce((sum, item) => sum + item.value, 0) || 1;
        containerRef.current.innerHTML = '';
        const colors = ['#6b8aff', '#8b5cf6', '#f59e0b', '#10b981', '#34d399'];
        const funnel = document.createElement('div');
        funnel.style.cssText = 'display: flex; flex-direction: column; gap: 20px; width: 100%; padding: 20px 0;';
        sortedData.forEach((item, index) => {
            const barWidthPercent = (item.value / totalValue) * 100;
            const percent = ((item.value / totalValue) * 100).toFixed(1);
            const row = document.createElement('div');
            row.style.cssText = 'display: flex; align-items: center; gap: 16px;';
            const circle = document.createElement('div');
            const circleSize = Math.max(60, 80 - index * 8);
            circle.style.cssText = `width: ${circleSize}px; height: ${circleSize}px; border-radius: 50%; background-color: ${colors[index % colors.length]}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 700; font-size: 18px; color: white;`;
            circle.textContent = `${percent}%`;
            const barSection = document.createElement('div');
            barSection.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 6px;';
            const bar = document.createElement('div');
            bar.style.cssText = `height: 32px; background-color: ${colors[index % colors.length]}; border-radius: 4px; width: ${Math.max(barWidthPercent, 15)}%; min-width: 60px; transition: all 0.2s; cursor: pointer;`;
            bar.addEventListener('mouseenter', () => { bar.style.opacity = '0.8'; bar.style.transform = 'scaleX(1.05)'; bar.style.transformOrigin = 'left'; });
            bar.addEventListener('mouseleave', () => { bar.style.opacity = '1'; bar.style.transform = 'scaleX(1)'; });
            const labelCount = document.createElement('div');
            labelCount.style.cssText = 'display: flex; gap: 8px; font-size: 12px; color: var(--text-tertiary);';
            const label = document.createElement('span');
            label.textContent = item.label;
            label.style.cssText = 'font-weight: 600; color: var(--text-secondary);';
            const count = document.createElement('span');
            count.textContent = item.value.toLocaleString();
            labelCount.appendChild(label);
            labelCount.appendChild(count);
            barSection.appendChild(bar);
            barSection.appendChild(labelCount);
            row.appendChild(circle);
            row.appendChild(barSection);
            funnel.appendChild(row);
        });
        containerRef.current.appendChild(funnel);
    }, [data]);
    return <div ref={containerRef} style={{ width: '100%', minHeight: '300px' }}></div>;
};

window.GroupedBarChartComponent = ({ data }) => {
    const { useEffect, useRef } = React;
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    useEffect(() => {
        if (!canvasRef.current) return;
        if (chartRef.current) chartRef.current.destroy();
        const ctx = canvasRef.current.getContext('2d');
        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    { label: 'Callback rate', data: data.responseRates, backgroundColor: '#6b8aff' },
                    { label: 'Interview rate', data: data.interviewRates, backgroundColor: '#10b981' }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#9ca3af' } } },
                scales: { y: { beginAtZero: true, max: 100, ticks: { color: '#9ca3af', callback: (value) => value + '%' }, grid: { color: '#2a3248' } }, x: { ticks: { color: '#9ca3af' }, grid: { display: false } } }
            }
        });
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [data]);
    return <canvas ref={canvasRef} style={{ maxHeight: '300px' }}></canvas>;
};

window.StatusBadge = ({ status }) => {
    if (!status) {
        console.warn("StatusBadge received undefined status");
        return <span className="status-badge status-not-applied">Unknown</span>;
    }
    const className = `status-badge status-${status.toLowerCase().replace(/\s+/g, "-")}`;
    return <span className={className}>{status}</span>;
};

window.PriorityBadge = ({ priority }) => {
    if (!priority) {
        console.warn("PriorityBadge received undefined priority");
        return <span className="priority-badge priority-tier2">No priority</span>;
    }
    const className = `priority-badge priority-${priority.toLowerCase().replace(/\s+/g, "")}`;
    return <span className={className}>{priority}</span>;
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { console.error('React Error Boundary caught:', error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: '#e4e6eb', background: '#0a0e1a', minHeight: '100vh' }}>
                    <h1 style={{ color: '#ff6b6b' }}>Something went wrong</h1>
                    <p>Error: {this.state.error?.message}</p>
                    <button onClick={() => window.location.reload()} style={{ background: '#6b8aff', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', marginTop: '1rem' }}>Reload Page</button>
                    <pre style={{ marginTop: '1rem', padding: '1rem', background: '#1a1f35', borderRadius: '6px', overflow: 'auto' }}>{this.state.error?.stack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}
window.ErrorBoundary = ErrorBoundary;