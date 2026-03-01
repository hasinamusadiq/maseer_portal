/**
 * Maseer Portal - Main Application
 * Handles form validation, image processing, and GitHub integration
 */

const MaseerApp = (function() {
    'use strict';

    // Configuration - Update these for your deployment
    const CONFIG = {
        GITHUB_OWNER: 'YOUR_GITHUB_USERNAME', // Change this
        GITHUB_REPO: 'maseer_automation',
        API_ENDPOINT: null, // Set to your backend if using secure token storage
        MAX_LOGO_SIZE: 2 * 1024 * 1024, // 2MB
        TARGET_WIDTH: 1224,
        TARGET_HEIGHT: 1536,
        ASPECT_RATIO: 4/5
    };

    // Campaign definitions for preview
    const CAMPAIGNS = [
        {
            time: '6:00 AM',
            name: 'Morning Motivation',
            language: 'Persian/Dari',
            style: 'Celestial Minimalism',
            color: '#60A5FA',
            energy: 'Calm • Ethereal • Uplifting',
            icon: '🌅'
        },
        {
            time: '12:00 PM',
            name: 'General Information',
            language: 'Pashto',
            style: 'Organic Hujra',
            color: '#D97706',
            energy: 'Cordial • Grounded • Trustworthy',
            icon: '🏛️'
        },
        {
            time: '6:00 PM',
            name: 'Service Promotion',
            language: 'Persian/Dari',
            style: 'Modern Classic',
            color: '#A855F7',
            energy: 'Professional • Inspiring • Authoritative',
            icon: '💼'
        },
        {
            time: '12:00 AM',
            name: 'Brand Awareness',
            language: 'English',
            style: 'Tactile Stop-Motion',
            color: '#EC4899',
            energy: 'Bold • Artistic • Memorable',
            icon: '🎭'
        }
    ];

    // Industry-specific color recommendations
    const INDUSTRY_COLORS = {
        'Jewelry & Gold': { primary: '#D4AF37', secondary: '#1C1C1C', accent: '#FFD700' },
        'Café & Restaurant': { primary: '#8B4513', secondary: '#F5DEB3', accent: '#D2691E' },
        'Fashion & Clothing': { primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#FFE66D' },
        'Technology & IT': { primary: '#00D9FF', secondary: '#0A192F', accent: '#64FFDA' },
        'Healthcare & Medical': { primary: '#00A86B', secondary: '#FFFFFF', accent: '#90EE90' },
        'Education & Training': { primary: '#4169E1', secondary: '#FFD700', accent: '#FF6347' },
        'Real Estate': { primary: '#2F4F4F', secondary: '#F5F5DC', accent: '#8B4513' },
        'Automotive': { primary: '#DC143C', secondary: '#C0C0C0', accent: '#FFD700' },
        'Beauty & Cosmetics': { primary: '#FF1493', secondary: '#FFF0F5', accent: '#FFB6C1' },
        'Construction & Materials': { primary: '#B8860B', secondary: '#8B4513', accent: '#D2691E' },
        'Consultancy & Services': { primary: '#4B0082', secondary: '#FFD700', accent: '#9370DB' },
        'Retail & Shopping': { primary: '#FF4500', secondary: '#FFD700', accent: '#32CD32' },
        'Travel & Hospitality': { primary: '#20B2AA', secondary: '#F0E68C', accent: '#87CEEB' },
        'Agriculture': { primary: '#228B22', secondary: '#F5DEB3', accent: '#8FBC8F' },
        'Handicrafts': { primary: '#8B4513', secondary: '#DEB887', accent: '#D2691E' }
    };

    // State management
    let state = {
        formData: {},
        logoBase64: null,
        logoFile: null,
        currentStep: 1,
        isSubmitting: false
    };

    /**
     * Initialize the application
     */
    function init() {
        console.log('🚀 Maseer Portal Initializing...');
        
        bindEvents();
        initColorPickers();
        initFileUpload();
        initIndustrySelector();
        initFormValidation();
        animateCampaignCards();
        
        console.log('✅ Maseer Portal Ready');
    }

    /**
     * Bind all event listeners
     */
    function bindEvents() {
        // Form submission
        const form = document.getElementById('registrationForm');
        if (form) {
            form.addEventListener('submit', handleSubmit);
        }

        // Color picker synchronization
        document.querySelectorAll('.color-input-wrapper').forEach(wrapper => {
            const textInput = wrapper.querySelector('input[type="text"]');
            const colorInput = wrapper.querySelector('input[type="color"]');
            const preview = wrapper.querySelector('.color-preview');

            if (textInput && colorInput && preview) {
                textInput.addEventListener('input', () => {
                    const color = textInput.value;
                    if (isValidHex(color)) {
                        colorInput.value = color;
                        preview.style.background = color;
                    }
                });

                colorInput.addEventListener('input', () => {
                    const color = colorInput.value.toUpperCase();
                    textInput.value = color;
                    preview.style.background = color;
                });
            }
        });

        // Smooth scroll for anchor links
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

    /**
     * Initialize color pickers with industry defaults
     */
    function initColorPickers() {
        const industrySelect = document.getElementById('industry');
        const primaryInput = document.getElementById('primaryColor');
        const secondaryInput = document.getElementById('secondaryColor');
        const primaryPreview = document.getElementById('primaryPreview');
        const secondaryPreview = document.getElementById('secondaryPreview');
        const primaryPicker = document.getElementById('primaryColorPicker');
        const secondaryPicker = document.getElementById('secondaryColorPicker');

        if (industrySelect) {
            industrySelect.addEventListener('change', function() {
                const colors = INDUSTRY_COLORS[this.value];
                if (colors) {
                    // Animate color change
                    animateColorChange(primaryPreview, colors.primary);
                    animateColorChange(secondaryPreview, colors.secondary);
                    
                    setTimeout(() => {
                        primaryInput.value = colors.primary;
                        primaryPicker.value = colors.primary;
                        secondaryInput.value = colors.secondary;
                        secondaryPicker.value = colors.secondary;
                        
                        showToast(`Colors optimized for ${this.value}`, 'info');
                    }, 300);
                }
            });
        }
    }

    /**
     * Animate color transition
     */
    function animateColorChange(element, newColor) {
        element.style.transition = 'background-color 0.3s ease';
        element.style.background = newColor;
    }

    /**
     * Initialize file upload with drag-drop and validation
     */
    function initFileUpload() {
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('logoInput');
        const filePreview = document.getElementById('filePreview');
        const previewImg = document.getElementById('previewImg');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const removeBtn = document.getElementById('removeFile');

        if (!uploadZone || !fileInput) return;

        // Click to upload
        uploadZone.addEventListener('click', () => fileInput.click());

        // Drag and drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => {
                uploadZone.classList.add('drag-active');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => {
                uploadZone.classList.remove('drag-active');
            });
        });

        uploadZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length) handleFile(files[0]);
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) handleFile(e.target.files[0]);
        });

        removeBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            resetUpload();
        });

        function handleFile(file) {
            // Validate
            if (!file.type.startsWith('image/')) {
                showError('Please upload an image file (PNG, JPG, SVG)');
                return;
            }

            if (file.size > CONFIG.MAX_LOGO_SIZE) {
                showError(`File too large. Maximum size is ${formatFileSize(CONFIG.MAX_LOGO_SIZE)}`);
                return;
            }

            state.logoFile = file;

            // Read and process
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Optimize for 1224x1536 display
                    const optimized = optimizeLogo(img);
                    state.logoBase64 = optimized;
                    
                    // Update UI
                    previewImg.src = optimized;
                    fileName.textContent = file.name;
                    fileSize.textContent = formatFileSize(file.size);
                    
                    uploadZone.style.display = 'none';
                    filePreview.classList.add('show');
                    
                    showToast('Logo uploaded successfully', 'success');
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function resetUpload() {
            fileInput.value = '';
            state.logoFile = null;
            state.logoBase64 = null;
            
            uploadZone.style.display = 'block';
            filePreview.classList.remove('show');
            previewImg.src = '';
        }
    }

    /**
     * Optimize logo for display and processing
     */
    function optimizeLogo(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Max dimensions for processing
        const maxSize = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > maxSize || height > maxSize) {
            if (width > height) {
                height = (height / width) * maxSize;
                width = maxSize;
            } else {
                width = (width / height) * maxSize;
                height = maxSize;
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        return canvas.toDataURL('image/png', 0.9);
    }

    /**
     * Initialize industry selector with visual feedback
     */
    function initIndustrySelector() {
        const select = document.getElementById('industry');
        if (!select) return;

        // Add visual indicator for selection
        select.addEventListener('change', function() {
            if (this.value) {
                this.classList.add('selected');
                const colors = INDUSTRY_COLORS[this.value];
                if (colors) {
                    showToast(`Recommended colors loaded for ${this.value}`, 'info', 3000);
                }
            }
        });
    }

    /**
     * Initialize form validation
     */
    function initFormValidation() {
        const inputs = document.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    validateField(input);
                }
            });
        });
    }

    /**
     * Validate single field
     */
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        if (!value) {
            isValid = false;
            message = 'This field is required';
        } else if (field.type === 'color' || field.id.includes('Color')) {
            if (!isValidHex(value)) {
                isValid = false;
                message = 'Please enter a valid hex color (e.g., #6B21A8)';
            }
        }

        // Update UI
        field.classList.toggle('error', !isValid);
        field.classList.toggle('valid', isValid);

        // Show/hide error message
        let errorEl = field.parentElement.querySelector('.field-error');
        if (!isValid) {
            if (!errorEl) {
                errorEl = document.createElement('span');
                errorEl.className = 'field-error';
                field.parentElement.appendChild(errorEl);
            }
            errorEl.textContent = message;
        } else if (errorEl) {
            errorEl.remove();
        }

        return isValid;
    }

    /**
     * Handle form submission
     */
    async function handleSubmit(e) {
        e.preventDefault();
        
        if (state.isSubmitting) return;
        
        // Validate all required fields
        const requiredFields = document.querySelectorAll('[required]');
        let allValid = true;
        
        requiredFields.forEach(field => {
            if (!validateField(field)) allValid = false;
        });

        if (!allValid) {
            showError('Please fill in all required fields correctly');
            return;
        }

        if (!state.logoBase64) {
            showError('Please upload your brand logo');
            return;
        }

        // Start submission
        state.isSubmitting = true;
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <div class="spinner"></div>
            <span>Creating your undeniable sample...</span>
        `;

        // Collect form data
        const formData = {
            brand_name: document.getElementById('brandName').value.trim(),
            local_name: document.getElementById('localName').value.trim(),
            industry: document.getElementById('industry').value,
            location: document.getElementById('location').value,
            primary_color: document.getElementById('primaryColor').value.toUpperCase(),
            secondary_color: document.getElementById('secondaryColor').value.toUpperCase(),
            target_audience: document.getElementById('targetAudience').value.trim(),
            key_offerings: document.getElementById('keyOfferings').value.trim(),
            unique_value: document.getElementById('uniqueValue')?.value.trim() || '',
            contact_info: document.getElementById('contact').value.trim(),
            logo_base64: state.logoBase64,
            signup_date: new Date().toISOString(),
            request_sample: true,
            meta_specs: {
                width: CONFIG.TARGET_WIDTH,
                height: CONFIG.TARGET_HEIGHT,
                aspect_ratio: CONFIG.ASPECT_RATIO,
                platforms: ['instagram_feed', 'instagram_story', 'facebook_feed']
            }
        };

        // Store for success page
        sessionStorage.setItem('maseer_registration', JSON.stringify(formData));
        
        // Simulate processing delay for UX
        await new Promise(r => setTimeout(r, 1500));
        
        // Redirect to success page
        window.location.href = 'success.html';
    }

    /**
     * Animate campaign preview cards
     */
    function animateCampaignCards() {
        const cards = document.querySelectorAll('.campaign-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, index * 150);
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(card => observer.observe(card));
    }

    /**
     * Utility: Validate hex color
     */
    function isValidHex(hex) {
        return /^#[0-9A-F]{6}$/i.test(hex);
    }

    /**
     * Utility: Format file size
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Show error message
     */
    function showError(message) {
        const alert = document.getElementById('errorAlert');
        if (alert) {
            alert.textContent = message;
            alert.className = 'alert alert-error show';
            setTimeout(() => alert.classList.remove('show'), 5000);
        }
    }

    /**
     * Show toast notification
     */
    function showToast(message, type = 'info', duration = 3000) {
        // Create toast if doesn't exist
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                padding: 1rem 1.5rem;
                border-radius: 0.75rem;
                font-weight: 500;
                z-index: 1000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
            `;
            document.body.appendChild(toast);
        }

        // Style based on type
        const colors = {
            success: 'background: rgba(16, 185, 129, 0.9); color: white;',
            error: 'background: rgba(239, 68, 68, 0.9); color: white;',
            info: 'background: rgba(107, 33, 168, 0.9); color: white;'
        };
        
        toast.style.cssText += colors[type] || colors.info;
        toast.textContent = message;
        toast.style.transform = 'translateX(0)';

        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
        }, duration);
    }

    // Public API
    return {
        init,
        CONFIG,
        CAMPAIGNS
    };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', MaseerApp.init);
} else {
    MaseerApp.init();
}
