/**
 * Maseer Portal - Configuration
 * All sensitive values loaded from environment or injected at build time
 */

const CONFIG = {
    // Firebase Config - Injected by GitHub Actions
    FIREBASE: {
        apiKey: window.ENV?.FIREBASE_API_KEY || '__FIREBASE_API_KEY__',
        authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || '__FIREBASE_AUTH_DOMAIN__',
        projectId: window.ENV?.FIREBASE_PROJECT_ID || '__FIREBASE_PROJECT_ID__',
        storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET || '__FIREBASE_STORAGE_BUCKET__',
        messagingSenderId: window.ENV?.FIREBASE_MESSAGING_SENDER_ID || '__FIREBASE_MESSAGING_SENDER_ID__',
        appId: window.ENV?.FIREBASE_APP_ID || '__FIREBASE_APP_ID__'
    },
    
    // Backend Repository
    BACKEND_REPO: window.ENV?.BACKEND_REPO || 'hasinamusadiq/maseer_automation',
    
    // Firebase Cloud Function URL
    CLOUD_FUNCTION_URL: window.ENV?.CLOUD_FUNCTION_URL || '__CLOUD_FUNCTION_URL__',
    
    // SMS Subscription Number
    SMS_NUMBER: window.ENV?.SMS_NUMBER || '+93793535228',
    
    // Client Limits
    MAX_CLIENTS: 24,
    
    // Video Polling Interval (ms)
    VIDEO_POLL_INTERVAL: 30000,
    
    // Debug Mode
    DEBUG: window.ENV?.DEBUG === 'true' || false
};

function validateConfig() {
    const required = ['apiKey', 'authDomain', 'projectId'];
    const missing = required.filter(key => CONFIG.FIREBASE[key].includes('__'));
    
    if (missing.length > 0) {
        console.error('Missing Firebase config:', missing);
        return false;
    }
    return true;
}

window.CONFIG = CONFIG;
window.validateConfig = validateConfig;
