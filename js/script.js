// Initialize Supabase client safely
const SUPABASE_URL = (typeof window !== 'undefined' && window.VITE_SUPABASE_URL) || 'https://cqoluvwmlojqjunjkfyl.supabase.co';
const SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxb2x1dndtbG9qcWp1bmprZnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzODU2NzgsImV4cCI6MjA5NTk2MTY3OH0.ePbTh2jU3nVfvJQ96LxzxluYURa9OwvXNegkrj5NGKQ';
let supabaseClient = null;
if (typeof supabase !== 'undefined') {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Force manual scroll restoration to prevent browser from restoring scroll position
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

// Set active nav link based on current page filename (bulletproof version)
(function () {
  // Get the pathname, remove hashes and queries
  var path = window.location.pathname.split('#')[0].split('?')[0];

  // Normalize by stripping trailing slash
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // Get the last path segment
  var segment = path.split('/').pop() || 'index.html';

  // Normalize the segment: strip extension and lowercase
  var filename = segment.endsWith('.html') ? segment.slice(0, -5).toLowerCase() : segment.toLowerCase();

  // Map clean filename names to data-page values
  var pageMap = {
    'index': 'home',
    '': 'home',
    'home': 'home',
    'about': 'about',
    'services': 'services',
    'portfolio': 'portfolio',
    'technology': 'tech',
    'tech': 'tech',
    'process': 'process',
    'contact': 'contact'
  };

  var activePage = pageMap[filename] || 'home';

  // Desktop navigation highlighting
  document.querySelectorAll('.nav-link-item').forEach(function (link) {
    if (link.getAttribute('data-page') === activePage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Mobile menu navigation highlighting
  document.querySelectorAll('.mobile-menu a').forEach(function (link) {
    var linkHref = link.getAttribute('href') || '';
    var hrefSegment = linkHref.split('#')[0].split('?')[0].split('/').pop();
    var hrefName = hrefSegment.endsWith('.html') ? hrefSegment.slice(0, -5).toLowerCase() : hrefSegment.toLowerCase();
    var normalizedHrefName = pageMap[hrefName] || hrefName;
    if (normalizedHrefName === activePage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
})();


let processTimelineScrollHandler = null;
let whySectionScrollHandler = null;
const projects = {
  controltower_rag: {
    industry: 'AI Systems · Enterprise Inventory & RAG Platform',
    title: 'Control Tower RAG — Inventory Intelligence',
    problem: 'High-throughput distributors struggle with stockouts, dead inventory accumulation, and slow manual database queries across multi-warehouse operations.',
    solution: 'Engineered a LangGraph-based hybrid orchestrator combining multi-step SQL agents with Chroma vector retrieval to analyze sales velocity, predict stockout risks, and trigger automated alerts.',
    outcome: 'Eliminated manual inventory reports, automated daily stockout risk dispatches via Telegram and WhatsApp, and enabled instant plain-English database querying with sub-500ms latency.',
    stack: ['FastAPI', 'Python', 'LangChain', 'LangGraph', 'Claude 3.5 Sonnet', 'MySQL', 'ChromaDB', 'Twilio WhatsApp']
  },
  supplychain_orderbot: {
    industry: 'Supply Chain · B2B Telegram MiniApp & Order Automation',
    title: 'OrderBot — Wholesale Hub & Supply Chain Automation',
    video: 'assets/videos/order_bot.mp4',
    poster: 'assets/images/supplychain_orderbot_dashboard.webp',
    problem: 'Wholesalers and distributors rely on fragmented phone calls and manual paper order taking, causing fulfillment bottlenecks, stock discrepancies, and delayed deliveries.',
    solution: 'Built a high-performance Telegram WebApp MiniApp allowing B2B buyers to browse live product catalogs, select tiered wholesale quantities, check real-time warehouse stock, and place instant orders.',
    outcome: 'Enabled 100% zero-app-download ordering inside Telegram, instant order routing to ERP/DB, automated invoice creation, and real-time multi-warehouse stock reservation.',
    stack: ['Telegram WebApp', 'Django', 'FastAPI', 'Python', 'PostgreSQL / SQLite', 'Vanilla JS', 'WebSockets']
  },
  wa_relay: {
    industry: 'Enterprise Comms · Multi-Operator WhatsApp Relay & Gateway',
    title: 'WhatsApp ECHO Bridge — Multi-Operator Relay',
    problem: 'WhatsApp Business only allows single-device logins for support teams, leading to lost customer inquiries, lack of collaboration, and zero message audit trails.',
    solution: 'Developed a self-hosted WhatsApp ECHO bridge on the Baileys protocol with Socket.io real-time broadcast, allowing dozens of concurrent operators to manage chat streams simultaneously.',
    outcome: 'Unified customer communications across all operators in under 10ms WebSocket latency, with native message editing, full SQLite WAL message history, and Google VCF contact sync.',
    stack: ['Node.js', 'Express', 'Socket.io', 'Baileys API', 'SQLite WAL', 'PM2', 'WebSockets']
  }
};
// Aliases
projects.rag = projects.controltower_rag;
projects.orderbot = projects.supplychain_orderbot;
projects.relay = projects.wa_relay;
projects.supremex = projects.controltower_rag;
projects.finova = projects.supplychain_orderbot;
projects.chintamani = projects.wa_relay;
projects.shantilal = projects.controltower_rag;

function openModal(id) {
  const p = projects[id];
  if (!p) return;
  const body = document.getElementById('modal-body');
  const overlay = document.getElementById('modal-overlay');
  if (body && overlay) {
    let videoHtml = '';
    if (p.video) {
      videoHtml = `
        <div class="modal-video-wrapper">
          <video class="modal-video-player" controls playsinline preload="metadata" poster="${p.poster || ''}">
            <source src="${p.video}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      `;
    }
    body.innerHTML = `
      <div class="modal-industry">${p.industry}</div>
      <h2>${p.title}</h2>
      ${videoHtml}
      <div class="modal-section"><h4>// The Problem</h4><p>${p.problem}</p></div>
      <div class="modal-section"><h4>// Our Solution</h4><p>${p.solution}</p></div>
      <div class="modal-section"><h4>// Outcome</h4><p>${p.outcome}</p></div>
      <div class="modal-section"><h4>// Tech Stack</h4><div class="portfolio-stack" style="margin-top:.5rem">${p.stack.map(t => `<span class="stack-badge">${t}</span>`).join('')}</div></div>
    `;
    overlay.classList.add('open');
  }
}

function closeModal(e) {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    if (!e || e.target === overlay || (e.target && e.target.classList && e.target.classList.contains('modal-close'))) {
      const videos = overlay.querySelectorAll('video');
      videos.forEach(v => {
        v.pause();
      });
      overlay.classList.remove('open');
    }
  }
}

function filterPortfolio(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.portfolio-item').forEach(item => {
    if (cat === 'all' || item.dataset.cat === cat) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}


// Page routing - MPA mode: navigate to the real page
function showPage(name) {
  const pageMap = {
    'home': 'index.html',
    'about': 'about.html',
    'services': 'services.html',
    'portfolio': 'portfolio.html',
    'tech': 'technology.html',
    'process': 'process.html',
    'contact': 'contact.html'
  };
  const target = pageMap[name];
  if (target) window.location.href = target;
}

// WhatsApp
function openWhatsApp() {
  const msg = encodeURIComponent("I want to enquire more for my business.");
  window.open('https://wa.me/919821139201?text=' + msg, '_blank');
}

// Nav scroll with smooth transition
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const nav = document.getElementById('main-nav');
  if (nav) {
    const scrollY = window.scrollY;
    nav.classList.toggle('scrolled', scrollY > 40);
    lastScroll = scrollY;
  }
}, { passive: true });

// Mobile menu
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const body = document.body;
  if (menu && body) {
    menu.classList.toggle('open');
    body.classList.toggle('mobile-nav-open');
  }
}

// Setup About page dynamics and animation classes before Observer runs
function setupAboutPageAnimations() {
  // 1. Stagger workflow steps dynamically
  document.querySelectorAll('.about-workflow-step').forEach((step, idx) => {
    step.classList.add('reveal');
    step.style.transitionDelay = `${(idx * 0.1)}s`;
  });
  // 2. Stagger technology groups dynamically
  document.querySelectorAll('.about-tech-group').forEach((group, idx) => {
    group.classList.add('reveal');
    group.style.transitionDelay = `${(idx * 0.1)}s`;
  });
  // 3. Stagger core value cards dynamically
  document.querySelectorAll('.about-value-card').forEach((card, idx) => {
    card.classList.add('reveal');
    card.style.transitionDelay = `${(idx * 0.08)}s`;
  });
  // 4. Stagger team member cards dynamically
  document.querySelectorAll('.about-team-card').forEach((card, idx) => {
    card.classList.add('reveal');
    card.style.transitionDelay = `${(idx * 0.08)}s`;
  });
  // 5. Stagger story cards dynamically
  document.querySelectorAll('.about-story-card').forEach((card, idx) => {
    card.classList.add('reveal');
    card.style.transitionDelay = `${(idx * 0.1)}s`;
  });
}

function setupServicesAnimations() {
  document.querySelectorAll('.svc-card, .who-card, .services-workflow-step, .trust-card').forEach((card, idx) => {
    card.classList.add('reveal');
    card.style.transitionDelay = `${((idx % 4) * 0.1)}s`;
  });
  document.querySelectorAll('.services-addon-card').forEach((chip, idx) => {
    chip.classList.add('reveal');
    chip.style.transitionDelay = `${((idx % 6) * 0.05)}s`;
  });
}

function initServicesAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.services-page-hero');
  if (hero && !prefersReduced) {
    requestAnimationFrame(() => { hero.classList.add('animate'); });
  }
  if (!prefersReduced) {
    const items = document.querySelectorAll('.service-full-item');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active-service');
        } else {
          entry.target.classList.remove('active-service');
        }
      });
    }, { rootMargin: '-20% 0px -20% 0px', threshold: 0 });
    items.forEach(item => observer.observe(item));
  }
}

