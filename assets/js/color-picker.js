/**
 * Advanced Color Picker Utilities for Maseer Portal
 * Handles color psychology, harmonies, and accessibility
 */

const ColorTools = (function() {
    'use strict';

    const COLOR_PSYCHOLOGY = {
        '#D4AF37': { name: 'Gold', emotion: 'Luxury, Success, Quality', industries: ['Jewelry', 'Premium Services'] },
        '#8B4513': { name: 'Saddle Brown', emotion: 'Reliability, Earthiness, Comfort', industries: ['Food', 'Crafts'] },
        '#FF6B6B': { name: 'Coral', emotion: 'Energy, Youth, Boldness', industries: ['Fashion', 'Beauty'] },
        '#00D9FF': { name: 'Cyan', emotion: 'Innovation, Trust, Technology', industries: ['Tech', 'Healthcare'] },
        '#00A86B': { name: 'Jade', emotion: 'Health, Growth, Harmony', industries: ['Medical', 'Wellness'] },
        '#4169E1': { name: 'Royal Blue', emotion: 'Authority, Wisdom, Trust', industries: ['Education', 'Finance'] },
        '#FF1493': { name: 'Deep Pink', emotion: 'Passion, Femininity, Playfulness', industries: ['Beauty', 'Fashion'] },
        '#6B21A8': { name: 'Purple', emotion: 'Creativity, Luxury, Spirituality', industries: ['Creative', 'Premium'] }
    };

    function hexToHSL(hex) {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    function hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
    }

    function getComplementary(hex) {
        const hsl = hexToHSL(hex);
        hsl.h = (hsl.h + 180) % 360;
        return hslToHex(hsl.h, hsl.s, hsl.l);
    }

    function getAnalogous(hex) {
        const hsl = hexToHSL(hex);
        return [
            hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
            hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l)
        ];
    }

    function getTriadic(hex) {
        const hsl = hexToHSL(hex);
        return [
            hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
            hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
        ];
    }

    function getContrastRatio(hex1, hex2) {
        const lum1 = getLuminance(hex1);
        const lum2 = getLuminance(hex2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    function getLuminance(hex) {
        const rgb = hexToRGB(hex);
        const [r, g, b] = rgb.map(c => {
            c /= 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    function hexToRGB(hex) {
        return [
            parseInt(hex.slice(1, 3), 16),
            parseInt(hex.slice(3, 5), 16),
            parseInt(hex.slice(5, 7), 16)
        ];
    }

    function getPsychology(hex) {
        let closest = null;
        let minDistance = Infinity;
        
        for (const [color, data] of Object.entries(COLOR_PSYCHOLOGY)) {
            const distance = colorDistance(hex, color);
            if (distance < minDistance) {
                minDistance = distance;
                closest = { hex: color, ...data };
            }
        }
        
        return closest;
    }

    function colorDistance(hex1, hex2) {
        const rgb1 = hexToRGB(hex1);
        const rgb2 = hexToRGB(hex2);
        return Math.sqrt(
            Math.pow(rgb1[0] - rgb2[0], 2) +
            Math.pow(rgb1[1] - rgb2[1], 2) +
            Math.pow(rgb1[2] - rgb2[2], 2)
        );
    }

    function generatePalette(primary) {
        return {
            primary: primary,
            secondary: getComplementary(primary),
            accent: getAnalogous(primary)[1],
            background: hslToHex(hexToHSL(primary).h, 20, 95),
            text: getContrastRatio(primary, '#FFFFFF') > 4.5 ? '#FFFFFF' : '#1A1A1A'
        };
    }

    function applyHarmony(primaryHex) {
        const palette = generatePalette(primaryHex);
        const secondaryInput = document.getElementById('secondaryColor');
        const secondaryPreview = document.getElementById('secondaryPreview');
        const secondaryPicker = document.getElementById('secondaryColorPicker');
        
        if (secondaryInput && !secondaryInput.value) {
            secondaryInput.value = palette.secondary;
            secondaryPreview.style.background = palette.secondary;
            secondaryPicker.value = palette.secondary;
            
            const psych = getPsychology(primaryHex);
            if (psych) {
                showColorInfo(psych);
            }
        }
    }

    function showColorInfo(data) {
        let info = document.getElementById('color-psychology');
        if (!info) {
            info = document.createElement('div');
            info.id = 'color-psychology';
            info.style.cssText = `
                margin-top: 1rem;
                padding: 1rem;
                background: rgba(107, 33, 168, 0.1);
                border-radius: 0.5rem;
                font-size: 0.875rem;
            `;
            
            const primaryWrapper = document.getElementById('primaryColor')?.parentElement;
            if (primaryWrapper) {
                primaryWrapper.appendChild(info);
            }
        }
        
        info.innerHTML = `
            <strong>${data.name}</strong> evokes: ${data.emotion}<br>
            <small>Best for: ${data.industries.join(', ')}</small>
        `;
    }

    return {
        hexToHSL,
        hslToHex,
        getComplementary,
        getAnalogous,
        getTriadic,
        getContrastRatio,
        getPsychology,
        generatePalette,
        applyHarmony,
        colorDistance
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    const primaryInput = document.getElementById('primaryColor');
    if (primaryInput) {
        let timeout;
        primaryInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    ColorTools.applyHarmony(e.target.value.toUpperCase());
                }
            }, 500);
        });
    }
});
