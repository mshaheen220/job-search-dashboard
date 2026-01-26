/**
 * Local Configuration Overrides
 * 
 * This file allows you to override global constants defined in constants.js.
 * It is loaded before constants.js, so values defined here in window.LOCAL_CONSTANTS
 * will be merged with the defaults.
 * 
 * Add this file to your .gitignore to keep your personal settings local.
 */

window.LOCAL_CONSTANTS = {
    APP_CONFIG: {
        // Personalize the app
        AUTHOR_NAME: 'My Local User',
        
        // Custom URLs (set to empty string to hide)
        URLS: {
            GITHUB: 'https://github.com/my-fork/job-search-dashboard',
            PAYPAL: '', 
            PERSONAL: 'https://my-portfolio.com'
        },
        
        // Adjust settings
        ITEMS_PER_PAGE: 50,
        BACKUP_INTERVAL_MS: 30 * 60 * 1000 // 30 minutes
    },

    // Example: Add a new interview format
    INTERVIEW_FORMATS: {
        VIDEO_DISCORD: 'Discord',
        VIDEO_SLACK: 'Slack Huddle'
    },

    // Example: Customize priority tiers
    PRIORITY_TIERS: {
        TIER_1: 'High Priority',
        TIER_2: 'Medium Priority',
        TIER_3: 'Low Priority'
    }
};