function setupPortfolioAnimations() {
  document.querySelectorAll('.showcase-card').forEach((card, idx) => {
    card.classList.add('reveal');
    card.style.transitionDelay = `${((idx % 3) * 0.1)}s`;
  });
}

function initPortfolioAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.portfolio-hero');
  if (hero) {
    hero.classList.remove('animate');
    if (!prefersReduced) {
      requestAnimationFrame(() => { hero.classList.add('animate'); });
    } else {
      hero.classList.add('animate');
    }
  }
}

function toggleFaq(headerEl) {
  const item = headerEl.parentElement;
  const body = item.querySelector('.faq-body');
  const allItems = document.querySelectorAll('.faq-item');
  allItems.forEach(i => {
    if (i !== item && i.classList.contains('active')) {
      i.classList.remove('active');
      i.querySelector('.faq-body').style.maxHeight = null;
    }
  });
  item.classList.toggle('active');
  if (item.classList.contains('active')) {
    body.style.maxHeight = body.scrollHeight + "px";
  } else {
    body.style.maxHeight = null;
  }
}

// Reveal on scroll with IntersectionObserver
function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.visible), .stagger-children:not(.visible)');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

// Hero word-by-word animation
function initHeroAnimation() {
  const words = document.querySelectorAll('#hero-title .word');
  const sub = document.getElementById('hero-sub');
  const actions = document.getElementById('hero-actions');
  const stats = document.getElementById('hero-stats');
  const visual = document.getElementById('hero-visual');

  // Reset animation states
  words.forEach(w => { w.classList.remove('animate'); });
  if (sub) sub.classList.remove('animate');
  if (actions) actions.classList.remove('animate');
  if (stats) stats.classList.remove('animate');
  if (visual) visual.classList.remove('animate');

  // Trigger with slight delay for smoothness
  requestAnimationFrame(() => {
    words.forEach(w => {
      w.style.animationDelay = w.closest('.line') ?
        getComputedStyle(w).getPropertyValue('--word-delay') : '0s';
      w.classList.add('animate');
    });
    if (sub) sub.classList.add('animate');
    if (actions) actions.classList.add('animate');
    if (stats) stats.classList.add('animate');
    if (visual) visual.classList.add('animate');
  });
}

// Mouse Parallax for hero devices with 3D tilt
function initHeroParallax() {
  const hero = document.getElementById('hero');
  const heroVisual = document.getElementById('hero-visual');
  const layers = document.querySelectorAll('.parallax-layer');
  const deviceComp = document.getElementById('device-comp');

  if (!hero || layers.length === 0) return;

  // Disable on mobile/touch devices or if prefers-reduced-motion is active
  if (window.matchMedia('(max-width: 768px)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    layers.forEach(layer => {
      layer.style.transform = 'translate3d(0, 0, 0)';
    });
    return;
  }

  let rafId = null;
  let mouseX = 0, mouseY = 0;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      const x = mouseX - rect.width / 2;
      const y = mouseY - rect.height / 2;
      const normX = x / (rect.width / 2);
      const normY = y / (rect.height / 2);

      layers.forEach(layer => {
        const depth = parseFloat(layer.getAttribute('data-depth')) || 0.1;
        const moveX = normX * depth * 35;
        const moveY = normY * depth * 35;
        layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      });

      // 3D tilt on device composition
      if (deviceComp) {
        const tiltX = normY * -8; // rotateX (inverted for natural feel)
        const tiltY = normX * 8;  // rotateY
        deviceComp.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      }

      rafId = null;
    });
  });

  // Reset positions when mouse leaves hero
  hero.addEventListener('mouseleave', () => {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    layers.forEach(layer => {
      layer.style.transition = 'transform 0.5s ease-out';
      layer.style.transform = 'translate3d(0, 0, 0)';
      setTimeout(() => {
        layer.style.transition = 'transform 0.12s ease-out';
      }, 500);
    });
    if (deviceComp) {
      deviceComp.style.transition = 'transform 0.5s ease-out';
      deviceComp.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      setTimeout(() => {
        deviceComp.style.transition = '';
      }, 500);
    }
  });
}

