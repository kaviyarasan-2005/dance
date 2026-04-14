/* ========================================
   DANCE STUDIO — Navigation Controller
   Mobile menu, dropdowns, scroll behavior
   ======================================== */

const Navigation = (() => {
  let navbar, mobileToggle, mobileMenu, scrollProgress, backToTop;
  let lastScroll = 0;

  function init() {
    navbar = document.querySelector('.navbar');
    mobileToggle = document.querySelector('.navbar__mobile-toggle');
    mobileMenu = document.querySelector('.navbar__menu');
    scrollProgress = document.querySelector('.scroll-progress');
    backToTop = document.querySelector('.back-to-top');

    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener('click', toggleMobileMenu);
    }

    // Dropdown toggles
    document.querySelectorAll('.navbar__dropdown-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          const dropdown = toggle.closest('.navbar__dropdown');
          dropdown.classList.toggle('open');
        }
      });
    });

    // Close dropdowns and mobile menu on outside click
    document.addEventListener('click', (e) => {
      // Mobile menu outside click
      if (window.innerWidth <= 768 && mobileMenu && mobileMenu.classList.contains('open')) {
        if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
          toggleMobileMenu();
        }
      }

      // Dropdown outside click
      if (window.innerWidth > 768) {
        document.querySelectorAll('.navbar__dropdown.open').forEach(dd => {
          if (!dd.contains(e.target)) {
            dd.classList.remove('open');
          }
        });
      }
    });

    // Scroll handler
    window.addEventListener('scroll', onScroll, { passive: true });

    // Back to top
    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Active nav link
    setActiveLink();

  }

  function toggleMobileMenu() {
    mobileToggle.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    if (navbar) navbar.classList.toggle('menu-open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  }

  function closeMobileMenu() {
    if (mobileToggle && mobileMenu) {
      mobileToggle.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function onScroll() {
    const scrollY = window.scrollY;
    
    // Navbar background on scroll
    if (navbar) {
      navbar.classList.toggle('scrolled', scrollY > 50);
    }

    // Scroll progress bar
    if (scrollProgress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollY / docHeight : 0;
      scrollProgress.style.transform = `scaleX(${progress})`;
    }

    // Back to top visibility
    if (backToTop) {
      backToTop.classList.toggle('visible', scrollY > 500);
    }

    lastScroll = scrollY;
  }

  function setActiveLink() {
    const currentPath = window.location.pathname;
    const filename = currentPath.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.navbar__link, .navbar__dropdown-item').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkFile = href.split('/').pop();
      
      if (linkFile === filename || 
          (filename === '' && linkFile === 'index.html') ||
          (filename === 'index.html' && linkFile === 'index.html')) {
        link.classList.add('active');
      }
    });
  }


  return { init, closeMobileMenu };
})();
