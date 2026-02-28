/**
 * Ariana Coach Portal - Complete Application
 * Handles form navigation, logo upload, and GitHub Issues submission
 */

// ⚠️ CHANGE THESE VALUES TO YOUR ACTUAL GITHUB USERNAME AND REPO NAME
const CONFIG = {
    GITHUB_USERNAME: 'hasinamusadiq',  // ← CHANGE THIS
    GITHUB_REPO: 'maseer_automation',   // ← CHANGE THIS
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
    initializeColorPicker();
}

function initializeColorPicker() {
    if (typeof Coloris !== 'undefined') {
        Coloris({
            el: '.coloris',
            theme: 'default',
            themeMode: 'dark',
            format: 'hex',
            alpha: false,
            swatches: [
                '#6B21A8', '#9333EA', '#A855F7', '#C084FC',
                '#EAB308', '#FDE047', '#FEF08A', '#FACC15',
                '#1E1B4B', '#312E81', '#4338CA', '#6366F1',
                '#0F172A', '#1E293B', '#334155', '#475569'
            ],
            onChange: (color, input) => {
                updateColorPreview(input.id, color);
            }
        });
    }
}

function updateColorPreview(inputId, color) {
    const previewId = inputId + 'Preview';
    const preview = document.getElementById(previewId);
    if (preview) {
        preview.style.backgroundColor = color;
    }
}

// ==========================================
// LOGO UPLOAD FUNCTIONS (CRITICAL - NEW)
// ==========================================

function handleLogoUpload(input) {
    const file = input.files[0];
    const container = document.getElementById('logoUploadContainer');
    const preview = document.getElementById('clientLogoPreview');
    const previewImg = document.getElementById('previewImage');
    const fileInfo = document.getElementById('fileInfo');
    const base64Input = document.getElementById('logoBase64');
    const filenameInput = document.getElementById('logoFileName');
    
    if (!file) return;
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert(currentLang === 'en' ? 'File size too large. Maximum size is 5MB.' : 'حجم فایل بیش از حد مجاز است. حداکثر ۵ مگابایت.');
        input.value = '';
        return;
    }
    
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
        alert(currentLang === 'en' ? 'Invalid file type. Please upload PNG, JPG, or SVG.' : 'فرمت فایل نامعتبر است. لطفاً PNG، JPG یا SVG آپلود کنید.');
        input.value = '';
        return;
    }
    
    // Read file as base64
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const base64String = e.target.result;
        
        // Show preview
        previewImg.src = base64String;
        preview.style.display = 'block';
        container.style.display = 'none';
        
        // Store in hidden inputs
        base64Input.value = base64String;
        filenameInput.value = file.name;
        
        // Display file info
        const sizeKB = (file.size / 1024).toFixed(1);
        fileInfo.innerHTML = `
            <span class="file-name">${file.name}</span>
            <span class="file-size">${sizeKB} KB</span>
        `;
        
        // Add success styling
        container.classList.add('has-file');
    };
    
    reader.onerror = function() {
        alert(currentLang === 'en' ? 'Error reading file. Please try again.' : 'خطا در خواندن فایل. لطفاً دوباره تلاش کنید.');
        input.value = '';
    };
    
    reader.readAsDataURL(file);
}

function changeLogo() {
    const input = document.getElementById('logoFile');
    input.click();
}

function removeClientLogo() {
    const input = document.getElementById('logoFile');
    const container = document.getElementById('logoUploadContainer');
    const preview = document.getElementById('clientLogoPreview');
    const base64Input = document.getElementById('logoBase64');
    const filenameInput = document.getElementById('logoFileName');
    
    // Reset everything
    input.value = '';
    preview.style.display = 'none';
    container.style.display = 'block';
    container.classList.remove('has-file');
    base64Input.value = '';
    filenameInput.value = '';
}