// Cursor-reactive glow for hero
function initHeroCursorGlow() {
  const heroVisual = document.getElementById('hero-visual');
  const cursorGlow = document.getElementById('hero-cursor-glow');
  if (!heroVisual || !cursorGlow) return;

  if (window.matchMedia('(max-width: 768px)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let glowRaf = null;
  heroVisual.addEventListener('mousemove', (e) => {
    if (glowRaf) return;
    glowRaf = requestAnimationFrame(() => {
      const rect = heroVisual.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cursorGlow.style.left = x + 'px';
      cursorGlow.style.top = y + 'px';
      glowRaf = null;
    });
  });
}

// Why section vertical timeline progress line and scroll activation
function initWhySectionTimeline() {
  const rightCol = document.querySelector('.why-timeline-right');
  const cards = document.querySelectorAll('.why-timeline-card-wrapper');

  if (!rightCol || cards.length === 0) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Intersection Observer for Card Activation
  let observer = null;
  if (!prefersReduced) {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -40% 0px', // Active when card is near the center area of viewport
      threshold: 0.1
    };

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const card = entry.target;
        if (entry.isIntersecting) {
          card.classList.add('active');
          card.classList.remove('completed');

          // Mark previous cards completed
          let prev = card.previousElementSibling;
          while (prev) {
            if (prev.classList.contains('why-timeline-card-wrapper')) {
              prev.classList.add('completed');
              prev.classList.remove('active');
            }
            prev = prev.previousElementSibling;
          }

          // Mark next cards inactive
          let next = card.nextElementSibling;
          while (next) {
            if (next.classList.contains('why-timeline-card-wrapper')) {
              next.classList.remove('active', 'completed');
            }
            next = next.nextElementSibling;
          }
        }
      });
    }, observerOptions);

    cards.forEach(card => observer.observe(card));
  } else {
    // Fallback for prefers-reduced-motion: all cards fully visible/active
    cards.forEach(card => card.classList.add('active'));
  }
}

// Active project card scroll highlight states (Phase 2)
function initProjectActiveStates() {
  const cards = document.querySelectorAll('.projects-showcase-stack .showcase-card');
  if (cards.length === 0) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    cards.forEach(card => {
      card.classList.add('active-project');
    });
    return;
  }

  const updateActiveStates = () => {
    let closest = null;
    let minDistance = Infinity;
    const viewportCenter = window.innerHeight / 2;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      // Calculate closeness of card center to viewport center
      const cardCenter = rect.top + rect.height / 2;
      const distanceFromCenter = Math.abs(cardCenter - viewportCenter);

      // Only track cards currently in the viewport
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (isVisible) {
        if (distanceFromCenter < minDistance) {
          minDistance = distanceFromCenter;
          closest = card;
        }
      }
    });

    if (closest) {
      cards.forEach((card) => {
        if (card === closest) {
          card.classList.add('active-project');
          card.classList.remove('completed-project');
        } else {
          card.classList.remove('active-project');
          // Mark as completed if scrolled past (above the active card)
          const closestIndex = Array.from(cards).indexOf(closest);
          const cardIndex = Array.from(cards).indexOf(card);
          if (cardIndex < closestIndex) {
            card.classList.add('completed-project');
          } else {
            card.classList.remove('completed-project');
          }
        }
      });
    }
  };

  const stack = document.querySelector('.projects-showcase-stack');
  if (stack) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.05
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', scrollHandler, { passive: true });
          updateActiveStates();
        } else {
          window.removeEventListener('scroll', scrollHandler);
        }
      });
    }, observerOptions);

    observer.observe(stack);
  }

  let rAF;
  function scrollHandler() {
    if (rAF) cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(updateActiveStates);
  }

  // Initial check
  updateActiveStates();
}


