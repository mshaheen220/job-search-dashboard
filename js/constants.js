(function() {
    const locals = window.LOCAL_CONSTANTS || {};
    const merge = (target, source) => {
        if (!source) return target;
        const result = { ...target };
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
                result[key] = merge(target[key], source[key]);
            } else {
                result[key] = source[key];
            }
        });
        return result;
    };

    window.APP_CONFIG = merge({
        VERSION: '2.3',
        APP_NAME: 'Job Search Dashboard',
        AUTHOR_NAME: 'Michael Shaheen',
        URLS: {
            GITHUB: 'https://github.com/mshaheen220/job-search-dashboard',
            PAYPAL: 'https://paypal.me/mlshaheen',
            PERSONAL: 'http://www.michaelshaheen.com'
        },
        STORAGE_KEYS: {
            JOBS: 'jobTrackerJobs',
            CUSTOM_COMPANIES: 'jobTrackerCustomCompanies',
            CUSTOM_CATEGORIES: 'jobTrackerCustomCategories',
            DELETED_CATEGORIES: 'jobTrackerDeletedCategories',
            BLOCKED_COMPANIES: 'jobTrackerBlockedCompanies',
            CATEGORY_COLORS: 'jobTrackerCategoryColors',
            LAST_BACKUP: 'jobTrackerLastBackup',
            THEME: 'jobTrackerTheme',
            LAST_MODIFIED: 'jobTrackerLastModified'
        },
        BACKUP_INTERVAL_MS: 60 * 60 * 1000,
        MS_PER_DAY: 1000 * 60 * 60 * 24,
        ITEMS_PER_PAGE: 20,
        HOT_PERIOD_MULTIPLIER: 1.25,
        MIN_APPLICATIONS_FOR_COMPANY_STATS: 2
    }, locals.APP_CONFIG);

    window.JOB_STATUSES = merge({
        APPLIED: 'Applied',
        IN_PROGRESS: 'In Progress',
        CLOSED: 'Closed'
    }, locals.JOB_STATUSES);

    window.STATUSES = Object.values(window.JOB_STATUSES);

    window.CLOSE_REASONS = merge({
        GHOSTED: 'Ghosted',
        REJECTED: 'Rejected',
        DECLINED_OFFER: 'Declined Offer',
        WITHDREW: 'Withdrew'
    }, locals.CLOSE_REASONS);

    window.PROGRESSION_STAGES = merge({
        APPLICATION: 'Application',
        RECRUITER_SCREEN: 'Recruiter Screen',
        PARTIAL_LOOP: 'Partial Loop',
        FULL_LOOP: 'Full Loop',
        OFFER: 'Offer'
    }, locals.PROGRESSION_STAGES);

    window.PROGRESSIONS = Object.values(window.PROGRESSION_STAGES);

    window.PRIORITY_TIERS = merge({
        TIER_1: 'Tier 1',
        TIER_2: 'Tier 2',
        TIER_3: 'Tier 3'
    }, locals.PRIORITY_TIERS);

    window.PRIORITIES = Object.values(window.PRIORITY_TIERS);

    window.INTERVIEW_FORMATS = merge({
        IN_PERSON: 'In Person',
        PHONE: 'Phone',
        VIDEO_ZOOM: 'Zoom',
        VIDEO_TEAMS: 'Teams',
        VIDEO_MEET: 'Google Meet',
        VIDEO_OTHER: 'Video Call',
        OTHER: 'Other'
    }, locals.INTERVIEW_FORMATS);

    window.INTERVIEW_SENTIMENTS = merge({
        FANTASTIC: 'Fantastic',
        GREAT: 'Great',
        GOOD: 'OK',
        NEUTRAL: 'Neutral',
        POOR: 'Poorly',
        TERRIBLE: 'Terribly'
    }, locals.INTERVIEW_SENTIMENTS);

    window.FIT_LEVELS = merge({
        UNSET: { label: '—', value: null },
        LOW: { label: 'Long Shot', value: 1 },
        MEDIUM: { label: 'Decent', value: 2 },
        HIGH: { label: 'Great', value: 3 }
    }, locals.FIT_LEVELS);

    window.DEFAULT_COMPANIES = merge({}, locals.DEFAULT_COMPANIES);
})();