function setupEventListeners() {
    // Real-time validation
    document.querySelectorAll('.form-step input[required], .form-step select[required], .form-step textarea[required]').forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
    });
    
    // Enter key navigation
    document.querySelectorAll('.form-step input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const step = parseInt(this.closest('.form-step').dataset.step);
                if (step < 3) {
                    nextStep(step + 1);
                } else {
                    document.getElementById('brandForm').dispatchEvent(new Event('submit'));
                }
            }
        });
    });
}

function validateField(field) {
    if (!field.value.trim()) {
        field.style.borderColor = '#EF4444';
        showFieldError(field, currentLang === 'en' ? 'This field is required' : 'این فیلد الزامی است');
        return false;
    } else {
        field.style.borderColor = '';
        removeFieldError(field);
        return true;
    }
}

function showFieldError(field, message) {
    removeFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = '#EF4444';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function removeFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function nextStep(step) {
    if (!validateStep(currentStep)) {
        return false;
    }
    
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
    currentStep = step;
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');
    updateProgressBar();
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    return true;
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
        if (!validateField(field)) {
            valid = false;
        }
    });
    
    // Special validation for logo on step 2
    if (step === 2) {
        const logoBase64 = document.getElementById('logoBase64').value;
        if (!logoBase64) {
            alert(currentLang === 'en' ? 'Please upload your brand logo.' : 'لطفاً لوگوی برند خود را آپلود کنید.');
            valid = false;
        }
    }
    
    if (!valid) {
        currentStepEl.style.animation = 'shake 0.5s';
        setTimeout(() => {
            currentStepEl.style.animation = '';
        }, 500);
    }
    
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
        return false;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';
    submitBtn.disabled = true;
    
    // Collect form data
    collectFormData();
    
    try {
        await submitToGitHub();
    } catch (error) {
        console.error('Submission error:', error);
        showError(error.message || (currentLang === 'en' ? 'Failed to submit. Please try again.' : 'ثبت ناموفق بود. لطفاً دوباره تلاش کنید.'));
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
    }
    
    return false;
}

function collectFormData() {
    const form = document.getElementById('brandForm');
    const formDataObj = new FormData(form);
    
    formData = {
        brand_name: formDataObj.get('brand_name')?.trim(),
        local_name: formDataObj.get('local_name')?.trim(),
        industry: formDataObj.get('industry'),
        location: formDataObj.get('location')?.trim() || 'Kabul, Afghanistan',
        primary_color: formDataObj.get('primary_color'),
        secondary_color: formDataObj.get('secondary_color'),
        logo_base64: document.getElementById('logoBase64').value,  // CRITICAL: Send base64
        logo_filename: document.getElementById('logoFileName').value,
        target_audience: formDataObj.get('target_audience')?.trim(),
        key_offerings: formDataObj.get('key_offerings')?.trim(),
        contact_info: formDataObj.get('contact_info')?.trim(),
        urgent: formDataObj.get('urgent') === 'true',
        language: currentLang === 'fa' ? 'Persian' : 'English',
        submitted_at: new Date().toISOString(),
        submitted_by: 'Ariana Coach Portal'
    };
    
    if (!formData.brand_name || !formData.industry || !formData.primary_color || !formData.logo_base64) {
        throw new Error(currentLang === 'en' ? 'Missing required fields' : 'فیلدهای الزامی خالی هستند');
    }
}

async function submitToGitHub() {
    const issueBody = formatIssueBody(formData);
    const issueTitle = `New Client: ${formData.brand_name}`;
    
    const baseUrl = `https://github.com/${CONFIG.GITHUB_USERNAME}/${CONFIG.GITHUB_REPO}/issues/new`;
    
    const params = new URLSearchParams({
        title: issueTitle,
        body: issueBody
    });
    
    try {
        params.append('labels', 'new-client,automated');
    } catch (e) {
        console.log('Labels parameter not supported');
    }
    
    const issueUrl = `${baseUrl}?${params.toString()}`;
    
    const newWindow = window.open(issueUrl, '_blank');
    
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        showError(currentLang === 'en' ? 
            'Please allow popups for this site, or click the link below:<br><a href="' + issueUrl + '" target="_blank">Click here to submit</a>' : 
            'لطفاً پاپ‌آپ را برای این سایت فعال کنید، یا روی لینک زیر کلیک کنید:<br><a href="' + issueUrl + '" target="_blank">اینجا کلیک کنید</a>');
        return;
    }
    
    showSuccess(issueUrl);
}