// Process page timeline vertical scroll filling and step activation
function initProcessTimeline() {
  const timeline = document.querySelector('.process-page-timeline');
  const activeLine = document.querySelector('.process-page-line-active');
  const steps = document.querySelectorAll('.process-page-step');

  if (!timeline || !activeLine || steps.length === 0) return;

  // Clean up any existing listener to prevent duplicates
  if (processTimelineScrollHandler) {
    window.removeEventListener('scroll', processTimelineScrollHandler);
  }

  function handleScroll() {
    const rect = timeline.getBoundingClientRect();
    const timelineHeight = rect.height;

    // Use 45% of viewport as the scroll trigger point
    const triggerPoint = window.innerHeight * 0.45;
    const scrolledDistance = triggerPoint - rect.top;

    // Calculate percentage (clamped between 0 and 100)
    let pct = (scrolledDistance / timelineHeight) * 100;
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;

    activeLine.style.height = `${pct}%`;

    // Determine the active step (closest to triggerPoint)
    let currentActiveIndex = 0;
    let minDistance = Infinity;

    steps.forEach((step, idx) => {
      const stepRect = step.getBoundingClientRect();
      const stepCenter = stepRect.top + stepRect.height / 2;
      const distance = Math.abs(stepCenter - triggerPoint);

      if (distance < minDistance) {
        minDistance = distance;
        currentActiveIndex = idx;
      }
    });

    steps.forEach((step, idx) => {
      if (idx === currentActiveIndex) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  // Bind scroll handler
  processTimelineScrollHandler = handleScroll;
  window.addEventListener('scroll', processTimelineScrollHandler, { passive: true });

  // Initial call to set state immediately
  handleScroll();
}

// Preloader Animation
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let loaderShown = false;
  try {
    loaderShown = sessionStorage.getItem('loaderShown');
  } catch (e) {
    console.warn("sessionStorage is not available:", e);
  }

  if (prefersReduced || loaderShown) {
    preloader.style.display = 'none';
    preloader.remove();
    document.body.classList.remove('preloader-active');
    return;
  }

  // 1. After wave rise completes (2.8s), trigger overlay zoom-out (includes background & content)
  setTimeout(() => {
    preloader.classList.add('zoom-out');
    document.body.classList.remove('preloader-active');
  }, 2800);

  // 2. Remove loader completely from DOM after animation completes (1.1s zoom duration)
  setTimeout(() => {
    preloader.remove();
    try {
      sessionStorage.setItem('loaderShown', 'true');
    } catch (e) {
      console.warn("Unable to save to sessionStorage:", e);
    }
  }, 3900);
}

// Theme Toggle Logic
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Card tilt with smooth tracking
function tiltCard(el, e) {
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
  el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
}

// Email validation
function isValidEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

// Form submit with validation, honeypot, cooldown, loading state and Supabase integration
async function submitForm() {
  const nameEl = document.getElementById('f-name');
  const emailEl = document.getElementById('f-email');
  const phoneEl = document.getElementById('f-phone');
  const serviceEl = document.getElementById('f-service');
  const msgEl = document.getElementById('f-msg');
  const honeyEl = document.getElementById('f-website');
  const btn = document.getElementById('submit-btn');
  const errGlobal = document.getElementById('form-error-global');

  if (!nameEl || !emailEl || !phoneEl || !serviceEl || !msgEl || !btn) return;

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const phone = phoneEl.value.trim();
  const service = serviceEl.value.trim();
  const msg = msgEl.value.trim();
  const honey = honeyEl ? honeyEl.value.trim() : '';

  // Reset errors
  ['fg-name', 'fg-email', 'fg-phone', 'fg-service', 'fg-msg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error');
  });
  if (errGlobal) {
    errGlobal.style.display = 'none';
    errGlobal.textContent = '';
  }

  let hasError = false;

  // 1. Name validation
  if (!name || name.length > 100) {
    const fgName = document.getElementById('fg-name');
    const err = fgName ? fgName.querySelector('.form-error') : null;
    if (fgName) fgName.classList.add('error');
    if (err) err.textContent = 'Please enter your name (max 100 chars)';
    hasError = true;
  }

  // 2. Email validation
  if (!email || !isValidEmail(email) || email.length > 150) {
    const fgEmail = document.getElementById('fg-email');
    const err = fgEmail ? fgEmail.querySelector('.form-error') : null;
    if (fgEmail) fgEmail.classList.add('error');
    if (err) err.textContent = 'âŒ Please enter a valid email address.';
    hasError = true;
  }

  // 3. Phone validation
  const phoneRegex = /^\d{10}$/;
  if (!phone || !phoneRegex.test(phone)) {
    const fgPhone = document.getElementById('fg-phone');
    const err = fgPhone ? fgPhone.querySelector('.form-error') : null;
    if (fgPhone) fgPhone.classList.add('error');
    if (err) err.textContent = 'âŒ Please enter a valid 10-digit mobile number.';
    hasError = true;
  }

  // 4. Service validation
  if (!service) {
    const fgService = document.getElementById('fg-service');
    const err = fgService ? fgService.querySelector('.form-error') : null;
    if (fgService) fgService.classList.add('error');
    if (err) err.textContent = 'Please select a service';
    hasError = true;
  }

  // 5. Msg validation
  if (!msg || msg.length > 1000) {
    const fgMsg = document.getElementById('fg-msg');
    const err = fgMsg ? fgMsg.querySelector('.form-error') : null;
    if (fgMsg) fgMsg.classList.add('error');
    if (err) err.textContent = 'Please tell us about your project (max 1000 chars)';
    hasError = true;
  }

  if (hasError) return;

  // Honeypot Protection (Reject silently)
  if (honey) {
    console.warn('Honeypot triggered.');
    showSuccessState();
    return;
  }

  // Cooldown Protection
  const COOLDOWN_MS = 60000;
  const lastSubmit = sessionStorage.getItem('last_submit_time');
  const now = Date.now();
  if (lastSubmit && (now - parseInt(lastSubmit, 10) < COOLDOWN_MS)) {
    if (errGlobal) {
      errGlobal.textContent = 'âŒ Too many submissions. Please wait a moment before trying again.';
      errGlobal.style.display = 'block';
    }
    return;
  }

  // Loading state
  btn.disabled = true;
  const originalBtnHtml = btn.innerHTML;
  btn.innerHTML = '<span><span class="spinner"></span>Sending...</span>';

  // Submit to Supabase
  try {
    if (!supabaseClient) {
      throw new Error('Supabase client is not initialized.');
    }

    // Generate UUID on the client to avoid RLS SELECT requirement
    const leadId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    const createdAt = new Date().toISOString();

    const record = {
      id: leadId,
      name,
      email,
      phone,
      service,
      project_description: msg,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      status: 'New',
      source: 'Website Contact Form',
      created_at: createdAt
    };

    const { error } = await supabaseClient.from('contact_leads').insert([record]);

    if (error) throw error;

    // Save last submit time for cooldown
    sessionStorage.setItem('last_submit_time', now.toString());

    // Invoke the Supabase Edge Function to send email
    supabaseClient.functions.invoke('send-lead-email', {
      body: record
    }).catch(invokeErr => {
      console.error('Edge Function email notification failed:', invokeErr);
    });

    // Show success state
    showSuccessState();

  } catch (err) {
    console.error('Submission failed:', err);
    if (errGlobal) {
      errGlobal.innerHTML = 'âŒ Unable to submit your inquiry right now.<br>Please try again later or contact us directly through WhatsApp.';
      errGlobal.style.display = 'block';
    }
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalBtnHtml;
  }

  function showSuccessState() {
    const formContainer = document.getElementById('form-container');
    const formSuccess = document.getElementById('form-success');
    if (formContainer) formContainer.style.display = 'none';
    if (formSuccess) formSuccess.style.display = 'block';
    setCharacterState('success');

    // Reset form inputs
    if (nameEl) nameEl.value = '';
    if (emailEl) emailEl.value = '';
    if (phoneEl) phoneEl.value = '';
    if (serviceEl) serviceEl.value = '';
    if (msgEl) msgEl.value = '';
  }
}

// Contact page animated assistant logic
let typingTimeout = null;
let contactListenersBound = false;

function setCharacterState(state) {
  const char = document.getElementById('contact-char');
  if (!char) return;
  char.className = 'character-container ' + state;
}

