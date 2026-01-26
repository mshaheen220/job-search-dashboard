const { useState, useEffect, useRef } = React;

window.addEventListener('error', (event) => { console.error('Global error:', event.error); });

function App() {
    const [theme, setTheme] = useState(() => { const saved = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.THEME); return saved || 'light'; });
    useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.THEME, theme); }, [theme]);
    const toggleTheme = () => { setTheme(prev => prev === 'light' ? 'dark' : 'light'); };
    const [view, setView] = useState("dashboard");
    const [jobs, setJobs] = useState([]);
    const [customCompanies, setCustomCompanies] = useState({});
    const [customCategories, setCustomCategories] = useState({});
    const [deletedCategories, setDeletedCategories] = useState([]);
    const [blockedCompanies, setBlockedCompanies] = useState([]);
    const [categoryColors, setCategoryColors] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [showCompanyModal, setShowCompanyModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [editingInterviewId, setEditingInterviewId] = useState(null);
    const [viewingJob, setViewingJob] = useState(null);
    const [highlightInterviewId, setHighlightInterviewId] = useState(null);
    const [lastBackupTime, setLastBackupTime] = useState(null);
    const [filters, setFilters] = useState({ status: "all", priority: "all", company: "", search: "" });
    const [sortConfig, setSortConfig] = useState({ key: 'dateApplied', direction: 'desc' });
    const [showUpdateBanner, setShowUpdateBanner] = useState(false);
    const [currentLastModified, setCurrentLastModified] = useState(null);
    const [initialInterviewCompany, setInitialInterviewCompany] = useState('');

    useEffect(() => {
        document.title = `${window.APP_CONFIG.APP_NAME} - ${window.APP_CONFIG.AUTHOR_NAME}`;
        const checkForUpdates = async () => {
            try {
                const response = await fetch(window.location.href, { method: 'HEAD' });
                const lastModified = response.headers.get('Last-Modified');
                if (lastModified) {
                    setCurrentLastModified(lastModified);
                    const saved = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LAST_MODIFIED);
                    if (saved && saved !== lastModified) setShowUpdateBanner(true);
                    else if (!saved) localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.LAST_MODIFIED, lastModified);
                }
            } catch (error) { console.debug('Update check failed:', error); }
        };
        checkForUpdates();
        const interval = setInterval(checkForUpdates, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        try {
            const savedJobs = window.StorageUtil.get(window.APP_CONFIG.STORAGE_KEYS.JOBS, []);
            if (Array.isArray(savedJobs) && savedJobs.length > 0) {
                const validJobs = [];
                for (let i = 0; i < savedJobs.length; i++) {
                    try { validJobs.push(window.SecurityUtil.validateJobData(savedJobs[i])); } catch (validationError) { console.warn(`Skipping invalid job at index ${i}:`, validationError); }
                }
                setJobs(validJobs);
            }
            const savedCompanies = window.StorageUtil.get(window.APP_CONFIG.STORAGE_KEYS.CUSTOM_COMPANIES, {});
            if (savedCompanies && typeof savedCompanies === 'object') {
                const validCompanies = {};
                for (const [name, data] of Object.entries(savedCompanies)) {
                    try { validCompanies[name] = window.SecurityUtil.validateCompanyData({ ...data, name }); } catch (err) { console.warn(`Skipping invalid company ${name}:`, err); }
                }
                setCustomCompanies(validCompanies);
            }
            setCustomCategories(window.StorageUtil.get(window.APP_CONFIG.STORAGE_KEYS.CUSTOM_CATEGORIES, {}));
            setDeletedCategories(window.StorageUtil.get(window.APP_CONFIG.STORAGE_KEYS.DELETED_CATEGORIES, []));
            setBlockedCompanies(window.StorageUtil.get(window.APP_CONFIG.STORAGE_KEYS.BLOCKED_COMPANIES, []));
            setCategoryColors(window.StorageUtil.get(window.APP_CONFIG.STORAGE_KEYS.CATEGORY_COLORS, {}));
            const savedBackupTime = window.StorageUtil.get(window.APP_CONFIG.STORAGE_KEYS.LAST_BACKUP);
            if (savedBackupTime) { const backupDate = new Date(savedBackupTime); if (!isNaN(backupDate.getTime())) setLastBackupTime(backupDate); }
        } catch (error) { window.SecurityUtil.handleError(error, 'loading saved data'); }
    }, []);

    const debouncedSaveJobs = useRef(window.PerformanceUtil.debounce(function (jobsData) {
        try { const startTime = performance.now(); window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.JOBS, jobsData); const duration = performance.now() - startTime; window.LoggerUtil.trackPerformance('persistJobs', duration, true); } catch (error) { window.LoggerUtil.error('Error saving jobs', { error: error.message }); window.SecurityUtil.handleError(error, 'saving jobs'); }
    }, 1000)).current;

    const debouncedSaveCompanies = useRef(window.PerformanceUtil.debounce(function (companiesData) {
        try { const startTime = performance.now(); window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.CUSTOM_COMPANIES, companiesData); const duration = performance.now() - startTime; window.LoggerUtil.trackPerformance('persistCompanies', duration, true); } catch (error) { window.LoggerUtil.error('Error saving companies', { error: error.message }); window.SecurityUtil.handleError(error, 'saving companies'); }
    }, 1000)).current;

    useEffect(() => { if (jobs.length > 0) debouncedSaveJobs(jobs); }, [jobs]);
    useEffect(() => { debouncedSaveCompanies(customCompanies); }, [customCompanies]);
    useEffect(() => { const saveBlocked = window.PerformanceUtil.debounce(function () { window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.BLOCKED_COMPANIES, blockedCompanies); }, 500); saveBlocked(); }, [blockedCompanies]);
    useEffect(() => { window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.CATEGORY_COLORS, categoryColors); }, [categoryColors]);
    useEffect(() => { window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.CUSTOM_CATEGORIES, customCategories); }, [customCategories]);
    useEffect(() => { window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.DELETED_CATEGORIES, deletedCategories); }, [deletedCategories]);
    useEffect(() => {
        const flushOnUnload = () => {
            try { 
                window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.JOBS, jobs); 
                window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.CUSTOM_COMPANIES, customCompanies); 
                window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.BLOCKED_COMPANIES, blockedCompanies); 
                window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.CUSTOM_CATEGORIES, customCategories); 
                window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.DELETED_CATEGORIES, deletedCategories); 
                window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.CATEGORY_COLORS, categoryColors); 
            } catch (e) { console.warn('Failed to flush data on unload:', e); }
        };
        window.addEventListener('beforeunload', flushOnUnload);
        return () => window.removeEventListener('beforeunload', flushOnUnload);
    }, [jobs, customCompanies, blockedCompanies, customCategories, deletedCategories, categoryColors]);

    const mergedCompanies = { ...window.DEFAULT_COMPANIES, ...customCategories };
    const allCompanies = {};
    Object.keys(mergedCompanies).forEach(category => { if (!deletedCategories.includes(category)) allCompanies[category] = mergedCompanies[category]; });
    
    // Ensure custom companies are distributed to their categories
    Object.entries(customCompanies).forEach(([companyName, customData]) => {
        // Handle legacy data or single category
        let categories = customData.categories || (customData.category ? [customData.category] : ['None']);
        
        // Filter out deleted categories unless it's the only one, then default to None
        categories = categories.map(c => deletedCategories.includes(c) ? 'None' : c);
        if (categories.length === 0) categories = ['None'];
        categories = [...new Set(categories)]; // Unique

        const normalizedData = { ...customData, categories };

        // Remove this company from all lists first to avoid duplicates if it was in DEFAULT_COMPANIES
        Object.keys(allCompanies).forEach(category => {
            const companyIndex = allCompanies[category].findIndex(c => c.name === companyName);
            if (companyIndex !== -1) allCompanies[category].splice(companyIndex, 1);
        });

        // Add to appropriate categories
        categories.forEach(category => {
            if (!allCompanies[category]) allCompanies[category] = [];
            allCompanies[category].push({ name: companyName, ...normalizedData });
        });
    });
    jobs.forEach(job => {
        if (!job.company) return;
        const existsInDefaults = Object.values(window.DEFAULT_COMPANIES).flat().some(c => c.name === job.company);
        const existsInAllCompanies = Object.values(allCompanies).flat().some(c => c.name === job.company);
        if (!existsInDefaults && !existsInAllCompanies) {
            const category = "None";
            if (!allCompanies[category]) allCompanies[category] = [];
            if (!allCompanies[category].some(c => c.name === job.company)) {
                const newCompany = { name: job.company, url: job.url || `https://www.google.com/search?q=${encodeURIComponent(job.company + ' careers')}` };
                if (customCompanies[job.company]) Object.assign(newCompany, customCompanies[job.company]);
                allCompanies[category].push(newCompany);
            }
        }
    });

    const handleUpdateCompany = (companyName, updates) => {
        if (updates.newCategory) {
            setCustomCategories(prev => ({ ...prev, [updates.newCategory]: [] }));
            setDeletedCategories(prev => prev.filter(cat => cat !== updates.newCategory));
            if (updates.newCategoryColor) {
                setCategoryColors(prev => ({ ...prev, [updates.newCategory]: updates.newCategoryColor }));
            }
            return;
        }
        if (updates.deleteCategory) {
            const categoryToDelete = updates.deleteCategory;
            const companiesInCategory = allCompanies[categoryToDelete] || [];
            setDeletedCategories(prev => { if (!prev.includes(categoryToDelete)) { return [...prev, categoryToDelete]; } return prev; });
            setCustomCategories(prev => {
                const updated = { ...prev };
                if (companiesInCategory.length > 0) {
                    if (!updated['None']) { updated['None'] = []; }
                    // Companies will be re-distributed by the main loop
                }
                delete updated[categoryToDelete];
                return updated;
            });
            if (companiesInCategory.length > 0) {
                setCustomCompanies(prev => {
                    const updated = { ...prev };
                    companiesInCategory.forEach(c => {
                        const name = c && c.name;
                        if (!name) return;
                        const existing = updated[name] || {};
                        let cats = existing.categories || (existing.category ? [existing.category] : []);
                        cats = cats.filter(cat => cat !== categoryToDelete);
                        updated[name] = { ...existing, name, categories: cats.length ? cats : ['None'] };
                    });
                    return updated;
                });
            }
            return;
        }
        if (updates.renameCategory) {
            const { oldName, newName } = updates.renameCategory;
            const companiesInCategory = allCompanies[oldName] || [];
            setCustomCategories(prev => {
                const updated = { ...prev };
                updated[newName] = companiesInCategory;
                delete updated[oldName];
                return updated;
            });
            setCategoryColors(prev => {
                const updated = { ...prev };
                if (updated[oldName]) {
                    updated[newName] = updated[oldName];
                    delete updated[oldName];
                }
                return updated;
            });
            return;
        }
        if (updates.updateCategoryColor) {
            const { category, color } = updates.updateCategoryColor;
            setCategoryColors(prev => ({ ...prev, [category]: color }));
            return;
        }
        let categoryFound = null;
        let companyFound = null;
        Object.entries(allCompanies).forEach(([category, companiesList]) => {
            const company = companiesList.find(c => c.name === companyName);
            if (company) { categoryFound = category; companyFound = company; }
        }); // Note: with multiple categories, this find might just get the first one, but we use companyName to update customCompanies map
        if (!companyFound && customCompanies[companyName]) {
            companyFound = customCompanies[companyName];
            categoryFound = customCompanies[companyName].category || 'None';
        }
        if (companyFound) {
            if (updates.name && updates.name !== companyName) {
                const newName = updates.name;
                setCustomCompanies(prev => {
                    const updated = { ...prev };
                    updated[newName] = { ...(updated[companyName] || {}), ...updates, name: newName };
                    delete updated[companyName];
                    return updated;
                });
                const jobsToUpdate = jobs.filter(j => j.company === companyName);
                if (jobsToUpdate.length > 0) {
                    const updatedJobs = jobs.map(j => j.company === companyName ? { ...j, company: newName } : j);
                    setJobs(updatedJobs);
                }
            } else {
                setCustomCompanies(prev => ({
                    ...prev,
                    [companyName]: {
                        ...(prev[companyName] || {}),
                        ...updates,
                        name: companyName,
                        url: updates.url || (companyFound ? companyFound.url : ''),
                    }
                }));
            }
        }
    };

    const addJob = (job) => { 
        try { 
            const startTime = performance.now(); 
            window.SecurityUtil.checkRateLimit(); 
            const validatedJob = window.SecurityUtil.validateJobData(job); 
            if (jobs.length >= window.SecurityUtil.CONFIG.MAX_JOBS_COUNT) throw new Error(`Maximum jobs limit (${window.SecurityUtil.CONFIG.MAX_JOBS_COUNT}) reached`); 
            setJobs(prevJobs => [...prevJobs, validatedJob]); 
            
            if (validatedJob.categories && validatedJob.categories.length > 0) {
                const missingCategories = validatedJob.categories.filter(cat => !allCompanies[cat]);
                if (missingCategories.length > 0) {
                    setCustomCategories(prev => {
                        const updated = { ...prev };
                        missingCategories.forEach(cat => {
                            if (!updated[cat]) updated[cat] = [];
                        });
                        return updated;
                    });
                }
            }

            if (job.newCategoryColors) {
                setCategoryColors(prev => ({ ...prev, ...job.newCategoryColors }));
            }
            window.PerformanceUtil.clearCache('sortedJobs', ...Object.keys(window.PerformanceUtil.cache).filter(k => k.startsWith('filteredJobs_'))); 
            const duration = performance.now() - startTime; 
            window.LoggerUtil.trackPerformance('addJob', duration, true); 
            window.LoggerUtil.trackAction('job_added', 'job_management', { jobId: validatedJob.id }); 
            setShowModal(false); setEditingJob(null); 
        } catch (error) { window.LoggerUtil.error('Error adding job', { error: error.message }); window.SecurityUtil.handleError(error, 'adding job'); } 
    };
    const addCompany = (company) => { 
        try { 
            const startTime = performance.now(); 
            window.SecurityUtil.checkRateLimit(); 
            const validatedCompany = window.SecurityUtil.validateCompanyData(company); 
            const currentCount = Object.keys(customCompanies).length; 
            if (currentCount >= window.SecurityUtil.CONFIG.MAX_COMPANIES_COUNT) throw new Error(`Maximum companies limit (${window.SecurityUtil.CONFIG.MAX_COMPANIES_COUNT}) reached`); 
            
            setCustomCompanies(prev => ({ ...prev, [validatedCompany.name]: validatedCompany })); 
            
            if (validatedCompany.categories && validatedCompany.categories.length > 0) {
                const missingCategories = validatedCompany.categories.filter(cat => !allCompanies[cat]);
                if (missingCategories.length > 0) {
                    setCustomCategories(prev => {
                        const updated = { ...prev };
                        missingCategories.forEach(cat => {
                            if (!updated[cat]) updated[cat] = [];
                        });
                        return updated;
                    });
                }
            }

            if (company.newCategoryColors) { setCategoryColors(prev => ({ ...prev, ...company.newCategoryColors })); } 
            if (company.newCategory && company.newCategoryColor) { setCategoryColors(prev => ({ ...prev, [company.newCategory]: company.newCategoryColor })); } 
            
            window.PerformanceUtil.clearCache('sortedJobs', ...Object.keys(window.PerformanceUtil.cache).filter(k => k.startsWith('filteredJobs_'))); 
            const duration = performance.now() - startTime; 
            window.LoggerUtil.trackPerformance('addCompany', duration, true); 
            window.LoggerUtil.trackAction('company_added', 'company_management', { company: validatedCompany.name }); 
            setShowCompanyModal(false); 
        } catch (error) { 
            window.LoggerUtil.error('Error adding company', { error: error.message }); 
            window.SecurityUtil.handleError(error, 'adding company'); 
        } 
    };
    const launchConfetti = () => { const container = document.createElement('div'); container.style.cssText = 'position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:9999'; document.body.appendChild(container); const colors = ['#6b8aff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']; const total = 36; for (let i = 0; i < total; i++) { const piece = document.createElement('div'); const width = 6 + Math.random() * 6; const height = width * (1.4 + Math.random() * 0.6); const startLeft = Math.random() * 100; const rotateStart = Math.random() * 360; piece.style.cssText = `position:absolute;top:-16px;left:${startLeft}%;width:${width}px;height:${height}px;background:${colors[i % colors.length]};opacity:1;border-radius:2px;transform:translate3d(0,0,0) rotate(${rotateStart}deg);`; piece.style.mixBlendMode = 'screen'; container.appendChild(piece); const xOffset = (Math.random() - 0.5) * 220; const yOffset = window.innerHeight * 0.98 + Math.random() * 200; const rotateEnd = rotateStart + (Math.random() - 0.5) * 1440; requestAnimationFrame(() => { piece.style.transition = `transform 2.2s ease-out, opacity 2.2s ease-out`; piece.style.transitionDelay = `${Math.random() * 0.16}s`; piece.style.transform = `translate(${xOffset}px, ${yOffset}px) rotate(${rotateEnd}deg)`; piece.style.opacity = '0.4'; }); } setTimeout(() => container.remove(), 2600); };
    const updateJob = (updatedJob) => { 
        try { 
            const startTime = performance.now(); 
            window.SecurityUtil.checkRateLimit(); 
            const validatedJob = window.SecurityUtil.validateJobData(updatedJob); 
            const oldJob = jobs.find(j => j.id === validatedJob.id); 
            const wasApplied = oldJob?.status === window.JOB_STATUSES.APPLIED; 
            const nowInProgress = validatedJob.status === window.JOB_STATUSES.IN_PROGRESS; 
            const progressionOrder = [window.PROGRESSION_STAGES.APPLICATION, window.PROGRESSION_STAGES.RECRUITER_SCREEN, window.PROGRESSION_STAGES.PARTIAL_LOOP, window.PROGRESSION_STAGES.FULL_LOOP, window.PROGRESSION_STAGES.OFFER]; 
            const oldProgression = oldJob?.progression || window.PROGRESSION_STAGES.APPLICATION; 
            const newProgression = validatedJob.progression || window.PROGRESSION_STAGES.APPLICATION; 
            const progressionMovedForward = progressionOrder.indexOf(newProgression) > progressionOrder.indexOf(oldProgression); 
            setJobs(jobs.map(j => j.id === validatedJob.id ? validatedJob : j)); 
            
            if (validatedJob.categories && validatedJob.categories.length > 0) {
                const missingCategories = validatedJob.categories.filter(cat => !allCompanies[cat]);
                if (missingCategories.length > 0) {
                    setCustomCategories(prev => {
                        const updated = { ...prev };
                        missingCategories.forEach(cat => {
                            if (!updated[cat]) updated[cat] = [];
                        });
                        return updated;
                    });
                }
            }

            if (updatedJob.newCategoryColors) {
                setCategoryColors(prev => ({ ...prev, ...updatedJob.newCategoryColors }));
            }
            window.PerformanceUtil.clearCache('sortedJobs', ...Object.keys(window.PerformanceUtil.cache).filter(k => k.startsWith('filteredJobs_'))); 
            const duration = performance.now() - startTime; 
            window.LoggerUtil.trackPerformance('updateJob', duration, true); 
            window.LoggerUtil.trackAction('job_updated', 'job_management', { jobId: validatedJob.id }); 
            if ((wasApplied && nowInProgress) || progressionMovedForward) launchConfetti(); 
            setShowModal(false); setEditingJob(null); 
        } catch (error) { window.LoggerUtil.error('Error updating job', { error: error.message }); window.SecurityUtil.handleError(error, 'updating job'); } 
    };
    const deleteJob = (id) => { if (confirm("Are you sure you want to delete this job?")) { const startTime = performance.now(); setJobs(jobs.filter(j => j.id !== id)); window.PerformanceUtil.clearCache('sortedJobs', ...Object.keys(window.PerformanceUtil.cache).filter(k => k.startsWith('filteredJobs_'))); const duration = performance.now() - startTime; window.LoggerUtil.trackPerformance('deleteJob', duration, true); window.LoggerUtil.trackAction('job_deleted', 'job_management', { jobId: id }); } };
    const exportToCSV = () => { const headers = ["Company", "Role", "Status", "Priority", "Date applied", "URL", "Salary", "Location", "Contact name", "Notes"]; const rows = jobs.map(j => [j.company, j.role, j.status, j.priority, new Date(j.dateApplied).toLocaleDateString(), j.url, j.salary || "", j.location || "", j.contact || "", j.notes || ""]); const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n"); const blob = new Blob([csv], { type: "text/csv" }); const url = window.URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `job-search-${new Date().toISOString().split('T')[0]}.csv`; a.click(); };
    const exportBackup = () => { try { const backupData = { jobs: jobs, customCompanies: customCompanies, blockedCompanies: blockedCompanies }; const backup = { version: window.APP_CONFIG.VERSION, exportDate: new Date().toISOString(), checksum: window.SecurityUtil.generateChecksum(backupData), data: backupData }; const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }); const url = window.URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `job-tracker-backup-${new Date().toISOString().split('T')[0]}.json`; a.click(); window.URL.revokeObjectURL(url); const now = new Date(); setLastBackupTime(now); window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.LAST_BACKUP, now.toISOString()); alert("Backup downloaded successfully!"); } catch (error) { window.SecurityUtil.handleError(error, 'exporting backup'); } };
    const importBackup = (fileContent, mode = 'replace') => {
        try {
            const backup = window.SecurityUtil.validateImportData(fileContent);
            if (backup.checksum && backup.data) { if (!window.SecurityUtil.verifyChecksum(backup.data, backup.checksum)) { if (!confirm('Warning: Data integrity check failed. The backup file may be corrupted or tampered with.\n\nDo you want to proceed anyway? (Not recommended)')) throw new Error('Import cancelled: integrity check failed'); } }
            const importData = backup.data || backup;
            const jobsToImport = importData.jobs || [];
            const validJobs = [];
            const validationErrors = [];
            for (let i = 0; i < jobsToImport.length; i++) { try { validJobs.push(window.SecurityUtil.validateJobData(jobsToImport[i])); } catch (err) { validationErrors.push(`Job ${i + 1}: ${err.message}`); } }
            if (validationErrors.length > 0) { if (!confirm(`Warning: ${validationErrors.length} out of ${jobsToImport.length} jobs failed validation and will be skipped.\n\nContinue with ${validJobs.length} valid jobs?`)) throw new Error('Import cancelled'); }
            if (mode === 'merge') {
                const existingJobKeys = new Set(jobs.map(j => `${j.company.toLowerCase()}-${j.role.toLowerCase()}-${j.dateApplied}`));
                const newJobs = validJobs.filter(job => { const key = `${job.company.toLowerCase()}-${job.role.toLowerCase()}-${job.dateApplied}`; return !existingJobKeys.has(key); });
                if (jobs.length + newJobs.length > window.SecurityUtil.CONFIG.MAX_JOBS_COUNT) throw new Error(`Merge would exceed maximum jobs limit (${window.SecurityUtil.CONFIG.MAX_JOBS_COUNT}). Current: ${jobs.length}, New: ${newJobs.length}`);
                const mergedJobs = [...jobs, ...newJobs];
                setJobs(mergedJobs);
                window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.JOBS, mergedJobs);
                window.PerformanceUtil.clearCacheByPrefix('sortedJobs_', 'filteredJobs_');
                if (importData.customCompanies && typeof importData.customCompanies === 'object') {
                    const mergedCompanies = { ...customCompanies };
                    for (const [name, data] of Object.entries(importData.customCompanies)) { try { mergedCompanies[name] = window.SecurityUtil.validateCompanyData({ ...data, name }); } catch (err) { console.warn(`Skipping invalid company ${name}:`, err); } }
                    setCustomCompanies(mergedCompanies);
                    window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.CUSTOM_COMPANIES, mergedCompanies);
                    window.PerformanceUtil.clearCacheByPrefix('sortedJobs_', 'filteredJobs_');
                }
                if (importData.blockedCompanies && Array.isArray(importData.blockedCompanies)) {
                    const sanitizedBlocked = importData.blockedCompanies.filter(name => typeof name === 'string').map(name => window.SecurityUtil.sanitizeInput(name, 200));
                    const mergedBlocked = [...new Set([...blockedCompanies, ...sanitizedBlocked])];
                    setBlockedCompanies(mergedBlocked);
                    window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.BLOCKED_COMPANIES, mergedBlocked);
                    window.PerformanceUtil.clearCacheByPrefix('sortedJobs_', 'filteredJobs_');
                }
                const skipped = validJobs.length - newJobs.length;
                alert(`Merge complete!\n\nAdded: ${newJobs.length} new jobs\nSkipped: ${skipped} duplicates\nTotal jobs: ${jobs.length + newJobs.length}`);
            } else {
                if (validJobs.length > window.SecurityUtil.CONFIG.MAX_JOBS_COUNT) throw new Error(`Import exceeds maximum jobs limit: ${validJobs.length} > ${window.SecurityUtil.CONFIG.MAX_JOBS_COUNT}`);
                setJobs(validJobs);
                window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.JOBS, validJobs);
                window.PerformanceUtil.clearCacheByPrefix('sortedJobs_', 'filteredJobs_');
                if (importData.customCompanies && typeof importData.customCompanies === 'object') {
                    const validCompanies = {};
                    for (const [name, data] of Object.entries(importData.customCompanies)) { try { validCompanies[name] = window.SecurityUtil.validateCompanyData({ ...data, name }); } catch (err) { console.warn(`Skipping invalid company ${name}:`, err); } }
                    setCustomCompanies(validCompanies);
                    window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.CUSTOM_COMPANIES, validCompanies);
                    window.PerformanceUtil.clearCacheByPrefix('sortedJobs_', 'filteredJobs_');
                }
                if (importData.blockedCompanies && Array.isArray(importData.blockedCompanies)) {
                    const sanitized = importData.blockedCompanies.filter(name => typeof name === 'string').map(name => window.SecurityUtil.sanitizeInput(name, 200));
                    setBlockedCompanies(sanitized);
                    window.StorageUtil.set(window.APP_CONFIG.STORAGE_KEYS.BLOCKED_COMPANIES, sanitized);
                    window.PerformanceUtil.clearCacheByPrefix('sortedJobs_', 'filteredJobs_');
                }
                alert(`Import complete!\n\nImported ${validJobs.length} jobs successfully!`);
            }
            setShowImportModal(false);
        } catch (error) { window.SecurityUtil.handleError(error, 'importing backup'); }
    };

    useEffect(() => {
        if (jobs.length > 0) {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            if (!lastBackupTime || lastBackupTime < oneHourAgo) {
                const daysSinceBackup = lastBackupTime ? Math.floor((Date.now() - lastBackupTime.getTime()) / (1000 * 60 * 60 * 24)) : null;
                if (daysSinceBackup === null || daysSinceBackup >= 1) { console.log("Backup reminder: It's been a while since your last backup"); }
            }
        }
    }, [jobs, lastBackupTime]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') { direction = 'desc'; }
        setSortConfig({ key, direction });
        window.PerformanceUtil.clearCacheByPrefix('sortedJobs_', 'filteredJobs_');
    };

    const getSortIcon = (columnKey) => { if (sortConfig.key !== columnKey) return ' ⇅'; return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'; };

    const sortedJobs = window.PerformanceUtil.memoize(`sortedJobs_${sortConfig.key}_${sortConfig.direction}`, () => {
        return window.PerformanceUtil.measure('sorting', () => {
            return [...jobs].sort((a, b) => {
                if (!sortConfig.key) return 0;
                const aVal = (a[sortConfig.key] || '').toString().toLowerCase();
                const bVal = (b[sortConfig.key] || '').toString().toLowerCase();
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        });
    }, 1000);

    const filteredJobs = window.PerformanceUtil.memoize(`filteredJobs_${JSON.stringify(filters)}_${sortConfig.key}_${sortConfig.direction}`, () => {
        return window.PerformanceUtil.measure('filtering', () => {
            return sortedJobs.filter(job => {
                if (filters.status !== "all" && job.status !== filters.status) return false;
                if (filters.priority !== "all" && job.priority !== filters.priority) return false;
                if (filters.company && job.company !== filters.company) return false;
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    const matchesRole = job.role.toLowerCase().includes(searchLower);
                    const matchesCompany = job.company.toLowerCase().includes(searchLower);
                    if (!matchesRole && !matchesCompany) return false;
                }
                return true;
            });
        });
    }, 1000);

    const handleHeaderViewChange = (newView) => {
        setInitialInterviewCompany('');
        setView(newView);
    };
    
    const handleJumpToInterview = (interviewId, company) => {
        setInitialInterviewCompany(company);
        setHighlightInterviewId(interviewId);
        setView('interviews');
    };

    return (
        <div className="app">
            {showUpdateBanner && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-hover))', color: 'white', padding: '1rem', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>✨</span><span>New updates available! Refresh to get the latest features.</span>
                        {window.APP_CONFIG.URLS.GITHUB && <a href={`${window.APP_CONFIG.URLS.GITHUB}/commits/main/`} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline', marginLeft: '0.5rem', cursor: 'pointer', opacity: 0.9, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}>What's new?</a>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => { if (currentLastModified) { localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.LAST_MODIFIED, currentLastModified); } window.location.reload(); }} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s', backdropFilter: 'blur(4px)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}>Refresh now</button>
                        <button onClick={() => { if (currentLastModified) { localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.LAST_MODIFIED, currentLastModified); } setShowUpdateBanner(false); }} style={{ background: 'transparent', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1.2rem', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>×</button>
                    </div>
                </div>
            )}
            <window.Header view={view} setView={handleHeaderViewChange} onBackup={exportBackup} onImport={() => setShowImportModal(true)} lastBackupTime={lastBackupTime} theme={theme} toggleTheme={toggleTheme} />
            <main className="main">
                {view === "dashboard" && <window.AnalyticsDashboard jobs={jobs} onEditJob={(job, interviewId) => { setEditingJob(job); setEditingInterviewId(interviewId); setShowModal(true); }} onViewJob={(job) => setViewingJob(job)} onJumpToInterview={handleJumpToInterview} />}
                {view === "companies" && <window.Companies
                    companies={allCompanies}
                    jobs={jobs}
                    customCompanies={customCompanies}
                    blockedCompanies={blockedCompanies}
                    deletedCategories={deletedCategories}
                    categoryColors={categoryColors}
                    setDeletedCategories={setDeletedCategories}
                    onUpdateCompany={handleUpdateCompany}
                    onDeleteCompany={(companyName) => { setBlockedCompanies(prev => [...prev, companyName]); }}
                    onUnhideCompany={(companyName) => { setBlockedCompanies(prev => prev.filter(name => name !== companyName)); }}
                    onAddJob={(company) => { setEditingJob({ company: company.name, url: company.url }); setShowModal(true); }}
                    onAddCompany={() => setShowCompanyModal(true)}
                    onViewCompanyJobs={(companyName) => { setView('jobs'); setFilters({ ...filters, company: companyName, search: '' }); }}
                />}
                {view === "jobs" && <window.JobsTable
                    jobs={filteredJobs}
                    filters={filters}
                    setFilters={setFilters}
                    categoryColors={categoryColors}
                    companies={allCompanies}
                    onUpdateCompany={handleUpdateCompany}
                    setDeletedCategories={setDeletedCategories}
                    existingCategories={Object.keys(allCompanies)}
                    onAdd={() => { setEditingJob(null); setShowModal(true); }}
                    onEdit={(job) => { setEditingJob(job); setShowModal(true); }}
                    onViewJob={(job) => setViewingJob(job)}
                    onUpdateJob={updateJob}
                    onDelete={deleteJob}
                    onExport={exportToCSV}
                    onBackup={exportBackup}
                    requestSort={requestSort}
                    getSortIcon={getSortIcon}
                    onViewInterviews={(company) => { setInitialInterviewCompany(company); setView('interviews'); }}
                />}
                {view === "interviews" && <window.Interviews jobs={jobs} initialCompany={initialInterviewCompany} highlightInterviewId={highlightInterviewId} onEditJob={(job, interviewId) => { setEditingJob(job); setEditingInterviewId(interviewId); setShowModal(true); }} />}
                {view === "stats" && <window.Stats jobs={jobs} />}
            </main>
            {showModal && (
                <window.JobModal 
                    job={editingJob} 
                    initialEditingInterviewId={editingInterviewId}
                    onSave={editingJob?.id ? updateJob : addJob} 
                    onClose={() => { setShowModal(false); setEditingJob(null); setEditingInterviewId(null); }} 
                    existingCategories={Object.keys(allCompanies)}
                    categoryColors={categoryColors}
                    companyCategories={editingJob ? (customCompanies[editingJob.company]?.categories || []) : []}
                />
            )}
            {viewingJob && (
                <window.JobDetailsModal
                    job={viewingJob}
                    onClose={() => setViewingJob(null)}
                    onUpdateJob={updateJob}
                    onViewInterviews={(company) => { setViewingJob(null); setInitialInterviewCompany(company); setView('interviews'); }}
                />
            )}
            {showCompanyModal && (<window.CompanyModal onSave={addCompany} onClose={() => setShowCompanyModal(false)} existingCategories={Object.keys(allCompanies)} categoryColors={categoryColors} />)}
            {showImportModal && (<window.ImportModal onImport={importBackup} onClose={() => setShowImportModal(false)} />)}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-text">Built by a job seeker, for job seekers, shared freely.</div>
                    <div className="footer-links">
                        {window.APP_CONFIG.URLS.PAYPAL && <a href={window.APP_CONFIG.URLS.PAYPAL} target="_blank" rel="noopener noreferrer" className="footer-link">
                            <svg className="footer-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .924-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" /></svg>
                            Thank me
                        </a>}
                        {window.APP_CONFIG.URLS.GITHUB && <a href={`${window.APP_CONFIG.URLS.GITHUB}/commits/main/`} target="_blank" rel="noopener noreferrer" className="footer-link">
                            <svg className="footer-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
                            Change log
                        </a>}
                        {window.APP_CONFIG.URLS.PERSONAL && <a href={window.APP_CONFIG.URLS.PERSONAL} target="_blank" rel="noopener noreferrer" className="footer-link">
                            <img src="img/ico_about.svg" className="footer-icon s407" style={{ width: '24px', height: '24px' }} alt="About Me" />
                            About Me
                        </a>}
                    </div>
                </div>
            </footer>
        </div>
    );
}

ReactDOM.render(
    <window.ErrorBoundary>
        <App />
    </window.ErrorBoundary>,
    document.getElementById("root")
);