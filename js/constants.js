window.APP_CONFIG = {
    VERSION: '1.0',
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
        BLOCKED_COMPANIES: 'blockedCompanies',
        LAST_BACKUP: 'jobTrackerLastBackup',
        THEME: 'theme'
    },
    BACKUP_INTERVAL_MS: 60 * 60 * 1000,
    MS_PER_DAY: 1000 * 60 * 60 * 24,
    ITEMS_PER_PAGE: 20,
    HOT_PERIOD_MULTIPLIER: 1.25,
    MIN_APPLICATIONS_FOR_COMPANY_STATS: 2
};

window.JOB_STATUSES = {
    APPLIED: 'Applied',
    IN_PROGRESS: 'In Progress',
    CLOSED: 'Closed'
};

window.STATUSES = Object.values(window.JOB_STATUSES);

window.CLOSE_REASONS = {
    GHOSTED: 'Ghosted',
    REJECTED: 'Rejected',
    DECLINED_OFFER: 'Declined Offer',
    WITHDREW: 'Withdrew'
};

window.PROGRESSION_STAGES = {
    APPLICATION: 'Application',
    RECRUITER_SCREEN: 'Recruiter Screen',
    PARTIAL_LOOP: 'Partial Loop',
    FULL_LOOP: 'Full Loop',
    OFFER: 'Offer'
};

window.PROGRESSIONS = Object.values(window.PROGRESSION_STAGES);

window.PRIORITY_TIERS = {
    TIER_1: 'Tier 1',
    TIER_2: 'Tier 2',
    TIER_3: 'Tier 3'
};

window.PRIORITIES = Object.values(window.PRIORITY_TIERS);

window.INTERVIEW_FORMATS = {
    IN_PERSON: 'In Person',
    PHONE: 'Phone',
    VIDEO_ZOOM: 'Zoom',
    VIDEO_TEAMS: 'Teams',
    VIDEO_MEET: 'Google Meet',
    VIDEO_OTHER: 'Video Call',
    OTHER: 'Other'
};

window.INTERVIEW_SENTIMENTS = {
    FANTASTIC: 'Fantastic',
    GREAT: 'Great',
    GOOD: 'OK',
    NEUTRAL: 'Neutral',
    POOR: 'Poorly',
    TERRIBLE: 'Terribly'
};

window.FIT_LEVELS = {
            UNSET: { label: '—', value: null },
            LOW: { label: 'Long Shot', value: 1 },
            MEDIUM: { label: 'Decent', value: 2 },
            HIGH: { label: 'Great', value: 3 }
        };

window.DEFAULT_COMPANIES = {};