// Real-time form validation
function setupRealTimeValidation() {
  const nameInput = document.getElementById('f-name');
  const emailInput = document.getElementById('f-email');
  const phoneInput = document.getElementById('f-phone');
  const serviceInput = document.getElementById('f-service');
  const msgInput = document.getElementById('f-msg');

  if (!nameInput || !emailInput || !phoneInput || !serviceInput || !msgInput) return;

  function validateField(input, fgId, errorMsg, validationFn) {
    const fg = document.getElementById(fgId);
    const errDiv = fg ? fg.querySelector('.form-error') : null;
    if (!fg || !errDiv) return;

    const val = input.value;
    const trimmed = val.trim();
    const isValid = validationFn(trimmed, val);

    if (!isValid) {
      fg.classList.add('error');
      errDiv.textContent = errorMsg;
    } else {
      fg.classList.remove('error');
    }
  }

  nameInput.addEventListener('input', () => {
    validateField(nameInput, 'fg-name', 'Please enter your name (max 100 chars)', (t) => t.length > 0 && t.length <= 100);
  });
  nameInput.addEventListener('blur', () => {
    validateField(nameInput, 'fg-name', 'Please enter your name (max 100 chars)', (t) => t.length > 0 && t.length <= 100);
  });

  emailInput.addEventListener('input', () => {
    validateField(emailInput, 'fg-email', 'âŒ Please enter a valid email address.', (t) => t.length > 0 && isValidEmail(t) && t.length <= 150);
  });
  emailInput.addEventListener('blur', () => {
    validateField(emailInput, 'fg-email', 'âŒ Please enter a valid email address.', (t) => t.length > 0 && isValidEmail(t) && t.length <= 150);
  });

  const phoneRegex = /^\d{10}$/;
  phoneInput.addEventListener('input', () => {
    validateField(phoneInput, 'fg-phone', 'âŒ Please enter a valid 10-digit mobile number.', (t) => phoneRegex.test(t));
  });
  phoneInput.addEventListener('blur', () => {
    validateField(phoneInput, 'fg-phone', 'âŒ Please enter a valid 10-digit mobile number.', (t) => phoneRegex.test(t));
  });

  serviceInput.addEventListener('change', () => {
    validateField(serviceInput, 'fg-service', 'Please select a service', (t) => t.length > 0);
  });
  serviceInput.addEventListener('blur', () => {
    validateField(serviceInput, 'fg-service', 'Please select a service', (t) => t.length > 0);
  });

  msgInput.addEventListener('input', () => {
    validateField(msgInput, 'fg-msg', 'Please tell us about your project (max 1000 chars)', (t) => t.length > 0 && t.length <= 1000);
  });
  msgInput.addEventListener('blur', () => {
    validateField(msgInput, 'fg-msg', 'Please tell us about your project (max 1000 chars)', (t) => t.length > 0 && t.length <= 1000);
  });
}

function initContactCharacter() {
  const char = document.getElementById('contact-char');
  const nameInput = document.getElementById('f-name');
  const emailInput = document.getElementById('f-email');
  const phoneInput = document.getElementById('f-phone');
  const serviceInput = document.getElementById('f-service');
  const msgInput = document.getElementById('f-msg');

  if (!char || !nameInput || !emailInput || !serviceInput || !msgInput) return;

  // Set initial idle state
  setCharacterState('idle');

  if (contactListenersBound) return;
  contactListenersBound = true;

  const inputs = [
    { el: nameInput, state: 'focus-name' },
    { el: emailInput, state: 'focus-email' },
    { el: phoneInput, state: 'focus-email' },
    { el: serviceInput, state: 'focus-service' },
    { el: msgInput, state: 'focus-msg' }
  ].filter(item => item.el !== null);

  // Bind real-time validation
  setupRealTimeValidation();

  inputs.forEach(item => {
    // Focus listener
    item.el.addEventListener('focus', () => {
      if (char.classList.contains('success')) return;
      setCharacterState(item.state);
    });

    // Blur listener
    item.el.addEventListener('blur', () => {
      if (char.classList.contains('success')) return;
      setTimeout(() => {
        const active = document.activeElement;
        const isFocusingForm = inputs.some(i => i.el === active);
        if (!isFocusingForm && !char.classList.contains('success')) {
          setCharacterState('idle');
        }
      }, 50);
    });

    // Typing listener
    item.el.addEventListener('input', () => {
      if (char.classList.contains('success')) return;
      setCharacterState('typing');

      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        if (document.activeElement === item.el) {
          setCharacterState(item.state);
        } else {
          setCharacterState('idle');
        }
      }, 800);
    });
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  initPreloader();
  setupAboutPageAnimations();
  setupServicesAnimations();
  setupPortfolioAnimations();
  initReveal();
  if (document.getElementById('hero-title')) { initHeroAnimation(); }
  if (document.getElementById('hero')) { initHeroParallax(); }
  if (document.getElementById('hero-visual')) { initHeroCursorGlow(); }
  if (document.querySelector('.why-timeline-right')) { initWhySectionTimeline(); }
  if (document.querySelector('.projects-showcase-stack, .showcase-card')) { initProjectActiveStates(); }
  initTheme();
  // Auto-init page-specific features based on element presence
  if (document.getElementById('contact-char')) { initContactCharacter(); }
  if (document.querySelector('.process-page-timeline')) { initProcessTimeline(); }

  if (document.querySelector('.services-page-hero')) { initServicesAnimations(); }
  if (document.querySelector('.benefits-slider')) { initBenefitsSlider(); }
  if (document.querySelector('.portfolio-hero')) { initPortfolioAnimations(); }
  if (document.querySelector('.who-flip-card')) { initWhoFlipCard(); }

  // Animate counters after a delay
  if (typeof animateCounters === 'function' && document.querySelector('.stat-number')) { setTimeout(animateCounters, 1200); }

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeProjectOverview();
    }
  });

  // Remove input errors on focus
  document.querySelectorAll('#form-container input, #form-container textarea').forEach(input => {
    input.addEventListener('focus', () => {
      const group = input.closest('.form-group');
      if (group) group.classList.remove('error');
    });
  });

  // Check query parameter for portfolio detail modal on portfolio.html page
  if (window.location.pathname.includes('portfolio.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project');
    if (projectId && typeof openModal === 'function') {
      // Open the modal after a slight delay to allow smooth loading
      setTimeout(() => {
        openModal(projectId);
      }, 600);
    }
  }
});



