/**
 * CIRCUIT-BAGASSE+ | Collapsible Left Sidebar Navigation
 * Professional Industrial Biorefinery Control Sidebar with 10 Top-Level Navigation Routes
 */

import { appState } from './state.js';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '#dashboard', tag: 'Core' },
  { id: '3d-modeling', label: '3D Modeling', icon: '🏭', route: '#3d-modeling', tag: 'Twin' },
  { id: 'mass-balance', label: 'Mass Balance', icon: '⚖️', route: '#mass-balance', tag: 'Audit' },
  { id: 'bioethanol', label: 'Bioethanol', icon: '⚗️', route: '#bioethanol', tag: 'Stream A' },
  { id: 'biosorbent', label: 'Biosorbent Lab', icon: '🧪', route: '#biosorbent', tag: 'Stream B' },
  { id: 'hemicellulose', label: 'Hemicellulose & Residuals', icon: '🌾', route: '#hemicellulose', tag: 'Stream C' },
  { id: 'tea', label: 'Techno-Economic Analysis', icon: '📈', route: '#tea', tag: 'TEA' },
  { id: 'sustainability', label: 'Sustainability', icon: '♻️', route: '#sustainability', tag: 'LCA' },
  { id: 'evidence', label: 'Scientific Evidence', icon: '📚', route: '#evidence', tag: 'Refs' },
  { id: 'report', label: 'Project Report', icon: '📄', route: '#report', tag: 'Doc' }
];

export function renderSidebar(container, app3d = null) {
  const state = appState.getState();
  const calcs = appState.getCalculations();
  const isCollapsed = state.sidebarCollapsed;

  container.className = `app-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`;

  // Count calculated modules for readiness indicator
  const calculatedCount = [
    calcs.planningBalance.calculated,
    calcs.bioethanol.calculated,
    calcs.repStats.calculated,
    calcs.tea.calculated
  ].filter(Boolean).length;

  container.innerHTML = `
    <!-- SIDEBAR HEADER (Brand + Collapse Toggle) -->
    <div class="sidebar-header">
      <a href="#dashboard" class="sidebar-brand" id="sidebar-brand-link" title="CIRCUIT-BAGASSE+ Biorefinery">
        <div class="brand-avatar">CB+</div>
        <div class="brand-info">
          <div class="brand-name">CIRCUIT-BAGASSE<span class="plus-glow">+</span></div>
          <div class="brand-edition">BIOVALOR 2026</div>
        </div>
      </a>
      <button class="sidebar-toggle-btn" id="btn-sidebar-toggle" title="${isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}">
        <svg class="toggle-icon ${isCollapsed ? 'icon-collapsed' : ''}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- NAVIGATION MENU LIST -->
    <nav class="sidebar-nav" id="sidebar-nav" aria-label="Biorefinery Navigation">
      <div class="nav-section-title">NAVIGATION</div>
      <ul class="nav-list">
        ${NAV_ITEMS.map(item => {
          const isActive = state.activeRoute === item.id;
          return `
            <li class="nav-item">
              <a href="${item.route}" 
                 class="sidebar-link ${isActive ? 'active' : ''}" 
                 data-route="${item.id}"
                 id="sidebar-nav-${item.id}"
                 title="${item.label}">
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-label">${item.label}</span>
                <span class="nav-badge-tag">${item.tag}</span>
              </a>
            </li>
          `;
        }).join('')}
      </ul>
    </nav>

    <!-- SIDEBAR QUICK ACTIONS & SYSTEM READINESS -->
    <div class="sidebar-footer">
      <div class="readiness-chip" title="${calculatedCount} of 4 core modules calculated">
        <span class="chip-status-dot ${calculatedCount === 4 ? 'dot-ready' : calculatedCount > 0 ? 'dot-partial' : 'dot-pending'}"></span>
        <div class="readiness-text">
          <span class="readiness-label">MODEL STATUS:</span>
          <span class="readiness-val">${calculatedCount === 4 ? 'READY (4/4)' : calculatedCount > 0 ? `IN PROGRESS (${calculatedCount}/4)` : 'EMPTY (0/4)'}</span>
        </div>
      </div>

      <div class="sidebar-action-buttons">
        <button class="sidebar-btn-util btn-load-reference" id="btn-sidebar-load-ref" title="Load PMC7801571 Reference Literature Scenario for instant benchmarking">
          <span class="util-icon">⚡</span>
          <span class="util-text">Load Ref Baseline</span>
        </button>
        <button class="sidebar-btn-util btn-clear-all" id="btn-sidebar-clear-all" title="Clear all manual inputs and reset to empty state">
          <span class="util-icon">↺</span>
          <span class="util-text">Clear Inputs</span>
        </button>
      </div>

      <div class="sidebar-meta">
        <span>BIOVALOR 2026 | NIT Warangal</span>
      </div>
    </div>
  `;

  // Attach Event Handlers
  const toggleBtn = container.querySelector('#btn-sidebar-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      appState.toggleSidebar();
      triggerResize(app3d);
    });
  }

  // Load Reference Literature Baseline
  const loadRefBtn = container.querySelector('#btn-sidebar-load-ref');
  if (loadRefBtn) {
    loadRefBtn.addEventListener('click', () => {
      if (confirm('Load PMC7801571 Literature Reference Scenario across all modules (100 kg basis, 42.5 kg cellulose, 75% adsorption, TEA baseline)?')) {
        appState.loadLiteratureReferenceScenario();
      }
    });
  }

  // Clear All Inputs
  const clearAllBtn = container.querySelector('#btn-sidebar-clear-all');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (confirm('Clear all inputs and reset all calculators to blank empty states?')) {
        appState.resetAllToEmpty();
      }
    });
  }

  // Mobile drawer links: close drawer on selection
  container.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
      document.body.classList.remove('mobile-sidebar-open');
    });
  });
}

function triggerResize(app3d) {
  // Give CSS transition 100ms then dispatch window resize
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
    if (app3d && typeof app3d.onWindowResize === 'function') {
      app3d.onWindowResize();
    }
  }, 120);
}
