window.parseDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
};

window.getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

window.getMonthYear = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

window.getWeekYear = (date) => {
    const week = window.getWeekNumber(date);
    return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
};

window.filterByDateRange = (jobs, startDate, endDate) => {
    return jobs.filter(job => {
        const appliedDate = window.parseDate(job.dateApplied);
        if (!appliedDate) return false;
        if (startDate && appliedDate < startDate) return false;
        if (endDate && appliedDate > endDate) return false;
        return true;
    });
};

window.StorageUtil = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;
            const parsed = JSON.parse(item);
            if (key === window.APP_CONFIG.STORAGE_KEYS.JOBS) {
                if (!Array.isArray(parsed)) {
                    console.warn('Invalid jobs data structure, using default');
                    return defaultValue;
                }
                if (parsed.length > window.SecurityUtil.CONFIG.MAX_JOBS_COUNT) {
                    console.warn('Jobs count exceeds limit, truncating');
                    return parsed.slice(0, window.SecurityUtil.CONFIG.MAX_JOBS_COUNT);
                }
            }
            return parsed;
        } catch (error) {
            window.SecurityUtil.handleError(error, 'loading data', false);
            return defaultValue;
        }
    },
    set(key, value) {
        try {
            const jsonString = JSON.stringify(value);
            const sizeInMB = new Blob([jsonString]).size / (1024 * 1024);
            if (sizeInMB > 5) {
                console.warn(`Data size (${sizeInMB.toFixed(2)}MB) approaching localStorage limits`);
                alert(`Warning: Your data is getting large (${sizeInMB.toFixed(2)}MB). Consider exporting a backup.`);
            }
            localStorage.setItem(key, jsonString);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                window.SecurityUtil.handleError(new Error('Storage quota exceeded. Please export and clear old data.'), 'saving data');
            } else {
                window.SecurityUtil.handleError(error, 'saving data', false);
            }
            return false;
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            window.SecurityUtil.handleError(error, 'removing data', false);
        }
    },
    getUsageStats() {
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            return {
                used: total,
                usedMB: (total / (1024 * 1024)).toFixed(2),
                estimated: '5-10MB typical limit'
            };
        } catch (error) {
            return { error: 'Unable to calculate usage' };
        }
    }
};

window.FitLevelUtil = {
    getLabel(value) {
        const level = Object.values(window.FIT_LEVELS).find(l => l.value === value);
        return level ? level.label : window.FIT_LEVELS.UNSET.label;
    },
    getValue(label) {
        const level = Object.values(window.FIT_LEVELS).find(l => l.label === label);
        return level ? level.value : window.FIT_LEVELS.UNSET.value;
    },
    compare(a, b, direction = 'desc') {
        if (a === null && b === null) return 0;
        if (a === null) return 1;
        if (b === null) return -1;
        return direction === 'desc' ? b - a : a - b;
    }
};

window.getFitLevelLabel = window.FitLevelUtil.getLabel;
window.getFitLevelValue = window.FitLevelUtil.getValue;
window.sortByFitLevel = window.FitLevelUtil.compare;

