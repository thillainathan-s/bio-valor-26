import { LITERATURE_FEEDSTOCK, DEFAULT_ASSUMPTIONS, calculateBiorefineryModel } from './calculations.js';

/**
 * Interactive Heads-Up Display, Scientific Inspector Panel, and Dry-Feedstock Mass-Balance Tracker
 * BIOVALOR'26 — CIRCUIT-BAGASSE+
 */
export class BiorefineryHUD {
  constructor(containerElement, onSelectMachine, onCameraControl, onConfigChange, audio, onViewModeChange, onToggleLabels = null) {
    this.container = containerElement;
    this.onSelectMachine = onSelectMachine;
    this.onCameraControl = onCameraControl;
    this.onConfigChange = onConfigChange;
    this.audio = audio;
    this.onViewModeChange = onViewModeChange || (() => {});
    this.onToggleLabels = onToggleLabels || (() => {});

    this.currentModel = calculateBiorefineryModel(DEFAULT_ASSUMPTIONS);
    this.activeMachineId = null;
    this.isPlayingTour = false;
    this.currentViewMode = 'interior';
    this.labelsVisible = true;

    this.initDOM();
  }

  initDOM() {
    this.container.innerHTML = `
      <!-- Top Header Navigation & Status Bar -->
      <header class="hud-topbar">
        <div class="hud-brand">
          <div class="brand-badge">BIOVALOR’26</div>
          <div class="brand-title">
            <span class="title-primary">CIRCUIT-BAGASSE+</span>
            <span class="title-sub">Industrial Biorefinery Simulation & Stoichiometric Ledger</span>
          </div>
        </div>

        <!-- Realtime Mass Ledger Badge -->
        <div class="hud-ledger-summary" id="hudLedgerSummary">
          <div class="ledger-pill" id="ledgerStatusPill">
            <span class="dot"></span>
            <span class="ledger-label">ACCOUNTING:</span>
            <span class="ledger-val" id="ledgerValorizedVal">--%</span>
            <span class="target-tag">Target — requires mass-balance validation</span>
          </div>
        </div>

        <!-- Global Action Controls -->
        <div class="hud-actions">
          <button class="btn-tool active" id="btnToggleLabels" title="Toggle 3D Machine & Component Names (ON/OFF)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            <span id="labelToggleText">Machine Labels: ON</span>
          </button>
          <button class="btn-tool btn-collapse-nav" id="btnToggleHUD" title="Minimize / Hide Top Navigation Bar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            <span>Hide Nav</span>
          </button>
          <button class="btn-tool btn-highlight" id="btnMassBalance" title="Open Dry-Feedstock Mass-Balance Tracking Panel">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            <span>Mass Balance</span>
          </button>
          <button class="btn-tool" id="btnParameters" title="Adjust Process Parameters">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>
            <span>Assumptions</span>
          </button>
          <button class="btn-tool" id="btnAudioToggle" title="Toggle Industrial Sound">
            <svg id="audioIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            <span id="audioText">Muted</span>
          </button>
          <button class="btn-tool" id="btnOverview" title="Return to Full Facility Wide View">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            <span>Facility</span>
          </button>
        </div>
      </header>

      <!-- Floating Restore HUD Pill (visible when topbar is hidden) -->
      <button class="hud-restore-pill" id="btnRestoreHUD" title="Show Navigation Bar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        <span>Show Navigation</span>
      </button>

      <!-- Floating Machine Labels Toggle Widget (Always visible in 3D viewport) -->
      <div class="floating-labels-control" id="floatingLabelsControl">
        <button class="toggle-pill-btn active" id="btnFloatToggleLabels" title="Toggle 3D Machine & Component Names (ON/OFF)">
          <span class="toggle-indicator-dot"></span>
          <span class="toggle-name-label">Machine Labels:</span>
          <span class="toggle-status-val" id="floatLabelStatus">ON</span>
        </button>
      </div>

      <!-- Bottom Floating Playback & Sequence Bar -->
      <footer class="hud-bottombar">
        <div class="playback-controls">
          <button class="btn-play" id="btnPlayComplete" title="Play Complete Process Sequence">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span id="playBtnText">PLAY COMPLETE PROCESS</span>
          </button>
          <button class="btn-ctrl" id="btnPauseResume" title="Pause or Resume Sequence">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            <span id="pauseBtnText">Pause</span>
          </button>
          <button class="btn-ctrl" id="btnRestart" title="Restart Guided Sequence">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            <span>Restart</span>
          </button>
        </div>

        <!-- Quick Jump Machine Dock -->
        <div class="machine-dock">
          <button class="dock-btn" data-machine="machine-1" title="1. Feedstock Receiving">1</button>
          <button class="dock-btn" data-machine="machine-2" title="2. Pretreatment">2</button>
          <button class="dock-btn" data-machine="machine-3" title="3. Separation (3-Stream)">3</button>
          <div class="dock-separator"></div>
          <button class="dock-btn pathway-a" data-machine="machine-4" title="A1. Enzymatic Hydrolysis">A1</button>
          <button class="dock-btn pathway-a" data-machine="machine-5" title="A2. Fermentation">A2</button>
          <button class="dock-btn pathway-a" data-machine="machine-6" title="A3. Distillation">A3</button>
          <div class="dock-separator"></div>
          <button class="dock-btn pathway-b" data-machine="machine-7" title="B1. Lignin Precipitation">B1</button>
          <button class="dock-btn pathway-b" data-machine="machine-8" title="B2. Biosorbent Prep">B2</button>
          <button class="dock-btn pathway-b" data-machine="machine-9" title="B3. Dye Adsorption">B3</button>
          <div class="dock-separator"></div>
          <button class="dock-btn pathway-c" data-machine="machine-c" title="C. Hemicellulose Sugar Recovery (Proposed)">C</button>
          <div class="dock-separator"></div>
          <button class="dock-btn residual-btn" data-machine="machine-10" title="10. Residuals & Ledger">10</button>
        </div>
      </footer>

      <!-- Guided Narration Subtitle Banner -->
      <div class="hud-narration" id="hudNarration">
        <div class="narration-step-tag" id="narrationStepTag">OVERVIEW</div>
        <div class="narration-text" id="narrationText">Click any industrial unit, view Mass Balance Ledger, or press PLAY COMPLETE PROCESS for the guided sequence.</div>
      </div>

      <!-- Machine Scientific Inspector Modal Card -->
      <div class="machine-inspector" id="machineInspector">
        <div class="inspector-header">
          <div class="inspector-title-wrap">
            <div class="inspector-category-badge" id="inspCategory">LITERATURE</div>
            <h2 class="inspector-title" id="inspTitle">Machine Name</h2>
          </div>
          <button class="inspector-close" id="inspCloseBtn">&times;</button>
        </div>

        <!-- NEW: Inspection View Mode Switcher Toolbar & Machine State -->
        <div class="inspector-viewmode-bar">
          <div class="viewmode-buttons">
            <button class="btn-vmode" id="btnVmodeExterior" title="Exterior View — Complete industrial housing">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
              <span>EXTERIOR</span>
            </button>
            <button class="btn-vmode active" id="btnVmodeInterior" title="Internal Inspection — Cutaway view revealing internal mechanism and transformation">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="9"/></svg>
              <span>INTERNAL VIEW</span>
            </button>
            <button class="btn-vmode" id="btnVmodeExploded" title="Exploded View — Displaces subassemblies to reveal structural relationships">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              <span>EXPLODED</span>
            </button>
          </div>
          <div class="inspector-state-pill state-processing" id="inspStatePill">
            <span class="state-dot"></span>
            <span class="state-text" id="inspStateText">PROCESSING</span>
          </div>
          <button class="btn-return-facility" id="btnReturnFacility" title="Return to Facility Wide View">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            <span>RETURN</span>
          </button>
        </div>

        <div class="inspector-body" id="inspBody">
          <!-- Dynamically populated per machine -->
        </div>
      </div>

      <!-- Floating Reopen Inspector Button (visible when inspector closed while machine is selected) -->
      <button class="hud-reopen-inspector-pill" id="btnReopenInspector" style="display: none;" title="Reopen Machine Information Panel">
        <span class="pill-dot" id="reopenDot"></span>
        <span class="reopen-icon">📋</span>
        <span id="reopenInspectorText">Reopen Machine Info</span>
      </button>

      <!-- Dry-Feedstock Mass-Balance Tracking Panel Modal -->
      <div class="mass-balance-modal" id="massBalanceModal">
        <div class="mass-balance-header">
          <div class="mb-title-wrap">
            <div class="mb-badge">STRICT MASS-BALANCE TRACKING</div>
            <h2>Dry-Feedstock Mass-Balance Tracking Panel</h2>
            <p class="mb-subtitle">Comprehensive non-overlapping material accounting: incoming bagasse, separated products, and residual streams.</p>
          </div>
          <button class="mass-balance-close" id="mbCloseBtn">&times;</button>
        </div>
        <div class="mass-balance-content" id="massBalanceContent">
          <!-- Dynamically populated via renderMassBalanceContent() -->
        </div>
      </div>

      <!-- Configurable Assumptions Modal Drawer -->
      <div class="assumptions-modal" id="assumptionsModal">
        <div class="assumptions-header">
          <h2>Process Engineering Parameters (Assumptions)</h2>
          <button class="assumptions-close" id="assumptionsCloseBtn">&times;</button>
        </div>
        <div class="assumptions-content">
          <div class="callout-banner alert-warning">
            <strong>SCIENTIFIC NOTICE:</strong> These parameters represent engineering assumptions for circuit simulation. None represent claimed experimental measurements until validated on physical prototypes.
          </div>
          <div class="input-grid">
            <div class="input-group">
              <label>Dry Feedstock Mass (kg basis):</label>
              <input type="number" id="inpFeedstockMass" value="100.0" step="10" min="10" max="10000">
            </div>
            <div class="input-group">
              <label>Pretreatment NaOH Concentration (% w/v):</label>
              <input type="number" id="inpNaOH" value="2.0" step="0.5" min="0.5" max="10">
            </div>
            <div class="input-group">
              <label>Lignin Solubilization Rate (%):</label>
              <input type="range" id="inpLigninSol" value="61" min="20" max="90">
              <span class="range-val" id="valLigninSol">61%</span>
            </div>
            <div class="input-group">
              <label>Cellulose Enzymatic Conversion (%):</label>
              <input type="range" id="inpHydrolysisEff" value="82" min="30" max="98">
              <span class="range-val" id="valHydrolysisEff">82%</span>
            </div>
            <div class="input-group">
              <label>Fermentation Efficiency (% Gay-Lussac):</label>
              <input type="range" id="inpFermEff" value="90" min="40" max="98">
              <span class="range-val" id="valFermEff">90%</span>
            </div>
            <div class="input-group">
              <label>Lignin Acid Precipitation Yield (%):</label>
              <input type="range" id="inpLigninPrecip" value="75" min="30" max="95">
              <span class="range-val" id="valLigninPrecip">75%</span>
            </div>
            <div class="input-group">
              <label>Proposed Hemicellulose Sugar Yield (%): [Proposed]</label>
              <input type="range" id="inpPentoseYield" value="65" min="20" max="90">
              <span class="range-val" id="valPentoseYield">65% (Proposed)</span>
            </div>
            <div class="input-group">
              <label>Initial Dye Concentration C0 (mg/L):</label>
              <input type="number" id="inpDyeC0" value="120.0" step="10" min="10" max="1000">
            </div>
            <div class="input-group">
              <label>Equilibrium Dye Concentration Ce (mg/L):</label>
              <input type="number" id="inpDyeCe" value="3.6" step="0.5" min="0.1" max="50">
            </div>
          </div>
          <div class="assumptions-footer">
            <button class="btn-action" id="btnResetDefaults">Reset to Baseline Defaults</button>
            <button class="btn-action btn-primary" id="btnApplyAssumptions">Apply & Recalculate Ledger</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.updateLedgerBadge();
    this.renderMassBalanceContent();
  }

  bindEvents() {
    // Full Screen Toggle / Collapse HUD
    const topbar = document.querySelector('.hud-topbar');
    const restorePill = document.getElementById('btnRestoreHUD');
    const toggleBtn = document.getElementById('btnToggleHUD');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.audio.playClick();
        if (topbar) topbar.classList.add('collapsed');
        if (restorePill) restorePill.classList.add('visible');
      });
    }

    if (restorePill) {
      restorePill.addEventListener('click', () => {
        this.audio.playClick();
        if (topbar) topbar.classList.remove('collapsed');
        if (restorePill) restorePill.classList.remove('visible');
      });
    }

    // Machine Labels ON/OFF Toggle Handlers
    const handleLabelToggle = () => {
      this.audio.playClick();
      this.labelsVisible = !this.labelsVisible;
      this.updateLabelToggleUI();
      if (this.onToggleLabels) {
        this.onToggleLabels(this.labelsVisible);
      }
    };

    const btnToggleLabels = document.getElementById('btnToggleLabels');
    if (btnToggleLabels) {
      btnToggleLabels.addEventListener('click', handleLabelToggle);
    }

    const btnFloatToggleLabels = document.getElementById('btnFloatToggleLabels');
    if (btnFloatToggleLabels) {
      btnFloatToggleLabels.addEventListener('click', handleLabelToggle);
    }

    // Overview button
    document.getElementById('btnOverview').addEventListener('click', () => {
      this.audio.playClick();
      this.closeInspector();
      this.closeMassBalancePanel();
      this.onCameraControl('overview');
    });

    // Mass Balance Tracker button
    document.getElementById('btnMassBalance').addEventListener('click', () => {
      this.audio.playClick();
      this.toggleMassBalancePanel();
    });

    document.getElementById('mbCloseBtn').addEventListener('click', () => {
      this.audio.playClick();
      this.closeMassBalancePanel();
    });

    // Audio toggle
    document.getElementById('btnAudioToggle').addEventListener('click', () => {
      const active = this.audio.toggleMute();
      const txt = document.getElementById('audioText');
      const icon = document.getElementById('audioIcon');
      if (active) {
        txt.textContent = 'Active';
        icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>';
      } else {
        txt.textContent = 'Muted';
        icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
      }
    });

    // Playback buttons
    document.getElementById('btnPlayComplete').addEventListener('click', () => {
      this.audio.playWhoosh();
      this.closeMassBalancePanel();
      this.onCameraControl('play_complete');
    });

    document.getElementById('btnPauseResume').addEventListener('click', () => {
      this.audio.playClick();
      this.onCameraControl('toggle_pause');
    });

    document.getElementById('btnRestart').addEventListener('click', () => {
      this.audio.playWhoosh();
      this.closeMassBalancePanel();
      this.onCameraControl('restart');
    });

    // Machine dock quick jump
    const dockButtons = document.querySelectorAll('.dock-btn');
    dockButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-machine');
        this.audio.playClick();
        this.closeMassBalancePanel();
        this.onSelectMachine(id);
      });
    });

    // Inspector close button
    document.getElementById('inspCloseBtn').addEventListener('click', () => {
      this.audio.playClick();
      this.closeInspector();
      this.onCameraControl('close_inspector');
    });

    // View mode switching buttons
    document.getElementById('btnVmodeExterior').addEventListener('click', () => {
      this.audio.playClick();
      this.setViewMode('exterior');
    });

    document.getElementById('btnVmodeInterior').addEventListener('click', () => {
      this.audio.playClick();
      this.setViewMode('interior');
    });

    document.getElementById('btnVmodeExploded').addEventListener('click', () => {
      this.audio.playClick();
      this.setViewMode('exploded');
    });

    // Reopen inspector button
    const reopenBtn = document.getElementById('btnReopenInspector');
    if (reopenBtn) {
      reopenBtn.addEventListener('click', () => {
        this.audio.playClick();
        if (this.activeMachineId) {
          this.showMachineInspector(this.activeMachineId);
        }
      });
    }

    document.getElementById('btnReturnFacility').addEventListener('click', () => {
      this.audio.playClick();
      this.closeInspector();
      if (reopenBtn) reopenBtn.style.display = 'none';
      this.activeMachineId = null;
      this.onCameraControl('overview');
    });

    // Assumptions modal open/close
    document.getElementById('btnParameters').addEventListener('click', () => {
      this.audio.playClick();
      document.getElementById('assumptionsModal').classList.toggle('active');
    });

    document.getElementById('assumptionsCloseBtn').addEventListener('click', () => {
      this.audio.playClick();
      document.getElementById('assumptionsModal').classList.remove('active');
    });

    // Range input value updates
    ['inpLigninSol', 'inpHydrolysisEff', 'inpFermEff', 'inpLigninPrecip', 'inpPentoseYield'].forEach(id => {
      const slider = document.getElementById(id);
      const spanId = id.replace('inp', 'val');
      const span = document.getElementById(spanId);
      if (slider && span) {
        slider.addEventListener('input', () => {
          if (id === 'inpPentoseYield') {
            span.textContent = slider.value + '% (Proposed)';
          } else {
            span.textContent = slider.value + '%';
          }
        });
      }
    });

    // Apply assumptions
    document.getElementById('btnApplyAssumptions').addEventListener('click', () => {
      this.audio.playClick();
      this.applyCustomAssumptions();
      document.getElementById('assumptionsModal').classList.remove('active');
    });

    document.getElementById('btnResetDefaults').addEventListener('click', () => {
      this.audio.playClick();
      this.resetAssumptions();
    });
  }

  setViewMode(mode) {
    this.currentViewMode = mode;
    document.querySelectorAll('.btn-vmode').forEach(btn => btn.classList.remove('active'));
    if (mode === 'exterior') {
      document.getElementById('btnVmodeExterior').classList.add('active');
    } else if (mode === 'interior') {
      document.getElementById('btnVmodeInterior').classList.add('active');
    } else if (mode === 'exploded') {
      document.getElementById('btnVmodeExploded').classList.add('active');
    }
    this.onViewModeChange(mode);
  }

  updateInspectorStateBadge(state) {
    const pill = document.getElementById('inspStatePill');
    const txt = document.getElementById('inspStateText');
    if (!pill || !txt) return;
    txt.textContent = state;
    pill.className = `inspector-state-pill state-${state.toLowerCase()}`;
  }

  toggleMassBalancePanel() {
    const modal = document.getElementById('massBalanceModal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
      this.renderMassBalanceContent();
    }
  }

  closeMassBalancePanel() {
    document.getElementById('massBalanceModal').classList.remove('active');
  }

  applyCustomAssumptions() {
    const custom = {
      feedstockMassKg: parseFloat(document.getElementById('inpFeedstockMass').value) || 100.0,
      pretreatment: {
        naohConcentrationPercent: parseFloat(document.getElementById('inpNaOH').value) || 2.0,
        ligninSolubilizationRate: parseFloat(document.getElementById('inpLigninSol').value) / 100.0
      },
      hydrolysis: {
        celluloseConversionEfficiency: parseFloat(document.getElementById('inpHydrolysisEff').value) / 100.0
      },
      fermentation: {
        glucoseToEthanolEfficiency: parseFloat(document.getElementById('inpFermEff').value) / 100.0
      },
      ligninRecovery: {
        precipitationYield: parseFloat(document.getElementById('inpLigninPrecip').value) / 100.0
      },
      hemicelluloseSugarRecovery: {
        pentoseSugarYieldFraction: parseFloat(document.getElementById('inpPentoseYield').value) / 100.0
      },
      wastewaterAdsorption: {
        initialDyeConcentrationC0_mg_L: parseFloat(document.getElementById('inpDyeC0').value) || 120.0,
        equilibriumDyeConcentrationCe_mg_L: parseFloat(document.getElementById('inpDyeCe').value) || 3.6
      }
    };

    this.currentModel = calculateBiorefineryModel(custom);
    this.updateLedgerBadge();
    this.renderMassBalanceContent();
    if (this.activeMachineId) {
      this.showMachineInspector(this.activeMachineId);
    }
    this.onConfigChange(this.currentModel);
  }

  resetAssumptions() {
    document.getElementById('inpFeedstockMass').value = '100.0';
    document.getElementById('inpNaOH').value = '2.0';
    document.getElementById('inpLigninSol').value = '61';
    document.getElementById('valLigninSol').textContent = '61%';
    document.getElementById('inpHydrolysisEff').value = '82';
    document.getElementById('valHydrolysisEff').textContent = '82%';
    document.getElementById('inpFermEff').value = '90';
    document.getElementById('valFermEff').textContent = '90%';
    document.getElementById('inpLigninPrecip').value = '75';
    document.getElementById('valLigninPrecip').textContent = '75%';
    document.getElementById('inpPentoseYield').value = '65';
    document.getElementById('valPentoseYield').textContent = '65% (Proposed)';
    document.getElementById('inpDyeC0').value = '120.0';
    document.getElementById('inpDyeCe').value = '3.6';

    this.currentModel = calculateBiorefineryModel(DEFAULT_ASSUMPTIONS);
    this.updateLedgerBadge();
    this.renderMassBalanceContent();
    if (this.activeMachineId) {
      this.showMachineInspector(this.activeMachineId);
    }
    this.onConfigChange(this.currentModel);
  }

  updateLedgerBadge() {
    const valSpan = document.getElementById('ledgerValorizedVal');
    const pill = document.getElementById('ledgerStatusPill');
    const pct = this.currentModel.ledger.totalIntegratedAccountingPercent.toFixed(1);
    valSpan.textContent = `${pct}% Accounted`;

    if (this.currentModel.ledger.achievesTargetWithResiduals) {
      pill.className = 'ledger-pill status-validated';
    } else {
      pill.className = 'ledger-pill status-pending';
    }
  }

  renderMassBalanceContent() {
    const container = document.getElementById('massBalanceContent');
    if (!container) return;
    const m = this.currentModel;

    const ethPct = ((m.pathwayA.recoveredHydrousEthanolKg / m.basis) * 100).toFixed(1);
    const bioPct = ((m.pathwayB.finalBiosorbentKg / m.basis) * 100).toFixed(1);
    const sugPct = ((m.pathwayC.proposedRecoveredPentoseSugarsKg / m.basis) * 100).toFixed(1);
    const resSolidsPct = ((m.pathwayA.unconvertedSolidResidueKg / m.basis) * 100).toFixed(1);
    const vinassePct = ((m.pathwayA.vinasseBottomsKg / m.basis) * 100).toFixed(1);
    const resWashPct = ((m.pathwayC.proposedStreamCResidualWashKg / m.basis) * 100).toFixed(1);
    const co2Pct = ((m.pathwayA.co2ProducedKg / m.basis) * 100).toFixed(1);
    const ligLossPct = (((m.pathwayB.unprecipitatedAcidSolubleLigninLiquorKg + m.pathwayB.biosorbentProcessingLossKg) / m.basis) * 100).toFixed(1);
    const remPct = ((m.ledger.unassignedRemainderKg / m.basis) * 100).toFixed(1);

    container.innerHTML = `
      <!-- Target Status Banner -->
      <div class="callout-banner alert-warning mb-target-banner">
        <div class="target-title">
          <span class="target-badge">FEEDSTOCK-ACCOUNTING TARGET</span>
          <h3>Target — requires mass-balance validation</h3>
        </div>
        <p>The 70% feedstock-accounting threshold is a process engineering model target. Without experimental mass-balance validation across continuous physical pilot prototypes, achieving &gt;70% material recovery remains a theoretical design target requiring rigorous compositional and stream mass closure.</p>
      </div>

      <!-- Proportional Visual Mass-Balance Breakdown Bar -->
      <div class="mass-bar-container">
        <div class="mass-bar-label-row">
          <span>Incoming Dry Feedstock: ${m.basis.toFixed(1)} kg (100.0%)</span>
          <span class="highlight-txt">Non-Overlapping Stream Tracking</span>
        </div>
        <div class="mass-bar-stacked">
          <div class="seg seg-ethanol" style="width: ${ethPct}%" title="Bioethanol: ${m.pathwayA.recoveredHydrousEthanolKg.toFixed(1)} kg (${ethPct}%)"></div>
          <div class="seg seg-biosorbent" style="width: ${bioPct}%" title="Lignin Biosorbent: ${m.pathwayB.finalBiosorbentKg.toFixed(1)} kg (${bioPct}%)"></div>
          <div class="seg seg-sugar-proposed" style="width: ${sugPct}%" title="Proposed Pentose Sugars (Unvalidated): ${m.pathwayC.proposedRecoveredPentoseSugarsKg.toFixed(1)} kg (${sugPct}%)"></div>
          <div class="seg seg-solid-res" style="width: ${resSolidsPct}%" title="Hydrolysis Solid Residue Fuel: ${m.pathwayA.unconvertedSolidResidueKg.toFixed(1)} kg (${resSolidsPct}%)"></div>
          <div class="seg seg-vinasse" style="width: ${vinassePct}%" title="Vinasse Stillage Bottoms: ${m.pathwayA.vinasseBottomsKg.toFixed(1)} kg (${vinassePct}%)"></div>
          <div class="seg seg-wash" style="width: ${resWashPct}%" title="Pentose Wash / Condensate: ${m.pathwayC.proposedStreamCResidualWashKg.toFixed(1)} kg (${resWashPct}%)"></div>
          <div class="seg seg-co2" style="width: ${co2Pct}%" title="Biogenic CO2 Off-Gas: ${m.pathwayA.co2ProducedKg.toFixed(1)} kg (${co2Pct}%)"></div>
          <div class="seg seg-lig-loss" style="width: ${ligLossPct}%" title="Lignin Filtrate & Sizing Dust: ${(m.pathwayB.unprecipitatedAcidSolubleLigninLiquorKg + m.pathwayB.biosorbentProcessingLossKg).toFixed(1)} kg (${ligLossPct}%)"></div>
          <div class="seg seg-remainder" style="width: ${remPct}%" title="Unassigned Feedstock Remainder: ${m.ledger.unassignedRemainderKg.toFixed(1)} kg (${remPct}%)"></div>
        </div>
        <div class="mass-bar-legend">
          <span class="leg-item"><i class="leg-dot bg-teal"></i> Stream A: Bioethanol (${ethPct}%)</span>
          <span class="leg-item"><i class="leg-dot bg-amber"></i> Stream B: Biosorbent (${bioPct}%)</span>
          <span class="leg-item"><i class="leg-dot bg-violet-hatched"></i> Stream C: Proposed Sugars [Unvalidated] (${sugPct}%)</span>
          <span class="leg-item"><i class="leg-dot bg-steel"></i> Solid Fuel Residue (${resSolidsPct}%)</span>
          <span class="leg-item"><i class="leg-dot bg-slate"></i> Vinasse Bottoms (${vinassePct}%)</span>
          <span class="leg-item"><i class="leg-dot bg-cyan"></i> CO2 Off-Gas (${co2Pct}%)</span>
          <span class="leg-item"><i class="leg-dot bg-muted"></i> Remainder (${remPct}%)</span>
        </div>
      </div>

      <!-- Grid of Mass Balance Tables -->
      <div class="mb-tables-grid">
        <!-- 1. Incoming Sugarcane Bagasse -->
        <div class="mb-card">
          <div class="mb-card-header">
            <h4>1. Incoming Raw Sugarcane Bagasse</h4>
            <span class="mb-card-tag cat-literature">LITERATURE (PMC7801571)</span>
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Fraction</th><th>Dry Mass</th><th>Feedstock Share</th></tr>
            </thead>
            <tbody>
              <tr><td>Cellulose (C6 Polymer)</td><td>${(LITERATURE_FEEDSTOCK.fractions.cellulose.massKg * m.scale).toFixed(1)} kg</td><td>42.5%</td></tr>
              <tr><td>Hemicellulose (C5 Arabinoxylan)</td><td>${(LITERATURE_FEEDSTOCK.fractions.hemicellulose.massKg * m.scale).toFixed(1)} kg</td><td>25.8%</td></tr>
              <tr><td>Acid-Insoluble Lignin</td><td>${(LITERATURE_FEEDSTOCK.fractions.acidInsolubleLignin.massKg * m.scale).toFixed(1)} kg</td><td>22.1%</td></tr>
              <tr><td>Unassigned Remainder*</td><td>${(LITERATURE_FEEDSTOCK.fractions.unassignedRemainder.massKg * m.scale).toFixed(1)} kg</td><td>9.6%</td></tr>
              <tr class="table-total"><td>Total Dry Incoming Biomass</td><td>${m.basis.toFixed(1)} kg</td><td>100.0%</td></tr>
            </tbody>
          </table>
          <p class="table-note">* Remainder represents arithmetic balance closure, not measured extractives/ash.</p>
        </div>

        <!-- 2. Non-Overlapping Recovered Material Streams -->
        <div class="mb-card">
          <div class="mb-card-header">
            <h4>2. Non-Overlapping Recovered Streams</h4>
            <span class="mb-card-tag cat-estimate">CALCULATED YIELDS</span>
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Product Stream</th><th>Origin / Unit</th><th>Dry Yield</th><th>Share</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Hydrous Bioethanol (~93% ABV)</strong></td><td>Pathway A (Distillation)</td><td>${m.pathwayA.recoveredHydrousEthanolKg.toFixed(1)} kg (${m.pathwayA.ethanolLiters.toFixed(1)} L)</td><td>${ethPct}%</td></tr>
              <tr><td><strong>Finished Lignin Biosorbent</strong></td><td>Pathway B (Screening)</td><td>${m.pathwayB.finalBiosorbentKg.toFixed(1)} kg</td><td>${bioPct}%</td></tr>
              <tr class="proposed-row"><td><strong>Proposed Pentose Sugars [Unvalidated]</strong></td><td>Pathway C (Stream C Recovery)</td><td>${m.pathwayC.proposedRecoveredPentoseSugarsKg.toFixed(1)} kg</td><td>${sugPct}%</td></tr>
              <tr class="table-total"><td>Total Primary Recovered Products</td><td>Integrated Yield</td><td>${(m.pathwayA.recoveredHydrousEthanolKg + m.pathwayB.finalBiosorbentKg + m.pathwayC.proposedRecoveredPentoseSugarsKg).toFixed(1)} kg</td><td>${((m.pathwayA.recoveredHydrousEthanolKg + m.pathwayB.finalBiosorbentKg + m.pathwayC.proposedRecoveredPentoseSugarsKg)/m.basis*100).toFixed(1)}%</td></tr>
            </tbody>
          </table>
          <p class="table-note">Stream C is explicitly designated as proposed candidate recovery and not experimentally proven.</p>
        </div>

        <!-- 3. Documented Residual Streams -->
        <div class="mb-card mb-card-wide">
          <div class="mb-card-header">
            <h4>3. Documented Residual Streams & Secondary Recovery</h4>
            <span class="mb-card-tag cat-estimate">ENERGY & BY-PRODUCTS</span>
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Residual Stream</th><th>Origin Equipment</th><th>Fate / Application</th><th>Mass</th><th>Share</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Unhydrolyzed Cellulose Solids</strong></td>
                <td>Machine 4 (Hydrolysis filter residue)</td>
                <td>Solid boiler fuel / cogeneration steam</td>
                <td>${m.pathwayA.unconvertedSolidResidueKg.toFixed(1)} kg</td>
                <td>${resSolidsPct}%</td>
              </tr>
              <tr>
                <td><strong>Vinasse Stillage Bottoms</strong></td>
                <td>Machine 6 (Distillation bottoms)</td>
                <td>Anaerobic digestion (biomethane generation)</td>
                <td>${m.pathwayA.vinasseBottomsKg.toFixed(1)} kg</td>
                <td>${vinassePct}%</td>
              </tr>
              <tr>
                <td><strong>Biogenic CO2 Off-Gas</strong></td>
                <td>Machine 5 (Fermentation off-gas)</td>
                <td>Atmospheric vent / potential algaeculture capture</td>
                <td>${m.pathwayA.co2ProducedKg.toFixed(1)} kg</td>
                <td>${co2Pct}%</td>
              </tr>
              <tr>
                <td><strong>Acid-Soluble Lignin & Sizing Fines</strong></td>
                <td>Machines 7 & 8 (Precipitation filtrate & sizing)</td>
                <td>Neutralization effluent & boiler fines</td>
                <td>${(m.pathwayB.unprecipitatedAcidSolubleLigninLiquorKg + m.pathwayB.biosorbentProcessingLossKg).toFixed(1)} kg</td>
                <td>${ligLossPct}%</td>
              </tr>
              <tr>
                <td><strong>Unassigned Feedstock Remainder</strong></td>
                <td>Machine 1 (Initial bagasse matrix)</td>
                <td>Baseline material conservation</td>
                <td>${m.ledger.unassignedRemainderKg.toFixed(1)} kg</td>
                <td>${remPct}%</td>
              </tr>
              <tr class="table-total">
                <td colspan="3"><strong>Total Accounted Biomass (Products + Documented Residuals)</strong></td>
                <td><strong>${m.basis.toFixed(1)} kg</strong></td>
                <td><strong>100.0%</strong></td>
              </tr>
            </tbody>
          </table>
          <div class="callout-banner alert-info" style="margin-top: 10px;">
            <strong>ZERO DOUBLE-COUNTING AUDIT GUARANTEE:</strong> Every kilogram of incoming bagasse dry matter is partitioned strictly into mutually exclusive physical pathways. Cellulose is divided strictly between recovered ethanol, CO2 off-gas, unhydrolyzed solid fuel, and vinasse; lignin is divided between recovered biosorbent, acid-soluble filtrate, and boiler solids; hemicellulose is divided between proposed recovered pentose syrup and anaerobic digester liquor.
          </div>
        </div>
      </div>
    `;
  }

  setNarration(stepTag, text) {
    document.getElementById('narrationStepTag').textContent = stepTag;
    document.getElementById('narrationText').textContent = text;
  }

  setPlaybackState(isPlaying, isPaused) {
    this.isPlayingTour = isPlaying;
    const playBtnText = document.getElementById('playBtnText');
    const pauseBtnText = document.getElementById('pauseBtnText');

    if (isPlaying) {
      playBtnText.textContent = 'STOP TOUR';
      pauseBtnText.textContent = isPaused ? 'Resume' : 'Pause';
    } else {
      playBtnText.textContent = 'PLAY COMPLETE PROCESS';
      pauseBtnText.textContent = 'Pause';
    }
  }

  closeInspector() {
    const inspector = document.getElementById('machineInspector');
    if (inspector) inspector.classList.remove('active');
    const reopenBtn = document.getElementById('btnReopenInspector');
    if (reopenBtn && this.activeMachineId) {
      reopenBtn.style.display = 'flex';
      const textEl = document.getElementById('reopenInspectorText');
      if (textEl && this.activeMachineTitle) {
        textEl.textContent = `Reopen: ${this.activeMachineTitle}`;
      }
    }
  }

  renderStructuredPanel({ functionText, descriptionText, inputs, outputs, parameters, techNotes, formulaHtml }) {
    return `
      <!-- 1. PRIMARY FUNCTION -->
      <div class="insp-section-card">
        <div class="insp-section-title"><span class="insp-sec-icon">⚙️</span> FUNCTION</div>
        <div class="insp-function-highlight">${functionText}</div>
      </div>

      <!-- 2. PROCESS DESCRIPTION -->
      <div class="insp-section-card">
        <div class="insp-section-title"><span class="insp-sec-icon">🔬</span> PROCESS DESCRIPTION</div>
        <p class="insp-text-p">${descriptionText}</p>
      </div>

      <!-- 3. MATERIAL INPUTS & REAGENTS -->
      ${inputs && inputs.length > 0 ? `
        <div class="insp-section-card">
          <div class="insp-section-title"><span class="insp-sec-icon">📥</span> INPUTS & REAGENTS</div>
          <div class="insp-stream-list">
            ${inputs.map(inp => `
              <div class="insp-stream-row">
                <span class="insp-stream-tag tag-inlet">${inp.tag || 'INLET'}</span>
                <div class="insp-stream-details">
                  <strong class="insp-stream-name">${inp.label}</strong>
                  <span class="insp-stream-desc">${inp.desc}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 4. MATERIAL OUTPUTS & DESTINATIONS -->
      ${outputs && outputs.length > 0 ? `
        <div class="insp-section-card">
          <div class="insp-section-title"><span class="insp-sec-icon">📤</span> OUTPUTS & DESTINATIONS</div>
          <div class="insp-stream-list">
            ${outputs.map(out => `
              <div class="insp-stream-row">
                <span class="insp-stream-tag tag-outlet">${out.tag || 'OUTLET'}</span>
                <div class="insp-stream-details">
                  <strong class="insp-stream-name">${out.label}</strong>
                  <span class="insp-stream-desc">${out.desc}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- GOVERNING EQUATION / FORMULA (WHERE APPLICABLE) -->
      ${formulaHtml ? `
        <div class="insp-section-card">
          <div class="insp-section-title"><span class="insp-sec-icon">📐</span> GOVERNING EQUATIONS</div>
          <div class="insp-formula-wrap">${formulaHtml}</div>
        </div>
      ` : ''}

      <!-- 5. OPERATING PARAMETERS -->
      ${parameters && parameters.length > 0 ? `
        <div class="insp-section-card">
          <div class="insp-section-title"><span class="insp-sec-icon">📊</span> OPERATING PARAMETERS</div>
          <div class="insp-params-grid">
            ${parameters.map(p => `
              <div class="insp-param-card">
                <div class="param-lbl">${p.label}</div>
                <div class="param-val">${p.value}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 6. TECHNICAL NOTES & SCIENTIFIC CITATIONS -->
      ${techNotes ? `
        <div class="insp-section-card">
          <div class="insp-section-title"><span class="insp-sec-icon">📚</span> TECHNICAL NOTES & REFERENCES</div>
          <div class="insp-notes-box">${techNotes}</div>
        </div>
      ` : ''}
    `;
  }

  showMachineInspector(machineId) {
    this.activeMachineId = machineId;
    const reopenBtn = document.getElementById('btnReopenInspector');
    if (reopenBtn) reopenBtn.style.display = 'none';

    const inspector = document.getElementById('machineInspector');
    const titleEl = document.getElementById('inspTitle');
    const catBadge = document.getElementById('inspCategory');
    const bodyEl = document.getElementById('inspBody');

    const MACHINE_ACCENTS = {
      'machine-1': '#f59e0b',
      'machine-2': '#06b6d4',
      'machine-3': '#14b8a6',
      'machine-4': '#38bdf8',
      'machine-5': '#eab308',
      'machine-6': '#f97316',
      'machine-7': '#ef4444',
      'machine-8': '#d97706',
      'machine-9': '#d946ef',
      'machine-c': '#a855f7',
      'machine-10': '#10b981'
    };
    const accent = MACHINE_ACCENTS[machineId] || '#38bdf8';
    inspector.style.setProperty('--machine-accent', accent);
    inspector.style.setProperty('--machine-glow', `${accent}44`);

    const m = this.currentModel;
    inspector.classList.add('active');

    // Default to internal view when inspecting
    this.setViewMode('interior');

    document.querySelectorAll('.dock-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-machine') === machineId);
    });

    switch (machineId) {
      case 'machine-1':
        this.activeMachineTitle = '1. Feedstock Receiving, Conveyor & Shredder';
        titleEl.textContent = this.activeMachineTitle;
        catBadge.textContent = 'LITERATURE';
        catBadge.className = 'inspector-category-badge cat-literature';
        bodyEl.innerHTML = this.renderStructuredPanel({
          functionText: 'Automated bulk bagasse intake, weight verification, and continuous mechanical size reduction to prepare uniform fibres for downstream alkali pretreatment.',
          descriptionText: 'Raw baled sugarcane bagasse is deposited into an intake receiving hopper, metered via a variable-speed inclined conveyor with digital load cells, and processed through dual counter-rotating intermeshing cutter rolls to break recalcitrant macroscopic fibres into 0.5–2.0 mm particles.',
          inputs: [
            { tag: 'INLET', label: 'Raw Bagasse', desc: 'Baled sugarcane bagasse from agricultural storage bay (~50% field moisture, 100 kg dry basis calibration).' }
          ],
          outputs: [
            { tag: 'OUTLET', label: 'Sized Biomass Chute', desc: 'Calibrated dry-equivalent fibres discharging directly into Machine 2 (Alkaline Pretreatment Reactor).' }
          ],
          parameters: [
            { label: 'Conveyor Linear Velocity', value: '0.25 m/s' },
            { label: 'Cutter Roll Speed', value: '450 RPM' },
            { label: 'Target Particle Cut', value: '0.5 – 2.0 mm' },
            { label: 'Calibration Dry Basis', value: `${m.basis.toFixed(1)} kg` }
          ],
          techNotes: `
            <strong>Literature Composition Benchmark (PMC7801571):</strong><br>
            Standard dry basis sugarcane bagasse composition: 42.5% Cellulose (glucan), 25.8% Hemicellulose (arabinoxylan), 22.1% Acid-insoluble Lignin, and 9.6% Unassigned Remainder.<br>
            <em>* Note: The 9.6 kg unassigned remainder must NOT be claimed as measured ash or extractives without explicit analytical testing.</em>
          `
        });
        break;

      case 'machine-2':
        this.activeMachineTitle = '2. Alkaline Pretreatment Reactor (NaOH)';
        titleEl.textContent = this.activeMachineTitle;
        catBadge.textContent = 'ASSUMPTION';
        catBadge.className = 'inspector-category-badge cat-assumption';
        bodyEl.innerHTML = this.renderStructuredPanel({
          functionText: 'Thermochemical deconstruction of the lignocellulosic matrix: Saponification of intermolecular ester bonds and selective dissolution of recalcitrant lignin into soluble black liquor.',
          descriptionText: 'Sized bagasse fibres are submerged in 2.0% w/v sodium hydroxide (NaOH) solution under central fluid vortex agitation. Dual pitched-blade turbines maintain slurry suspension while steam jacket heating holds 100°C for 2.0 hours, solubilizing ~61.0% of native lignin and breaking lignin-carbohydrate complexes (LCC).',
          inputs: [
            { tag: 'INLET 1', label: 'Sized Bagasse', desc: 'Fibres from Machine 1 conveyor discharge chute.' },
            { tag: 'INLET 2', label: 'Chemical Dosing', desc: '2.0% w/v NaOH aqueous solution delivered via circumferential ring sparger (10:1 liquor-to-solid ratio).' },
            { tag: 'UTILITY', label: 'Heating Steam', desc: 'Low-pressure saturated steam circulated through thermal jacket.' }
          ],
          outputs: [
            { tag: 'OUTLET', label: 'Pretreated Slurry', desc: 'Dark slurry of enriched cellulose solid cake + dissolved black liquor pumped to Machine 3 Filter Press.' }
          ],
          parameters: [
            { label: 'Alkali Reagent', value: `${m.config.pretreatment.naohConcentrationPercent}% w/v NaOH` },
            { label: 'Operating Temperature', value: `${m.config.pretreatment.tempC}°C` },
            { label: 'Residence Time', value: `${m.config.pretreatment.residenceTimeHours} Hours` },
            { label: 'Lignin Solubilization Rate', value: `${(m.config.pretreatment.ligninSolubilizationRate * 100).toFixed(0)}% (Assumed)` }
          ],
          techNotes: `
            <strong>Scientific Literature Context (Sequential Alkali Study):</strong><br>
            Reported literature recovery ranges: Solid recovery 70.2 ± 2.4%, Cellulose retention in solid ~78.6%, Lignin solubilization 61.0%. These values represent engineering assumptions for our pilot model.
          `
        });
        break;

      case 'machine-3':
        this.activeMachineTitle = '3. Solid–Liquid Fractionation (Filter Press)';
        titleEl.textContent = this.activeMachineTitle;
        catBadge.textContent = 'CALCULATED ESTIMATE';
        catBadge.className = 'inspector-category-badge cat-estimate';
        bodyEl.innerHTML = this.renderStructuredPanel({
          functionText: 'High-pressure mechanical phase separation: Partitioning pretreated slurry into insoluble cellulose cake (Stream A), alkaline black liquor (Stream B), and soluble hemicellulose liquid (Stream C).',
          descriptionText: 'The pretreated dark slurry is pumped at 150 bar into recessed polypropylene filter plates. Heavy hydraulic closing rams press the slurry against synthetic filter cloths. Insoluble cellulose-rich cake is retained and washed, while black liquor drains through corner filtrate channels.',
          inputs: [
            { tag: 'INLET', label: 'Pretreated Slurry', desc: 'Alkaline biomass suspension from Machine 2 bottom cone valve.' },
            { tag: 'WASH', label: 'Process Wash Water', desc: 'Demineralized displacement wash to neutralize residual sodium hydroxide.' }
          ],
          outputs: [
            { tag: 'STREAM A', label: 'Cellulose Solid Cake', desc: `${m.pretreatmentResult.celluloseInSolidKg.toFixed(1)} kg Cellulose -> Conveyor to Machine 4 (Hydrolysis).` },
            { tag: 'STREAM B', label: 'Alkaline Black Liquor', desc: `${m.pretreatmentResult.ligninInLiquorKg.toFixed(1)} kg Solubilized Lignin -> Piping to Machine 7 (Acidification).` },
            { tag: 'STREAM C', label: 'Hemicellulose Liquid', desc: `${m.pathwayC.streamCHemicelluloseInputKg.toFixed(1)} kg Solubilized Hemicellulose -> Header to Machine C.` },
            { tag: 'DRAIN', label: 'Spent Wash Filtrate', desc: 'Neutralizing rinse water drained to Machine 10 Central Sump.' }
          ],
          parameters: [
            { label: 'Hydraulic Ram Pressure', value: '150 bar' },
            { label: 'Filtration Cycle Time', value: '45 Minutes' },
            { label: 'Dry Cake Recovery', value: `${m.pretreatmentResult.drySolidCakeKg.toFixed(1)} kg` },
            { label: 'Separation Efficiency', value: '> 98.5%' }
          ],
          techNotes: `
            <strong>Strict Non-Overlapping Stoichiometric Rule:</strong><br>
            All streams leaving the filter press are audited as mutually exclusive fractions. No material is double-counted between solid cake and filtrate. Never infer dry biomass from wet cake without moisture correction.
          `
        });
        break;

      case 'machine-4':
        this.activeMachineTitle = '4. Enzymatic Hydrolysis Bioreactor (Pathway A)';
        titleEl.textContent = this.activeMachineTitle;
        catBadge.textContent = 'CALCULATED ESTIMATE';
        catBadge.className = 'inspector-category-badge cat-estimate';
        bodyEl.innerHTML = this.renderStructuredPanel({
          functionText: 'Biocatalytic depolymerization: Cellulase enzymes hydrolyze insoluble β-1,4-glucan chains into fermentable D-glucose syrup with stoichiometric hydration.',
          descriptionText: 'Washed cellulose cake is suspended in citrate buffer solution at pH 4.8 and 50°C. An automated dosing valve delivers commercial cellulase enzyme cocktail (15 FPU/g). A double helical ribbon agitator circulates the viscous slurry during 72 hours of saccharification.',
          inputs: [
            { tag: 'STREAM A', label: 'Cellulose Cake', desc: 'Insoluble glucan-rich biomass from Machine 3 conveyor.' },
            { tag: 'BIOCATALYST', label: 'Cellulase Enzyme', desc: '15 FPU per gram of dry glucan (Trichoderma reesei cocktail).' },
            { tag: 'BUFFER', label: 'Citrate Buffer / H2O', desc: 'Process water maintaining pH 4.8 and ~15% w/w solid consistency.' }
          ],
          outputs: [
            { tag: 'PRODUCT', label: 'D-Glucose Syrup', desc: `Clarified fermentable monomer syrup (${m.pathwayA.estimatedGlucoseKg.toFixed(1)} kg C6) pumped to Machine 5.` },
            { tag: 'RESIDUAL', label: 'Unhydrolyzed Residue', desc: `${m.pathwayA.unconvertedSolidResidueKg.toFixed(1)} kg recalcitrant fibres routed to Machine 10 Cogeneration Boiler.` }
          ],
          formulaHtml: `
            <strong>Hydration Stoichiometry (180/162 Ratio):</strong><br>
            <code>(C6H10O5)n + n H2O → n C6H12O6 (D-Glucose)</code><br>
            Molecular Weight Factor = 180.16 / 162.14 = <strong>1.1111 (180/162)</strong><br>
            • Theoretical Glucose = ${m.pretreatmentResult.celluloseInSolidKg.toFixed(1)} kg Cellulose × 1.1111 = <strong>${m.pathwayA.theoreticalGlucoseKg.toFixed(1)} kg</strong><br>
            • Estimated Glucose (${(m.config.hydrolysis.celluloseConversionEfficiency * 100).toFixed(0)}% Conversion) = <strong>${m.pathwayA.estimatedGlucoseKg.toFixed(1)} kg</strong>
          `,
          parameters: [
            { label: 'Enzyme Loading', value: `${m.config.hydrolysis.enzymeDosingFPU_per_g} FPU/g glucan` },
            { label: 'Bioreactor pH', value: `${m.config.hydrolysis.ph}` },
            { label: 'Operating Temp', value: `${m.config.hydrolysis.temperatureC}°C` },
            { label: 'Residence Time', value: `${m.config.hydrolysis.residenceTimeHours} Hours` }
          ],
          techNotes: `
            <strong>Stoichiometric Integrity Notice:</strong><br>
            Water incorporated during glycosidic bond hydrolysis (+11.1% mass gain) is chemically added mass and must never be counted as recovered bagasse feedstock.
          `
        });
        break;

      case 'machine-5':
        this.activeMachineTitle = '5. Yeast Fermentation Bioreactor (Pathway A)';
        titleEl.textContent = this.activeMachineTitle;
        catBadge.textContent = 'CALCULATED ESTIMATE';
        catBadge.className = 'inspector-category-badge cat-estimate';
        bodyEl.innerHTML = this.renderStructuredPanel({
          functionText: 'Anaerobic microbial biocatalysis: Industrial yeast converts monomeric hexose sugars into bioethanol broth and biogenic carbon dioxide.',
          descriptionText: 'Clarified D-glucose syrup is pumped into an anaerobic stainless bioreactor and inoculated with Saccharomyces cerevisiae at 32°C. Yeast glycolytic pathways metabolize hexose into ethanol and biogenic CO2 microbubbles that rise through the liquid broth and vent via a top condenser scrubber.',
          inputs: [
            { tag: 'INLET 1', label: 'D-Glucose Syrup', desc: `Hydrolyzed hexose sugar stream (${m.pathwayA.estimatedGlucoseKg.toFixed(1)} kg) from Machine 4.` },
            { tag: 'INLET 2', label: 'Yeast Inoculum', desc: `${m.config.fermentation.yeastStrain} active dry yeast culture + micronutrients.` }
          ],
          outputs: [
            { tag: 'PRODUCT', label: 'Fermentation Beer', desc: 'Ethanol-rich aqueous broth (~6–10% ABV) harvested to Machine 6 Distillation.' },
            { tag: 'OFF-GAS', label: 'Biogenic CO2 Gas', desc: `${m.pathwayA.co2ProducedKg.toFixed(1)} kg carbon dioxide vented through rooftop foam trap.` },
            { tag: 'RESIDUAL', label: 'Spent Yeast Biomass', desc: 'Inactivated yeast cell cake routed to Machine 10 Digester.' }
          ],
          formulaHtml: `
            <strong>Gay-Lussac Stoichiometry:</strong><br>
            <code>C6H12O6 → 2 C2H5OH + 2 CO2</code><br>
            Theoretical Yield Factor = (2 × 46.07) / 180.16 = <strong>0.5111 g ethanol / g glucose</strong><br>
            • Theoretical Ethanol = ${m.pathwayA.estimatedGlucoseKg.toFixed(1)} kg Glucose × 0.5111 = <strong>${m.pathwayA.theoreticalEthanolKg.toFixed(1)} kg</strong><br>
            • Estimated Fermented Ethanol (${(m.config.fermentation.glucoseToEthanolEfficiency * 100).toFixed(0)}% Efficiency) = <strong>${m.pathwayA.estimatedFermentedEthanolKg.toFixed(1)} kg</strong>
          `,
          parameters: [
            { label: 'Yeast Strain', value: `${m.config.fermentation.yeastStrain}` },
            { label: 'Fermentation Temp', value: `${m.config.fermentation.temperatureC}°C` },
            { label: 'Anaerobic Time', value: `${m.config.fermentation.anaerobicHours} Hours` },
            { label: 'Theoretical Factor', value: '0.5111 g/g' }
          ],
          techNotes: `
            <strong>Inhibitor Sensitivity Notice:</strong><br>
            Hydroxymethylfurfural (HMF), furfural, and acetic acid generated during pretreatment can inhibit yeast glycolysis. Proper washing in Machine 3 prevents fermentation failure.
          `
        });
        break;

      case 'machine-6':
        this.activeMachineTitle = '6. Ethanol Distillation & Condenser (Pathway A)';
        titleEl.textContent = this.activeMachineTitle;
        catBadge.textContent = 'CALCULATED ESTIMATE';
        catBadge.className = 'inspector-category-badge cat-estimate';
        bodyEl.innerHTML = this.renderStructuredPanel({
          functionText: 'Multi-stage thermal separation: Stripping and concentrating volatile bioethanol from fermentation beer up to the binary azeotropic limit.',
          descriptionText: 'Fermentation broth enters the middle trays of an 8-tray bubble-cap column. Bottom thermosiphon reboiler steam vapour strips volatile ethanol upward. The enriched vapour enters an overhead horizontal shell-and-tube condenser, recovering hydrous ethanol while discharging de-alcoholized vinasse from the bottom.',
          inputs: [
            { tag: 'INLET', label: 'Fermentation Beer', desc: 'Dilute bioethanol broth feed pumped from Machine 5 harvest line.' },
            { tag: 'UTILITY', label: 'Reboiler Steam', desc: 'Process heating steam supplied from Machine 10 Cogeneration Boiler.' }
          ],
          outputs: [
            { tag: 'PRODUCT', label: 'Hydrous Ethanol', desc: `${m.pathwayA.recoveredHydrousEthanolKg.toFixed(1)} kg (${m.pathwayA.ethanolLiters.toFixed(1)} Liters at ~93.5% ABV) into storage.` },
            { tag: 'RESIDUAL', label: 'Vinasse Bottoms', desc: `${m.pathwayA.vinasseBottomsKg.toFixed(1)} kg organic-rich bottom stillage sent to Machine 10 Digester.` }
          ],
          parameters: [
            { label: 'Thermal Recovery', value: `${(m.config.distillation.thermalRecoveryRate * 100).toFixed(0)}%` },
            { label: 'Reboiler Temp', value: '102.5°C' },
            { label: 'Overhead Top Temp', value: '78.3°C' },
            { label: 'Product Purity', value: `${m.pathwayA.purityABV}% ABV (Hydrous)` }
          ],
          techNotes: `
            <strong>Azeotropic Boundary Disclaimer:</strong><br>
            Fractional distillation recovers hydrous ethanol (azeotrope ~95.6% ABV). Fuel-grade anhydrous ethanol (>99.5%) requires molecular-sieve dehydration. Never declare fuel-grade anhydrous without downstream dehydration.
          `
        });
        break;

      case 'machine-7':
        this.activeMachineTitle = '7. Lignin Acidification & Precipitation (Pathway B)';
        titleEl.textContent = this.activeMachineTitle;
        catBadge.textContent = 'CALCULATED ESTIMATE';
        catBadge.className = 'inspector-category-badge cat-estimate';
        bodyEl.innerHTML = this.renderStructuredPanel({
          functionText: 'Controlled acid precipitation: Shifting black liquor pH below the phenolic pKa to precipitate solubilized kraft/alkali lignin as brown solid floccules.',
          descriptionText: 'Alkaline black liquor (Stream B) from Machine 3 is charged into a glass-lined jacketed vessel. Dilute sulfuric acid (20% v/v H2SO4) is metered through a top dip-tube under high-shear propeller mixing, reducing pH from 12.8 to 2.0. Phenolic hydroxyls protonate, reducing electrostatic repulsion and aggregating insoluble lignin particles.',
          inputs: [
            { tag: 'STREAM B', label: 'Alkaline Black Liquor', desc: `${m.pretreatmentResult.ligninInLiquorKg.toFixed(1)} kg solubilized lignin from Machine 3 manifold.` },
            { tag: 'REAGENT', label: 'Dilute H2SO4 Acid', desc: '20% v/v industrial sulfuric acid dosing solution.' }
          ],
          outputs: [
            { tag: 'PRODUCT', label: 'Lignin Slurry', desc: `${m.pathwayB.precipitatedLigninDryKg.toFixed(1)} kg precipitated dry-equivalent lignin floccules to Machine 8.` },
            { tag: 'EFFLUENT', label: 'Acid Filtrate Sump', desc: `${m.pathwayB.unprecipitatedAcidSolubleLigninLiquorKg.toFixed(1)} kg acid-soluble lignin + sodium sulfate to wastewater.` }
          ],
          parameters: [
            { label: 'Initial Black Liquor pH', value: '12.8' },
            { label: 'Precipitation End pH', value: '2.0 ± 0.1' },
            { label: 'Reaction Temperature', value: '60°C' },
            { label: 'Precipitation Yield', value: `${(m.config.ligninRecovery.precipitationYield * 100).toFixed(0)}% (Assumed)` }
          ],
          techNotes: `
            <strong>Material Classification Notice:</strong><br>
            The precipitated solid is strictly classified as <em>lignin-rich material</em> (containing residual ash and co-precipitated pentosans), not 100% chemically pure analytical lignin.
          `
        });
        break;

      case 'machine-8':
        this.activeMachineTitle = '8. Biosorbent Washer, Dryer & Granulator (Pathway B)';
        titleEl.textContent = this.activeMachineTitle;
        catBadge.textContent = 'CALCULATED ESTIMATE';
        catBadge.className = 'inspector-category-badge cat-estimate';
        bodyEl.innerHTML = this.renderStructuredPanel({
          functionText: 'Post-precipitation conditioning: Sulfate salt washing, convective thermal moisture removal, and hammer-mill pulverization to yield porous biosorbent granules.',
          descriptionText: 'Three integrated sub-units: (8A) Rotary vacuum drum filter washes precipitated lignin cake with water sprays to wash out sulfate salts; (8B) Convective rotary drum dryer tumbles material at 105°C to <5% moisture; (8C) Hammer mill pulverizer calibrates dry chunks into 0.25–0.50 mm porous biosorbent granules.',
          inputs: [
            { tag: 'INLET', label: 'Precipitated Lignin', desc: 'Acidified flocculated lignin cake from Machine 7.' },
            { tag: 'WASH', label: 'Demineralized Water', desc: 'Spray wash on rotary drum to remove sodium sulfate salts.' },
            { tag: 'AIR', label: 'Convective Hot Air', desc: 'Thermal drying stream at 105°C.' }
          ],
          outputs: [
            { tag: 'PRODUCT', label: 'Porous Biosorbent', desc: `${m.pathwayB.finalBiosorbentKg.toFixed(1)} kg granulated dry biosorbent stored in hopper -> Machine 9.` },
            { tag: 'RESIDUAL', label: 'Sizing Fines & Dust', desc: `${m.pathwayB.biosorbentProcessingLossKg.toFixed(1)} kg screening dust routed to Machine 10 Cogeneration Boiler.` }
          ],
          parameters: [
            { label: 'Salt Removal Wash Rate', value: '> 96%' },
            { label: 'Drying Temperature', value: '105°C convective' },
            { label: 'Calibrated Particle Mesh', value: '0.25 – 0.50 mm' },
            { label: 'Screening Yield', value: `${(m.config.biosorbentPrep.sizingYield * 100).toFixed(0)}%` }
          ],
          techNotes: `
            <strong>Thermal Activation Context:</strong><br>
            Thermal drying at 105°C preserves functional surface groups (phenolic -OH and carboxylic -COOH) for cation electrostatic complexation without hazardous chemical crosslinkers.
          `
        });
        break;

      case 'machine-9':
        this.activeMachineTitle = '9. Wastewater Dye Adsorption Column (Pathway B)';
        titleEl.textContent = this.activeMachineTitle;
        catBadge.textContent = 'CALCULATED ESTIMATE';
        catBadge.className = 'inspector-category-badge cat-estimate';
        bodyEl.innerHTML = this.renderStructuredPanel({
          functionText: 'Continuous fixed-bed dye adsorption: Capturing synthetic cationic textile dye (Methylene Blue) onto porous lignin biosorbent granules.',
          descriptionText: 'Textile dye wastewater enters a top liquid distributor and trickles down through a packed bed of porous lignin granules. Liquid-solid mass transfer drives dye chromophores into intraparticle pores, binding via electrostatic attraction and π-π aromatic stacking.',
          inputs: [
            { tag: 'INLET', label: 'Dye Wastewater', desc: `Synthetic textile wastewater (${m.wastewater.C0} mg/L Methylene Blue, ${m.wastewater.V_L} L batch).` },
            { tag: 'PACKING', label: 'Biosorbent Bed', desc: `Dry granulated lignin biosorbent (${m.pathwayB.finalBiosorbentKg.toFixed(1)} kg) from Machine 8.` }
          ],
          outputs: [
            { tag: 'TREATED', label: 'Clarified Effluent', desc: `Treated effluent (${m.wastewater.Ce} mg/L residual, ${m.wastewater.dyeRemovalEfficiencyPercent.toFixed(1)}% removal) collected in tank.` },
            { tag: 'SPENT', label: 'Spent Biosorbent Bed', desc: 'Dye-loaded lignin granules discharged periodically for bio-composites or combustion.' }
          ],
          formulaHtml: `
            <strong>Adsorption Performance Formulas:</strong><br>
            • Removal Efficiency: <code>R (%) = ((C0 - Ce) / C0) × 100</code> = <strong>${m.wastewater.dyeRemovalEfficiencyPercent.toFixed(1)}%</strong><br>
            • Adsorption Capacity: <code>qe (mg/g) = ((C0 - Ce) × V) / m</code> = <strong>${m.wastewater.adsorptionCapacityQe_mg_g.toFixed(1)} mg/g</strong>
          `,
          parameters: [
            { label: 'Initial Dye C0', value: `${m.wastewater.C0} mg/L` },
            { label: 'Equilibrium Dye Ce', value: `${m.wastewater.Ce} mg/L` },
            { label: 'Batch Volume', value: `${m.wastewater.V_L} Liters` },
            { label: 'Adsorption Capacity qe', value: `${m.wastewater.adsorptionCapacityQe_mg_g.toFixed(1)} mg/g` }
          ],
          techNotes: `
            <strong style="color: #f87171;">CRITICAL WATER SAFETY WARNING:</strong><br>
            <strong>"VISUALLY CLEAR WATER IS NOT GUARANTEED SAFE DRINKING WATER."</strong><br>
            Chromatically clarified effluent has removed synthetic dye color, but dissolved organic carbon, heavy metals, microbial pathogens, and surfactants require accredited laboratory certification before discharge or reuse!
          `
        });
        break;

      case 'machine-c':
        this.activeMachineTitle = 'C. Hemicellulose Liquid & Proposed Sugar Recovery (Pathway C)';
        titleEl.textContent = this.activeMachineTitle;
        catBadge.textContent = 'PROPOSED (UNVALIDATED)';
        catBadge.className = 'inspector-category-badge cat-proposed';
        bodyEl.innerHTML = this.renderStructuredPanel({
          functionText: 'Candidate valorization pathway: Investigating catalytic or enzymatic post-hydrolysis of solubilized arabinoxylan into monomeric pentose sugars and furfural co-products.',
          descriptionText: 'Solubilized hemicellulose liquid from Machine 3 is transferred to an acid-tolerant secondary reactor for candidate post-hydrolysis. The conceptual process hydrolyzes branched xylan oligomers into monomeric D-xylose, L-arabinose, and platform furfural chemicals.',
          inputs: [
            { tag: 'STREAM C', label: 'Hemicellulose Liquid', desc: `${m.pathwayC.streamCHemicelluloseInputKg.toFixed(1)} kg solubilized arabinoxylan from Machine 3 header.` },
            { tag: 'CATALYST', label: 'Candidate Catalyst', desc: '0.5% dilute acid or endo-1,4-β-xylanase biocatalyst.' }
          ],
          outputs: [
            { tag: 'PROPOSED', label: 'Pentose Sugar Syrup', desc: `${m.pathwayC.proposedRecoveredPentoseSugarsKg.toFixed(1)} kg candidate D-xylose / L-arabinose syrup.` },
            { tag: 'PROPOSED', label: 'Furfural Co-product', desc: `${m.pathwayC.proposedFurfuralCoproduceKg.toFixed(1)} kg platform chemical intermediate.` },
            { tag: 'RESIDUAL', label: 'Residual Liquor', desc: 'Spent post-hydrolysis liquor routed to Machine 10 Anaerobic Digester.' }
          ],
          parameters: [
            { label: 'Stream C Input', value: `${m.pathwayC.streamCHemicelluloseInputKg.toFixed(1)} kg` },
            { label: 'Proposed Sugar Yield', value: `${(m.config.hemicelluloseSugarRecovery.pentoseSugarYieldFraction * 100).toFixed(0)}% (Candidate)` },
            { label: 'Reaction Temp (Prop.)', value: '120°C' },
            { label: 'Validation Status', value: 'UNVALIDATED CONCEPT' }
          ],
          techNotes: `
            <strong>Scientific Credibility Notice:</strong><br>
            Pathway C is a proposed engineering concept. All sugar yields and furfural numbers are candidate in-silico estimates, not claimed experimental measurements. Conditional on pilot validation.
          `
        });
        break;

      case 'machine-10':
        this.activeMachineTitle = '10. Residuals Management & Mass-Balance Ledger';
        titleEl.textContent = this.activeMachineTitle;
        catBadge.textContent = 'CALCULATED ESTIMATE';
        catBadge.className = 'inspector-category-badge cat-estimate';
        bodyEl.innerHTML = this.renderStructuredPanel({
          functionText: 'Facility-wide circular closure: Anaerobic biomethane digestion of aqueous residuals, biomass boiler cogeneration, and dry mass-balance reconciliation.',
          descriptionText: 'Residual streams from all operational units converge here for full circular closure: Unconverted cellulose fibres (Machine 4) and sizing dust (Machine 8) feed the cogeneration boiler for process steam. Liquid vinasse (Machine 6) and wash residues enter an anaerobic digester generating biomethane fuel gas.',
          inputs: [
            { tag: 'INLET 1', label: 'Solid Residue', desc: `${m.pathwayA.unconvertedSolidResidueKg.toFixed(1)} kg unhydrolyzed cellulose fibres to boiler.` },
            { tag: 'INLET 2', label: 'Vinasse Bottoms', desc: `${m.pathwayA.vinasseBottomsKg.toFixed(1)} kg organic-rich distillation stillage to digester.` },
            { tag: 'INLET 3', label: 'Sizing Fines', desc: `${m.pathwayB.biosorbentProcessingLossKg.toFixed(1)} kg lignin dust to boiler.` },
            { tag: 'DRAIN', label: 'Plant Washdowns', desc: 'Central drainage sump collecting floor and equipment washings.' }
          ],
          outputs: [
            { tag: 'ENERGY', label: 'Process Steam', desc: '15 bar saturated steam generated for pretreatment and distillation duties.' },
            { tag: 'ENERGY', label: 'Biomethane Gas', desc: 'High-BTU methane fuel gas from anaerobic digester off-take.' },
            { tag: 'RESIDUE', label: 'Boiler Ash & Sludge', desc: 'Mineral ash and stabilized anaerobic digestate biofertilizer.' }
          ],
          parameters: [
            { label: 'Total Accounted Share', value: `${m.ledger.totalIntegratedAccountingPercent.toFixed(1)}%` },
            { label: 'Solid Boiler Fuel', value: `${m.pathwayA.unconvertedSolidResidueKg.toFixed(1)} kg` },
            { label: 'Vinasse Digestion Liquor', value: `${m.pathwayA.vinasseBottomsKg.toFixed(1)} kg` },
            { label: 'Biogenic CO2 Gas', value: `${m.pathwayA.co2ProducedKg.toFixed(1)} kg` }
          ],
          techNotes: `
            <strong>Zero Unaccounted Material Policy:</strong><br>
            Every kilogram of dry sugarcane bagasse entering the facility is rigorously tracked through products, energy cogeneration, or audited process residuals.
          `
        });
        break;
    }
  }

  updateLabelToggleUI() {
    const btn = document.getElementById('btnToggleLabels');
    const txt = document.getElementById('labelToggleText');
    const floatBtn = document.getElementById('btnFloatToggleLabels');
    const floatStatus = document.getElementById('floatLabelStatus');

    if (btn && txt) {
      if (this.labelsVisible) {
        btn.classList.add('active');
        btn.classList.remove('btn-off');
        txt.textContent = 'Machine Labels: ON';
      } else {
        btn.classList.remove('active');
        btn.classList.add('btn-off');
        txt.textContent = 'Machine Labels: OFF';
      }
    }

    if (floatBtn && floatStatus) {
      if (this.labelsVisible) {
        floatBtn.classList.add('active');
        floatBtn.classList.remove('off');
        floatStatus.textContent = 'ON';
      } else {
        floatBtn.classList.remove('active');
        floatBtn.classList.add('off');
        floatStatus.textContent = 'OFF';
      }
    }
  }

  setLabelToggleState(visible) {
    this.labelsVisible = visible;
    this.updateLabelToggleUI();
  }
}
