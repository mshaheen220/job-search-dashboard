window.PerformanceMonitor = () => {
    const [stats, setStats] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
        setStats(window.PerformanceUtil.getReport());
        setIsLoading(false);
        const interval = setInterval(() => { setStats(window.PerformanceUtil.getReport()); }, 2000);
        return () => clearInterval(interval);
    }, []);
    if (isLoading) return (<div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}><span style={{ fontSize: '1.2rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span><span>Loading performance metrics...</span></div>);
    if (!stats) return null;
    return (
        <div>
            <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>📊 Performance metrics</div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Cache Hit Rate: {stats.cacheStats.hitRate} (Hits: {stats.cacheStats.hits} | Misses: {stats.cacheStats.misses})</div>
            {Object.entries(stats.operationStats).slice(0, 5).map(([op, data]) => (<div key={op} style={{ marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>{op}: {data.avg} avg | min: {data.min} | max: {data.max} | calls: {data.count}</div>))}
        </div>
    );
};

window.Header = ({ view, setView, onBackup, onImport, lastBackupTime, theme, toggleTheme }) => {
    const [showPerf, setShowPerf] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const daysSinceBackup = lastBackupTime ? Math.floor((Date.now() - lastBackupTime.getTime()) / (1000 * 60 * 60 * 24)) : null;
    const backupWarning = daysSinceBackup === null || daysSinceBackup >= 1;

    const handleNavClick = (action) => {
        action();
        setIsMenuOpen(false);
    };

    return (
        <>
            <header className="header">
                <div className="header-content">
                    <div className="logo"><div className="theme-toggle">🎯</div><span>Job Search Dashboard</span></div>
                    
                    <button 
                        className="mobile-menu-btn" 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? '✕' : '☰'}
                    </button>

                    <div className={`header-controls ${isMenuOpen ? 'show' : ''}`}>
                        <nav className="nav">
                            <button className={`nav-btn ${view === "dashboard" ? "active" : ""}`} onClick={() => handleNavClick(() => setView("dashboard"))}>Dashboard</button>
                            <button className={`nav-btn ${view === "companies" ? "active" : ""}`} onClick={() => handleNavClick(() => setView("companies"))}>Companies</button>
                            <button className={`nav-btn ${view === "jobs" ? "active" : ""}`} onClick={() => handleNavClick(() => setView("jobs"))}>Applications</button>
                            <button className={`nav-btn ${view === "interviews" ? "active" : ""}`} onClick={() => handleNavClick(() => setView("interviews"))}>Interviews</button>
                            <window.Tooltip text={lastBackupTime ? `Last backup: ${lastBackupTime.toLocaleDateString()}` : "No backup yet"}><button className="nav-btn" onClick={() => handleNavClick(onBackup)} style={{ borderColor: backupWarning ? "var(--warning)" : undefined, background: backupWarning ? (theme === 'dark' ? '#7c2d12' : '#faa29d') : undefined, color: backupWarning ? (theme === 'dark' ? '#fed7aa' : 'var(--text-primary)') : undefined }}>💾 Back up {backupWarning && "⚠️"}</button></window.Tooltip>
                            <button className="nav-btn" onClick={() => handleNavClick(onImport)}>📥 Import</button>
                        </nav>
                        <div className="header-actions">
                            {window.APP_CONFIG.URLS.GITHUB && <window.Tooltip text="View on GitHub"><button className="theme-toggle" onClick={() => window.open(window.APP_CONFIG.URLS.GITHUB, '_blank')} style={{ fontSize: '1.2rem' }}>
                                <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
                            </button></window.Tooltip>}
                            <window.Tooltip text="Toggle performance metrics"><button className="theme-toggle" onClick={() => setShowPerf(!showPerf)} style={{ fontSize: '1.2rem' }}>⚡</button></window.Tooltip>
                            <window.Tooltip text={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}><button className="theme-toggle" onClick={toggleTheme}>{theme === 'light' ? '🌙' : '☀️'}</button></window.Tooltip>
                        </div>
                    </div>
                </div>
            </header>
            {showPerf && (
                <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', padding: '1rem', margin: '1rem auto 1rem auto', marginLeft: 'auto', marginRight: 'auto', maxWidth: '1336px', width: '100%', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace', maxHeight: '300px', overflow: 'auto', boxSizing: 'border-box' }}>
                    <window.PerformanceMonitor />
                </div>
            )}
        </>
    );
};