window.SecurityUtil = {
    CONFIG: {
        MAX_STRING_LENGTH: 10000,
        MAX_URL_LENGTH: 2048,
        MAX_JOBS_COUNT: 10000,
        MAX_COMPANIES_COUNT: 5000,
        MAX_IMPORT_SIZE_MB: 10,
        ALLOWED_URL_PROTOCOLS: ['http:', 'https:'],
        RATE_LIMIT_MS: 100
    },
    sanitizeHTML(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
    validateURL(url) {
        if (!url || typeof url !== 'string') return null;
        if (url.length > this.CONFIG.MAX_URL_LENGTH) {
            console.warn('URL exceeds maximum length');
            return null;
        }
        try {
            const urlObj = new URL(url);
            if (!this.CONFIG.ALLOWED_URL_PROTOCOLS.includes(urlObj.protocol)) {
                console.warn('Invalid URL protocol:', urlObj.protocol);
                return null;
            }
            if (urlObj.protocol === 'javascript:' || urlObj.protocol === 'data:') {
                console.warn('Blocked dangerous URL protocol');
                return null;
            }
            return urlObj.href;
        } catch (e) {
            console.warn('Invalid URL format:', url);
            return null;
        }
    },
    validateStringLength(str, maxLength = this.CONFIG.MAX_STRING_LENGTH) {
        if (typeof str !== 'string') return false;
        return str.length <= maxLength;
    },
    sanitizeInput(input, maxLength = this.CONFIG.MAX_STRING_LENGTH) {
        if (typeof input !== 'string') return '';
        let sanitized = input.slice(0, maxLength);
        sanitized = sanitized.replace(/\0/g, '');
        sanitized = sanitized.trim();
        return sanitized;
    },
    validateJobData(job) {
        if (!job || typeof job !== 'object') throw new Error('Invalid job data: must be an object');
        const requiredFields = ['company', 'role'];
        for (const field of requiredFields) {
            if (!job[field] || typeof job[field] !== 'string') throw new Error(`Invalid job data: ${field} is required`);
        }
        const validated = {
            id: job.id || Date.now(),
            company: this.sanitizeInput(job.company, 200),
            role: this.sanitizeInput(job.role, 200),
            status: this.validateEnum(job.status, Object.values(window.JOB_STATUSES), window.JOB_STATUSES.APPLIED),
            priority: this.validateEnum(job.priority, Object.values(window.PRIORITY_TIERS), window.PRIORITY_TIERS.TIER_2),
            dateApplied: this.validateDate(job.dateApplied),
            url: job.url ? this.validateURL(job.url) : '',
            salary: this.sanitizeInput(job.salary || '', 100),
            location: this.sanitizeInput(job.location || '', 200),
            contact: this.sanitizeInput(job.contact || '', 200),
            notes: this.sanitizeInput(job.notes || '', 5000),
            followUp: job.followUp ? this.validateDate(job.followUp, false) : '',
            progression: this.validateEnum(job.progression, Object.values(window.PROGRESSION_STAGES), window.PROGRESSION_STAGES.APPLICATION),
            closeReason: job.closeReason ? this.validateEnum(job.closeReason, Object.values(window.CLOSE_REASONS), '') : '',
            resumeUrl: job.resumeUrl ? this.validateURL(job.resumeUrl) : '',
            coverLetterUrl: job.coverLetterUrl ? this.validateURL(job.coverLetterUrl) : '',
            fitLevel: job.fitLevel !== undefined ? this.validateFitLevel(job.fitLevel) : null
        };
        const dataSize = JSON.stringify(validated).length;
        if (dataSize > 50000) throw new Error('Job data exceeds maximum size');
        return validated;
    },
    validateCompanyData(company) {
        if (!company || typeof company !== 'object') throw new Error('Invalid company data');
        if (!company.name || typeof company.name !== 'string') throw new Error('Company name is required');
        return {
            name: this.sanitizeInput(company.name, 200),
            url: company.url ? this.validateURL(company.url) : '',
            category: this.sanitizeInput(company.category || 'None', 100),
            fitLevel: company.fitLevel !== undefined ? this.validateFitLevel(company.fitLevel) : null
        };
    },
    validateEnum(value, allowedValues, defaultValue) {
        return allowedValues.includes(value) ? value : defaultValue;
    },
    validateDate(dateStr, required = true) {
        if (!dateStr) return required ? new Date().toISOString().split('T')[0] : '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return required ? new Date().toISOString().split('T')[0] : '';
        const minDate = new Date('2000-01-01');
        const maxDate = new Date('2100-01-01');
        if (date < minDate || date > maxDate) {
            console.warn('Date out of valid range:', dateStr);
            return required ? new Date().toISOString().split('T')[0] : '';
        }
        return date.toISOString().split('T')[0];
    },
    validateFitLevel(value) {
        if (value === null || value === undefined) return null;
        const numValue = parseInt(value);
        return [1, 2, 3].includes(numValue) ? numValue : null;
    },
    validateImportData(jsonString) {
        const sizeInMB = new Blob([jsonString]).size / (1024 * 1024);
        if (sizeInMB > this.CONFIG.MAX_IMPORT_SIZE_MB) throw new Error(`Import file too large: ${sizeInMB.toFixed(2)}MB (max: ${this.CONFIG.MAX_IMPORT_SIZE_MB}MB)`);
        let parsed;
        try {
            parsed = JSON.parse(jsonString);
        } catch (e) {
            throw new Error('Invalid JSON format: ' + e.message);
        }
        if (!parsed || typeof parsed !== 'object') throw new Error('Invalid backup format: must be an object');
        const data = parsed.data || parsed;
        if (!data.jobs || !Array.isArray(data.jobs)) throw new Error('Invalid backup format: jobs array required');
        if (data.jobs.length > this.CONFIG.MAX_JOBS_COUNT) throw new Error(`Too many jobs: ${data.jobs.length} (max: ${this.CONFIG.MAX_JOBS_COUNT})`);
        if (data.customCompanies) {
            const companyCount = Object.keys(data.customCompanies).length;
            if (companyCount > this.CONFIG.MAX_COMPANIES_COUNT) throw new Error(`Too many companies: ${companyCount} (max: ${this.CONFIG.MAX_COMPANIES_COUNT})`);
        }
        return data;
    },
    handleError(error, context, showToUser = true) {
        console.error(`[${context}]`, error);
        if (showToUser) {
            const safeMessage = this.getSafeErrorMessage(error, context);
            alert(safeMessage);
        }
    },
    getSafeErrorMessage(error, context) {
        const baseMessage = `An error occurred while ${context}.`;
        if (error.message && error.message.startsWith('Invalid')) return `${baseMessage}\n${error.message}`;
        return `${baseMessage}\nPlease try again or contact support if the issue persists.`;
    },
    _lastOperationTime: 0,
    _operationQueue: [],
    _isProcessing: false,
    _recentErrors: 0,
    getAdaptiveRateLimit() {
        let limit = this.CONFIG.RATE_LIMIT_MS;
        if (this._operationQueue.length > 5) limit *= 2;
        if (this._recentErrors > 3) limit *= 1.5;
        return limit;
    },
    async queueOperation(fn, operationName) {
        const adaptive = this.getAdaptiveRateLimit();
        const now = Date.now();
        if (now - this._lastOperationTime < adaptive) {
            const waitTime = adaptive - (now - this._lastOperationTime);
            window.LoggerUtil.warn('Operation queued due to rate limit', { operation: operationName, waitTime });
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        this._lastOperationTime = Date.now();
        try {
            const result = await fn();
            this._recentErrors = Math.max(0, this._recentErrors - 1);
            return result;
        } catch (error) {
            this._recentErrors++;
            throw error;
        }
    },
    checkRateLimit() {
        const adaptive = this.getAdaptiveRateLimit();
        const now = Date.now();
        if (now - this._lastOperationTime < adaptive) throw new Error('Operation rate limit exceeded. Please wait.');
        this._lastOperationTime = now;
    },
    generateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    },
    verifyChecksum(data, checksum) {
        return this.generateChecksum(data) === checksum;
    }
};

window.UIUtil = {
    linkify(text) {
        if (!text) return '';
        const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
        return text.replace(urlPattern, (url) => {
            const href = url.startsWith('http') ? url : `http://${url}`;
            return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-primary); text-decoration: underline;">${url}</a>`;
        });
    }
};

