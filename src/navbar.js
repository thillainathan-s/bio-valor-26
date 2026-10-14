/**
 * CIRCUIT-BAGASSE+ | Top Navigation Bar
 * Professional Industrial Control Header with 10 Top-Level Navigation Routes
 */

import { appState } from './state.js';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '#dashboard' },
  { id: '3d-modeling', label: '3D Modeling', icon: '🏭', route: '#3d-modeling' },
  { id: 'mass-balance', label: 'Mass Balance', icon: '⚖️', route: '#mass-balance' },
  { id: 'bioethanol', label: 'Bioethanol', icon: '⚗️', route: '#bioethanol' },
  { id: 'biosorbent', label: 'Biosorbent Lab', icon: '🧪', route: '#biosorbent' },
  { id: 'hemicellulose', label: 'Hemicellulose & Residuals', icon: '🌾', route: '#hemicellulose' },
  { id: 'tea', label: 'Techno-Economic Analysis', icon: '📈', route: '#tea' },
  { id: 'sustainability', label: 'Sustainability', icon: '♻️', route: '#sustainability' },
  { id: 'evidence', label: 'Scientific Evidence', icon: '📚', route: '#evidence' },
  { id: 'report', label: 'Project Report', icon: '📄', route: '#report' }
];

export function renderNavbar(container) {
  const state = appState.getState();
  const { planningBalance } = appState.getCalculations();

  container.innerHTML = `
    <div class="top-nav-inner">
      <!-- Brand & Event Identity -->
      <div class="brand-zone">
        <a href="#dashboard" class="brand-logo-link" id="nav-brand-link">
          <div class="brand-badge-circle">CB+</div>
          <div class="brand-text-col">
            <div class="brand-title">CIRCUIT-BAGASSE<span class="plus-glow">+</span></div>
            <div class="brand-sub">BIOVALOR 2026 | SMART INTEGRATED BIOREFINERY</div>
          </div>
        </a>
      </div>

      <!-- Main Navigation Items -->
      <nav class="nav-links-menu" id="nav-links-menu" aria-label="Main Navigation">
        ${NAV_ITEMS.map(item => `
          <a href="${item.route}" 
             class="nav-tab-btn ${state.activeRoute === item.id ? 'active' : ''}" 
             data-route="${item.id}"
             id="nav-tab-${item.id}">
            <span class="nav-tab-icon">${item.icon}</span>
            <span class="nav-tab-label">${item.label}</span>
          </a>
        `).join('')}
      </nav>

      <!-- Right Action & Live Metric Widget -->
      <div class="nav-right-actions">
        <!-- Live Accounting Badge -->
        <div class="nav-metric-chip" title="Current Illustrative Feedstock Allocation">
          <span class="chip-dot ${planningBalance.accountingRatioPercent >= 70 ? 'dot-success' : 'dot-warning'}"></span>
          <span class="chip-title">ALLOCATION:</span>
          <span class="chip-val">${planningBalance.accountingRatioPercent.toFixed(2)}%</span>
          <span class="chip-sub">/ 70% TGT</span>
        </div>

        <!-- Reset Defaults Button -->
        <button class="nav-btn-action reset-btn" id="btn-nav-reset" title="Reset all calculators to prompt baseline illustrative values">
          <span class="btn-icon">↺</span>
          <span class="btn-text">Reset Example</span>
        </button>

        <!-- Mobile Menu Toggle Button -->
        <button class="nav-mobile-toggle" id="btn-mobile-nav-toggle" aria-label="Toggle navigation menu">
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
        </button>
      </div>
    </div>
  `;

  // Attach Event Handlers
  const resetBtn = container.querySelector('#btn-nav-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all Mass Balance, Bioethanol, Biosorbent and TEA parameters to the illustrative scenario values?')) {
        appState.resetToDefaults();
      }
    });
  }

  const mobileToggle = container.querySelector('#btn-mobile-nav-toggle');
  const navMenu = container.querySelector('#nav-links-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });

    // Close menu when clicking link
    navMenu.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
      });
    });
  }
}
