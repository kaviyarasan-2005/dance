/* ========================================
   DANCE STUDIO — Animations Controller
   Intersection Observer reveals, parallax,
   micro-interactions, particles, counters
   ======================================== */

const Animations = (() => {
  let observer;
  let cursorEl;
  let particleCanvas, particleCtx;
  let particles = [];
  let animationFrame;

  function init() {
    initScrollReveals();
    initParallax();
    initCustomCursor();
    initButtonRipple();
    initCardTilt();
    initCounters();
    initMarquee();
    initTextMaskReveal();
    initImageHoverZoom();
  }

  /* === Scroll Reveal via Intersection Observer === */
  function initScrollReveals() {
    const revealEls = document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal--scale');
    if (!revealEls.length) return;

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealEls.forEach(el => observer.observe(el));
  }

  /* === Parallax on Scroll === */
  function initParallax() {
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    if (!parallaxEls.length) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          parallaxEls.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.5;
            const rect = el.getBoundingClientRect();
            const offset = (rect.top + scrollY) * speed - scrollY * speed;
            el.style.transform = `translateY(${offset * 0.3}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* === Custom Cursor === */
  function initCustomCursor() {
    cursorEl = document.querySelector('.custom-cursor');
    if (!cursorEl || window.matchMedia('(pointer: coarse)').matches) return;

    document.addEventListener('mousemove', (e) => {
      cursorEl.style.left = e.clientX + 'px';
      cursorEl.style.top = e.clientY + 'px';
    });

    // Expand on interactive elements
    const interactiveEls = document.querySelectorAll('a, button, input, textarea, select, [role="button"], .card, .btn');
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', () => cursorEl.classList.add('expanded'));
      el.addEventListener('mouseleave', () => cursorEl.classList.remove('expanded'));
    });
  }

  /* === Button Ripple Effect === */
  function initButtonRipple() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  /* === 3D Card Tilt === */
  function initCardTilt() {
    document.querySelectorAll('.card--tilt').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        card.style.transition = 'transform 0.5s ease';
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'none';
      });
    });
  }

  /* === Animated Number Counters === */
  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.counter, 10);
    const duration = parseInt(el.dataset.counterDuration, 10) || 2000;
    const suffix = el.dataset.counterSuffix || '';
    const prefix = el.dataset.counterPrefix || '';
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target.toLocaleString() + suffix;
      }
    }
    requestAnimationFrame(update);
  }

  /* === Infinite Marquee === */
  function initMarquee() {
    document.querySelectorAll('.marquee').forEach(marquee => {
      const track = marquee.querySelector('.marquee__track');
      if (!track) return;
      // Clone items for seamless loop
      const items = track.innerHTML;
      track.innerHTML = items + items;
    });
  }

  /* === Text Mask Reveal === */
  function initTextMaskReveal() {
    const masks = document.querySelectorAll('.text-mask');
    if (!masks.length) return;

    const maskObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          maskObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    masks.forEach(el => maskObserver.observe(el));
  }

  /* === Image Hover Zoom === */
  function initImageHoverZoom() {
    document.querySelectorAll('.hover-zoom').forEach(container => {
      const img = container.querySelector('img');
      if (!img) return;
      container.style.overflow = 'hidden';
      img.style.transition = 'transform 0.6s ease';
      container.addEventListener('mouseenter', () => {
        img.style.transform = 'scale(1.05)';
      });
      container.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1)';
      });
    });
  }

  /* === Hero Particle System === */
  function initParticles(canvasId) {
    particleCanvas = document.getElementById(canvasId);
    if (!particleCanvas) return;
    
    particleCtx = particleCanvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', debounce(resizeCanvas, 200));
    
    // Create particles
    const count = Math.min(80, Math.floor(particleCanvas.width * particleCanvas.height / 15000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * particleCanvas.width,
        y: Math.random() * particleCanvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    
    animateParticles();
  }

  function resizeCanvas() {
    if (!particleCanvas) return;
    particleCanvas.width = particleCanvas.parentElement.offsetWidth;
    particleCanvas.height = particleCanvas.parentElement.offsetHeight;
  }

  function animateParticles() {
    if (!particleCtx || !particleCanvas) return;
    
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      
      // Wrap around
      if (p.x < 0) p.x = particleCanvas.width;
      if (p.x > particleCanvas.width) p.x = 0;
      if (p.y < 0) p.y = particleCanvas.height;
      if (p.y > particleCanvas.height) p.y = 0;
      
      // Draw particle
      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      particleCtx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      particleCtx.fill();
      
      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          particleCtx.beginPath();
          particleCtx.moveTo(p.x, p.y);
          particleCtx.lineTo(p2.x, p2.y);
          particleCtx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - dist / 120)})`;
          particleCtx.lineWidth = 0.5;
          particleCtx.stroke();
        }
      }
    });
    
    animationFrame = requestAnimationFrame(animateParticles);
  }

  function destroyParticles() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    particles = [];
  }

  /* === Utility: Debounce === */
  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  return { init, initParticles, destroyParticles, initCounters, initScrollReveals };
})();