window.PerformanceUtil = {
    metrics: {
        operationTimes: {},
        cacheHits: 0,
        cacheMisses: 0,
        throttledCalls: 0,
        errorCount: 0,
        lastOperations: []
    },
    cache: new Map(),
    cacheTimeouts: new Map(),
    memoize(key, fn, ttl = 5000) {
        if (this.cache.has(key)) {
            this.metrics.cacheHits++;
            return this.cache.get(key);
        }
        this.metrics.cacheMisses++;
        const result = fn();
        this.cache.set(key, result);
        if (this.cacheTimeouts.has(key)) clearTimeout(this.cacheTimeouts.get(key));
        const timeoutId = setTimeout(() => {
            this.cache.delete(key);
            this.cacheTimeouts.delete(key);
        }, ttl);
        this.cacheTimeouts.set(key, timeoutId);
        return result;
    },
    clearCache(...keys) {
        keys.forEach(key => {
            if (this.cacheTimeouts.has(key)) {
                clearTimeout(this.cacheTimeouts.get(key));
                this.cacheTimeouts.delete(key);
            }
            this.cache.delete(key);
        });
    },
    clearCacheByPrefix(...prefixes) {
        const keys = Array.from(this.cache.keys());
        keys.forEach(k => {
            if (prefixes.some(p => k.startsWith(p))) {
                if (this.cacheTimeouts.has(k)) {
                    clearTimeout(this.cacheTimeouts.get(k));
                    this.cacheTimeouts.delete(k);
                }
                this.cache.delete(k);
            }
        });
    },
    debounce(fn, delay = 300) {
        let timeoutId;
        const self = this;
        return function debounced(...args) {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (self && self.metrics) self.metrics.throttledCalls++;
                fn.apply(this, args);
            }, delay);
        };
    },
    throttle(fn, interval = 300) {
        let lastCallTime = 0;
        return function throttled(...args) {
            const now = Date.now();
            if (now - lastCallTime >= interval) {
                lastCallTime = now;
                return fn.apply(this, args);
            }
            this.metrics.throttledCalls++;
        };
    },
    measure(operation, fn) {
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        if (!this.metrics.operationTimes[operation]) this.metrics.operationTimes[operation] = [];
        this.metrics.operationTimes[operation].push(duration);
        if (this.metrics.operationTimes[operation].length > 100) this.metrics.operationTimes[operation].shift();
        return result;
    },
    getAvgTime(operation) {
        const times = this.metrics.operationTimes[operation];
        if (!times || times.length === 0) return 0;
        return times.reduce((a, b) => a + b, 0) / times.length;
    },
    getReport() {
        const report = {
            cacheStats: {
                hits: this.metrics.cacheHits,
                misses: this.metrics.cacheMisses,
                hitRate: this.metrics.cacheHits + this.metrics.cacheMisses > 0
                    ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100).toFixed(2) + '%'
                    : 'N/A'
            },
            operationStats: {},
            memoryUsage: {
                cacheSize: this.cache.size,
                logCount: window.LoggerUtil.logs.length
            }
        };
        for (const [op, times] of Object.entries(this.metrics.operationTimes)) {
            if (times.length > 0) {
                report.operationStats[op] = {
                    count: times.length,
                    avg: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2) + 'ms',
                    min: Math.min(...times).toFixed(2) + 'ms',
                    max: Math.max(...times).toFixed(2) + 'ms'
                };
            }
        }
        return report;
    },
    cleanup() {
        this.cache.clear();
        this.cacheTimeouts.forEach(timeout => clearTimeout(timeout));
        this.cacheTimeouts.clear();
        this.metrics.operationTimes = {};
        this.metrics.throttledCalls = 0;
        if (window.LoggerUtil.logs.length > 100) window.LoggerUtil.logs = window.LoggerUtil.logs.slice(-100);
    },
    getMemoryStats() {
        const stats = {
            cacheSize: this.cache.size,
            cacheTimeouts: this.cacheTimeouts.size,
            logCount: window.LoggerUtil.logs.length,
            metricsOperations: Object.keys(this.metrics.operationTimes).length
        };
        if (performance.memory) {
            stats.heapUsed = (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB';
            stats.heapLimit = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB';
        }
        return stats;
    }
};

