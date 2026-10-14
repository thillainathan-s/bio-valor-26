/**
 * CIRCUIT-BAGASSE+ | Application Router & View Orchestrator
 * Seamless navigation between Interactive 3D Biorefinery Digital Twin and 9 Dashboard Views
 */

import { appState } from './state.js';
import { renderDashboardView } from './views/dashboardView.js';
import { renderMassBalanceView } from './views/massBalanceView.js';
import { renderBioethanolView } from './views/bioethanolView.js';
import { renderBiosorbentView } from './views/biosorbentView.js';
import { renderHemicelluloseView } from './views/hemicelluloseView.js';
import { renderTEAView } from './views/teaView.js';
import { renderSustainabilityView } from './views/sustainabilityView.js';
import { renderEvidenceView } from './views/evidenceView.js';
import { renderReportView } from './views/reportView.js';
import { renderTopAppBar } from './topBar.js';

export class BiorefineryRouter {
  constructor(app3d = null) {
    this.app3d = app3d;
    this.viewContent = document.getElementById('view-content');
    this.view3D = document.getElementById('view-3d');
    this.topAppBar = document.getElementById('top-app-bar');
    this.currentRoute = null;

    // View renderer registry
    this.views = {
      'dashboard': renderDashboardView,
      'mass-balance': renderMassBalanceView,
      'bioethanol': renderBioethanolView,
      'biosorbent': renderBiosorbentView,
      'hemicellulose': renderHemicelluloseView,
      'tea': renderTEAView,
      'sustainability': renderSustainabilityView,
      'evidence': renderEvidenceView,
      'report': renderReportView
    };

    // Listen to hash changes (browser back/forward & links)
    window.addEventListener('hashchange', () => this.handleRoute());

    // Listen to reactive state changes to update the currently displayed view & top bar
    appState.subscribe((state) => {
      this.updateSidebarActiveState(state.activeRoute);
      if (this.topAppBar) {
        renderTopAppBar(this.topAppBar, this.app3d);
      }
      if (this.currentRoute && this.currentRoute !== '3d-modeling') {
        this.renderCurrentView();
      }
    });
  }

  set3DApp(app3d) {
    this.app3d = app3d;
  }

  init() {
    this.handleRoute();
  }

  getRouteFromHash() {
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
    if (!hash || hash === '') return 'dashboard'; // Default landing page: Dashboard
    return hash;
  }

  handleRoute() {
    let route = this.getRouteFromHash();

    // Alias mapping
    if (route === 'home' || route === 'dash') route = 'dashboard';
    if (route === '3d' || route === 'model' || route === 'twin') route = '3d-modeling';
    if (route === 'massbalance') route = 'mass-balance';
    if (route === 'ethanol') route = 'bioethanol';
    if (route === 'biosorb' || route === 'lab') route = 'biosorbent';
    if (route === 'residuals') route = 'hemicellulose';
    if (route === 'economic' || route === 'economics') route = 'tea';

    // Validate route or fallback to dashboard
    if (route !== '3d-modeling' && !this.views[route]) {
      route = 'dashboard';
    }

    this.currentRoute = route;
    appState.setActiveRoute(route);

    this.updateSidebarActiveState(route);
    if (this.topAppBar) {
      renderTopAppBar(this.topAppBar, this.app3d);
    }

    if (route === '3d-modeling') {
      this.show3DView();
    } else {
      this.showContentView(route);
    }
  }

  show3DView() {
    if (this.viewContent) {
      this.viewContent.style.display = 'none';
    }

    if (this.view3D) {
      this.view3D.style.display = 'block';
      this.view3D.style.visibility = 'visible';
    }

    // Trigger Three.js resize and resume if paused
    if (this.app3d && typeof this.app3d.onWindowResize === 'function') {
      setTimeout(() => {
        this.app3d.onWindowResize();
      }, 50);
    }

    document.title = 'CIRCUIT-BAGASSE+ | 3D Interactive Biorefinery Digital Twin';
  }

  showContentView(route) {
    if (this.view3D) {
      this.view3D.style.display = 'none';
      this.view3D.style.visibility = 'hidden';
    }

    if (this.viewContent) {
      this.viewContent.style.display = 'block';
      this.viewContent.scrollTop = 0;
    }

    this.renderCurrentView();

    const titles = {
      'dashboard': 'Dashboard & Command Center',
      'mass-balance': 'Feedstock Mass Balance',
      'bioethanol': 'Bioethanol Calculator',
      'biosorbent': 'Biosorbent Lab',
      'hemicellulose': 'Hemicellulose & Residuals',
      'tea': 'Techno-Economic Analysis',
      'sustainability': 'Sustainability & Circularity',
      'evidence': 'Scientific Evidence',
      'report': 'Project Report'
    };

    document.title = `CIRCUIT-BAGASSE+ | ${titles[route] || 'Biorefinery Dashboard'}`;
  }

  renderCurrentView() {
    if (!this.viewContent || !this.currentRoute) return;
    const renderer = this.views[this.currentRoute];
    if (renderer) {
      renderer(this.viewContent);
    }
  }

  updateSidebarActiveState(route) {
    // Update sidebar navigation links
    document.querySelectorAll('.sidebar-link').forEach(btn => {
      const btnRoute = btn.dataset.route;
      if (btnRoute === route) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Also update any legacy nav-tab-btn if present
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const btnRoute = btn.dataset.route;
      if (btnRoute === route) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}
