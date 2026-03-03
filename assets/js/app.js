/**
 * Maseer Portal - Main Application Logic
 * Handles form submission, validation, and GitHub API integration
 */

const CONFIG = {
    BACKEND_REPO: 'hasinamusadiq/maseer_automation',
    GITHUB_API_BASE: 'https://api.github.com',
    MAX_LOGO_SIZE: 2 * 1024 * 1024, // 2MB
    SUPPORTED_FORMATS: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'],
    REQUIRED_FIELDS: ['brandName', 'industry', 'primaryColor']
};

const App = (function() {
    'use strict';
    
    let formData = {};
    let logoFile = null;
    
    function init() {
        setupEventListeners();
        setupValidation();
        loadSavedData();
    }
    
    function setupEventListeners() {
        const form = document.getElementById('registrationForm');
        if (form) {
            form.addEventListener('submit', handleSubmit);
        }
        
        const logoInput = document.getElementById('logoInput');
        if (logoInput) {
            logoInput.addEventListener('change', handleFileSelect);
        }
        
        const uploadZone = document.getElementById('uploadZone');
        if (uploadZone) {
            uploadZone.addEventListener('dragover', handleDragOver);
            uploadZone.addEventListener('dragleave', handleDragLeave);
            uploadZone.addEventListener('drop', handleDrop);
        }
        
        setupColorPickers();
    }
    
    function setupColorPickers() {
        const primaryPicker = document.getElementById('primaryColorPicker');
        const secondaryPicker = document.getElementById('secondaryColorPicker');
        
        if (primaryPicker) {
            primaryPicker.addEventListener('change', (e) => updateColor('primary', e.target.value));
        }
        if (secondaryPicker) {
            secondaryPicker.addEventListener('change', (e) => updateColor('secondary', e.target.value));
        }
    }
    
    function updateColor(type, value) {
        const input = document.getElementById(`${type}Color`);
        const preview = document.getElementById(`${type}Preview`);
        
        if (input) input.value = value.toUpperCase();
        if (preview) {
            preview.style.background = value;
            preview.style.setProperty('--preview-color', value);
        }
        
        if (type === 'primary' && window.ColorTools) {
            ColorTools.applyHarmony(value.toUpperCase());
        }
    }
    
    function setupValidation() {
        const inputs = document.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearError(input));
        });
    }
    
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';
        
        if (!value) {
            isValid = false;
            message = 'This field is required';
        } else if (field.id === 'primaryColor' && !/^#[0-9A-F]{6}$/i.test(value)) {
            isValid = false;
            message = 'Please enter a valid hex color (e.g., #6B21A8)';
        }
        
        if (!isValid) {
            showFieldError(field, message);
        } else {
            markFieldValid(field);
        }
        
        return isValid;
    }
    
    function showFieldError(field, message) {
        field.classList.add('error');
        field.classList.remove('valid');
        
        let errorEl = field.parentElement.querySelector('.field-error');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'field-error';
            field.parentElement.appendChild(errorEl);
        }
        errorEl.textContent = message;
    }
    
    function clearError(field) {
        field.classList.remove('error');
        const errorEl = field.parentElement.querySelector('.field-error');
        if (errorEl) errorEl.remove();
    }
    
    function markFieldValid(field) {
        field.classList.remove('error');
        field.classList.add('valid');
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-active');
    }
    
    function handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-active');
    }
    
    function handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-active');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }
    
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    }
    
    function processFile(file) {
        if (!CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
            showToast('Please upload PNG, JPG, or SVG', 'error');
            return;
        }
        
        if (file.size > CONFIG.MAX_LOGO_SIZE) {
            showToast('Logo must be under 2MB', 'error');
            return;
        }
        
        logoFile = file;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('filePreview');
            const img = document.getElementById('previewImg');
            const name = document.getElementById('fileName');
            const size = document.getElementById('fileSize');
            
            if (img) img.src = e.target.result;
            if (name) name.textContent = file.name;
            if (size) size.textContent = formatFileSize(file.size);
            if (preview) preview.classList.add('show');
            
            const uploadZone = document.getElementById('uploadZone');
            if (uploadZone) uploadZone.classList.add('has-file');
        };
        reader.readAsDataURL(file);
    }
    
    function removeFile() {
        logoFile = null;
        const preview = document.getElementById('filePreview');
        const uploadZone = document.getElementById('uploadZone');
        const input = document.getElementById('logoInput');
        
        if (preview) preview.classList.remove('show');
        if (uploadZone) uploadZone.classList.remove('has-file');
        if (input) input.value = '';
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    async function handleSubmit(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        
        if (!validateForm()) {
            showToast('Please fix the errors above', 'error');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Creating your campaign...';
        
        try {
            await submitToGitHub();
            saveFormData();
            window.location.href = 'success.html';
        } catch (error) {
            console.error('Submission error:', error);
            showToast('Failed to submit. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    function validateForm() {
        let isValid = true;
        CONFIG.REQUIRED_FIELDS.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !validateField(field)) {
                isValid = false;
            }
        });
        return isValid;
    }
    
    async function submitToGitHub() {
        const brandName = document.getElementById('brandName').value.trim();
        const localName = document.getElementById('localName').value.trim();
        const industry = document.getElementById('industry').value;
        const primaryColor = document.getElementById('primaryColor').value.toUpperCase();
        const secondaryColor = document.getElementById('secondaryColor').value.toUpperCase();
        const targetAudience = document.getElementById('targetAudience').value.trim();
        const keyOfferings = document.getElementById('keyOfferings').value.trim();
        const contact = document.getElementById('contact').value.trim();
        
        let logoBase64 = '';
        if (logoFile) {
            logoBase64 = await fileToBase64(logoFile);
        }
        
        const issueBody = createIssueBody({
            brand_name: brandName,
            local_name: localName || 'N/A',
            industry: industry,
            primary_color: primaryColor,
            secondary_color: secondaryColor || '#EAB308',
            target_audience: targetAudience || 'General Afghan market',
            key_offerings: keyOfferings || 'Premium products/services',
            contact_info: contact || 'N/A',
            logo_base64: logoBase64,
            request_sample: true
        });
        
        const response = await fetch(`${CONFIG.GITHUB_API_BASE}/repos/${CONFIG.BACKEND_REPO}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${await getGitHubToken()}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: `New Client: ${brandName}`,
                body: issueBody,
                labels: ['new-client']
            })
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const data = await response.json();
        sessionStorage.setItem('maseer_issue_number', data.number);
        sessionStorage.setItem('maseer_registration', JSON.stringify({ brand_name: brandName }));
        
        return data;
    }
    
    function createIssueBody(data) {
        return `---
name: New Client Registration
about: Register a new brand for AI video marketing
title: "New Client: ${data.brand_name}"
labels: [new-client]
---

## New Brand Registration - Maseer Media Inc.

**Submitted:** ${new Date().toISOString()}
**Status:** Standard

### Brand Information
| Field | Value |
|-------|-------|
| **Brand Name** | ${data.brand_name} |
| **Local Name** | ${data.local_name} |
| **Industry** | ${data.industry} |
| **Location** | Kabul, Afghanistan |

### Visual Identity
| Field | Value |
|-------|-------|
| **Primary Color** | ${data.primary_color} |
| **Secondary Color** | ${data.secondary_color} |
| **Logo** | ${data.logo_base64 ? 'Included (see JSON below)' : 'None'} |

### Marketing Details
| Field | Value |
|-------|-------|
| **Target Audience** | ${data.target_audience} |
| **Key Offerings** | ${data.key_offerings} |
| **Contact** | ${data.contact_info} |

### Raw Data (JSON)
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\``;
    }
    
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    async function getGitHubToken() {
        return 'YOUR_GITHUB_TOKEN_HERE';
    }
    
    function saveFormData() {
        const data = {
            brand_name: document.getElementById('brandName').value,
            timestamp: Date.now()
        };
        localStorage.setItem('maseer_form_draft', JSON.stringify(data));
    }
    
    function loadSavedData() {
        const saved = localStorage.getItem('maseer_form_draft');
        if (saved) {
            const data = JSON.parse(saved);
            if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                const brandName = document.getElementById('brandName');
                if (brandName && !brandName.value) {
                    brandName.value = data.brand_name || '';
                }
            }
        }
    }
    
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.style.background = type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)';
        toast.style.color = '#fff';
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    return {
        init,
        updateColor,
        removeFile
    };
})();

document.addEventListener('DOMContentLoaded', App.init);