window.LoggerUtil = {
    logs: [],
    maxLogs: 1000,
    LOG_LEVELS: { DEBUG: 'DEBUG', INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' },
    log(level, message, data = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, level, message, data, userAgent: navigator.userAgent };
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) this.logs.shift();
        const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
        console[consoleMethod](`[${timestamp}] ${level}: ${message}`, data);
    },
    debug(message, data) { this.log(this.LOG_LEVELS.DEBUG, message, data); },
    info(message, data) { this.log(this.LOG_LEVELS.INFO, message, data); },
    warn(message, data) { this.log(this.LOG_LEVELS.WARN, message, data); },
    error(message, data) { this.log(this.LOG_LEVELS.ERROR, message, data); },
    getLogs(level = null, hoursBack = 24) {
        const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
        let filtered = this.logs.filter(log => new Date(log.timestamp) >= cutoffTime);
        if (level) filtered = filtered.filter(log => log.level === level);
        return filtered;
    },
    exportLogs() {
        return { exported: new Date().toISOString(), totalLogs: this.logs.length, logs: this.logs };
    },
    trackAction(action, category, data = {}) {
        this.info(`User Action: ${action}`, { category, ...data });
    },
    trackPerformance(operation, duration, success = true) {
        this.info(`Operation: ${operation}`, { duration: `${duration.toFixed(2)}ms`, success, category: 'performance' });
    }
};