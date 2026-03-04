/**
 * Maseer Portal - Main Application Logic
 * Zero-cost stack: Firebase Auth + Firebase Functions + GitHub
 */

const App = (function() {
    'use strict';
    
    let currentUser = null;
    let videoCheckInterval = null;
    let db = null;
    let functions = null;
    
    function init() {
        if (!window.validateConfig()) {
            showError('Configuration error. Please contact support.');
            return;
        }
        
        initializeFirebase();
        setupEventListeners();
        checkCapacity();
    }
    
    function initializeFirebase() {
        try {
            firebase.initializeApp(CONFIG.FIREBASE);
            
            // Initialize Firestore and Functions
            db = firebase.firestore();
            functions = firebase.functions();
            
            // Use emulator in debug mode
            if (CONFIG.DEBUG && window.location.hostname === 'localhost') {
                functions.useFunctionsEmulator('http://localhost:5001');
                db.useEmulator('localhost', 8080);
            }
            
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    handleAuthSuccess(user);
                } else {
                    showAuthModal();
                }
            });
        } catch (error) {
            console.error('Firebase init error:', error);
            showError('Failed to initialize authentication.');
        }
    }
    
    function setupEventListeners() {
        const phoneForm = document.getElementById('phoneAuthForm');
        if (phoneForm) {
            phoneForm.addEventListener('submit', handlePhoneVerify);
        }
        
        const regForm = document.getElementById('registrationForm');
        if (regForm) {
            regForm.addEventListener('submit', handleRegistration);
        }
    }
    
    function showAuthModal() {
        document.getElementById('authModal').style.display = 'flex';
        document.getElementById('mainContent').classList.remove('authenticated');
    }
    
    function hideAuthModal() {
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('mainContent').classList.add('authenticated');
    }
    
    function handleAuthSuccess(user) {
        currentUser = user;
        hideAuthModal();
        
        const displayName = user.displayName || user.phoneNumber || user.email || 'User';
        document.getElementById('userDisplay').textContent = displayName;
        
        const phoneInput = document.getElementById('verifiedPhone');
        if (phoneInput && user.phoneNumber) {
            phoneInput.value = user.phoneNumber;
        }
        
        // Check Firestore for existing video
        checkForExistingVideo(user.uid);
        
        // Real-time listener for video status
        listenForVideoUpdates(user.uid);
    }
    
    async function checkCapacity() {
        try {
            // Call Firebase Function to check capacity
            const checkCapacityFn = functions.httpsCallable('checkCapacity');
            const result = await checkCapacityFn();
            const { current, max, remaining } = result.data;
            
            if (remaining <= 0) {
                document.getElementById('capacityCheck').innerHTML = `
                    <div class="capacity-banner">
                        <strong>Capacity Full</strong><br>
                        We've reached our limit of ${max} clients. 
                        Please <a href="mailto:waitlist@maseer.media" style="color: inherit;">join our waitlist</a>.
                    </div>
                `;
                document.getElementById('registrationForm').style.display = 'none';
            } else if (remaining <= 5) {
                document.getElementById('capacityCheck').innerHTML = `
                    <div class="alert alert-success show" style="background: rgba(234,179,8,0.1); border-color: rgba(234,179,8,0.3); color: #FCD34D;">
                        <strong>Limited Spots:</strong> Only ${remaining} spots remaining!
                    </div>
                `;
            }
        } catch (error) {
            console.error('Capacity check failed:', error);
        }
    }
    
    async function listenForVideoUpdates(userId) {
        // Real-time listener for video generation status
        db.collection('videos').doc(userId)
            .onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    if (data.status === 'ready' && data.downloadUrl) {
                        showVideoSection(data.downloadUrl);
                    }
                }
            });
    }
    
    async function checkForExistingVideo(userId) {
        try {
            const doc = await db.collection('videos').doc(userId).get();
            if (doc.exists) {
                const data = doc.data();
                if (data.status === 'ready' && data.downloadUrl) {
                    showVideoSection(data.downloadUrl);
                }
            }
        } catch (error) {
            console.log('No video found yet');
        }
    }
    
    function showVideoSection(videoUrl) {
        const section = document.getElementById('videoSection');
        const video = document.getElementById('sampleVideo');
        
        section.classList.add('active');
        
        // Use Firebase Storage URL with token (secure, time-limited)
        video.src = videoUrl;
        
        // Security measures
        video.addEventListener('contextmenu', e => e.preventDefault());
        
        // Add watermark overlay with user ID
        addWatermark();
        
        section.scrollIntoView({ behavior: 'smooth' });
    }
    
    function addWatermark() {
        const container = document.querySelector('.video-container');
        if (container.querySelector('.watermark')) return;
        
        const watermark = document.createElement('div');
        watermark.className = 'watermark';
        watermark.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(0,0,0,0.6);
            color: rgba(255,255,255,0.5);
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 20;
            pointer-events: none;
            font-family: monospace;
        `;
        watermark.textContent = `ID: ${currentUser.uid.substring(0, 8)}`;
        container.appendChild(watermark);
    }
    
    async function handleRegistration(e) {
        e.preventDefault();
        
        if (!currentUser) {
            showError('Please login first');
            return;
        }
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Creating...';
        
        try {
            const formData = collectFormData();
            
            // Call Firebase Function to create GitHub issue
            const createIssueFn = functions.httpsCallable('createGitHubIssue');
            const result = await createIssueFn({ data: formData });
            
            const { issueNumber, issueUrl } = result.data;
            
            // Store in Firestore for tracking
            await db.collection('registrations').doc(currentUser.uid).set({
                ...formData,
                issueNumber,
                issueUrl,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            });
            
            sessionStorage.setItem('maseer_registration', JSON.stringify({
                brand_name: formData.brand_name,
                user_id: currentUser.uid,
                issue_number: issueNumber,
                timestamp: Date.now()
            }));
            
            window.location.href = 'success.html';
            
        } catch (error) {
            console.error('Registration error:', error);
            showError(error.message || 'Failed to submit. Please try again.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    function collectFormData() {
        return {
            brand_name: document.getElementById('brandName').value.trim(),
            local_name: document.getElementById('localName').value.trim() || null,
            industry: document.getElementById('industry').value,
            facebook_page: document.getElementById('facebookPage').value.trim(),
            phone: document.getElementById('verifiedPhone').value,
            primary_color: document.getElementById('primaryColor').value.toUpperCase(),
            secondary_color: document.getElementById('secondaryColor').value.toUpperCase(),
            target_audience: document.getElementById('targetAudience').value.trim() || null,
            key_offerings: document.getElementById('keyOfferings').value.trim() || null,
            user_id: currentUser.uid,
            user_email: currentUser.email,
            user_phone: currentUser.phoneNumber,
            request_sample: true,
            submitted_at: new Date().toISOString()
        };
    }
    
    function sendSubscriptionSMS(e) {
        e.preventDefault();
        const message = 'Maseer';
        window.location.href = `sms:${CONFIG.SMS_NUMBER}?body=${encodeURIComponent(message)}`;
    }
    
    function showError(message) {
        const alert = document.getElementById('errorAlert');
        alert.textContent = message;
        alert.classList.add('show');
        setTimeout(() => alert.classList.remove('show'), 5000);
    }
    
    return {
        init,
        sendSubscriptionSMS
    };
})();

// Auth Module
const Auth = (function() {
    'use strict';
    
    let confirmationResult = null;
    let recaptchaVerifier = null;
    
    function initRecaptcha() {
        if (recaptchaVerifier) return;
        
        recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sendOtpBtn', {
            size: 'invisible',
            callback: () => {}
        });
    }
    
    async function sendOTP() {
        initRecaptcha();
        
        const phoneInput = document.getElementById('phoneNumber');
        const phone = phoneInput.value.trim();
        const btn = document.getElementById('sendOtpBtn');
        
        if (!phone.match(/^\+93[0-9]{9}$/)) {
            alert('Please enter a valid Afghan number: +937XXXXXXXX');
            return;
        }
        
        btn.disabled = true;
        btn.textContent = 'Sending...';
        
        try {
            confirmationResult = await firebase.auth().signInWithPhoneNumber(phone, recaptchaVerifier);
            document.getElementById('otpSection').classList.add('active');
            btn.textContent = 'Resend OTP';
        } catch (error) {
            console.error('OTP Error:', error);
            alert('Failed to send OTP: ' + error.message);
            btn.disabled = false;
            btn.textContent = 'Send OTP';
        }
    }
    
    async function loginWithGoogle() {
        const btn = document.getElementById('googleLoginBtn');
        btn.disabled = true;
        
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await firebase.auth().signInWithPopup(provider);
        } catch (error) {
            console.error('Google login error:', error);
            alert('Google login failed: ' + error.message);
            btn.disabled = false;
        }
    }
    
    async function loginWithFacebook() {
        const btn = document.getElementById('facebookLoginBtn');
        btn.disabled = true;
        
        try {
            const provider = new firebase.auth.FacebookAuthProvider();
            await firebase.auth().signInWithPopup(provider);
        } catch (error) {
            console.error('Facebook login error:', error);
            alert('Facebook login failed: ' + error.message);
            btn.disabled = false;
        }
    }
    
    async function verifyOTP(e) {
        e.preventDefault();
        
        const code = document.getElementById('otpCode').value;
        if (!code || code.length !== 6) {
            alert('Please enter the 6-digit code');
            return;
        }
        
        try {
            await confirmationResult.confirm(code);
        } catch (error) {
            console.error('Verification error:', error);
            alert('Invalid code. Please try again.');
        }
    }
    
    function logout() {
        firebase.auth().signOut();
        localStorage.removeItem('maseer_user');
        location.reload();
    }
    
    window.Auth = {
        sendOTP,
        loginWithGoogle,
        loginWithFacebook,
        logout
    };
    
    return window.Auth;
})();

document.addEventListener('DOMContentLoaded', App.init);
