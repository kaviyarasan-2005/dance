/* ========================================
   DANCE STUDIO — Main Initializer
   Orchestrates all modules and preloader
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize core modules
  ThemeManager.init();
  RTLManager.init();
  Navigation.init();
  Animations.init();

  // Initialize dashboard if on dashboard page
  if (document.querySelector('.dashboard')) {
    Dashboard.init();
  }

  // Accordion functionality
  initAccordions();

  // Tab functionality
  initTabs();


  // Smooth scroll for anchor links
  initSmoothScroll();

  // Form validation
  initFormValidation();

  // Pricing toggle
  initPricingToggle();

  // Filter grids
  initFilterGrid();
});


/* === Accordion === */
function initAccordions() {
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      const isOpen = item.classList.contains('open');
      
      // Close siblings (optional: remove for multi-open)
      const parent = item.parentElement;
      parent.querySelectorAll('.accordion-item.open').forEach(openItem => {
        if (openItem !== item) openItem.classList.remove('open');
      });
      
      item.classList.toggle('open', !isOpen);
    });
  });
}

/* === Tabs === */
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabContainer => {
    const buttons = tabContainer.querySelectorAll('.tab-btn');
    const panelContainer = tabContainer.nextElementSibling || tabContainer.closest('.tab-wrapper')?.querySelector('.tab-panels');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        
        // Update active button
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active panel
        if (panelContainer) {
          panelContainer.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
          });
          const targetPanel = panelContainer.querySelector(`[data-tab-panel="${target}"]`) ||
                              document.getElementById(target);
          if (targetPanel) targetPanel.classList.add('active');
        } else {
          document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
          });
          const targetPanel = document.querySelector(`[data-tab-panel="${target}"]`) ||
                              document.getElementById(target);
          if (targetPanel) targetPanel.classList.add('active');
        }
      });
    });
  });
}

/* === Smooth Scroll === */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        Navigation.closeMobileMenu();
      }
    });
  });
}

/* === Form Validation === */
function initFormValidation() {
  document.querySelectorAll('form[data-validate]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      
      form.querySelectorAll('[required]').forEach(input => {
        const value = input.value.trim();
        const errorEl = input.nextElementSibling?.classList.contains('form-error') ? input.nextElementSibling : null;
        
        if (!value) {
          input.classList.add('error');
          input.classList.remove('success');
          if (errorEl) errorEl.style.display = 'block';
          isValid = false;
        } else if (input.type === 'email' && !isValidEmail(value)) {
          input.classList.add('error');
          input.classList.remove('success');
          if (errorEl) {
            errorEl.textContent = 'Please enter a valid email address';
            errorEl.style.display = 'block';
          }
          isValid = false;
        } else {
          input.classList.remove('error');
          input.classList.add('success');
          if (errorEl) errorEl.style.display = 'none';
        }
      });
      
      if (isValid) {
        // Success animation on submit button
        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
          const originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
          submitBtn.style.background = '#48BB78';
          submitBtn.disabled = true;
          
          setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.style.background = '';
            submitBtn.disabled = false;
            form.reset();
            form.querySelectorAll('.success').forEach(el => el.classList.remove('success'));
          }, 2500);
        }
      }
    });

    // Real-time validation
    form.querySelectorAll('[required]').forEach(input => {
      input.addEventListener('blur', () => {
        if (input.value.trim()) {
          input.classList.remove('error');
          input.classList.add('success');
          const errorEl = input.nextElementSibling;
          if (errorEl?.classList.contains('form-error')) errorEl.style.display = 'none';
        }
      });
      
      input.addEventListener('input', () => {
        if (input.classList.contains('error') && input.value.trim()) {
          input.classList.remove('error');
          const errorEl = input.nextElementSibling;
          if (errorEl?.classList.contains('form-error')) errorEl.style.display = 'none';
        }
      });
    });
  });
  
  // Password strength meter
  document.querySelectorAll('[data-password-strength]').forEach(input => {
    const meter = document.querySelector(input.dataset.passwordStrength);
    if (!meter) return;
    
    input.addEventListener('input', () => {
      const val = input.value;
      let strength = 0;
      if (val.length >= 8) strength++;
      if (/[A-Z]/.test(val)) strength++;
      if (/[0-9]/.test(val)) strength++;
      if (/[^A-Za-z0-9]/.test(val)) strength++;
      meter.setAttribute('data-strength', strength);
    });
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* === Pricing Toggle === */
function initPricingToggle() {
  const toggle = document.querySelector('.pricing-toggle');
  if (!toggle) return;
  
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('yearly');
    
    document.querySelectorAll('[data-price-monthly]').forEach(el => {
      const isYearly = toggle.classList.contains('yearly');
      el.textContent = isYearly ? el.dataset.priceYearly : el.dataset.priceMonthly;
    });
    
    document.querySelectorAll('[data-period]').forEach(el => {
      el.textContent = toggle.classList.contains('yearly') ? '/year' : '/month';
    });
  });
}

/* === Filter Grid === */
function initFilterGrid() {
  document.querySelectorAll('.filter-tabs').forEach(filterContainer => {
    const buttons = filterContainer.querySelectorAll('.filter-btn');
    const gridId = filterContainer.dataset.target;
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        const items = grid.querySelectorAll('[data-category]');
        
        items.forEach(item => {
          const match = filter === 'all' || item.dataset.category === filter;
          item.style.opacity = match ? '1' : '0';
          item.style.transform = match ? 'scale(1)' : 'scale(0.8)';
          setTimeout(() => {
            item.style.display = match ? '' : 'none';
          }, match ? 0 : 300);
        });
      });
    });
  });
}
