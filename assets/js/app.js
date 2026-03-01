/**
 * Maseer Portal App - Complete Functionality
 * File handling, form submission, and UX enhancements
 */

// Global state
const AppState = {
    logoBase64: null,
    logoFile: null,
    isSubmitting: false
};

/**
 * Initialize application
 */
document.addEventListener('DOMContentLoaded', () => {
    initColorPickers();
    initIndustrySelector();
    initSmoothScroll();
    initCampaignCards();
});

/**
 * Color picker synchronization
 */
function initColorPickers() {
    const pairs = [
        { text: 'primaryColor', picker: 'primaryColorPicker', preview: 'primaryPreview' },
        { text: 'secondaryColor', picker: 'secondaryColorPicker', preview: 'secondaryPreview' }
    ];
    
    pairs.forEach(({ text, picker, preview }) => {
        const textInput = document.getElementById(text);
        const pickerInput = document.getElementById(picker);
        const previewDiv = document.getElementById(preview);
        
        if (!textInput || !pickerInput) return;
        
        // Text input change
        textInput.addEventListener('input', () => {
            const color = textInput.value;
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                pickerInput.value = color.toLowerCase();
                previewDiv.style.background = color;
                previewDiv.style.setProperty('--preview-color', color);
                
                // Trigger consciousness pulse
                if (window.ConsciousnessSystem) {
                    ConsciousnessSystem.pulseFrequency();
                }
            }
        });
        
        // Color picker change
        pickerInput.addEventListener('input', () => {
            const color = pickerInput.value.toUpperCase();
            textInput.value = color;
            previewDiv.style.background = color;
            previewDiv.style.setProperty('--preview-color', color);
        });
    });
}

/**
 * Update color from picker
 */
function updateColor(type, value) {
    const upper = value.toUpperCase();
    document.getElementById(`${type}Color`).value = upper;
    document.getElementById(`${type}Preview`).style.background = upper;
}

/**
 * Industry selector with color recommendations
 */
function initIndustrySelector() {
    const industryColors = {
        'Jewelry & Gold': { primary: '#D4AF37', secondary: '#1C1C1C' },
        'Café & Restaurant': { primary: '#8B4513', secondary: '#F5DEB3' },
        'Fashion & Clothing': { primary: '#FF6B6B', secondary: '#4ECDC4' },
        'Technology & IT': { primary: '#00D9FF', secondary: '#0A192F' },
        'Healthcare & Medical': { primary: '#00A86B', secondary: '#FFFFFF' },
        'Education & Training': { primary: '#4169E1', secondary: '#FFD700' },
        'Real Estate': { primary: '#2F4F4F', secondary: '#F5F5DC' },
        'Automotive': { primary: '#DC143C', secondary: '#C0C0C0' },
        'Beauty & Cosmetics': { primary: '#FF1493', secondary: '#FFF0F5' },
        'Construction & Materials': { primary: '#B8860B', secondary: '#8B4513' },
        'Consultancy & Services': { primary: '#4B0082', secondary: '#FFD700' },
        'Retail & Shopping': { primary: '#FF4500', secondary: '#FFD700' },
        'Travel & Hospitality': { primary: '#20B2AA', secondary: '#F0E68C' },
        'Agriculture': { primary: '#228B22', secondary: '#F5DEB3' },
        'Handicrafts': { primary: '#8B4513', secondary: '#DEB887' }
    };
    
    const select = document.getElementById('industry');
    if (!select) return;
    
    select.addEventListener('change', function() {
        const colors = industryColors[this.value];
        if (colors) {
            // Animate color change
            updateColor('primary', colors.primary);
            updateColor('secondary', colors.secondary);
            
            showToast(`Colors optimized for ${this.value}`, 'success');
        }
    });
}

