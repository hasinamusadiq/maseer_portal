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
 * Form submission - Opens GitHub Actions workflow trigger
 */
function handleSubmit(e) {
    e.preventDefault();
    
    if (AppState.isSubmitting) return;
    
    // Validate required fields
    const brandName = document.getElementById('brandName').value.trim();
    const industry = document.getElementById('industry').value;
    const primaryColor = document.getElementById('primaryColor').value;
    
    if (!brandName) {
        showToast('Please enter your brand name', 'error');
        document.getElementById('brandName').focus();
        return false;
    }
    
    if (!industry) {
        showToast('Please select your industry', 'error');
        document.getElementById('industry').focus();
        return false;
    }
    
    if (!primaryColor || !/^#[0-9A-F]{6}$/i.test(primaryColor)) {
        showToast('Please enter a valid primary color (e.g., #6B21A8)', 'error');
        document.getElementById('primaryColor').focus();
        return false;
    }
    
    if (!AppState.logoBase64) {
        showToast('Please upload your logo', 'error');
        return false;
    }
    
    AppState.isSubmitting = true;
    
    // Update button
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div><span>Preparing...</span>';
    
    // Collect data
    const formData = {
        brand_name: brandName,
        local_name: document.getElementById('localName').value.trim(),
        industry: industry,
        primary_color: primaryColor.toUpperCase(),
        secondary_color: document.getElementById('secondaryColor').value.toUpperCase() || '#EAB308',
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
    
    // Store for success page
    sessionStorage.setItem('maseer_registration', JSON.stringify(formData));
    
    // Consciousness climax
    if (window.ConsciousnessSystem) {
        ConsciousnessSystem.setFrequency('gamma');
        document.documentElement.style.setProperty('--glow-intensity', '2');
    }
    
    // Show workflow trigger modal
    setTimeout(() => {
        showWorkflowTrigger(formData);
    }, 500);
    
    return false;
}

/**
 * Show modal with workflow trigger instructions
 */
function showWorkflowTrigger(formData) {
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'workflowModal';
    modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(10, 10, 15, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 2rem;
        backdrop-filter: blur(10px);
    `;
    
    const jsonData = JSON.stringify(formData, null, 2);
    const isLarge = jsonData.length > 1500;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(145deg, #1a1a2e, #12121a);
            border: 2px solid #6B21A8;
            border-radius: 1.5rem;
            padding: 2.5rem;
            max-width: 650px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0,0,0,0.5), 0 0 60px rgba(107, 33, 168, 0.3);
            animation: modalEntry 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        ">
            <div style="font-size: 4rem; margin-bottom: 1rem; animation: pulse 2s infinite;">⚡</div>
            
            <h2 style="color: #fff; margin-bottom: 1rem; font-size: 1.75rem; font-weight: 700;">
                Ready to Generate Your Sample!
            </h2>
            
            <p style="color: rgba(255,255,255,0.7); margin-bottom: 2rem; line-height: 1.7; font-size: 1rem;">
                Your brand <strong style="color: #EAB308;">${formData.brand_name}</strong> is prepared.<br>
                Click below to trigger the AI video generation workflow.
            </p>
            
            <div style="background: rgba(107, 33, 168, 0.1); border: 1px solid rgba(107, 33, 168, 0.3); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                    <span style="font-size: 1.25rem;">📐</span>
                    <span style="color: #fff; font-weight: 600;">1224×1536 Meta-Optimized</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                    <span style="font-size: 1.25rem;">🎨</span>
                    <span style="color: rgba(255,255,255,0.8);">Maximum Impact Fusion Style</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span style="font-size: 1.25rem;">⏱️</span>
                    <span style="color: rgba(255,255,255,0.8);">Ready in ~3 minutes</span>
                </div>
            </div>
            
            ${isLarge ? `
            <div style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1.5rem; text-align: left;">
                <p style="color: #EAB308; font-size: 0.875rem; margin-bottom: 0.75rem; font-weight: 600;">
                    ⚠️ Data is large. Copy this JSON and paste in the workflow:
                </p>
                <textarea id="payloadData" style="width: 100%; height: 100px; background: rgba(0,0,0,0.5); border: 1px solid #444; border-radius: 0.5rem; color: #fff; padding: 0.75rem; font-family: monospace; font-size: 0.7rem; resize: none; margin-bottom: 0.75rem;">${jsonData}</textarea>
                <button onclick="copyPayload()" style="background: #444; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; width: 100%;">📋 Copy JSON Data</button>
            </div>
            <a href="https://github.com/hasinamusadiq/maseer_portal/actions/workflows/create-client-issue.yml" 
               target="_blank" 
               style="display: inline-block; background: linear-gradient(135deg, #6B21A8, #7C3AED); color: #fff; text-decoration: none; padding: 1rem 2rem; border-radius: 0.75rem; font-weight: 600; font-size: 1rem; margin-bottom: 1rem; width: 100%; box-sizing: border-box;">
                Open GitHub Workflow →
            </a>
            ` : `
            <a href="https://github.com/hasinamusadiq/maseer_portal/actions/workflows/create-client-issue.yml" 
               target="_blank" 
               style="display: inline-block; background: linear-gradient(135deg, #6B21A8, #EAB308); color: #fff; text-decoration: none; padding: 1.25rem 2.5rem; border-radius: 0.75rem; font-weight: 700; font-size: 1.125rem; margin-bottom: 1rem; width: 100%; box-sizing: border-box; box-shadow: 0 10px 30px rgba(107, 33, 168, 0.4); transition: all 0.3s;">
                🚀 Trigger Sample Generation
            </a>
            `}
            
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 0.5rem; padding: 0.75rem; margin-bottom: 1rem;">
                <p style="color: #6EE7B7; font-size: 0.8125rem; margin: 0;">
                    <strong>Next steps:</strong> Click "Run workflow" → Paste your brand name → Click "Run workflow"
                </p>
            </div>
            
            <button onclick="closeModalAndContinue()" style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; transition: all 0.3s;">
                Continue to Success Page →
            </button>
        </div>
        
        <style>
            @keyframes modalEntry {
                from { opacity: 0; transform: scale(0.9) translateY(20px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
            }
        </style>
    `;
    
    document.body.appendChild(modal);
    
    // Reset button state
    const btn = document.getElementById('submitBtn');
    btn.disabled = false;
    btn.innerHTML = '<span data-i18n="submitBtn">Generate My Undeniable Sample</span><span>→</span>';
    AppState.isSubmitting = false;
}

/**
 * Copy payload to clipboard
 */
function copyPayload() {
    const textarea = document.getElementById('payloadData');
    if (!textarea) return;
    
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile
    
    try {
        document.execCommand('copy');
        showToast('JSON copied! Paste in workflow inputs.', 'success');
    } catch (err) {
        // Fallback
        navigator.clipboard.writeText(textarea.value).then(() => {
            showToast('JSON copied! Paste in workflow inputs.', 'success');
        }).catch(() => {
            showToast('Please manually copy the JSON', 'error');
        });
    }
}

/**
 * Close modal and continue to success page
 */
function closeModalAndContinue() {
    const modal = document.getElementById('workflowModal');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s';
        setTimeout(() => modal.remove(), 300);
    }
    
    // Redirect to success page
    window.location.href = 'success.html';
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