function formatIssueBody(data) {
    return `## New Brand Registration - Ariana Coach

**Submitted:** ${data.submitted_at}
**Status:** ${data.urgent ? '⚠️ URGENT - Process within 24 hours' : 'Standard'}
**Language:** ${data.language}

---

### Brand Information
| Field | Value |
|-------|-------|
| **Brand Name** | ${data.brand_name} |
| **Local Name** | ${data.local_name || 'Not provided'} |
| **Industry** | ${data.industry} |
| **Location** | ${data.location} |

### Visual Identity
| Field | Value |
|-------|-------|
| **Primary Color** | \`${data.primary_color}\` |
| **Secondary Color** | \`${data.secondary_color || 'Not provided'}\` |
| **Logo** | Uploaded via form |

### Marketing Details
| Field | Value |
|-------|-------|
| **Target Audience** | ${data.target_audience} |
| **Key Offerings** | ${data.key_offerings} |
| **Contact Info** | ${data.contact_info || 'Not provided'} |

---

### Raw Data (JSON)
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

---

**Next Steps:**
1. Review the information above
2. Add label \`new-client\` to trigger automation
3. Video will be generated within 6 hours

*Powered by Ariana Coach*

<!-- 
IMPORTANT: To trigger automatic video generation, please add the label 'new-client' to this issue.
-->`;
}

function showSuccess(issueUrl) {
    document.getElementById('brandForm').style.display = 'none';
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    
    const issueLink = document.getElementById('issueLink');
    issueLink.href = `https://github.com/${CONFIG.GITHUB_USERNAME}/${CONFIG.GITHUB_REPO}/issues`;
    issueLink.textContent = currentLang === 'en' ? 'View on GitHub' : 'مشاهده در گیت‌هاب';
    
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showError(message) {
    document.getElementById('brandForm').style.display = 'none';
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'block';
    
    const errorText = document.getElementById('errorText');
    errorText.innerHTML = message;
    
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('brandForm').style.display = 'block';
    document.getElementById('clientLogoPreview').style.display = 'none';
    document.getElementById('logoUploadContainer').style.display = 'block';
    document.getElementById('logoBase64').value = '';
    document.getElementById('logoFileName').value = '';
    
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    document.querySelector('.form-step[data-step="1"]').classList.add('active');
    currentStep = 1;
    updateProgressBar();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.querySelector('.btn-text').style.display = 'block';
    submitBtn.querySelector('.btn-loader').style.display = 'none';
    submitBtn.disabled = false;
    
    document.querySelectorAll('.field-error').forEach(el => el.remove());
    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(el => {
        el.style.borderColor = '';
    });
    
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'fa' : 'en';
    document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
    document.getElementById('lang-text').textContent = currentLang === 'en' ? 'فارسی' : 'English';
    
    document.querySelectorAll('[data-en][data-fa]').forEach(el => {
        const newText = el.getAttribute(`data-${currentLang}`);
        if (newText) {
            el.textContent = newText;
        }
    });
}

// Add shake animation
const shakeStyles = document.createElement('style');
shakeStyles.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    .field-error {
        animation: fadeIn 0.3s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(shakeStyles);

console.log('%c Ariana Coach ', 'background: #6B21A8; color: #EAB308; font-size: 20px; padding: 10px; font-weight: bold;');
console.log('%c AI-Powered Marketing for Afghan Businesses ', 'color: #6B21A8; font-size: 14px;');
