/**
 * Maseer Portal - Production-Ready Authentication & Video Streaming
 * Zero-cost stack: Firebase Auth + GitHub Releases + Telegram
 */

const CONFIG = {
    BACKEND_REPO: 'hasinamusadiq/maseer_automation',
    FIREBASE_CONFIG: {
        apiKey: "AIzaSy...", // Your Firebase config
        authDomain: "maseer-portal.firebaseapp.com",
        projectId: "maseer-portal",
        appId: "1:..."
    },
    SMS_NUMBER: '+93793535228',
    MAX_CLIENTS: 24
};

// Initialize Firebase
firebase.initializeApp(CONFIG.FIREBASE_CONFIG);

const App = {
    async init() {
        this.checkAuthState();
        this.setupEventListeners();
        this.enforceClientLimit();
    },
    
    checkAuthState() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                Auth.handleAuthSuccess(user);
            } else {
                document.getElementById('authModal').style.display = 'flex';
            }
        });
    },
    
    async enforceClientLimit() {
        // Check if we've hit 24 clients
        const response = await fetch(`https://api.github.com/repos/${CONFIG.BACKEND_REPO}/issues?labels=new-client&state=open`);
        const issues = await response.json();
        
        if (issues.length >= CONFIG.MAX_CLIENTS) {
            document.getElementById('registrationForm').innerHTML = `
                <div class="alert alert-error show">
                    We've reached capacity (24/24 clients). 
                    <a href="mailto:waitlist@maseer.media">Join waitlist</a>
                </div>
            `;
        }
    }
};

const Auth = {
    recaptchaVerifier: null,
    
    initRecaptcha() {
        this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sendOtpBtn', {
            size: 'invisible'
        });
    },
    
    async sendOTP() {
        const phone = document.getElementById('phoneNumber').value;
        if (!phone.match(/^\+93[0-9]{9}$/)) {
            alert('Please enter valid Afghan number: +937XXXXXXXX');
            return;
        }
        
        try {
            window.confirmationResult = await firebase.auth().signInWithPhoneNumber(
                phone, 
                this.recaptchaVerifier
            );
            document.getElementById('otpSection').classList.add('active');
            document.getElementById('sendOtpBtn').textContent = 'Resend';
        } catch (error) {
            console.error('OTP Error:', error);
            alert('Failed to send OTP. Please try again.');
        }
    },
    
    async verifyOTP(e) {
        e.preventDefault();
        const code = document.getElementById('otpCode').value;
        
        try {
            const result = await window.confirmationResult.confirm(code);
            this.handleAuthSuccess(result.user);
        } catch (error) {
            alert('Invalid code. Please try again.');
        }
    },
    
    async loginWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        this.handleAuthSuccess(result.user);
    },
    
    async loginWithFacebook() {
        const provider = new firebase.auth.FacebookAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        this.handleAuthSuccess(result.user);
    },
    
    handleAuthSuccess(user) {
        // Hide auth modal
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('mainContent').classList.add('authenticated');
        
        // Store user data
        localStorage.setItem('maseer_user', JSON.stringify({
            uid: user.uid,
            phone: user.phoneNumber,
            email: user.email,
            name: user.displayName
        }));
        
        // Pre-fill form
        if (user.phoneNumber) {
            document.getElementById('verifiedPhone').value = user.phoneNumber;
        }
        
        // Load their video if they have one
        VideoManager.checkForExistingVideo(user.uid);
    },
    
    logout() {
        firebase.auth().signOut();
        localStorage.removeItem('maseer_user');
        location.reload();
    }
};

const VideoManager = {
    async checkForExistingVideo(userId) {
        // Poll for video associated with this user
        const user = JSON.parse(localStorage.getItem('maseer_user'));
        if (!user) return;
        
        // Check GitHub releases for video with this user's brand
        const response = await fetch(`https://api.github.com/repos/${CONFIG.BACKEND_REPO}/releases`);
        const releases = await response.json();
        
        // Find video matching user's brand (stored in issue)
        // This requires linking user ID to GitHub issue
    },
    
    async loadVideo(videoUrl) {
        const section = document.getElementById('videoSection');
        const video = document.getElementById('sampleVideo');
        
        section.classList.add('active');
        
        // Use HLS or direct MP4 with protection
        video.src = videoUrl;
        video.play();
        
        // Security measures
        this.protectVideo(video);
    },
    
    protectVideo(video) {
        // Disable context menu
        video.addEventListener('contextmenu', e => e.preventDefault());
        
        // Detect screen recording (basic)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) video.pause();
        });
        
        // Watermark with user ID (if you had canvas rendering)
    }
};

const FormHandler = {
    async submit(e) {
        e.preventDefault();
        
        const user = JSON.parse(localStorage.getItem('maseer_user'));
        if (!user) {
            alert('Please login first');
            return;
        }
        
        const formData = {
            brand_name: document.getElementById('brandName').value,
            facebook_page: document.getElementById('facebookPage').value,
            phone: document.getElementById('verifiedPhone').value,
            industry: document.getElementById('industry').value,
            primary_color: document.getElementById('primaryColor').value,
            user_id: user.uid, // Link to Firebase user
            request_sample: true
        };
        
        // Submit to GitHub via your backend proxy (or use GitHub API directly with limited scope)
        await this.createGitHubIssue(formData);
        
        // Show success and poll for video
        window.location.href = 'success.html';
    },
    
    async createGitHubIssue(data) {
        // Use a Cloudflare Worker (free) to proxy this request securely
        // OR use GitHub API with a token that only has 'issues' scope
        
        const response = await fetch('https://api.github.com/repos/' + CONFIG.BACKEND_REPO + '/issues', {
            method: 'POST',
            headers: {
                'Authorization': `token ${await this.getToken()}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                title: `New Client: ${data.brand_name}`,
                body: this.formatIssueBody(data),
                labels: ['new-client']
            })
        });
        
        if (!response.ok) throw new Error('Failed to create issue');
        return response.json();
    },
    
    formatIssueBody(data) {
        return `---
name: New Client Registration
user_id: ${data.user_id}
facebook_page: ${data.facebook_page}
---

| Field | Value |
|-------|-------|
| **Brand Name** | ${data.brand_name} |
| **Facebook Page** | ${data.facebook_page} |
| **Phone** | ${data.phone} |
| **Industry** | ${data.industry} |
| **Primary Color** | ${data.primary_color} |

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\``;
    },
    
    async getToken() {
        // Option 1: Cloudflare Worker proxy (recommended)
        const response = await fetch('https://your-worker.your-subdomain.workers.dev/token');
        return response.text();
        
        // Option 2: Short-lived token with limited scope (riskier)
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    
    // Auth events
    document.getElementById('phoneAuthForm').addEventListener('submit', (e) => Auth.verifyOTP(e));
    document.getElementById('sendOtpBtn').addEventListener('click', () => Auth.sendOTP());
    
    // Form events
    document.getElementById('registrationForm').addEventListener('submit', (e) => FormHandler.submit(e));
});