(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.matchMedia({
    "(min-width: 769px)": function () {
      const cards = gsap.utils.toArray('.services-carousel-track .service-card');
      const dots = gsap.utils.toArray('.carousel-dots .dot');

      if (cards.length === 0) return;

      // Define 3D carousel states for cards (0 to 4)
      const states = [
        // State 0 (first card active in center)
        [
          { x: 0, rotateY: 0, scale: 1, opacity: 1, filter: "blur(0px)", zIndex: 10 },
          { x: 300, rotateY: -35, scale: 0.8, opacity: 0.5, filter: "blur(2px)", zIndex: 8 },
          { x: 550, rotateY: -45, scale: 0.6, opacity: 0.15, filter: "blur(4px)", zIndex: 5 },
          { x: 750, rotateY: -45, scale: 0.4, opacity: 0, filter: "blur(6px)", zIndex: 2 },
          { x: 950, rotateY: -45, scale: 0.4, opacity: 0, filter: "blur(6px)", zIndex: 1 }
        ],
        // State 1 (second card active in center)
        [
          { x: -300, rotateY: 35, scale: 0.8, opacity: 0.5, filter: "blur(2px)", zIndex: 8 },
          { x: 0, rotateY: 0, scale: 1, opacity: 1, filter: "blur(0px)", zIndex: 10 },
          { x: 300, rotateY: -35, scale: 0.8, opacity: 0.5, filter: "blur(2px)", zIndex: 8 },
          { x: 550, rotateY: -45, scale: 0.6, opacity: 0.15, filter: "blur(4px)", zIndex: 5 },
          { x: 750, rotateY: -45, scale: 0.4, opacity: 0, filter: "blur(6px)", zIndex: 1 }
        ],
        // State 2 (third card active in center)
        [
          { x: -550, rotateY: 45, scale: 0.6, opacity: 0.15, filter: "blur(4px)", zIndex: 5 },
          { x: -300, rotateY: 35, scale: 0.8, opacity: 0.5, filter: "blur(2px)", zIndex: 8 },
          { x: 0, rotateY: 0, scale: 1, opacity: 1, filter: "blur(0px)", zIndex: 10 },
          { x: 300, rotateY: -35, scale: 0.8, opacity: 0.5, filter: "blur(2px)", zIndex: 8 },
          { x: 550, rotateY: -45, scale: 0.6, opacity: 0.15, filter: "blur(4px)", zIndex: 5 }
        ],
        // State 3 (fourth card active in center)
        [
          { x: -750, rotateY: 45, scale: 0.4, opacity: 0, filter: "blur(6px)", zIndex: 1 },
          { x: -550, rotateY: 45, scale: 0.6, opacity: 0.15, filter: "blur(4px)", zIndex: 5 },
          { x: -300, rotateY: 35, scale: 0.8, opacity: 0.5, filter: "blur(2px)", zIndex: 8 },
          { x: 0, rotateY: 0, scale: 1, opacity: 1, filter: "blur(0px)", zIndex: 10 },
          { x: 300, rotateY: -35, scale: 0.8, opacity: 0.5, filter: "blur(2px)", zIndex: 8 }
        ],
        // State 4 (fifth card active in center)
        [
          { x: -950, rotateY: 45, scale: 0.4, opacity: 0, filter: "blur(6px)", zIndex: 1 },
          { x: -750, rotateY: 45, scale: 0.4, opacity: 0, filter: "blur(6px)", zIndex: 2 },
          { x: -550, rotateY: 45, scale: 0.6, opacity: 0.15, filter: "blur(4px)", zIndex: 5 },
          { x: -300, rotateY: 35, scale: 0.8, opacity: 0.5, filter: "blur(2px)", zIndex: 8 },
          { x: 0, rotateY: 0, scale: 1, opacity: 1, filter: "blur(0px)", zIndex: 10 }
        ]
      ];

      // Initial positions
      cards.forEach((card, idx) => {
        gsap.set(card, states[0][idx]);
      });

      // Pinned scroll-controlled timeline
      const servicesTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".services-section",
          start: "top top",
          end: "+=260%", // scroll distance
          scrub: true,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          onUpdate: self => {
            // Find active card index (0 to 4)
            const activeIdx = Math.round(self.progress * (cards.length - 1));
            cards.forEach((card, idx) => {
              if (idx === activeIdx) {
                card.classList.add('active-card');
                card.style.pointerEvents = 'auto';
              } else {
                card.classList.remove('active-card');
                card.style.pointerEvents = 'none';
              }
            });
            // Update dots
            dots.forEach((dot, idx) => {
              if (idx === activeIdx) {
                dot.classList.add('active');
              } else {
                dot.classList.remove('active');
              }
            });
          }
        }
      });

      // Map transitions onto ScrollTrigger timeline
      for (let step = 0; step < 4; step++) {
        const nextStep = step + 1;
        cards.forEach((card, idx) => {
          servicesTl.to(card, {
            x: states[nextStep][idx].x,
            rotateY: states[nextStep][idx].rotateY,
            scale: states[nextStep][idx].scale,
            opacity: states[nextStep][idx].opacity,
            filter: states[nextStep][idx].filter,
            zIndex: states[nextStep][idx].zIndex,
            duration: 1,
            ease: "power1.inOut"
          }, step);
        });
      }
    },

    // Mobile scroll-driven horizontal slide animation
    "(max-width: 767px)": function () {
      const wrapper = document.querySelector('.services-carousel-wrapper');
      const track = document.querySelector('.services-carousel-track');
      const cards = gsap.utils.toArray('.services-carousel-track .service-card');
      const dots = gsap.utils.toArray('.carousel-dots .dot');

      if (cards.length === 0 || !track || !wrapper) return;

      let cardStep = 0;
      let maxTranslate = 0;
      let totalScroll = 0;

      const servicesST = ScrollTrigger.create({
        trigger: ".services-section",
        start: "top top",
        end: () => {
          const totalCards = cards.length;
          totalScroll = window.innerHeight * (totalCards - 1);

          // Calculate step and maxTranslate dynamically from DOM offsets
          if (totalCards > 1) {
            cardStep = cards[1].offsetLeft - cards[0].offsetLeft;
          } else {
            cardStep = 0;
          }
          maxTranslate = cardStep * (totalCards - 1);

          console.log("[What We Build Mobile Init/Refresh]:");
          console.log("totalCards detected:", totalCards);
          console.log("card titles detected:", cards.map(c => c.querySelector('.service-title')?.textContent.trim() || c.className));
          console.log("cardStep:", cardStep);
          console.log("maxTranslate:", maxTranslate);
          console.log("dynamic end scroll height:", totalScroll);

          return "+=" + totalScroll;
        },
        scrub: true,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: self => {
          const totalCards = cards.length;
          totalScroll = window.innerHeight * (totalCards - 1);
          if (totalCards > 1) {
            cardStep = cards[1].offsetLeft - cards[0].offsetLeft;
          } else {
            cardStep = 0;
          }
          maxTranslate = cardStep * (totalCards - 1);
        },
        onUpdate: self => {
          let progress = self.progress;

          // Clamp progress between 0 and 1
          progress = Math.min(Math.max(progress, 0), 1);

          // Calculate translateX and clamp it strictly between 0 and maxTranslate
          const translateX = -Math.min(Math.max(progress * maxTranslate, 0), maxTranslate);

          // Apply translation directly
          gsap.set(track, { x: translateX });

          // Debugging log at milestones
          if (self.progress === 0 || self.progress === 1 || Math.abs(self.progress - 0.5) < 0.01) {
            console.log(`[What We Build Mobile Update] self.progress: ${self.progress.toFixed(3)}, progress: ${progress.toFixed(3)}, translateX: ${translateX.toFixed(2)}`);
          }

          // Update active card class and pagination dots
          const activeIdx = Math.round(progress * (cards.length - 1));
          cards.forEach((card, idx) => {
            if (idx === activeIdx) {
              card.classList.add('active-card');
            } else {
              card.classList.remove('active-card');
            }
          });
          dots.forEach((dot, idx) => {
            if (idx === activeIdx) {
              dot.classList.add('active');
            } else {
              dot.classList.remove('active');
            }
          });
        }
      });

      // Mobile Touch Swipe Gesture Mapping
      let touchStartX = 0;
      let touchStartY = 0;

      track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      track.addEventListener('touchmove', (e) => {
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchStartX - touchX;
        const deltaY = touchStartY - touchY;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
          const scrollTriggerInstance = servicesST;
          if (scrollTriggerInstance) {
            const factor = 1.2; // swipe sensitivity
            window.scrollBy(0, deltaX * factor);
            touchStartX = touchX;
          }
        }
      }, { passive: true });

      // Dot click navigation on mobile
      dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          const scrollTriggerInstance = servicesST;
          if (scrollTriggerInstance) {
            const targetProgress = idx / (cards.length - 1);
            const start = scrollTriggerInstance.start;
            const end = scrollTriggerInstance.end;
            const targetScroll = start + targetProgress * (end - start);
            window.scrollTo({
              top: targetScroll,
              behavior: 'smooth'
            });
          }
        });
      });
    }
  });
})();

