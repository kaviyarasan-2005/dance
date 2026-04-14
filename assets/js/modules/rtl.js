/* ========================================
   DANCE STUDIO — RTL/LTR Manager
   Language direction switching
   ======================================== */

const RTLManager = (() => {
  const STORAGE_KEY = 'dance-studio-lang';

  const languages = {
    en: { dir: 'ltr', lang: 'en', label: 'English', font: "'Inter', sans-serif" },
    ar: { dir: 'rtl', lang: 'ar', label: 'العربية', font: "'Cairo', sans-serif" }
  };

  let currentLang = 'en';

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    currentLang = saved && languages[saved] ? saved : 'en';
    applyLanguage(currentLang);
    bindEvents();
  }

  function bindEvents() {
    // Only bind if not already bound to avoid multiple listeners
    if (RTLManager.eventsBound) return;
    
    document.querySelectorAll('[data-rtl-toggle]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const nextLang = currentLang === 'en' ? 'ar' : 'en';
        setLanguage(nextLang);
      });
    });
    
    RTLManager.eventsBound = true;
  }

  function setLanguage(lang) {
    if (!languages[lang]) return;
    currentLang = lang;
    applyLanguage(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  function applyLanguage(lang) {
    const config = languages[lang];
    document.documentElement.setAttribute('dir', config.dir);
    document.documentElement.setAttribute('lang', config.lang);
    
    // Update active states on toggles
    document.querySelectorAll('[data-rtl-toggle]').forEach(btn => {
      btn.classList.toggle('active', lang === 'ar');
    });
  }

  function getLanguage() {
    return currentLang;
  }

  function getDirection() {
    return languages[currentLang].dir;
  }

  return { init, setLanguage, getLanguage, getDirection, eventsBound: false };
})();
