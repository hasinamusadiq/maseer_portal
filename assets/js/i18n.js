/**
 * Maseer I18n System
 * Supports English, Persian/Dari (FA), and Pashto (PS)
 */

const I18n = (function() {
    'use strict';
    
    const TRANSLATIONS = {
        en: {
            tagline: "Premium AI video marketing for Afghan brands.<br>4 daily campaigns. 1224×1536 Meta-optimized. Undeniable results.",
            heroBadge: "Sample Ready in 3 Minutes",
            campaignTitle: "Your Daily Campaign Schedule",
            morningLang: "FA",
            morningTitle: "Morning Motivation",
            morningDesc: "Celestial Minimalism with Nastaʿlīq calligraphy. Navy-to-gold gradients with ethereal parallax motion. Awaken your audience.",
            morningEnergy: "Calm • Ethereal • Theta 4-8Hz",
            middayLang: "PS",
            middayTitle: "General Information",
            middayDesc: "Organic \"Hujra\" aesthetic with hand-drawn textures. Warm earthy tones and soft Pashto typography. Build community trust.",
            middayEnergy: "Cordial • Grounded • Alpha 8-13Hz",
            eveningLang: "FA",
            eveningTitle: "Service Promotion",
            eveningDesc: "Modern Classic with high-res photography. Detail callouts and kinetic typography. Drive action with authority.",
            eveningEnergy: "Professional • Inspiring • Beta 13-30Hz",
            nightLang: "EN",
            nightTitle: "Brand Awareness",
            nightDesc: "Tactile Stop-Motion with handcrafted assembly. 12fps stutter for human feel. Create unforgettable artistic impact.",
            nightEnergy: "Bold • Artistic • Gamma 30-100Hz",
            formTitle: "Begin Your Transformation",
            formSubtitle: "Complete your brand profile. Your consciousness-optimized sample will be ready in 3 minutes.",
            promiseTitle: "Immediate Undeniable Sample",
            promiseText: "High-impact preview using color psychology and industry-specific visual metaphors. Delivered instantly.",
            labelBrand: "Brand Name (English)",
            labelLocal: "Brand Name (Local)",
            labelIndustry: "Industry",
            labelColors: "Brand Colors",
            labelLogo: "Brand Logo",
            labelAudience: "Target Audience",
            labelOfferings: "Key Offerings",
            labelContact: "WhatsApp for Delivery",
            placeholderBrand: "e.g., Zarrin Jewelry",
            placeholderLocal: "e.g., زرین جواهرات / زرین ګالری",
            selectIndustry: "Select your industry",
            placeholderPrimary: "Primary #6B21A8",
            placeholderSecondary: "Secondary #EAB308",
            uploadText: "Drop logo or click to browse",
            uploadHint: "PNG with transparency preferred (max 2MB)",
            placeholderAudience: "e.g., Affluent women 25-45 / زنان ثروتمند / بډایې ښځې",
            placeholderOfferings: "Describe your main products/services...",
            placeholderContact: "+93 70 123 4567",
            submitBtn: "Generate My Undeniable Sample",
            footer: "© 2026 Maseer Media Inc. | Kabul, Afghanistan"
        },
        
        fa: {
            tagline: "بازاریابی ویدیویی هوش مصنوعی برتر برای برندهای افغان.<br>۴ کمپین روزانه. بهینه‌شده برای متا ۱۲۲۴×۱۵۳۶. نتایج انکارناپذیر.",
            heroBadge: "نمونه در ۳ دقیقه آماده است",
            campaignTitle: "برنامه زمانی کمپین روزانه شما",
            morningLang: "دری",
            morningTitle: "انگیزه صبحگاهی",
            morningDesc: "مینیمالیسم آسمانی با خط نستعلیق. گرادیانتی از نیلی به طلایی با حرکت پارالاکس اثیری. مخاطبان خود را بیدار کنید.",
            morningEnergy: "آرام • اثیری • تتا ۴-۸ هرتز",
            middayLang: "پشتو",
            middayTitle: "اطلاعات عمومی",
            middayDesc: "جمالیات ارگانیک \"هجره\" با بافت‌های دست‌کشیده. رنگ‌های گرم زمینی و تایپوگرافی نرم پشتو. اعتماد جامعه را بسازید.",
            middayEnergy: "گرم • ریشه‌دار • آلفا ۸-۱۳ هرتز",
            eveningLang: "دری",
            eveningTitle: "تبلیغ خدمات",
            eveningDesc: "کلاسیک مدرن با عکاسی با وضوح بالا. جزئیات برجسته و تایپوگرافی جنبشی. با اقتدار به عمل وادار کنید.",
            eveningEnergy: "حرفه‌ای • الهام‌بخش • بتا ۱۳-۳۰ هرتز",
            nightLang: "انگلیسی",
            nightTitle: "آگاهی از برند",
            nightDesc: "استاپ‌موشن لمسی با مونتاژ دست‌ساز. لرزش ۱۲ فریم‌برثانیه برای حس انسانی. تأثیر هنری فراموش‌نشدنی ایجاد کنید.",
            nightEnergy: " جسور • هنری • گاما ۳۰-۱۰۰ هرتز",
            formTitle: "تحول خود را آغاز کنید",
            formSubtitle: "پروفایل برند خود را تکمیل کنید. نمونه بهینه‌شده برای هوشیاری شما در ۳ دقیقه آماده خواهد بود.",
            promiseTitle: "نمونه انکارناپذیر فوری",
            promiseText: "پیش‌نمایش با تأثیر بالا با استفاده از روان‌شناسی رنگ و استعاره‌های بصری خاص صنعت. فوری تحویل داده می‌شود.",
            labelBrand: "نام برند (انگلیسی)",
            labelLocal: "نام برند (محلی)",
            labelIndustry: "صنعت",
            labelColors: "رنگ‌های برند",
            labelLogo: "لوگوی برند",
            labelAudience: "مخاطب هدف",
            labelOfferings: "محصولات/خدمات کلیدی",
            labelContact: "واتس‌اپ برای تحویل",
            placeholderBrand: "مثال: زرین جواهرات",
            placeholderLocal: "مثال: زرین جواهرات",
            selectIndustry: "صنعت خود را انتخاب کنید",
            placeholderPrimary: "اصلی #6B21A8",
            placeholderSecondary: "فرعی #EAB308",
            uploadText: "لوگو را رها کنید یا برای مرور کلیک کنید",
            uploadHint: "PNG با شفافیت ترجیح داده می‌شود (حداکثر ۲ مگابایت)",
            placeholderAudience: "مثال: زنان ثروتمند ۲۵-۴۵ ساله",
            placeholderOfferings: "محصولات/خدمات اصلی خود را توصیف کنید...",
            placeholderContact: "+۹۳ ۷۰ ۱۲۳ ۴۵۶۷",
            submitBtn: "نمونه انکارناپذیر من را بسازید",
            footer: "© ۲۰۲۶ ماسیر مدیا | کابل، افغانستان"
        },
        
        ps: {
            tagline: "د افغان برندونو لپاره د AI پریمیم ویډیو مارکیټینګ.<br>۴ ورځنی کمپاینونه. ۱۲۲۴×۱۵۳۶ Meta-بهینه شوی. انکار نشي کولی پایلې.",
            heroBadge: "نمونه په ۳ دقیقو کې چمتو ده",
            campaignTitle: "ستاسو د ورځنی کمپاین مهال ویش",
            morningLang: "دری",
            morningTitle: "سهارنه الهام",
            morningDesc: "د نستعلیق خط سره آسماني مینیمالیزم. د سمندرۍ څخه تر سرو زرو پورې ګریډینټ د اثري پارالاکس حرکت سره. خپل لیدونکي ویښ کړئ.",
            morningEnergy: "ارام • اثري • ټیتا ۴-۸ هرتز",
            middayLang: "پښتو",
            middayTitle: "عمومي معلومات",
            middayDesc: "د \"هجرې\" ارګانیک جمالیات د لاسي بافتونو سره. ګرم ځمکني رنګونه او نرم پښتو تایپوګرافي. د ټولنې اعتماد رامنځته کړئ.",
            middayEnergy: "ګرم • ریښه‌دار • الفا ۸-۱۳ هرتز",
            eveningLang: "دری",
            eveningTitle: "د خدماتو ترویج",
            eveningDesc: "د لوړې resolutions عکاسي سره عصري کلاسیک. د جزئیاتو غږونه او حرکتي تایپوګرافي. د اقتدار سره عمل ته اړ کړئ.",
            eveningEnergy: "مسلکي • الهام بښونکی • بېټا ۱۳-۳۰ هرتز",
            nightLang: "انګلیسي",
            nightTitle: "د برند خبرتیا",
            nightDesc: "د لاسي مونتاژ سره لمسی سټاپ-موشن. د انساني احساس لپاره ۱۲fps سټټر. د هنري اغیزې نه هیریدونکی پایله رامنځته کړئ.",
            nightEnergy: "جرئت • هنري • ګاما ۳۰-۱۰۰ هرتز",
            formTitle: "خپل بدلون پیل کړئ",
            formSubtitle: "د خپل برند پروفایل بشپړ کړئ. ستاسو د هوښیارۍ لپاره بهینه شوی نمونه په ۳ دقیقو کې چمتو شي.",
            promiseTitle: "وروستی انکار نشي کولی نمونه",
            promiseText: "د رنګ روانشناسي او د صنعت ځانګړو بصری استعارو کارولو سره د لوړ اغیزې مخکتنه. سمدلاسه تحویل شوی.",
            labelBrand: "د برند نوم (انګلیسي)",
            labelLocal: "د برند نوم (محلي)",
            labelIndustry: "صنعت",
            labelColors: "د برند رنګونه",
            labelLogo: "د برند لوګو",
            labelAudience: "هدفې لیدونکي",
            labelOfferings: "اصلي محصولات/خدمات",
            labelContact: "د تحویل لپاره واتس‌اپ",
            placeholderBrand: "د مثال په توګه: زرین ګالری",
            placeholderLocal: "د مثال په توګه: زرین ګالری",
            selectIndustry: "خپل صنعت وټاکئ",
            placeholderPrimary: "اصلي #6B21A8",
            placeholderSecondary: "ثانوي #EAB308",
            uploadText: "لوګو راوړئ یا د سپړلو لپاره کلیک وکړئ",
            uploadHint: "PNG د شفافیت سره غوره دی (حداکثر ۲ MB)",
            placeholderAudience: "د مثال په توګه: بډایې ښځې ۲۵-۴۵ کلنه",
            placeholderOfferings: "خپل اصلي محصولات/خدمات تشریح کړئ...",
            placeholderContact: "+۹۳ ۷۰ ۱۲۳ ۴۵۶۷",
            submitBtn: "زما انکار نشي کولی نمونه جوړه کړه",
            footer: "© ۲۰۲۶ ماسیر میډیا | کابل، افغانستان"
        }
    };
    
    let currentLang = 'en';
    
    function init() {
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('fa') || browserLang.startsWith('ps')) {
            const lang = browserLang.startsWith('ps') ? 'ps' : 'fa';
            setLanguage(lang, false);
        }
        
        const saved = localStorage.getItem('maseer_lang');
        if (saved && TRANSLATIONS[saved]) {
            setLanguage(saved, false);
        }
    }
    
    function setLanguage(lang, save = true) {
        if (!TRANSLATIONS[lang]) return;
        
        currentLang = lang;
        
        updatePageLanguage();
        updateLangButtons();
        updateDirection();
        
        if (save) {
            localStorage.setItem('maseer_lang', lang);
        }
        
        window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
    }
    
    function updatePageLanguage() {
        const texts = TRANSLATIONS[currentLang];
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (texts[key]) {
                el.innerHTML = texts[key];
            }
        });
        
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (texts[key]) {
                el.placeholder = texts[key];
            }
        });
    }
    
    function updateLangButtons() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === currentLang);
        });
    }
    
    function updateDirection() {
        const rtl = currentLang === 'fa' || currentLang === 'ps';
        document.documentElement.dir = rtl ? 'rtl' : 'ltr';
        document.documentElement.lang = currentLang;
    }
    
    function t(key) {
        return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key] || key;
    }
    
    function getCurrentLang() {
        return currentLang;
    }
    
    return {
        init,
        setLanguage,
        t,
        getCurrentLang,
        TRANSLATIONS
    };
})();

function setLanguage(lang) {
    I18n.setLanguage(lang);
}

document.addEventListener('DOMContentLoaded', I18n.init);