// =========================================================================
// WHO BENEFITS MOST: OVERLAPPING CMS STACKING SLIDER
// =========================================================================
let currentBenefitIndex = 0;
let benefitsCards = [];
let benefitsPrevBtn = null;
let benefitsNextBtn = null;

function initBenefitsSlider() {
  const slider = document.querySelector('.benefits-slider');
  if (!slider) return;

  benefitsCards = slider.querySelectorAll('.benefits-card');
  if (benefitsCards.length === 0) return;

  // Dynamically create arrow buttons if they do not exist
  benefitsPrevBtn = slider.querySelector('.benefits-prev');
  benefitsNextBtn = slider.querySelector('.benefits-next-button');

  if (!benefitsPrevBtn || !benefitsNextBtn) {
    // Create navigation wrapper
    const navWrapper = document.createElement('div');
    navWrapper.className = 'benefits-nav-wrapper';
    navWrapper.style.cssText = 'display: flex; justify-content: flex-start; gap: 1.5rem; margin-top: 2.5rem;';

    // Prev Button
    if (!benefitsPrevBtn) {
      benefitsPrevBtn = document.createElement('button');
      benefitsPrevBtn.className = 'benefits-prev';
      benefitsPrevBtn.innerHTML = 'â†';
      benefitsPrevBtn.setAttribute('aria-label', 'Previous Slide');
      navWrapper.appendChild(benefitsPrevBtn);
    }

    // Next Button
    if (!benefitsNextBtn) {
      benefitsNextBtn = document.createElement('button');
      benefitsNextBtn.className = 'benefits-next-button';
      benefitsNextBtn.innerHTML = 'â†’';
      benefitsNextBtn.setAttribute('aria-label', 'Next Slide');
      navWrapper.appendChild(benefitsNextBtn);
    }

    slider.appendChild(navWrapper);

    // Dynamically insert standard styling into page head
    const styleEl = document.createElement('style');
    styleEl.textContent = `
          .benefits-nav-wrapper {
            position: relative;
            z-index: 10;
          }
          .benefits-prev, .benefits-next-button {
            background: var(--surface);
            border: 1px solid var(--border2);
            color: var(--text);
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1.25rem;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            outline: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }
          .benefits-prev:hover, .benefits-next-button:hover {
            background: var(--accent);
            color: white;
            border-color: var(--accent);
            transform: translateY(-2px);
            box-shadow: 0 6px 18px var(--glow);
          }
          .benefits-prev:active, .benefits-next-button:active {
            transform: translateY(0);
          }
          .benefits-prev:disabled, .benefits-next-button:disabled {
            opacity: 0.25;
            cursor: not-allowed;
            transform: none !important;
            box-shadow: none !important;
          }
        `;
    document.head.appendChild(styleEl);
  }

  // Bind Listeners
  benefitsPrevBtn.addEventListener('click', goToPrevBenefit);
  benefitsNextBtn.addEventListener('click', goToNextBenefit);

  // Initialize display state
  updateBenefitsSlider();
}

function updateBenefitsSlider() {
  if (benefitsCards.length === 0) return;

  benefitsCards.forEach((card, idx) => {
    // Reset classes to base
    card.className = 'who-card benefits-card';

    let diff = (idx - currentBenefitIndex + benefitsCards.length) % benefitsCards.length;

    // Assign class dynamically based on 7-card stacking logic
    if (diff === 0) {
      card.classList.add('benefits-active');
    } else if (diff === 1) {
      card.classList.add('benefits-next');
    } else if (diff === 2) {
      card.classList.add('benefits-third');
    } else if (diff === 3) {
      card.classList.add('benefits-fourth');
    } else if (diff === 4) {
      card.classList.add('benefits-fifth');
    } else if (diff === 5) {
      card.classList.add('benefits-sixth');
    } else if (diff === 6) {
      card.classList.add('benefits-seventh');
    } else if (diff === benefitsCards.length - 1 && benefitsCards.length > 7) {
      card.classList.add('benefits-past');
    } else {
      card.classList.add('benefits-far');
    }
  });

  // Buttons are never disabled in infinite loop mode
  if (benefitsPrevBtn) {
    benefitsPrevBtn.disabled = false;
  }
  if (benefitsNextBtn) {
    benefitsNextBtn.disabled = false;
  }
}

function goToNextBenefit() {
  if (benefitsCards.length > 0) {
    currentBenefitIndex = (currentBenefitIndex + 1) % benefitsCards.length;
    updateBenefitsSlider();
  }
}

function goToPrevBenefit() {
  if (benefitsCards.length > 0) {
    currentBenefitIndex = (currentBenefitIndex - 1 + benefitsCards.length) % benefitsCards.length;
    updateBenefitsSlider();
  }
}

function initWhoFlipCard() {
  const flipCards = document.querySelectorAll('.who-flip-card');
  flipCards.forEach(flipCard => {
    flipCard.addEventListener('click', (e) => {
      // Do not toggle flip when clicking interactive links
      if (e.target.closest('a')) {
        return;
      }

      // Toggle flipped state on mobile width or devices that do not support hover interaction
      if (window.innerWidth < 768 || !window.matchMedia('(hover: hover)').matches) {
        flipCard.classList.toggle('flipped');
      }
    });
  });
}

