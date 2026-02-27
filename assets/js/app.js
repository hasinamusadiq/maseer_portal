/**
 * Maseer Portal - Main Application
 */

// ⚠️ CHANGE THESE VALUES TO YOUR GITHUB USERNAME AND REPO NAME
const CONFIG = {
    GITHUB_USERNAME: 'hasinamusadiq',  // ← CHANGE THIS TO YOUR USERNAME
    GITHUB_REPO: 'maseer_automation',   // ← CHANGE THIS IF YOUR REPO HAS DIFFERENT NAME
};

// State management
let currentStep = 1;
let formData = {};
let currentLang = 'en';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
    
    // Set default language based on browser
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('fa') || browserLang.startsWith('ar')) {
        toggleLanguage();
    }
});

function initializeForm() {
    updateProgressBar();
    
    // Initialize Coloris
    if (typeof Coloris !== 'undefined') {
        Coloris({
            el: '.coloris',
            theme: 'default',
            themeMode: 'light',
            format: 'hex',
            alpha: false,
            swatches: [
                '#D32F2F', '#C2185B', '#7B1FA2', '#512DA8',
                '#303F9F', '#1976D2', '#0288D1', '#0097A7',
                '#00796B', '#388E3C', '#689F38', '#AFB42B',
                '#FBC02D', '#FFA000', '#F57C00', '#E64A19',
                '#5D4037', '#616161', '#455A64', '#263238'
            ],
            onChange: (color, input) => {
                const previewId = input.id + 'Preview';
                const preview = document.getElementById(previewId);
                if (preview) {
                    preview.style.backgroundColor = color;
                }
            }
        });
    }
}

function setupEventListeners() {
    // Logo URL validation
    document.getElementById('logoUrl').addEventListener('blur', validateLogoUrl);
    
    // Enter key navigation
    document.querySelectorAll('.form-step input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const step = parseInt(this.closest('.form-step').dataset.step);
                if (step < 3) {
                    nextStep(step + 1);
                }
            }
        });
    });
}

function validateLogoUrl() {
    const url = document.getElementById('logoUrl').value;
    const preview = document.getElementById('logoPreview');
    const container = document.getElementById('logoPreviewContainer');
    
    if (!url) {
        container.style.display = 'none';
        return;
    }
    
    const img = new Image();
    img.onload = function() {
        preview.src = url;
        container.style.display = 'block';
    };
    img.onerror = function() {
        container.style.display = 'none';
    };
    img.src = url;
}

function removeLogo() {
    document.getElementById('logoUrl').value = '';
    document.getElementById('logoPreviewContainer').style.display = 'none';
}

function nextStep(step) {
    if (!validateStep(currentStep)) {
        return;
    }
    
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
    currentStep = step;
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');
    updateProgressBar();
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
}

function prevStep(step) {
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
    currentStep = step;
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');
    updateProgressBar();
}

function validateStep(step) {
    const currentStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
    const requiredFields = currentStepEl.querySelectorAll('[required]');
    let valid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#D32F2F';
            valid = false;
            field.style.animation = 'shake 0.5s';
            setTimeout(() => {
                field.style.animation = '';
                field.style.borderColor = '';
            }, 500);
        }
    });
    
    return valid;
}

function updateProgressBar() {
    document.querySelectorAll('.progress-step').forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        step.classList.remove('active', 'completed');
        
        if (stepNum === currentStep) {
            step.classList.add('active');
        } else if (stepNum < currentStep) {
            step.classList.add('completed');
        }
    });
    
    document.querySelectorAll('.progress-line').forEach((line, index) => {
        if (index < currentStep - 1) {
            line.classList.add('active');
        } else {
            line.classList.remove('active');
        }
    });
}

