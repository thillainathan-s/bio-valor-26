/**
 * CIRCUIT-BAGASSE+ | Main Area Top App Bar
 * Breadcrumbs, mobile hamburger toggle, live status indicators, and quick tools.
 */

import { appState } from './state.js';

const ROUTE_INFO = {
  'dashboard': { title: 'Biorefinery Dashboard & Overview', breadcrumb: 'COMMAND CENTER' },
  '3d-modeling': { title: 'Interactive 3D Digital Twin Simulation', breadcrumb: 'VIRTUAL FACILITY' },
  'mass-balance': { title: 'Feedstock Mass Balance & Material Allocation', breadcrumb: 'RECONCILIATION LEDGER' },
  'bioethanol': { title: 'Bioethanol Stoichiometric Engine (Stream A)', breadcrumb: 'HYDROLYSIS & FERMENTATION' },
  'biosorbent': { title: 'Lignin Biosorbent Lab & Adsorption (Stream B)', breadcrumb: 'WASTEWATER REMEDIATION' },
  'hemicellulose': { title: 'Hemicellulose & Residuals Valuation (Stream C)', breadcrumb: 'VALORIZATION & PENTOSES' },
  'tea': { title: 'Techno-Economic Analysis (TEA)', breadcrumb: 'FINANCIAL APPRAISAL' },
  'sustainability': { title: 'Sustainability & Circularity Assessment', breadcrumb: 'LCA & CARBON METRICS' },
  'evidence': { title: 'Scientific Evidence & Academic Literature Base', breadcrumb: 'PEER-REVIEWED SOURCES' },
  'report': { title: 'Biorefinery Project & Feasibility Report', breadcrumb: 'EXECUTIVE SYNTHESIS' }
};

export function renderTopAppBar(container, app3d = null) {
  const state = appState.getState();
  const calcs = appState.getCalculations();
  const route = state.activeRoute || 'dashboard';
  const info = ROUTE_INFO[route] || { title: 'Biorefinery Application', breadcrumb: 'CIRCUIT-BAGASSE+' };
  const pb = calcs.planningBalance;

  container.innerHTML = `
    <div class="top-bar-inner">
      <div class="top-bar-left">
        <!-- Mobile hamburger menu button -->
        <button class="btn-mobile-sidebar-toggle" id="btn-mobile-sidebar-toggle" aria-label="Open navigation sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div class="breadcrumb-group">
          <div class="breadcrumb-sub">CIRCUIT-BAGASSE+ / ${info.breadcrumb}</div>
          <h2 class="breadcrumb-title">${info.title}</h2>
        </div>
      </div>

      <div class="top-bar-right">
        <!-- Mass Balance Allocation Live Pill -->
        <div class="top-metric-pill ${pb.calculated ? (pb.accountingRatioPercent >= 70 ? 'pill-success' : 'pill-warning') : 'pill-empty'}" title="${pb.calculated ? `Current Allocation: ${pb.accountingRatioPercent.toFixed(2)}% of dry bagasse` : 'Mass Balance not yet calculated'}">
          <span class="pill-dot"></span>
          <span class="pill-text-lbl">ALLOCATION:</span>
          <span class="pill-text-val">${pb.calculated ? `${pb.accountingRatioPercent.toFixed(2)}%` : 'PENDING'}</span>
          <span class="pill-text-sub">${pb.calculated ? (pb.accountingRatioPercent >= 70 ? '✓ 70% TARGET MET' : '/ 70% TGT') : 'Enter Mass Balance'}</span>
        </div>

        ${!pb.calculated ? `
          <button class="top-action-btn btn-load-ref-top" id="btn-top-quick-ref" title="Load Literature Reference Benchmark (PMC7801571)">
            <span class="action-icon">⚡</span>
            <span class="action-label">Load Literature Baseline</span>
          </button>
        ` : `
          <button class="top-action-btn btn-clear-top" id="btn-top-quick-clear" title="Clear inputs and start fresh">
            <span class="action-icon">↺</span>
            <span class="action-label">Clear</span>
          </button>
        `}
      </div>
    </div>
  `;

  // Mobile toggle click
  const mobileToggle = container.querySelector('#btn-mobile-sidebar-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      document.body.classList.toggle('mobile-sidebar-open');
    });
  }

  // Backdrop click closes mobile sidebar
  const backdrop = document.getElementById('sidebar-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      document.body.classList.remove('mobile-sidebar-open');
    });
  }

  // Quick action buttons
  const quickRef = container.querySelector('#btn-top-quick-ref');
  if (quickRef) {
    quickRef.addEventListener('click', () => {
      appState.loadLiteratureReferenceScenario();
    });
  }

  const quickClear = container.querySelector('#btn-top-quick-clear');
  if (quickClear) {
    quickClear.addEventListener('click', () => {
      if (confirm('Clear all calculations and inputs?')) {
        appState.resetAllToEmpty();
      }
    });
  }
}
