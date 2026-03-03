/**
 * Maseer Consciousness System
 * Manages frequency states for optimal user attraction and conversion
 */

const ConsciousnessSystem = (function() {
    'use strict';
    
    const FREQUENCIES = {
        theta: {
            name: 'Theta',
            range: '4-8Hz',
            color: '#1e3a5f',
            state: 'Deep Relaxation & Creativity',
            description: 'Deep meditation, creativity, emotional connection'
        },
        alpha: {
            name: 'Alpha',
            range: '8-13Hz',
            color: '#4c1d95',
            state: 'Relaxed Alertness',
            description: 'Calm focus, learning, positive thinking'
        },
        beta: {
            name: 'Beta',
            range: '13-30Hz',
            color: '#dc2626',
            state: 'Active Thinking',
            description: 'Focus, alertness, problem-solving'
        },
        gamma: {
            name: 'Gamma',
            range: '30-100Hz',
            color: '#059669',
            state: 'Peak Performance',
            description: 'High-level cognition, peak concentration'
        }
    };
    
    let currentFrequency = 'alpha';
    let scrollVelocity = 0;
    let lastScrollY = 0;
    let attentionLevel = 0.5;
    
    function init() {
        setupScrollTracking();
        setupInteractionTracking();
        setupFormEngagement();
        startFrequencyModulation();
    }
    
    function setupScrollTracking() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            const currentY = window.scrollY;
            scrollVelocity = Math.abs(currentY - lastScrollY);
            lastScrollY = currentY;
            
            if (scrollVelocity < 5) {
                setFrequency('theta');
            } else if (scrollVelocity < 20) {
                setFrequency('alpha');
            } else if (scrollVelocity < 50) {
                setFrequency('beta');
            } else {
                setFrequency('gamma');
            }
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                setFrequency('alpha');
            }, 150);
        }, { passive: true });
    }
    
    function setupInteractionTracking() {
        const interactions = ['mousemove', 'click', 'touchstart', 'keydown'];
        let lastInteraction = Date.now();
        
        interactions.forEach(type => {
            document.addEventListener(type, () => {
                const now = Date.now();
                const gap = now - lastInteraction;
                
                if (gap < 1000) {
                    attentionLevel = Math.min(1, attentionLevel + 0.1);
                } else if (gap > 5000) {
                    attentionLevel = Math.max(0.3, attentionLevel - 0.05);
                }
                
                lastInteraction = now;
                
                if (type === 'click') {
                    pulseFrequency();
                }
            }, { passive: true });
        });
    }
    
    function setupFormEngagement() {
        const form = document.getElementById('registrationForm');
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                setFrequency('gamma');
                increaseGlow(1.5);
            });
            
            input.addEventListener('blur', () => {
                setFrequency('alpha');
                resetGlow();
            });
            
            input.addEventListener('input', () => {
                const filled = Array.from(inputs).filter(i => i.value).length;
                const progress = filled / inputs.length;
                
                if (progress > 0.7) {
                    setFrequency('gamma');
                } else if (progress > 0.3) {
                    setFrequency('beta');
                }
            });
        });
    }
    
    function setFrequency(freq) {
        if (currentFrequency === freq) return;
        
        currentFrequency = freq;
        const config = FREQUENCIES[freq];
        
        document.documentElement.style.setProperty('--active-frequency', config.color);
        updateFrequencyIndicator(config);
        applyFrequencyVisuals(config);
    }
    
    function updateFrequencyIndicator(config) {
        const indicator = document.getElementById('frequencyIndicator');
        const text = document.getElementById('frequencyText');
        
        if (indicator && text) {
            text.textContent = `${config.name} State: ${config.range} — ${config.state}`;
            indicator.style.borderColor = config.color;
        }
    }
    
    function applyFrequencyVisuals(config) {
        const bg = document.getElementById('consciousnessBg');
        
        const speeds = {
            theta: '20s',
            alpha: '15s',
            beta: '10s',
            gamma: '6s'
        };
        
        if (bg) {
            bg.style.animationDuration = speeds[currentFrequency];
        }
    }
    
    function pulseFrequency() {
        const original = currentFrequency;
        setFrequency('gamma');
        
        setTimeout(() => {
            if (currentFrequency === 'gamma') {
                setFrequency(original);
            }
        }, 500);
    }
    
    function increaseGlow(factor) {
        document.documentElement.style.setProperty('--glow-intensity', factor);
    }
    
    function resetGlow() {
        document.documentElement.style.setProperty('--glow-intensity', 0.5);
    }
    
    function startFrequencyModulation() {
        setInterval(() => {
            const time = Date.now() / 1000;
            const breath = Math.sin(time * 0.5) * 0.5 + 0.5;
            
            const baseGlow = parseFloat(getComputedStyle(document.documentElement)
                .getPropertyValue('--glow-intensity')) || 0.5;
            
            const modulated = baseGlow + (breath * 0.2);
            document.documentElement.style.setProperty('--glow-modulated', modulated);
            
        }, 100);
    }
    
    function getState() {
        return {
            frequency: currentFrequency,
            ...FREQUENCIES[currentFrequency],
            attentionLevel,
            scrollVelocity
        };
    }
    
    return {
        init,
        setFrequency,
        pulseFrequency,
        getState,
        FREQUENCIES
    };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ConsciousnessSystem.init);
} else {
    ConsciousnessSystem.init();
}
