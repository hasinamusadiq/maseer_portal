/**
 * Maseer Portal - Complete Application
 * Handles form navigation, validation, and GitHub Issues submission
 */

// ⚠️ CHANGE THESE VALUES TO YOUR ACTUAL GITHUB USERNAME AND REPO NAME
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
    initializeColorPicker();
}

function initializeColorPicker() {
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
                '#5D4037', '#616161', '#455A64', '#263238',
                '#FFFFFF', '#EEEEEE', '#BDBDBD', '#757575'
            ],
            onChange: (color, input) => {
                updateColorPreview(input.id, color);
            }
        });
    } else {
        // Fallback to native color picker
        document.querySelectorAll('.coloris').forEach(input => {
            input.type = 'color';
            input.addEventListener('input', function() {
                updateColorPreview(this.id, this.value);
            });
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

function setupEventListeners() {
    // Logo URL validation
    const logoUrlInput = document.getElementById('logoUrl');
    if (logoUrlInput) {
        logoUrlInput.addEventListener('blur', validateLogoUrl);
    }
    
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
        field.style.borderColor = '#D32F2F';
        showFieldError(field, 'This field is required');
        return false;
    } else {
        field.style.borderColor = '';
        removeFieldError(field);
        return true;
    }
}

function showFieldError(field, message) {
    // Remove existing error
    removeFieldError(field);
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = '#D32F2F';
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

function validateLogoUrl() {
    const url = document.getElementById('logoUrl').value;
    const preview = document.getElementById('logoPreview');
    const container = document.getElementById('logoPreviewContainer');
    
    if (!url) {
        container.style.display = 'none';
        return;
    }
    
    // Show loading state
    container.style.display = 'block';
    preview.style.opacity = '0.5';
    
    const img = new Image();
    img.onload = function() {
        preview.src = url;
        preview.style.opacity = '1';
        container.style.display = 'block';
    };
    img.onerror = function() {
        container.style.display = 'none';
        showFieldError(document.getElementById('logoUrl'), 'Invalid image URL. Please check the link.');
    };
    img.src = url;
}

function removeLogo() {
    document.getElementById('logoUrl').value = '';
    document.getElementById('logoPreviewContainer').style.display = 'none';
    removeFieldError(document.getElementById('logoUrl'));
}

function nextStep(step) {
    if (!validateStep(currentStep)) {
        return false;
    }
    
    // Hide current step
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
    
    // Show new step
    currentStep = step;
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');
    
    // Update progress
    updateProgressBar();
    
    // Scroll to top of form
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
    
    if (!valid) {
        // Shake animation for visual feedback
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
        showError(error.message || 'Failed to submit. Please try again.');
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
        logo_path: formDataObj.get('logo_path')?.trim(),
        target_audience: formDataObj.get('target_audience')?.trim(),
        key_offerings: formDataObj.get('key_offerings')?.trim(),
        contact_info: formDataObj.get('contact_info')?.trim(),
        urgent: formDataObj.get('urgent') === 'true',
        language: currentLang === 'fa' ? 'Persian' : 'English',
        submitted_at: new Date().toISOString(),
        submitted_by: 'Maseer Portal'
    };
    
    // Validate data
    if (!formData.brand_name || !formData.industry || !formData.primary_color || !formData.logo_path) {
        throw new Error('Missing required fields');
    }
}

async function submitToGitHub() {
    // Create issue body with proper formatting
    const issueBody = formatIssueBody(formData);
    const issueTitle = `New Client: ${formData.brand_name}`;
    
    // Build GitHub Issues URL with pre-filled data
    // Note: Labels in URL only work if they already exist in the repo
    const baseUrl = `https://github.com/${CONFIG.GITHUB_USERNAME}/${CONFIG.GITHUB_REPO}/issues/new`;
    
    const params = new URLSearchParams({
        title: issueTitle,
        body: issueBody
    });
    
    // Try to add labels (will only work if labels exist)
    try {
        params.append('labels', 'new-client,automated');
    } catch (e) {
        console.log('Labels parameter not supported');
    }
    
    const issueUrl = `${baseUrl}?${params.toString()}`;
    
    // Open GitHub issue creation in new tab
    const newWindow = window.open(issueUrl, '_blank');
    
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup blocked
        showError('Please allow popups for this site, or click the link below:<br><a href="' + issueUrl + '" target="_blank">Click here to submit</a>');
        return;
    }
    
    // Show success message
    showSuccess(issueUrl);
}

function formatIssueBody(data) {
    return `## New Brand Registration

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
| **Logo URL** | ${data.logo_path} |

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

*This issue was automatically generated by [Maseer Portal](https://${CONFIG.GITHUB_USERNAME}.github.io/maseer-portal/)*

<!-- 
IMPORTANT: To trigger automatic video generation, please add the label 'new-client' to this issue.
You can do this by clicking the gear icon next to "Labels" on the right side.
-->`;
}

function showSuccess(issueUrl) {
    document.getElementById('brandForm').style.display = 'none';
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    
    // Update issue link
    const issueLink = document.getElementById('issueLink');
    issueLink.href = `https://github.com/${CONFIG.GITHUB_USERNAME}/${CONFIG.GITHUB_REPO}/issues`;
    issueLink.textContent = 'View on GitHub';
    
    // Add direct link as backup
    const directLink = document.createElement('p');
    directLink.style.marginTop = '1rem';
    directLink.innerHTML = `<a href="${issueUrl}" target="_blank" style="color: var(--primary);">Direct submission link</a>`;
    
    // Only add if not already present
    if (!successMessage.querySelector('.direct-link')) {
        directLink.className = 'direct-link';
        successMessage.insertBefore(directLink, document.querySelector('.btn-new'));
    }
    
    // Scroll to success message
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
    // Reset form
    document.getElementById('brandForm').reset();
    
    // Reset UI
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('brandForm').style.display = 'block';
    document.getElementById('logoPreviewContainer').style.display = 'none';
    
    // Remove direct link if exists
    const directLink = document.querySelector('.direct-link');
    if (directLink) {
        directLink.remove();
    }
    
    // Reset to step 1
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    document.querySelector('.form-step[data-step="1"]').classList.add('active');
    currentStep = 1;
    updateProgressBar();
    
    // Reset button state
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.querySelector('.btn-text').style.display = 'block';
    submitBtn.querySelector('.btn-loader').style.display = 'none';
    submitBtn.disabled = false;
    
    // Clear all errors
    document.querySelectorAll('.field-error').forEach(el => el.remove());
    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(el => {
        el.style.borderColor = '';
    });
    
    // Scroll to top
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'fa' : 'en';
    document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
    document.getElementById('lang-text').textContent = currentLang === 'en' ? 'فارسی' : 'English';
    
    // Update all elements with data-en and data-fa attributes
    document.querySelectorAll('[data-en][data-fa]').forEach(el => {
        const newText = el.getAttribute(`data-${currentLang}`);
        if (newText) {
            el.textContent = newText;
        }
    });
    
    // Update placeholders
    document.querySelectorAll('[data-en-placeholder]').forEach(el => {
        const placeholder = el.getAttribute(`data-${currentLang}-placeholder`);
        if (placeholder) {
            el.placeholder = placeholder;
        }
    });
}

function showUploadHelp() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('helpModal');
    if (event.target === modal) {
        closeModal();
    }
};

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Add shake animation to styles
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

// Console greeting
console.log('%c Maseer Portal ', 'background: #D32F2F; color: white; font-size: 20px; padding: 10px;');
console.log('%c AI-Powered Video Marketing for Afghan Businesses ', 'color: #D32F2F; font-size: 14px;');
