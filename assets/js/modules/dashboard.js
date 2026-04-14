/* ========================================
   DANCE STUDIO — Dashboard Controller
   Charts, role toggle, table sorting, chat
   ======================================== */

const Dashboard = (() => {

  function init() {
    initSidebar();
    
    // Delay chart initialization to ensure container dimensions are calculated
    setTimeout(() => {
        // Admin & Common
        initSortableTable();
        initProgressRings();
        initCounters();
        initLineChart();
        initDonutChart();
        initRadarChart();
        initHeatMap();
        initAttendanceHeatMap();
        
        // User Specific Redesign
        initWaveChart();
        initGoalRings();
        initBadges();
        initLevelProgress();
        
        initChat();
        initMobileNav();
    }, 250);
  }



  /* === Sidebar Collapse === */
  function initSidebar() {
    const sidebar = document.querySelector('.dashboard__sidebar');
    const toggle = document.querySelector('.sidebar-toggle');
    if (!sidebar || !toggle) return;

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });

    // Mobile sidebar toggle
    const mobileMenuBtn = document.querySelector('.dashboard__mobile-menu-btn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Close sidebar on overlay click (mobile)
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024 && sidebar.classList.contains('mobile-open')) {
        if (!sidebar.contains(e.target) && !e.target.closest('.dashboard__mobile-menu-btn')) {
          sidebar.classList.remove('mobile-open');
        }
      }
    });
  }


  /* === Sortable Table === */
  function initSortableTable() {
    document.querySelectorAll('.data-table').forEach(table => {
      const headers = table.querySelectorAll('th[data-sort]');
      headers.forEach(th => {
        th.addEventListener('click', () => {
          const column = th.dataset.sort;
          const isAsc = th.classList.contains('sorted-asc');
          
          // Reset all headers
          headers.forEach(h => {
            h.classList.remove('sorted', 'sorted-asc', 'sorted-desc');
          });
          
          th.classList.add('sorted', isAsc ? 'sorted-desc' : 'sorted-asc');
          
          const tbody = table.querySelector('tbody');
          const rows = Array.from(tbody.querySelectorAll('tr'));
          const colIndex = Array.from(th.parentElement.children).indexOf(th);
          
          rows.sort((a, b) => {
            let aVal = a.children[colIndex]?.textContent.trim() || '';
            let bVal = b.children[colIndex]?.textContent.trim() || '';
            
            // Try numeric sort
            const aNum = parseFloat(aVal.replace(/[^0-9.-]/g, ''));
            const bNum = parseFloat(bVal.replace(/[^0-9.-]/g, ''));
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
              return isAsc ? bNum - aNum : aNum - bNum;
            }
            
            return isAsc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
          });
          
          rows.forEach(row => tbody.appendChild(row));
        });
      });
    });
  }

  /* === SVG Circular Progress Rings === */
  function initProgressRings() {
    document.querySelectorAll('.progress-ring').forEach(ring => {
      const circle = ring.querySelector('.progress-ring__circle');
      const text = ring.querySelector('.progress-ring__text');
      if (!circle) return;

      const radius = circle.getAttribute('r');
      const circumference = 2 * Math.PI * radius;
      circle.style.strokeDasharray = circumference;
      circle.style.strokeDashoffset = circumference;

      const percent = parseInt(ring.dataset.percent, 10) || 0;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const offset = circumference - (percent / 100) * circumference;
            circle.style.strokeDashoffset = offset;
            if (text) {
              animateValue(text, 0, percent, 1000, '%');
            }
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      observer.observe(ring);
    });
  }

  function initCounters() {
    document.querySelectorAll('[data-counter]').forEach(el => {
      const target = parseFloat(el.dataset.counter);
      const prefix = el.dataset.counterPrefix || '';
      const suffix = el.dataset.counterSuffix || '';
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateValue(el, 0, target, 1500, suffix, prefix);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      observer.observe(el);
    });
  }

  function animateValue(el, start, end, duration, suffix = '', prefix = '') {
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * (end - start) + start;
      
      if (end % 1 === 0) {
        el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
      } else {
        el.textContent = prefix + current.toFixed(1) + suffix;
      }
      
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  /* === SVG Line Chart === */
  function initLineChart() {
    document.querySelectorAll('.line-chart').forEach(container => {
      const data = JSON.parse(container.dataset.values || '[]');
      const labels = JSON.parse(container.dataset.labels || '[]');
      if (!data.length) return;

      container.innerHTML = '';
      const width = container.offsetWidth || 400;
      const height = 250;
      const padding = { top: 20, right: 20, bottom: 40, left: 50 };
      const chartW = width - padding.left - padding.right;
      const chartH = height - padding.top - padding.bottom;

      const maxVal = Math.max(...data) * 1.1;
      const minVal = 0;

      const svg = createSVGElement('svg', { width, height, viewBox: `0 0 ${width} ${height}` });

      // Grid lines
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        svg.appendChild(createSVGElement('line', {
          x1: padding.left, y1: y, x2: width - padding.right, y2: y,
          stroke: 'var(--border-color)', 'stroke-width': 1, 'stroke-dasharray': '4,4'
        }));

        const val = Math.round(maxVal - (maxVal / 4) * i);
        const text = createSVGElement('text', {
          x: padding.left - 10, y: y + 4, 'text-anchor': 'end', fill: 'var(--text-tertiary)', 'font-size': '11'
        });
        text.textContent = val;
        svg.appendChild(text);
      }

      // Points and path
      const points = data.map((val, i) => ({
        x: padding.left + (i / (data.length - 1)) * chartW,
        y: padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH
      }));

      // Area fill
      const areaPath = `M${points[0].x},${padding.top + chartH} ` +
        points.map(p => `L${p.x},${p.y}`).join(' ') +
        ` L${points[points.length - 1].x},${padding.top + chartH} Z`;

      const defs = createSVGElement('defs', {});
      const gradient = createSVGElement('linearGradient', { id: 'chartGradient', x1: '0', y1: '0', x2: '0', y2: '1' });
      gradient.appendChild(createSVGElement('stop', { offset: '0%', 'stop-color': 'var(--color-primary)', 'stop-opacity': '0.4' }));
      gradient.appendChild(createSVGElement('stop', { offset: '100%', 'stop-color': 'var(--color-primary)', 'stop-opacity': '0' }));
      defs.appendChild(gradient);
      svg.appendChild(defs);
      svg.appendChild(createSVGElement('path', { d: areaPath, fill: 'url(#chartGradient)', opacity: '0.3' }));

      // Line
      const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
      const line = createSVGElement('path', {
        d: linePath, fill: 'none', stroke: 'var(--color-primary)',
        'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
      });
      line.style.animation = 'drawLine 1.5s ease forwards';
      svg.appendChild(line);

      // X-axis labels
      labels.forEach((label, i) => {
        if (i >= points.length) return;
        const text = createSVGElement('text', {
          x: points[i].x, y: height - 8, 'text-anchor': 'middle', fill: 'var(--text-tertiary)', 'font-size': '11'
        });
        text.textContent = label;
        svg.appendChild(text);
      });

      container.appendChild(svg);
    });
  }

  /* === SVG Wave Chart (Novel Area Chart) === */
  function initWaveChart() {
    document.querySelectorAll('.wave-chart').forEach(container => {
      const data = JSON.parse(container.dataset.values || '[]');
      const labels = JSON.parse(container.dataset.labels || '[]');
      if (!data.length) return;

      container.innerHTML = '';
      const width = container.offsetWidth || 500;
      const height = 250;
      const padding = { top: 20, right: 30, bottom: 40, left: 40 };
      const chartW = width - padding.left - padding.right;
      const chartH = height - padding.top - padding.bottom;

      const maxVal = Math.max(...data) * 1.1;
      const svg = createSVGElement('svg', { width, height, viewBox: `0 0 ${width} ${height}` });

      const defs = createSVGElement('defs', {});
      const gradient = createSVGElement('linearGradient', { id: 'waveGradient', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
      gradient.appendChild(createSVGElement('stop', { offset: '0%', 'stop-color': 'var(--color-primary)', 'stop-opacity': '0.3' }));
      gradient.appendChild(createSVGElement('stop', { offset: '100%', 'stop-color': 'var(--color-primary)', 'stop-opacity': '0' }));
      defs.appendChild(gradient);
      svg.appendChild(defs);

      const points = data.map((val, i) => ({
        x: padding.left + (i / (data.length - 1)) * chartW,
        y: padding.top + chartH - (val / maxVal) * chartH
      }));

      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
          const curr = points[i];
          const next = points[i + 1];
          const cpX = curr.x + (next.x - curr.x) / 2;
          d += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
      }

      const fillPath = d + ` L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;
      svg.appendChild(createSVGElement('path', { d: fillPath, fill: 'url(#waveGradient)', opacity: '0.8' }));
      
      const strokeEl = createSVGElement('path', { d: d, fill: 'none', stroke: 'var(--color-primary)', 'stroke-width': '3', 'stroke-linecap': 'round' });
      strokeEl.style.animation = 'fadeIn 1s ease forwards';
      svg.appendChild(strokeEl);

      labels.forEach((label, i) => {
          const text = createSVGElement('text', {
              x: points[i].x, y: height - 10, 'text-anchor': 'middle', fill: 'var(--text-tertiary)', 'font-size': '12'
          });
          text.textContent = label;
          svg.appendChild(text);
      });

      container.appendChild(svg);
    });
  }

  /* === SVG Bar Chart === */

  /* === SVG Donut Chart === */
  function initDonutChart() {
    document.querySelectorAll('.donut-chart').forEach(container => {
      const data = JSON.parse(container.dataset.values || '[]');
      if (!data.length) return;

      container.innerHTML = '';
      const size = 200;
      const radius = 80;
      const thickness = 20;
      const center = size / 2;
      const circumference = 2 * Math.PI * (radius - thickness / 2);

      const svg = createSVGElement('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}` });
      
      let currentAngle = -90;
      const total = data.reduce((sum, item) => sum + item.value, 0);

      data.forEach((item, i) => {
        const slicePercent = (item.value / total);
        const dashArray = (slicePercent * circumference);

        const circle = createSVGElement('circle', {
          cx: center, cy: center, r: radius - thickness / 2,
          fill: 'none', stroke: item.color || 'var(--color-primary)',
          'stroke-width': thickness,
          'stroke-dasharray': `${dashArray} ${circumference}`,
          'stroke-dashoffset': dashArray,
          transform: `rotate(${currentAngle} ${center} ${center})`,
          'stroke-linecap': 'butt'
        });

        circle.style.transition = 'stroke-dashoffset 1s ease, opacity 0.5s ease';
        svg.appendChild(circle);
        
        setTimeout(() => {
            circle.style.strokeDashoffset = '0';
        }, 300 + (i * 100));

        currentAngle += (slicePercent * 360);
      });

      // Center text
      const totalLabel = createSVGElement('text', {
        x: center, y: center + 5, 'text-anchor': 'middle',
        fill: 'var(--text-primary)', 'font-size': '20', 'font-weight': 'bold'
      });
      totalLabel.textContent = total;
      svg.appendChild(totalLabel);

      container.appendChild(svg);
    });
  }

  /* === SVG Radar Chart === */
  function initRadarChart() {
    document.querySelectorAll('.radar-chart').forEach(container => {
      const data = JSON.parse(container.dataset.values || '[]');
      const labels = JSON.parse(container.dataset.labels || '[]');
      if (!data.length) return;

      container.innerHTML = '';
      const size = 300;
      const center = size / 2;
      const radius = 100;
      const angleStep = (Math.PI * 2) / labels.length;

      const svg = createSVGElement('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}` });

      // Draw background polygons (grid)
      for (let level = 1; level <= 4; level++) {
        const r = (radius / 4) * level;
        const points = labels.map((_, i) => {
          const x = center + r * Math.cos(i * angleStep - Math.PI / 2);
          const y = center + r * Math.sin(i * angleStep - Math.PI / 2);
          return `${x},${y}`;
        }).join(' ');

        svg.appendChild(createSVGElement('polygon', {
          points, fill: 'none', stroke: 'var(--border-color)', 'stroke-width': 1
        }));
      }

      // Draw axes
      labels.forEach((label, i) => {
        const x = center + radius * Math.cos(i * angleStep - Math.PI / 2);
        const y = center + radius * Math.sin(i * angleStep - Math.PI / 2);
        svg.appendChild(createSVGElement('line', {
          x1: center, y1: center, x2: x, y2: y,
          stroke: 'var(--border-color)', 'stroke-width': 1
        }));

        // Label
        const lx = center + (radius + 20) * Math.cos(i * angleStep - Math.PI / 2);
        const ly = center + (radius + 20) * Math.sin(i * angleStep - Math.PI / 2);
        const text = createSVGElement('text', {
          x: lx, y: ly, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
          fill: 'var(--text-tertiary)', 'font-size': '10'
        });
        text.textContent = label;
        svg.appendChild(text);
      });

      // Draw data polygon
      const points = data.map((val, i) => {
        const r = (val / 100) * radius;
        const x = center + r * Math.cos(i * angleStep - Math.PI / 2);
        const y = center + r * Math.sin(i * angleStep - Math.PI / 2);
        return `${x},${y}`;
      }).join(' ');

      const poly = createSVGElement('polygon', {
        points, fill: 'var(--color-primary)', 'fill-opacity': '0.3',
        stroke: 'var(--color-primary)', 'stroke-width': 2
      });
      poly.style.animation = 'fadeIn 1s ease forwards';
      svg.appendChild(poly);

      container.appendChild(svg);
    });
  }

  /* === SVG Heatmap === */
  function initHeatMap() {
    const container = document.querySelector('.activity-heatmap');
    if (!container) return;

    const data = [
      [2, 5, 8, 3, 1, 0, 4], [4, 9, 3, 6, 8, 3, 2], [7, 3, 9, 1, 5, 8, 4],
      [3, 6, 2, 8, 4, 3, 9], [8, 4, 7, 3, 9, 2, 5], [9, 8, 4, 2, 6, 9, 3]
    ];

    container.innerHTML = '';
    const width = container.offsetWidth || 500;
    const height = 180;
    const svg = createSVGElement('svg', { width: '100%', height, viewBox: `0 0 ${width} ${height}` });
    
    const rows = data.length;
    const cols = 7;
    const padding = 4;
    const cellW = (width - (cols * padding)) / cols;
    const cellH = (height - (rows * padding)) / rows;

    data.forEach((row, ri) => {
      row.forEach((val, ci) => {
        const opacity = val / 10;
        const rect = createSVGElement('rect', {
          x: ci * (cellW + padding), y: ri * (cellH + padding),
          width: cellW, height: cellH, rx: 4, ry: 4,
          fill: 'var(--color-primary)', 'fill-opacity': opacity === 0 ? 0.05 : opacity
        });
        svg.appendChild(rect);
      });
    });
    container.appendChild(svg);
  }

  /* === SVG Attendance Heatmap === */
  function initAttendanceHeatMap() {
    const container = document.querySelector('.attendance-heatmap');
    if (!container) return;

    const data = [[1,0,1,1,1,1,0], [1,1,1,0,1,1,0], [0,1,1,1,1,0,0], [1,1,1,1,1,1,0], [1,1,0,1,1,1,0]];
    container.innerHTML = '';
    const width = container.offsetWidth || 500;
    const height = 140;
    const svg = createSVGElement('svg', { width: '100%', height, viewBox: `0 0 ${width} ${height}` });
    
    const rows = data.length;
    const cols = 7;
    const padding = 4;
    const cellW = (width - (cols * padding)) / cols;
    const cellH = (height - (rows * padding)) / rows;

    data.forEach((row, ri) => {
      row.forEach((val, ci) => {
        const fill = val === 1 ? 'var(--color-primary)' : 'var(--border-color)';
        const rect = createSVGElement('rect', {
          x: ci * (cellW + padding), y: ri * (cellH + padding),
          width: cellW, height: cellH, rx: 4, ry: 4, fill: fill,
          'fill-opacity': val === 1 ? (Math.random() * 0.4 + 0.6) : 1
        });
        svg.appendChild(rect);
      });
    });
    container.appendChild(svg);
  }

  function createSVGElement(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  /* === Chat Interface === */
  function initChat() {
    const chatInput = document.querySelector('.chat-input input');
    const chatSendBtn = document.querySelector('.chat-input .btn');
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatInput || !chatSendBtn || !chatMessages) return;

    const sendMessage = () => {
      const text = chatInput.value.trim();
      if (!text) return;

      const msg = document.createElement('div');
      msg.className = 'chat-message chat-message--sent';
      msg.innerHTML = `
        <div class="chat-message__bubble">${escapeHtml(text)}</div>
        <span class="chat-message__time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      `;
      msg.style.animation = 'fadeUp 0.3s ease';
      chatMessages.appendChild(msg);
      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Simulate typing indicator and reply
      setTimeout(() => {
        const typing = document.createElement('div');
        typing.className = 'chat-message chat-message--received';
        typing.innerHTML = `
          <div class="chat-message__bubble">
            <div class="chat-typing">
              <span class="chat-typing__dot"></span>
              <span class="chat-typing__dot"></span>
              <span class="chat-typing__dot"></span>
            </div>
          </div>
        `;
        chatMessages.appendChild(typing);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        setTimeout(() => {
          typing.remove();
          const reply = document.createElement('div');
          reply.className = 'chat-message chat-message--received';
          reply.innerHTML = `
            <div class="chat-message__bubble">Thanks for your message! Our team will get back to you shortly.</div>
            <span class="chat-message__time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          `;
          reply.style.animation = 'fadeUp 0.3s ease';
          chatMessages.appendChild(reply);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1500);
      }, 500);
    };

    chatSendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  /* === SVG Concentric Goal Rings === */
  function initGoalRings() {
    const container = document.querySelector('.goal-rings');
    if (!container) return;

    const goals = [
        { label: 'Technique', percent: 85, color: 'var(--color-primary)' },
        { label: 'Rhythm', percent: 65, color: 'var(--color-accent)' },
        { label: 'Stamina', percent: 90, color: '#48BB78' }
    ];

    const size = 260;
    const center = size / 2;
    const baseRadius = 100;
    const thickness = 20;
    const spacing = 28;

    const svg = createSVGElement('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}` });

    goals.forEach((goal, i) => {
        const r = baseRadius - (i * spacing);
        const circ = 2 * Math.PI * r;
        
        // Background track
        svg.appendChild(createSVGElement('circle', {
            cx: center, cy: center, r: r,
            fill: 'none', stroke: 'var(--border-color)', 'stroke-width': thickness, opacity: '0.3'
        }));

        // Progress bar
        const ring = createSVGElement('circle', {
            cx: center, cy: center, r: r,
            fill: 'none', stroke: goal.color, 'stroke-width': thickness,
            'stroke-dasharray': circ, 'stroke-dashoffset': circ,
            'stroke-linecap': 'round', transform: `rotate(-90 ${center} ${center})`
        });

        ring.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)';
        svg.appendChild(ring);

        // Label on ring
        const label = createSVGElement('text', {
            x: center, y: center - r + 5,
            'text-anchor': 'middle', fill: 'white', 'font-size': '10', 'font-weight': 'bold'
        });
        label.textContent = goal.percent + '%';
        label.style.opacity = '0';
        label.style.transition = 'opacity 0.5s ease 1.5s';
        /** svg.appendChild(label); **/

        setTimeout(() => {
            ring.style.strokeDashoffset = circ - (goal.percent / 100) * circ;
            label.style.opacity = '1';
        }, 100 + (i * 200));
    });

    container.appendChild(svg);
  }

  /* === SVG Hexagon Badges === */
  function initBadges() {
    const container = document.querySelector('.hexagon-badges');
    if (!container) return;

    const badges = [
        { icon: '\uf005', color: 'gold', label: 'Pro' },
        { icon: '\uf06d', color: '#ff4d4d', label: 'Streak' },
        { icon: '\uf11b', color: '#00ccff', label: 'Master' },
        { icon: '\uf121', color: '#cc33ff', label: 'Logic' },
        { icon: '\uf0e7', color: 'orange', label: 'Fast' }
    ];

    const svgSize = 300;
    const svg = createSVGElement('svg', { width: '100%', height: '100%', viewBox: `0 0 ${svgSize} ${svgSize}` });
    
    // Hexagon math
    const hexWidth = 60;
    const hexHeight = 70;
    const center = svgSize / 2;

    const positions = [
        { x: center, y: center },
        { x: center - hexWidth * 0.8, y: center - hexHeight / 2 },
        { x: center + hexWidth * 0.8, y: center - hexHeight / 2 },
        { x: center - hexWidth * 0.8, y: center + hexHeight / 2 },
        { x: center + hexWidth * 0.8, y: center + hexHeight / 2 }
    ];

    positions.forEach((pos, i) => {
        const badge = badges[i];
        const group = createSVGElement('g', { transform: `translate(${pos.x}, ${pos.y})` });
        
        // Polygon points for hex
        const points = '0,-30 26,-15 26,15 0,30 -26,15 -26,-15';
        const hex = createSVGElement('polygon', {
            points: points, fill: 'var(--bg-card)', stroke: badge.color, 'stroke-width': '2'
        });
        
        const icon = createSVGElement('text', {
            x: 0, y: 5, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
            'font-family': '"Font Awesome 6 Free"', 'font-weight': '900', fill: badge.color, 'font-size': '20'
        });
        icon.textContent = badge.icon;

        group.appendChild(hex);
        group.appendChild(icon);
        
        group.style.opacity = '0';
        group.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(0)`;
        group.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        
        svg.appendChild(group);

        setTimeout(() => {
            group.style.opacity = '1';
            group.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(1)`;
        }, 500 + (i * 150));
    });

    container.appendChild(svg);
  }

  /* === User Level Progress Banner === */
  function initLevelProgress() {
    const ring = document.querySelector('.level-progress-ring');
    const text = document.querySelector('.level-progress-text');
    if (!ring) return;

    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference;

    const percent = 78; // Current progress to Level 12
    setTimeout(() => {
        ring.style.strokeDashoffset = circumference - (percent / 100) * circumference;
        if (text) animateValue(text, 0, percent, 2000, '%');
    }, 500);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* === Mobile Nav === */
  function initMobileNav() {
    document.querySelectorAll('.dashboard__mobile-nav-item').forEach(item => {
      item.addEventListener('click', function() {
        document.querySelectorAll('.dashboard__mobile-nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }

  return { init };
})();
