// ── Mobile Menu ─────────────────────────────────────────────────────────────
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobile-menu');
const iconMenu    = document.getElementById('icon-open-menu');
const iconClose   = document.getElementById('icon-close-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('is-open', isOpen);
    if (iconMenu)  iconMenu.style.display  = isOpen ? 'none'  : 'block';
    if (iconClose) iconClose.style.display = isOpen ? 'block' : 'none';
  });

  // Close mobile menu when a link is clicked
  mobileMenu.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('is-open');
      if (iconMenu)  iconMenu.style.display  = 'block';
      if (iconClose) iconClose.style.display = 'none';
    });
  });
}

// ── Scroll-reveal (IntersectionObserver) ────────────────────────────────────
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '-60px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── IDE tab switching ────────────────────────────────────────────────────────
const sidebarFiles = document.querySelectorAll('.ide-sidebar .sidebar-file[data-panel]');
const mobileTabs   = document.querySelectorAll('.ide-mobile-tabs .mobile-tab[data-panel]');
const codePanels   = document.querySelectorAll('.ide-editor .code-area[data-panel]');
const ideFilename  = document.querySelector('.ide-filename span');

const panelFilenames = {
  design:  'web_design.html -Paladeno',
  speed:   'performance.ts -Paladeno',
  privacy: 'privacy.config -Paladeno',
  seo:     'seo_ready.js -Paladeno',
  process: 'process.md -Paladeno'
};

function switchPanel(target) {
  sidebarFiles.forEach(f => f.classList.toggle('active', f.dataset.panel === target));
  mobileTabs.forEach(t => t.classList.toggle('active', t.dataset.panel === target));

  codePanels.forEach(panel => {
    panel.style.display = panel.dataset.panel === target ? '' : 'none';
  });

  if (ideFilename) ideFilename.textContent = panelFilenames[target] || '';
  runTypewriter(target);
}

sidebarFiles.forEach(file => {
  file.addEventListener('click', () => switchPanel(file.dataset.panel));
});

mobileTabs.forEach(tab => {
  tab.addEventListener('click', () => switchPanel(tab.dataset.panel));
});

// ── Typewriter effect ────────────────────────────────────────────────────────
const panelTextData = new Map();
let activeTypewriter = null;

// Collect original text node data for each panel
codePanels.forEach(panel => {
  const codeLines = panel.querySelector('.code-lines');
  if (!codeLines) return;
  const textData = [];
  codeLines.querySelectorAll('.line').forEach(line => {
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
    let node;
    while (node = walker.nextNode()) {
      textData.push({ node, original: node.textContent });
    }
  });
  panelTextData.set(panel.dataset.panel, textData);
});

// Clear all text initially (typewriter will reveal it)
panelTextData.forEach(data => {
  data.forEach(({ node }) => { node.textContent = ''; });
});

function cancelTypewriter() {
  if (activeTypewriter) {
    clearTimeout(activeTypewriter.timer);
    activeTypewriter = null;
  }
  document.querySelectorAll('.type-cursor').forEach(c => c.remove());
  panelTextData.forEach(data => {
    data.forEach(({ node, original }) => { node.textContent = original; });
  });
}

function runTypewriter(panelKey) {
  cancelTypewriter();

  const textData = panelTextData.get(panelKey);
  if (!textData || textData.length === 0) return;

  const panel = document.querySelector('.code-area[data-panel="' + panelKey + '"]');
  if (!panel) return;
  const lines = panel.querySelectorAll('.code-lines .line');

  // Clear only this panel's text
  textData.forEach(({ node }) => { node.textContent = ''; });

  let nodeIdx = 0;
  let charIdx = 0;
  const state = { timer: null };
  activeTypewriter = state;

  function typeNext() {
    if (nodeIdx >= textData.length) {
      activeTypewriter = null;
      return;
    }

    const { node, original } = textData[nodeIdx];

    // Skip whitespace-only nodes quickly
    if (original.trim() === '') {
      node.textContent = original;
      nodeIdx++;
      charIdx = 0;
      state.timer = setTimeout(typeNext, 5);
      return;
    }

    charIdx++;
    node.textContent = original.substring(0, charIdx);

    if (charIdx >= original.length) {
      nodeIdx++;
      charIdx = 0;
    }

    state.timer = setTimeout(typeNext, 18);
  }

  typeNext();
}

// Start typewriter when IDE section scrolls into view
const ideWrapper = document.querySelector('.ide-wrapper');
if (ideWrapper) {
  const ideObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeFile = document.querySelector('.sidebar-file.active');
        runTypewriter(activeFile ? activeFile.dataset.panel : 'design');
        ideObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  ideObserver.observe(ideWrapper);
}

// ── Terminal tab switching ────────────────────────────────────────────────────
const termTabs     = document.querySelectorAll('.term-tabs span[data-term]');
const termContents = document.querySelectorAll('.term-content[data-term]');

termTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.term;
    termTabs.forEach(t => t.classList.toggle('term-tab-active', t.dataset.term === target));
    termContents.forEach(c => {
      c.style.display = c.dataset.term === target ? '' : 'none';
    });
  });
});

// ── Dynamic year in footer ───────────────────────────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
