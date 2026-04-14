const fs = require('fs');
const path = require('path');

const getNavMenu = (isRoot) => {
    const p = isRoot ? 'pages/' : '';
    const r = isRoot ? '' : '../';
    return `
        <ul class="navbar__menu">
          <li class="navbar__item navbar__dropdown">
            <a href="${r}index.html" class="navbar__link navbar__dropdown-toggle">Home</a>
            <ul class="navbar__dropdown-menu">
              <li><a href="${r}index.html" class="navbar__dropdown-item">Home 1</a></li>
              <li><a href="${p}home-2.html" class="navbar__dropdown-item">Home 2</a></li>
            </ul>
          </li>
          <li class="navbar__item"><a href="${p}about.html" class="navbar__link">About</a></li>
          <li class="navbar__item navbar__dropdown">
            <a href="${p}services.html" class="navbar__link navbar__dropdown-toggle">Services</a>
            <ul class="navbar__dropdown-menu">
              <li><a href="${p}services.html" class="navbar__dropdown-item">Services</a></li>
              <li><a href="${p}service-detail.html" class="navbar__dropdown-item">Service Details</a></li>
            </ul>
          </li>
          <li class="navbar__item navbar__dropdown">
            <a href="${p}blog.html" class="navbar__link navbar__dropdown-toggle">Blog</a>
            <ul class="navbar__dropdown-menu">
              <li><a href="${p}blog.html" class="navbar__dropdown-item">Blogs</a></li>
              <li><a href="${p}blog-detail.html" class="navbar__dropdown-item">Blog Details</a></li>
            </ul>
          </li>
          <li class="navbar__item"><a href="${p}pricing.html" class="navbar__link">Pricing</a></li>
          <li class="navbar__item navbar__dropdown">
            <a href="#" class="navbar__link navbar__dropdown-toggle">Dashboard</a>
            <ul class="navbar__dropdown-menu">
              <li><a href="${p}admin-dashboard.html" class="navbar__dropdown-item">Admin</a></li>
              <li><a href="${p}dashboard.html" class="navbar__dropdown-item">Dashboard</a></li>
            </ul>
          </li>
          <li class="navbar__item"><a href="${p}contact.html" class="navbar__link">Contact</a></li>
          <li class="navbar__mobile-login"><a href="${isRoot ? 'pages/login.html' : 'login.html'}" class="btn btn--primary">Sign In</a></li>
        </ul>`;
};

const getActions = (isRoot) => {
    const p = isRoot ? 'pages/' : '';
    return `
        <div class="navbar__actions">
          <a href="${p}login.html" class="btn" style="padding:0.5rem 1.25rem;border-radius:var(--radius-full);margin-inline-end:0.5rem;background:var(--gradient-primary);color:white;border:none;transition:none;transform:none;box-shadow:none;">Sign In</a>
          <button class="navbar__action-btn" data-rtl-toggle aria-label="Toggle RTL">
            <i class="fas fa-globe"></i>
          </button>
          <button class="navbar__action-btn" data-theme-toggle aria-label="Toggle theme">
            <i class="fas fa-moon"></i>
          </button>
          <button class="navbar__mobile-toggle" id="mobileToggle" aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
        </div>`;
};

function processFiles(dir) {
    let list = fs.readdirSync(dir);
    list.forEach(function(file) {
        let filePath = path.join(dir, file);
        let stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) { 
            if (filePath.includes('pages')) processFiles(filePath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let isRoot = !filePath.includes('pages') || filePath.endsWith('index.html');
            
            // Clean up any existing messy nav
            const innerRegex = /<div class="navbar__inner">[\s\S]*?<\/div>\s*<\/div>\s*<\/nav>/;
            if (content.match(innerRegex)) {
                const logoHtml = `<a href="${isRoot ? 'index.html' : '../index.html'}" class="navbar__logo">
          <div class="navbar__logo-icon"><i class="fas fa-music"></i></div>
          <div class="navbar__logo-text"><span>Alan</span></div>
        </a>`;
                
                const newInner = `<div class="navbar__inner">
        ${logoHtml}
        ${getNavMenu(isRoot)}
        ${getActions(isRoot)}
      </div></div></nav>`;
                
                content = content.replace(innerRegex, newInner);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Fixed Navigation for:', filePath);
            }
        }
    });
}
processFiles(__dirname);