async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateStep(3)) {
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';
    submitBtn.disabled = true;
    
    collectFormData();
    
    try {
        await submitToGitHub();
    } catch (error) {
        console.error('Submission error:', error);
        showError(error.message);
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function collectFormData() {
    const form = document.getElementById('brandForm');
    const formDataObj = new FormData(form);
    
    formData = {
        brand_name: formDataObj.get('brand_name'),
        local_name: formDataObj.get('local_name'),
        industry: formDataObj.get('industry'),
        location: formDataObj.get('location') || 'Kabul, Afghanistan',
        primary_color: formDataObj.get('primary_color'),
        secondary_color: formDataObj.get('secondary_color'),
        logo_path: formDataObj.get('logo_path'),
        target_audience: formDataObj.get('target_audience'),
        key_offerings: formDataObj.get('key_offerings'),
        contact_info: formDataObj.get('contact_info'),
        urgent: formDataObj.get('urgent') === 'true',
        language: currentLang === 'fa' ? 'Persian' : 'English',
        submitted_at: new Date().toISOString()
    };
}

async function submitToGitHub() {
    // Create issue body
    const issueBody = formatIssueBody(formData);
    const issueTitle = `New Client: ${formData.brand_name}`;
    
    // GitHub Issues URL with pre-filled data
    const baseUrl = `https://github.com/${CONFIG.GITHUB_USERNAME}/${CONFIG.GITHUB_REPO}/issues/new`;
    const params = new URLSearchParams({
        title: issueTitle,
        body: issueBody,
        labels: 'new-client,automated'
    });
    
    // Open GitHub issue creation in new tab
    const issueUrl = `${baseUrl}?${params.toString()}`;
    window.open(issueUrl, '_blank');
    
    // Show success message
    showSuccess();
}

function formatIssueBody(data) {
    return `## New Brand Registration

**Submitted:** ${data.submitted_at}
**Status:** ${data.urgent ? '⚠️ URGENT' : 'Standard'}

### Brand Information
| Field | Value |
|-------|-------|
| **Brand Name** | ${data.brand_name} |
| **Local Name** | ${data.local_name} |
| **Industry** | ${data.industry} |
| **Location** | ${data.location} |

### Visual Identity
| Field | Value |
|-------|-------|
| **Primary Color** | \`${data.primary_color}\` |
| **Secondary Color** | \`${data.secondary_color}\` |
| **Logo URL** | ${data.logo_path} |

### Marketing Details
| Field | Value |
|-------|-------|
| **Target Audience** | ${data.target_audience} |
| **Key Offerings** | ${data.key_offerings} |
| **Contact** | ${data.contact_info || 'Not provided'} |

### Raw Data (JSON)
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

---
*This issue was automatically generated by [Maseer Portal](https://${CONFIG.GITHUB_USERNAME}.github.io/maseer-portal/)*
`;
}

function showSuccess() {
    document.getElementById('brandForm').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';
    
    const issueUrl = `https://github.com/${CONFIG.GITHUB_USERNAME}/${CONFIG.GITHUB_REPO}/issues`;
    document.getElementById('issueLink').href = issueUrl;
    document.getElementById('issueLink').textContent = 'View Issues on GitHub';
}

function showError(message) {
    document.getElementById('brandForm').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'block';
    document.getElementById('errorText').textContent = message;
}

function retrySubmit() {
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('brandForm').style.display = 'block';
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.querySelector('.btn-text').style.display = 'block';
    submitBtn.querySelector('.btn-loader').style.display = 'none';
    submitBtn.disabled = false;
}

function resetForm() {
    document.getElementById('brandForm').reset();
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('brandForm').style.display = 'block';
    document.getElementById('logoPreviewContainer').style.display = 'none';
    
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    document.querySelector('.form-step[data-step="1"]').classList.add('active');
    currentStep = 1;
    updateProgressBar();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.querySelector('.btn-text').style.display = 'block';
    submitBtn.querySelector('.btn-loader').style.display = 'none';
    submitBtn.disabled = false;
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'fa' : 'en';
    document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
    document.getElementById('lang-text').textContent = currentLang === 'en' ? 'فارسی' : 'English';
    
    document.querySelectorAll('[data-en][data-fa]').forEach(el => {
        el.textContent = el.getAttribute(`data-${currentLang}`);
    });
}

function showUploadHelp() {
    document.getElementById('helpModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('helpModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('helpModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);
