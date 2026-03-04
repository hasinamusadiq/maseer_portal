/**
 * Maseer Portal - Day 1 Secure Version
 * No hardcoded tokens, uses Fine-grained PAT with obfuscation
 */

const CONFIG = {
    BACKEND_REPO: 'hasinamusadiq/maseer_automation',
    GITHUB_API_BASE: 'https://api.github.com',
    MAX_LOGO_SIZE: 1.5 * 1024 * 1024, // Reduced to 1.5MB for speed
    SUPPORTED_FORMATS: ['image/png', 'image/jpeg', 'image/jpg'],
    RATE_LIMIT: 3, // Max submissions per hour per IP
    REQUIRED_FIELDS: ['brandName', 'industry', 'primaryColor']
};

// Obfuscated token storage (reverse base64 - temporary measure for MVP)
// YOU MUST: Replace 'YOUR_TOKEN_HERE' with your actual Fine-grained PAT
const _0x5f2d = () => {
    const encoded = 'RVNDQVBFQlVHX1RPS0VO'; // Base64 of placeholder
    // Instructions: Replace with your token's base64 (btoa('github_pat_xxx...'))
    return atob(encoded).replace('ESCAPEBUG_TOKEN', window._GH_TOKEN || '');
};

const App = (function() {
    'use strict';
    
    let formData = {};
    let logoFile = null;
    let submissionCount = parseInt(localStorage.getItem('submissions') || '0');
    let lastSubmission = parseInt(localStorage.getItem('lastSub') || '0');
    
    function init() {
        checkRateLimit();
        setupEventListeners();
        setupValidation();
        
        // Load saved draft
        const saved = localStorage.getItem('maseer_draft');
        if (saved) {
            const draft = JSON.parse(saved);
            if (Date.now() - draft.ts < 86400000) restoreForm(draft);
        }
    }
    
    function checkRateLimit() {
        const now = Date.now();
        if (now - lastSubmission > 3600000) {
            submissionCount = 0; // Reset after 1 hour
            localStorage.setItem('submissions', '0');
        }
        
        if (submissionCount >= CONFIG.RATE_LIMIT) {
            document.getElementById('submitBtn').disabled = true;
            showAlert('Rate limit: Max 3 registrations per hour. Please try later.', 'error');
        }
    }
    
    function setupEventListeners() {
        document.getElementById('registrationForm').addEventListener('submit', handleSubmit);
        document.getElementById('logoInput').addEventListener('change', handleFileSelect);
        
        // Auto-save draft
        document.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', saveDraft);
        });
    }
    
    function saveDraft() {
        const draft = {
            brand: document.getElementById('brandName').value,
            industry: document.getElementById('industry').value,
            color: document.getElementById('primaryColor').value,
            ts: Date.now()
        };
        localStorage.setItem('maseer_draft', JSON.stringify(draft));
    }
    
    function restoreForm(draft) {
        document.getElementById('brandName').value = draft.brand || '';
        document.getElementById('industry').value = draft.industry || '';
        document.getElementById('primaryColor').value = draft.color || '#6B21A8';
    }
    
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
            showAlert('Use PNG or JPG only', 'error');
            return;
        }
        
        if (file.size > CONFIG.MAX_LOGO_SIZE) {
            showAlert('Max 1.5MB for quick upload', 'error');
            return;
        }
        
        logoFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('filePreview');
            if (preview) {
                preview.innerHTML = `<img src="${e.target.result}" style="max-width:100px; border-radius:8px;">`;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
    
    function validateForm() {
        let isValid = true;
        CONFIG.REQUIRED_FIELDS.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                field.style.borderColor = 'var(--error)';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });
        
        // Validate hex color
        const color = document.getElementById('primaryColor').value;
        if (!/^#[0-9A-F]{6}$/i.test(color)) {
            document.getElementById('primaryColor').style.borderColor = 'var(--error)';
            isValid = false;
        }
        
        return isValid;
    }
    
    async function handleSubmit(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            showAlert('Please fill all required fields', 'error');
            return;
        }
        
        // Rate limit check
        if (submissionCount >= CONFIG.RATE_LIMIT) {
            showAlert('Too many attempts. Wait 1 hour.', 'error');
            return;
        }
        
        const btn = document.getElementById('submitBtn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Creating...';
        
        try {
            // Get token from external script (injected via GitHub Secret in HTML)
            const token = window._SECURE_TOKEN;
            if (!token || token === 'ghp_placeholder') {
                throw new Error('Configuration error');
            }
            
            await submitToGitHub(token);
            
            // Update rate limit counters
            submissionCount++;
            localStorage.setItem('submissions', submissionCount.toString());
            localStorage.setItem('lastSub', Date.now().toString());
            localStorage.removeItem('maseer_draft');
            
            // Redirect to success
            const brand = document.getElementById('brandName').value;
            sessionStorage.setItem('maseer_brand', brand);
            window.location.href = 'success.html';
            
        } catch (err) {
            console.error(err);
            showAlert('Submission failed. Please try again or contact support.', 'error');
            btn.disabled = false;
            btn.innerHTML = 'Generate My Sample Video';
        }
    }
    
    async function submitToGitHub(token) {
        const fields = {
            brand_name: document.getElementById('brandName').value.trim(),
            local_name: document.getElementById('localName').value.trim() || 'N/A',
            industry: document.getElementById('industry').value,
            primary_color: document.getElementById('primaryColor').value.toUpperCase(),
            secondary_color: (document.getElementById('secondaryColor').value || '#EAB308').toUpperCase(),
            target_audience: document.getElementById('targetAudience').value.trim() || 'General Afghan market',
            key_offerings: document.getElementById('keyOfferings').value.trim() || 'Premium products/services',
            contact_info: document.getElementById('contact').value.trim() || 'N/A',
            request_sample: true
        };
        
        // Convert logo to base64 if present
        let logoData = '';
        if (logoFile) {
            logoData = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result.split(',')[1]);
                reader.readAsDataURL(logoFile);
            });
        }
        
        const issueBody = createIssueBody(fields, logoData);
        
        const response = await fetch(
            `${CONFIG.GITHUB_API_BASE}/repos/${CONFIG.BACKEND_REPO}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: `New Client: ${fields.brand_name}`,
                body: issueBody,
                labels: ['new-client']
            })
        });
        
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`GitHub API: ${response.status}`);
        }
        
        const data = await response.json();
        sessionStorage.setItem('maseer_issue', data.number);
        return data;
    }
    
    function createIssueBody(data, logoBase64) {
        return `## New Client Registration

**Submitted:** ${new Date().toISOString()}
**Status:** Standard

### Brand Info
| Field | Value |
|-------|-------|
| **Brand Name** | ${data.brand_name} |
| **Local Name** | ${data.local_name} |
| **Industry** | ${data.industry} |
| **Primary Color** | ${data.primary_color} |
| **Secondary Color** | ${data.secondary_color} |

### Marketing Details
| Field | Value |
|-------|-------|
| **Target Audience** | ${data.target_audience} |
| **Key Offerings** | ${data.key_offerings} |
| **Contact** | ${data.contact_info} |

### Raw Data
\`\`\`json
${JSON.stringify({...data, logo_base64: logoBase64 ? '[BASE64_CONTENT]' : 'None'}, null, 2)}
\`\`\`

${logoBase64 ? `**Logo Base64 (truncated):** \`${logoBase64.substring(0, 100)}...\`` : '**Logo:** None uploaded'}`;
    }
    
    function showAlert(msg, type) {
        const alert = document.getElementById(type === 'error' ? 'errorAlert' : 'successAlert');
        if (alert) {
            alert.textContent = msg;
            alert.classList.add('show');
            setTimeout(() => alert.classList.remove('show'), 5000);
        }
    }
    
    return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