// =========================================================================
// PROJECT OVERVIEW MODAL SYSTEM
// =========================================================================
const projectOverviewData = {
  controltower_rag: {
    title: 'Control Tower RAG — Inventory Intelligence & Decision Engine',
    tag: 'AI Systems · Enterprise Inventory & RAG Platform',
    overview: 'Control Tower RAG is an enterprise AI inventory monitoring and decision intelligence platform. It features multi-agent LangChain and LangGraph hybrid orchestrators, real-time MySQL database inspection, dead inventory detection, stockout prediction based on daily sales velocity, and automated multi-channel alert dispatches.',
    problem: 'High-throughput distributors struggle with stockouts, dead inventory accumulation, and slow manual database queries across multi-warehouse operations.',
    features: [
      'Intelligent Natural Language to SQL Agent querying',
      'Real-time stockout prediction & sales velocity tracking',
      'LangGraph hybrid routing (Vector docs + Live SQL)',
      'Automated alert dispatches (Telegram Bot, SMTP HTML, Twilio WhatsApp)',
      'In-memory snapshot caching & response versioning',
      'Multi-warehouse product inventory management'
    ],
    tech: ['FastAPI', 'Python', 'LangChain', 'LangGraph', 'Claude 3.5 Sonnet', 'MySQL / SQLAlchemy', 'ChromaDB', 'APScheduler'],
    status: 'Live Enterprise System',
    statusClass: 'live'
  },
  supplychain_orderbot: {
    title: 'OrderBot — Wholesale Hub & Supply Chain Automation',
    tag: 'Supply Chain · B2B Telegram MiniApp & Order Automation',
    video: 'assets/videos/order_bot.mp4',
    poster: 'assets/images/supplychain_orderbot_dashboard.webp',
    overview: 'A modern B2B supply chain ordering and distributor management system built as a high-speed Telegram WebApp MiniApp and robust backend. Automates wholesale product discovery, real-time inventory checks, bulk shopping carts, wholesale tiered pricing, and direct invoice routing.',
    problem: 'Wholesalers and distributors rely on fragmented phone calls and manual paper order taking, causing fulfillment bottlenecks, stock discrepancies, and delayed deliveries.',
    features: [
      'Telegram WebApp MiniApp for zero-install mobile ordering',
      'Real-time catalog search & SKU filtering across categories',
      'Live multi-warehouse inventory sync & stock reservation',
      'B2B bulk shopping cart with tiered wholesale pricing',
      'Automated distributor order validation & invoice generation',
      'Customer and distributor verification workflows'
    ],
    tech: ['Telegram WebApp', 'Django', 'FastAPI', 'Python', 'PostgreSQL / SQLite', 'Vanilla JS', 'WebSockets'],
    status: 'Live Client System',
    statusClass: 'live'
  },
  wa_relay: {
    title: 'WhatsApp ECHO Bridge — Multi-Operator Relay & Gateway',
    tag: 'Enterprise Comms · Multi-Operator WhatsApp Relay & Gateway',
    overview: 'A high-concurrency self-hosted WhatsApp ECHO bridge and customer communications relay built on Node.js and the Baileys protocol. Enables dozens of support operators to collaborate on a single WhatsApp business line in real-time with full message persistence, live WebSocket synchronization, media handling, and audit trails.',
    problem: 'Single-session WhatsApp limitations prevent support teams from collaborating on customer chats, tracking message history, or handling concurrent customer inquiries.',
    features: [
      'Multi-operator live presence & concurrent chat assignment',
      'Real-time bi-directional message broadcast via WebSockets (<10ms)',
      'Native protocol message editing & message recall',
      'Persistent SQLite message history & attachment caching',
      'Google VCF automated contact resolution & address book sync',
      'PM2 process management with 99.98% uptime'
    ],
    tech: ['Node.js', 'Express', 'Socket.io', 'Baileys WhatsApp API', 'SQLite WAL', 'PM2', 'WebSockets'],
    status: 'Production Deployed',
    statusClass: 'live'
  }
};
// Aliases
projectOverviewData.rag = projectOverviewData.controltower_rag;
projectOverviewData.orderbot = projectOverviewData.supplychain_orderbot;
projectOverviewData.relay = projectOverviewData.wa_relay;
projectOverviewData.supremex = projectOverviewData.controltower_rag;
projectOverviewData.finova = projectOverviewData.supplychain_orderbot;
projectOverviewData.chintamani = projectOverviewData.wa_relay;
projectOverviewData.shantilal = projectOverviewData.controltower_rag;

function openProjectOverview(id) {
  const data = projectOverviewData[id];
  if (!data) return;

  const contentContainer = document.getElementById('project-modal-content');
  const overlay = document.getElementById('project-overview-modal');
  if (!contentContainer || !overlay) return;

  const featuresHtml = data.features.map(f => `<li>${f}</li>`).join('');
  const techHtml = data.tech.map(t => `<span class="project-modal-tech-badge">${t}</span>`).join('');

  let videoHtml = '';
  if (data.video) {
    videoHtml = `
      <div class="project-modal-video-wrapper">
        <video class="project-modal-video-player" controls playsinline preload="metadata" poster="${data.poster || ''}">
          <source src="${data.video}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    `;
  }

  contentContainer.innerHTML = `
    <div class="project-modal-body">
      <div class="project-modal-meta">
        <span class="project-modal-industry">${data.tag}</span>
        <span class="project-modal-status ${data.statusClass}">${data.status}</span>
      </div>
      <h2 class="project-modal-title">${data.title}</h2>
      
      ${videoHtml}

      <div class="project-modal-section">
        <h4>// Overview</h4>
        <p>${data.overview}</p>
      </div>
      
      <div class="project-modal-section">
        <h4>// Problem Solved</h4>
        <p>${data.problem}</p>
      </div>
      
      <div class="project-modal-section">
        <h4>// Core Features</h4>
        <ul class="project-modal-features-list">
          ${featuresHtml}
        </ul>
      </div>
      
      <div class="project-modal-section" style="margin-bottom: 0;">
        <h4>// Technology</h4>
        <div class="project-modal-tech-stack">
          ${techHtml}
        </div>
      </div>
    </div>
  `;

  // Calculate scrollbar width to prevent page shift
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);

  overlay.classList.add('open');
  document.body.classList.add('project-modal-open');
}

function closeProjectOverview() {
  const overlay = document.getElementById('project-overview-modal');
  if (!overlay) return;

  const videos = overlay.querySelectorAll('video');
  videos.forEach(v => {
    v.pause();
  });

  overlay.classList.remove('open');
  document.body.classList.remove('project-modal-open');
  document.body.style.removeProperty('--scrollbar-width');
}

function handleProjectModalBackdropClick(event) {
  if (event.target.classList.contains('project-modal-overlay')) {
    closeProjectOverview();
  }
}