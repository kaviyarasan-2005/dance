/* ========================================
   DANCE STUDIO — Theme Manager
   Dark/Light mode toggle with persistence
   ======================================== */

const ThemeManager = (() => {
  const STORAGE_KEY = 'dance-studio-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  let currentTheme = LIGHT;

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    currentTheme = saved || (prefersDark ? DARK : LIGHT);
    applyTheme(currentTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? DARK : LIGHT);
      }
    });

    // Bind toggle buttons
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', toggle);
    });
  }

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    updateIcons(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function toggle() {
    const newTheme = currentTheme === DARK ? LIGHT : DARK;
    applyTheme(newTheme);
  }

  function updateIcons(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      const sunIcon = btn.querySelector('.theme-icon-sun');
      const moonIcon = btn.querySelector('.theme-icon-moon');
      if (sunIcon && moonIcon) {
        if (theme === DARK) {
          sunIcon.style.display = 'inline';
          moonIcon.style.display = 'none';
        } else {
          sunIcon.style.display = 'none';
          moonIcon.style.display = 'inline';
        }
      } else {
        // Fallback: update icon class
        const icon = btn.querySelector('i');
        if (icon) {
          icon.className = theme === DARK ? 'fas fa-sun' : 'fas fa-moon';
        }
      }
    });
  }

  function getTheme() {
    return currentTheme;
  }

  return { init, toggle, getTheme };
})();