/**
 * File upload handlers
 */
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
    // Validate
    if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file', 'error');
        return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
        showToast('File too large. Maximum 2MB', 'error');
        return;
    }
    
    AppState.logoFile = file;
    
    // Read and optimize
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // Optimize for 1224x1536 display
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const maxSize = 800;
            let w = img.width, h = img.height;
            
            if (w > maxSize || h > maxSize) {
                if (w > h) {
                    h = (h / w) * maxSize;
                    w = maxSize;
                } else {
                    w = (w / h) * maxSize;
                    h = maxSize;
                }
            }
            
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);
            
            AppState.logoBase64 = canvas.toDataURL('image/png', 0.9);
            
            // Show preview
            document.getElementById('previewImg').src = AppState.logoBase64;
            document.getElementById('fileName').textContent = file.name;
            document.getElementById('fileSize').textContent = formatFileSize(file.size);
            document.getElementById('filePreview').style.display = 'flex';
            document.getElementById('uploadZone').style.display = 'none';
            
            showToast('Logo uploaded successfully', 'success');
            
            // Consciousness boost
            if (window.ConsciousnessSystem) {
                ConsciousnessSystem.setFrequency('gamma');
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function removeFile() {
    AppState.logoFile = null;
    AppState.logoBase64 = null;
    
    document.getElementById('logoInput').value = '';
    document.getElementById('filePreview').style.display = 'none';
    document.getElementById('uploadZone').style.display = 'block';
}

/**
 * Form submission
 */
function handleSubmit(e) {
    e.preventDefault();
    
    if (AppState.isSubmitting) return;
    
    // Validate
    if (!AppState.logoBase64) {
        showToast('Please upload your logo', 'error');
        return;
    }
    
    AppState.isSubmitting = true;
    
    // Update button
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div><span>Creating...</span>';
    
    // Collect data
    const formData = {
        brand_name: document.getElementById('brandName').value.trim(),
        local_name: document.getElementById('localName').value.trim(),
        industry: document.getElementById('industry').value,
        primary_color: document.getElementById('primaryColor').value,
        secondary_color: document.getElementById('secondaryColor').value,
        target_audience: document.getElementById('targetAudience').value.trim(),
        key_offerings: document.getElementById('keyOfferings').value.trim(),
        contact_info: document.getElementById('contact').value.trim(),
        logo_base64: AppState.logoBase64,
        language: I18n.getCurrentLang(),
        signup_date: new Date().toISOString(),
        request_sample: true,
        meta_specs: {
            width: 1224,
            height: 1536,
            aspect_ratio: "4:5"
        }
    };
    
    // Store and redirect
    sessionStorage.setItem('maseer_registration', JSON.stringify(formData));
    
    // Consciousness climax
    if (window.ConsciousnessSystem) {
        ConsciousnessSystem.setFrequency('gamma');
        document.documentElement.style.setProperty('--glow-intensity', '2');
    }
    
    setTimeout(() => {
        window.location.href = 'success.html';
    }, 1000);
    
    return false;
}

/**
 * Campaign card interactions
 */
function initCampaignCards() {
    const cards = document.querySelectorAll('.campaign-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const type = card.dataset.campaign;
            const frequencies = {
                morning: 'theta',
                midday: 'alpha',
                evening: 'beta',
                night: 'gamma'
            };
            
            if (window.ConsciousnessSystem && frequencies[type]) {
                ConsciousnessSystem.setFrequency(frequencies[type]);
            }
        });
    });
}

function highlightCampaign(type) {
    // Visual feedback
    const card = document.querySelector(`[data-campaign="${type}"]`);
    if (card) {
        card.style.transform = 'scale(1.05)';
        setTimeout(() => {
            card.style.transform = '';
        }, 300);
    }
    
    scrollToForm();
}

/**
 * Smooth scroll
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function scrollToForm() {
    document.getElementById('formSection').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Toast notifications
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const colors = {
        success: 'background: rgba(16, 185, 129, 0.95); color: white;',
        error: 'background: rgba(239, 68, 68, 0.95); color: white;',
        info: 'background: rgba(107, 33, 168, 0.95); color: white;'
    };
    
    toast.style.cssText = colors[type] || colors.info;
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Utilities
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
