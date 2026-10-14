/**
 * CIRCUIT-BAGASSE+ | Mass Balance View
 * Strict non-overlapping stoichiometric allocation, manual data entry, validation & audit.
 */

import { appState, REFERENCE_SCENARIO } from '../state.js';
import { LITERATURE_FEEDSTOCK } from '../calculations.js';

export function renderMassBalanceView(container) {
  const state = appState.getState();
  const { planningBalance } = appState.getCalculations();
  const isCalc = planningBalance.calculated;

  container.innerHTML = `
    <div class="view-page animate-fade-in">
      
      <!-- PAGE HEADER -->
      <header class="page-header">
        <div class="page-title-row">
          <div>
            <div class="page-breadcrumb">CIRCUIT-BAGASSE+ / CORE REFINERY MODEL</div>
            <h1 class="page-title">Feedstock Mass Balance & Material Allocation</h1>
            <p class="page-subtitle">Strict non-overlapping stoichiometric reconciliation across the three primary biomass fractions</p>
          </div>
          <div class="header-actions">
            <button class="btn-action-outline btn-load-ref" id="btn-load-ref-mb" title="Load PMC7801571 Literature Reference Scenario">
              <span>⚡ Load Reference Baseline</span>
            </button>
            <button class="btn-action-outline btn-clear-inputs" id="btn-clear-mb" title="Clear all inputs and reset to empty state">
              <span>↺ Clear Inputs</span>
            </button>
          </div>
        </div>
      </header>

      <!-- PROMINENT MANDATORY SCIENTIFIC DISCLAIMER -->
      <section class="scientific-alert-banner">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <div class="alert-title">ACADEMIC / INDUSTRIAL PLANNING SCENARIO — SUBJECT TO AUDIT</div>
          <p class="alert-text">
            All feedstock allocations require explicit user data entry. The assumed recovery fractions represent engineering planning values and must be verified experimentally. No added water, alkali reagents, or enzymes may be counted as recovered dry biomass.
          </p>
        </div>
        <div class="alert-status-badge ${isCalc ? 'tier-calc' : 'tier-pending'}">${isCalc ? (state.planning.isReferenceScenario ? 'LITERATURE BASELINE' : 'USER SCENARIO') : 'AWAITING INPUT'}</div>
      </section>

      <!-- MANUAL INPUTS & PARAMETERS FORM -->
      <section class="card-panel manual-entry-panel">
        <div class="panel-header">
          <div class="panel-title-group">
            <span class="panel-icon">⚖️</span>
            <div>
              <h3 class="panel-title">Manual Biomass Allocation Parameters</h3>
              <p class="panel-subtitle">Enter dry feedstock mass and individual component recovery percentages (0–100%)</p>
            </div>
          </div>
          <span class="panel-tag">${isCalc ? 'Calculated' : 'Manual Entry'}</span>
        </div>

        <form id="form-mass-balance" class="input-form-grid" onsubmit="return false;">
          <!-- Feedstock Dry Basis Input -->
          <div class="form-field-card">
            <label class="field-label" for="input-feedstock-basis">
              <span>1. Dry Feedstock Input Mass ($F_{dry}$):</span>
              <span class="unit-tag">kg dry basis</span>
            </label>
            <input type="number" 
                   id="input-feedstock-basis" 
                   class="form-input-number" 
                   min="1" 
                   max="100000" 
                   step="0.5" 
                   placeholder="e.g. 100.0"
                   value="${state.planning.feedstockMassKg !== null && state.planning.feedstockMassKg !== undefined ? state.planning.feedstockMassKg : ''}"
                   required>
            <div class="field-hint">Literature reference: 100.0 kg dry sugarcane bagasse (PMC7801571).</div>
          </div>

          <!-- Cellulose Recovery % -->
          <div class="form-field-card">
            <label class="field-label" for="input-cellulose-frac">
              <span>2. Cellulose Recovery ($R_{cell}$):</span>
              <span class="unit-tag">% (Stream A)</span>
            </label>
            <input type="number" 
                   id="input-cellulose-frac" 
                   class="form-input-number highlight-cyan" 
                   min="0" 
                   max="100" 
                   step="1" 
                   placeholder="e.g. 90"
                   value="${state.planning.celluloseFraction !== '' && state.planning.celluloseFraction !== null && state.planning.celluloseFraction !== undefined ? (Number(state.planning.celluloseFraction) * 100).toFixed(0) : ''}"
                   required>
            <div class="field-hint">Reference scenario: 90% allocation of 42.5 kg cellulose -> 38.25 kg.</div>
          </div>

          <!-- Hemicellulose Recovery % -->
          <div class="form-field-card">
            <label class="field-label" for="input-hemicellulose-frac">
              <span>3. Hemicellulose Recovery ($R_{hemi}$):</span>
              <span class="unit-tag">% (Stream C)</span>
            </label>
            <input type="number" 
                   id="input-hemicellulose-frac" 
                   class="form-input-number highlight-purple" 
                   min="0" 
                   max="100" 
                   step="1" 
                   placeholder="e.g. 70"
                   value="${state.planning.hemicelluloseFraction !== '' && state.planning.hemicelluloseFraction !== null && state.planning.hemicelluloseFraction !== undefined ? (Number(state.planning.hemicelluloseFraction) * 100).toFixed(0) : ''}"
                   required>
            <div class="field-hint">Reference scenario: 70% allocation of 25.8 kg hemicellulose -> 18.06 kg.</div>
          </div>

          <!-- Lignin Recovery % -->
          <div class="form-field-card">
            <label class="field-label" for="input-lignin-frac">
              <span>4. Lignin Recovery ($R_{lig}$):</span>
              <span class="unit-tag">% (Stream B)</span>
            </label>
            <input type="number" 
                   id="input-lignin-frac" 
                   class="form-input-number highlight-amber" 
                   min="0" 
                   max="100" 
                   step="1" 
                   placeholder="e.g. 65"
                   value="${state.planning.ligninFraction !== '' && state.planning.ligninFraction !== null && state.planning.ligninFraction !== undefined ? (Number(state.planning.ligninFraction) * 100).toFixed(0) : ''}"
                   required>
            <div class="field-hint">Reference scenario: 65% allocation of 22.1 kg lignin -> 14.365 kg.</div>
          </div>

          <!-- Form Action Button Row -->
          <div class="form-actions-bar">
            <button type="button" class="btn-primary-action" id="btn-submit-mb">
              <span class="btn-icon">⚡</span>
              <span class="btn-text">Calculate Mass Balance</span>
            </button>
            <button type="button" class="btn-secondary-action" id="btn-reset-form-mb">
              <span class="btn-icon">↺</span>
              <span class="btn-text">Reset to Empty</span>
            </button>
          </div>

          <!-- Inline Error / Validation Message Banner -->
          <div class="validation-msg-box" id="mb-validation-msg" style="display: none;"></div>
        </form>
      </section>

      <!-- RESULTS SECTION: Renders calculations when valid, otherwise displays clean empty state -->
      ${isCalc ? `
        <!-- ALLOCATION TARGET HERO CARD -->
        <section class="balance-hero-card">
          <div class="target-col-left">
            <div class="target-metric-label">FEEDSTOCK ACCOUNTING RATIO</div>
            <div class="target-metric-value-row">
              <span class="big-metric-num ${planningBalance.accountingRatioPercent >= 70 ? 'highlight-teal' : 'highlight-rose'}">
                ${planningBalance.accountingRatioPercent.toFixed(3)}%
              </span>
              <span class="target-ratio-badge ${planningBalance.accountingRatioPercent >= 70 ? 'badge-pass' : 'badge-fail'}">
                ${planningBalance.accountingRatioPercent >= 70 ? 'NUMERIC THRESHOLD MET (≥ 70%)' : 'BELOW 70% TARGET'}
              </span>
            </div>
            
            <div class="target-sub-text">
              Allocated Biomass: <strong>${planningBalance.totalAllocatedKg.toFixed(3)} kg</strong> / Target: <strong>${planningBalance.targetKg.toFixed(1)} kg</strong> (70% of ${planningBalance.basis.toFixed(1)} kg dry feedstock)
            </div>

            <!-- Progress Bar with 70% Target Marker -->
            <div class="balance-progress-wrapper">
              <div class="balance-progress-track">
                <div class="balance-progress-fill ${planningBalance.accountingRatioPercent >= 70 ? 'fill-teal' : 'fill-rose'}" style="width: ${Math.min(100, (planningBalance.accountingRatioPercent / 100) * 100)}%"></div>
                <div class="target-threshold-pin" style="left: 70%" title="Competition 70% Requirement">
                  <span class="pin-line"></span>
                  <span class="pin-tag">70% Target</span>
                </div>
              </div>
            </div>
            <div class="progress-labels-row">
              <span>0 kg</span>
              <span class="label-center">Target Threshold: ${planningBalance.targetKg.toFixed(1)} kg</span>
              <span>${planningBalance.basis.toFixed(0)} kg Basis</span>
            </div>
          </div>

          <div class="target-col-right">
            <div class="audit-status-box ${planningBalance.hasDoubleCountingError ? 'audit-error' : 'audit-success'}">
              <div class="audit-icon">${planningBalance.hasDoubleCountingError ? '❌' : '🛡️'}</div>
              <div class="audit-title">Double-Counting Audit: ${planningBalance.hasDoubleCountingError ? 'FAILED' : 'VERIFIED CLEAN'}</div>
              <p class="audit-desc">
                ${planningBalance.hasDoubleCountingError 
                  ? 'CRITICAL ERROR: Component allocation exceeds physical 100% boundary or creates duplicate product claims!' 
                  : 'All material allocations are mutually exclusive. Cellulose, glucose, and ethanol are audited as separate non-overlapping stages. No added water or chemicals are credited as bagasse recovery.'}
              </p>
            </div>
          </div>
        </section>

        <!-- MASS BALANCE RECONCILIATION TABLE -->
        <section class="dash-section">
          <div class="section-heading-row">
            <div>
              <h2 class="section-title">Feedstock Component Reconciliation Ledger</h2>
              <p class="section-sub">Detailed breakdown of dry bagasse fractions from initial inventory to final verified destinations</p>
            </div>
            <span class="data-badge badge-calc">Validated Calculation</span>
          </div>

          <div class="table-container">
            <table class="scientific-table">
              <thead>
                <tr>
                  <th>Stream / Component</th>
                  <th>Initial Mass (kg)</th>
                  <th>Initial %</th>
                  <th>Allocated Fraction</th>
                  <th>Allocated Mass (kg)</th>
                  <th>Unallocated / Residual (kg)</th>
                  <th>Primary Destination</th>
                  <th>Accounting Eligibility</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Cellulose Fraction</strong></td>
                  <td>${planningBalance.initial.celluloseKg.toFixed(2)}</td>
                  <td>42.5%</td>
                  <td>${(Number(state.planning.celluloseFraction) * 100).toFixed(0)}%</td>
                  <td class="highlight-cyan font-bold">${planningBalance.allocations.cellulose.allocatedKg.toFixed(3)}</td>
                  <td>${(planningBalance.initial.celluloseKg - planningBalance.allocations.cellulose.allocatedKg).toFixed(3)}</td>
                  <td>Pathway A: Hydrolysis & Bioethanol</td>
                  <td><span class="badge-eligible">Eligible (Single-Count)</span></td>
                </tr>
                <tr>
                  <td><strong>Hemicellulose Fraction</strong></td>
                  <td>${planningBalance.initial.hemicelluloseKg.toFixed(2)}</td>
                  <td>25.8%</td>
                  <td>${(Number(state.planning.hemicelluloseFraction) * 100).toFixed(0)}%</td>
                  <td class="highlight-purple font-bold">${planningBalance.allocations.hemicellulose.allocatedKg.toFixed(3)}</td>
                  <td>${(planningBalance.initial.hemicelluloseKg - planningBalance.allocations.hemicellulose.allocatedKg).toFixed(3)}</td>
                  <td>Pathway C: Proposed Pentose Sugar Recovery</td>
                  <td><span class="badge-conditional">Conditional on Validation</span></td>
                </tr>
                <tr>
                  <td><strong>Acid-Insoluble Lignin</strong></td>
                  <td>${planningBalance.initial.ligninKg.toFixed(2)}</td>
                  <td>22.1%</td>
                  <td>${(Number(state.planning.ligninFraction) * 100).toFixed(0)}%</td>
                  <td class="highlight-amber font-bold">${planningBalance.allocations.lignin.allocatedKg.toFixed(3)}</td>
                  <td>${(planningBalance.initial.ligninKg - planningBalance.allocations.lignin.allocatedKg).toFixed(3)}</td>
                  <td>Pathway B: Acid Precipitation & Biosorbent</td>
                  <td><span class="badge-eligible">Eligible (Single-Count)</span></td>
                </tr>
                <tr>
                  <td><strong>Unassigned Remainder</strong></td>
                  <td>${planningBalance.initial.remainderKg.toFixed(2)}</td>
                  <td>9.6%</td>
                  <td>0%</td>
                  <td class="highlight-dim">0.000</td>
                  <td>${planningBalance.initial.remainderKg.toFixed(3)}</td>
                  <td>Quarantine: Sump / Ash Testing</td>
                  <td><span class="badge-ineligible">Ineligible (Unmeasured)</span></td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="table-total-row">
                  <th>Total Dry Bagasse</th>
                  <th>${planningBalance.basis.toFixed(2)} kg</th>
                  <th>100.0%</th>
                  <th>—</th>
                  <th class="highlight-teal font-bold">${planningBalance.totalAllocatedKg.toFixed(3)} kg</th>
                  <th>${(planningBalance.basis - planningBalance.totalAllocatedKg).toFixed(3)} kg</th>
                  <th>3 Pathways + Residue Sump</th>
                  <th>
                    Ratio: <strong class="highlight-teal">${planningBalance.accountingRatioPercent.toFixed(3)}%</strong>
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      ` : `
        <!-- HELPFUL EMPTY STATE CONTAINER -->
        <section class="empty-state-card">
          <div class="empty-state-icon">📋</div>
          <h3 class="empty-state-title">Awaiting Mass Balance Input</h3>
          <p class="empty-state-desc">
            No mass balance calculation has been performed yet. Enter your feedstock dry mass and component recovery percentages above, then click <strong>Calculate Mass Balance</strong> to generate the stoichiometric accounting ledger.
          </p>
          <div class="empty-state-actions">
            <button class="btn-action-primary" id="btn-empty-load-ref">
              <span>⚡ Load Reference Literature Baseline (100 kg Basis)</span>
            </button>
          </div>
        </section>
      `}

      <!-- GOVERNING EQUATIONS REFERENCE CARD -->
      <section class="card-panel" style="margin-top: 24px;">
        <div class="panel-header">
          <h3 class="panel-title">Governing Mass Balance Equations</h3>
          <span class="panel-tag">Rigorous Formulations</span>
        </div>
        <div class="formula-grid-3col">
          <div class="formula-card">
            <div class="formula-title">1. Component Mass ($M_i$)</div>
            <div class="formula-code">M_i = Dry Feedstock Mass × Component Fraction</div>
            <div class="formula-example">Cellulose: 100 kg × 0.425 = 42.50 kg | Hemi: 25.8 kg | Lignin: 22.1 kg</div>
          </div>
          <div class="formula-card">
            <div class="formula-title">2. Recovered Component Mass ($M_{rec,i}$)</div>
            <div class="formula-code">M_{rec,i} = M_i × Recovery Fraction (R_i)</div>
            <div class="formula-example">Cellulose: 42.5 × 0.90 = 38.25 kg | Hemi: 18.06 kg | Lignin: 14.365 kg</div>
          </div>
          <div class="formula-card">
            <div class="formula-title">3. Accounting Ratio ($\eta_{account}$ %)</div>
            <div class="formula-code">\eta = (\sum M_{rec,i} / M_{initial,dry}) \times 100</div>
            <div class="formula-example">(38.25 + 18.06 + 14.365) / 100.0 × 100 = <strong>70.675%</strong></div>
          </div>
        </div>
      </section>

    </div>
  `;

  // Attach Event Handlers
  const submitBtn = container.querySelector('#btn-submit-mb');
  const basisInput = container.querySelector('#input-feedstock-basis');
  const cellInput = container.querySelector('#input-cellulose-frac');
  const hemiInput = container.querySelector('#input-hemicellulose-frac');
  const ligInput = container.querySelector('#input-lignin-frac');
  const errorBox = container.querySelector('#mb-validation-msg');

  function validateAndCalculate() {
    const basisVal = parseFloat(basisInput.value);
    const cellVal = parseFloat(cellInput.value);
    const hemiVal = parseFloat(hemiInput.value);
    const ligVal = parseFloat(ligInput.value);

    const errors = [];
    if (isNaN(basisVal) || basisVal <= 0) {
      errors.push('Dry Feedstock Input Mass must be a positive number greater than 0 kg.');
    }
    if (isNaN(cellVal) || cellVal < 0 || cellVal > 100) {
      errors.push('Cellulose recovery percentage must be between 0% and 100%.');
    }
    if (isNaN(hemiVal) || hemiVal < 0 || hemiVal > 100) {
      errors.push('Hemicellulose recovery percentage must be between 0% and 100%.');
    }
    if (isNaN(ligVal) || ligVal < 0 || ligVal > 100) {
      errors.push('Lignin recovery percentage must be between 0% and 100%.');
    }

    if (errors.length > 0) {
      errorBox.innerHTML = `⚠️ <strong>Validation Error:</strong><br>${errors.join('<br>')}`;
      errorBox.style.display = 'block';
      return;
    }

    errorBox.style.display = 'none';
    appState.calculatePlanning({
      feedstockMassKg: basisVal,
      celluloseFraction: cellVal / 100.0,
      hemicelluloseFraction: hemiVal / 100.0,
      ligninFraction: ligVal / 100.0
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', validateAndCalculate);
  }

  const resetFormBtn = container.querySelector('#btn-reset-form-mb');
  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', () => {
      appState.clearPlanning();
    });
  }

  const clearMbBtn = container.querySelector('#btn-clear-mb');
  if (clearMbBtn) {
    clearMbBtn.addEventListener('click', () => {
      appState.clearPlanning();
    });
  }

  const loadRefBtn = container.querySelector('#btn-load-ref-mb');
  if (loadRefBtn) {
    loadRefBtn.addEventListener('click', () => {
      appState.calculatePlanning({
        feedstockMassKg: 100.0,
        celluloseFraction: 0.90,
        hemicelluloseFraction: 0.70,
        ligninFraction: 0.65
      });
    });
  }

  const emptyLoadRefBtn = container.querySelector('#btn-empty-load-ref');
  if (emptyLoadRefBtn) {
    emptyLoadRefBtn.addEventListener('click', () => {
      appState.calculatePlanning({
        feedstockMassKg: 100.0,
        celluloseFraction: 0.90,
        hemicelluloseFraction: 0.70,
        ligninFraction: 0.65
      });
    });
  }
}
