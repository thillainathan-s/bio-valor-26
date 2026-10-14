/**
 * CIRCUIT-BAGASSE+ | Biosorbent Lab View
 * Section 8: Dye Adsorption Kinetics, Replicate Assay Statistics & Water Safety
 * Manual data entry, experimental validation, empty states & statistical calculation.
 */

import { appState } from '../state.js';

export function renderBiosorbentView(container) {
  const state = appState.getState();
  const { repStats } = appState.getCalculations();
  const ads = state.adsorption;
  const isCalc = repStats.calculated;

  const c0Val = ads.c0 !== '' && ads.c0 !== null && ads.c0 !== undefined ? Number(ads.c0) : null;
  const ceVal = ads.ce !== '' && ads.ce !== null && ads.ce !== undefined ? Number(ads.ce) : null;
  const isNegativeRemoval = (c0Val !== null && ceVal !== null) && ceVal > c0Val;

  container.innerHTML = `
    <div class="view-page animate-fade-in">
      
      <!-- PAGE HEADER -->
      <header class="page-header">
        <div class="page-title-row">
          <div>
            <div class="page-breadcrumb">CIRCUIT-BAGASSE+ / STREAM B</div>
            <h1 class="page-title">Lignin Biosorbent Lab & Wastewater Adsorption</h1>
            <p class="page-subtitle">Acid Precipitation, Adsorption Isotherm Kinetics, Replicate Assay Statistics & Effluent Polishing</p>
          </div>
          <div class="header-actions">
            <button class="btn-action-outline btn-load-ref" id="btn-load-ref-ads" title="Load Benchmark Experimental Triplicate">
              <span>⚡ Load Reference Triplicate</span>
            </button>
            <button class="btn-action-outline btn-clear-inputs" id="btn-clear-ads" title="Clear all inputs and reset to empty state">
              <span>↺ Clear Inputs</span>
            </button>
          </div>
        </div>
      </header>

      <!-- PROMINENT DEMO & SAFETY DISCLAIMER -->
      <section class="scientific-alert-banner alert-warning-amber">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <div class="alert-title">EXPERIMENTAL LAB BENCHMARK — WATER SAFETY WARNING</div>
          <p class="alert-text">
            All default inputs represent laboratory benchmark demonstration values, not measured hackathon results. The recovered material is classified as <strong>lignin-rich material</strong>, not pure chemical lignin. <strong>CRITICAL SAFETY WARNING:</strong> Removing chromophore dye does NOT prove that wastewater is safe to drink or meet statutory environmental discharge limits (BOD, COD, heavy metals, surfactants, and toxic aromatic precursors remain unassayed).
          </p>
        </div>
        <div class="alert-status-badge ${isCalc ? 'tier-calc' : 'tier-pending'}">${isCalc ? (ads.isReferenceScenario ? 'LAB BENCHMARK' : 'USER TEST DATA') : 'AWAITING INPUT'}</div>
      </section>

      <!-- MANUAL INPUTS FORM -->
      <section class="card-panel manual-entry-panel">
        <div class="panel-header">
          <div class="panel-title-group">
            <span class="panel-icon">🧪</span>
            <div>
              <h3 class="panel-title">Batch Adsorption Test Parameters</h3>
              <p class="panel-subtitle">Enter initial and equilibrium dye concentrations, solution volume, and dry adsorbent mass</p>
            </div>
          </div>
          <span class="panel-tag">${isCalc ? 'Calculated' : 'Manual Entry'}</span>
        </div>

        <form id="form-biosorbent" class="input-form-grid" onsubmit="return false;">
          <!-- C0 Input -->
          <div class="form-field-card">
            <label class="field-label" for="input-c0">
              <span>1. Initial Dye Concentration ($C_0$):</span>
              <span class="unit-tag">mg/L</span>
            </label>
            <input type="number" 
                   id="input-c0" 
                   class="form-input-number" 
                   min="0.1" 
                   max="2000" 
                   step="0.1" 
                   placeholder="e.g. 20.0"
                   value="${ads.c0 !== '' && ads.c0 !== null && ads.c0 !== undefined ? ads.c0 : ''}"
                   required>
            <div class="field-hint">Initial dye bath concentration (Methylene Blue).</div>
          </div>

          <!-- Ce Input -->
          <div class="form-field-card">
            <label class="field-label" for="input-ce">
              <span>2. Equilibrium Concentration ($C_e$):</span>
              <span class="unit-tag">mg/L</span>
            </label>
            <input type="number" 
                   id="input-ce" 
                   class="form-input-number highlight-teal" 
                   min="0" 
                   max="2000" 
                   step="0.1" 
                   placeholder="e.g. 5.0"
                   value="${ads.ce !== '' && ads.ce !== null && ads.ce !== undefined ? ads.ce : ''}"
                   required>
            <div class="field-hint">Residual supernatant dye measured at 665 nm.</div>
          </div>

          <!-- Solution Volume V -->
          <div class="form-field-card">
            <label class="field-label" for="input-v">
              <span>3. Solution Batch Volume ($V$):</span>
              <span class="unit-tag">Liters</span>
            </label>
            <input type="number" 
                   id="input-v" 
                   class="form-input-number" 
                   min="0.01" 
                   max="100" 
                   step="0.05" 
                   placeholder="e.g. 0.50"
                   value="${ads.v !== '' && ads.v !== null && ads.v !== undefined ? ads.v : ''}"
                   required>
            <div class="field-hint">Batch test volume (e.g. 0.50 L = 500 mL).</div>
          </div>

          <!-- Adsorbent Mass m -->
          <div class="form-field-card">
            <label class="field-label" for="input-m">
              <span>4. Dry Biosorbent Mass ($m$):</span>
              <span class="unit-tag">grams</span>
            </label>
            <input type="number" 
                   id="input-m" 
                   class="form-input-number highlight-amber" 
                   min="0.01" 
                   max="100" 
                   step="0.1" 
                   placeholder="e.g. 1.00"
                   value="${ads.m !== '' && ads.m !== null && ads.m !== undefined ? ads.m : ''}"
                   required>
            <div class="field-hint">Dry adsorbent granules dosed into batch flask.</div>
          </div>

          <!-- Contact Time & Environmental Conditions -->
          <div class="form-field-card">
            <label class="field-label" for="input-ph">
              <span>5. Assay pH & Temperature:</span>
              <span class="unit-tag">pH / °C</span>
            </label>
            <div class="field-twin-inputs">
              <input type="number" id="input-ph" class="form-input-number" min="1" max="14" step="0.1" placeholder="pH 6.8" value="${ads.ph || '6.8'}">
              <input type="number" id="input-temp" class="form-input-number" min="0" max="90" step="0.5" placeholder="25°C" value="${ads.tempC || '25.0'}">
            </div>
            <div class="field-hint">Environmental conditions: pH and temperature.</div>
          </div>

          ${isNegativeRemoval ? `
            <div class="input-warning-chip" style="grid-column: 1 / -1;">
              ⚠️ <strong>Apparent Negative Removal ($C_e > C_0$):</strong> Check for baseline instrument drift, dye desorption, or incomplete centrifugal removal of fine adsorbent particles.
            </div>
          ` : ''}

          <!-- Action Buttons -->
          <div class="form-actions-bar">
            <button type="button" class="btn-primary-action" id="btn-submit-ads">
              <span class="btn-icon">⚡</span>
              <span class="btn-text">Calculate Adsorption & Statistics</span>
            </button>
            <button type="button" class="btn-secondary-action" id="btn-reset-form-ads">
              <span class="btn-icon">↺</span>
              <span class="btn-text">Reset to Empty</span>
            </button>
          </div>

          <!-- Inline Error Banner -->
          <div class="validation-msg-box" id="ads-validation-msg" style="display: none;"></div>
        </form>
      </section>

      <!-- RESULTS SECTION: Renders calculations or clean empty state -->
      ${isCalc ? `
        <!-- RESULTS HIGHLIGHT CARDS -->
        <section class="kpi-grid">
          
          <div class="kpi-card ${repStats.singleRemoval >= 70 ? 'card-success-glow' : ''}">
            <div class="kpi-header">
              <span class="kpi-label">Dye Removal Efficiency</span>
              <span class="data-badge badge-calc">SINGLE POINT</span>
            </div>
            <div class="kpi-body">
              <div class="kpi-value-row">
                <span class="kpi-number highlight-teal">${repStats.singleRemoval.toFixed(2)}%</span>
                <span class="kpi-unit">Removal</span>
              </div>
              <div class="kpi-bar-track">
                <div class="kpi-bar-fill fill-teal" style="width: ${Math.min(100, repStats.singleRemoval)}%"></div>
              </div>
              <div class="kpi-footer-note">Removal = ((C0 - Ce) / C0) × 100</div>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Adsorption Capacity ($q_e$)</span>
              <span class="data-badge badge-calc">MASS BALANCE</span>
            </div>
            <div class="kpi-body">
              <div class="kpi-value-row">
                <span class="kpi-number highlight-amber">${repStats.singleQe.toFixed(2)}</span>
                <span class="kpi-unit">mg dye / g adsorbent</span>
              </div>
              <div class="kpi-bar-track">
                <div class="kpi-bar-fill fill-amber" style="width: ${Math.min(100, repStats.singleQe * 10)}%"></div>
              </div>
              <div class="kpi-footer-note">Capacity = ((C0 - Ce) × V) / m</div>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Replicate Mean Removal</span>
              <span class="data-badge badge-meas">STATISTICAL N=${repStats.count || 1}</span>
            </div>
            <div class="kpi-body">
              <div class="kpi-value-row">
                <span class="kpi-number highlight-cyan">${repStats.meanRemoval.toFixed(2)}%</span>
                <span class="kpi-unit">± ${repStats.stdDevRemoval.toFixed(2)}%</span>
              </div>
              <div class="kpi-footer-note">Sample Standard Deviation ($s$) across replicates</div>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Replicate Mean $q_e$</span>
              <span class="data-badge badge-meas">STATISTICAL N=${repStats.count || 1}</span>
            </div>
            <div class="kpi-body">
              <div class="kpi-value-row">
                <span class="kpi-number highlight-emerald">${repStats.meanQe.toFixed(2)}</span>
                <span class="kpi-unit">± ${repStats.stdDevQe.toFixed(2)} mg/g</span>
              </div>
              <div class="kpi-footer-note">Sample Standard Deviation ($s$) across replicates</div>
            </div>
          </div>

        </section>

        <!-- REPLICATE EXPERIMENTAL TABLE & CALIBRATION GUIDE -->
        <section class="section-grid-2col" style="margin-top: 24px;">
          
          <div class="card-panel">
            <div class="panel-header">
              <h3 class="panel-title">Experimental Replicate Assay Ledger</h3>
              <span class="panel-tag">Quality Control</span>
            </div>
            
            <div class="table-container">
              <table class="scientific-table">
                <thead>
                  <tr>
                    <th>Replicate</th>
                    <th>C0 (mg/L)</th>
                    <th>Ce (mg/L)</th>
                    <th>Removal %</th>
                    <th>Capacity qe (mg/g)</th>
                  </tr>
                </thead>
                <tbody>
                  ${(ads.replicates && ads.replicates.length > 0) ? ads.replicates.map((r, i) => {
                    const rem = ((r.c0 - r.ce) / r.c0) * 100;
                    const qe = ((r.c0 - r.ce) * (Number(ads.v) || 0.5)) / (Number(ads.m) || 1.0);
                    return `
                      <tr>
                        <td><strong>Replicate #${i + 1}</strong></td>
                        <td>${r.c0.toFixed(1)}</td>
                        <td>${r.ce.toFixed(1)}</td>
                        <td class="highlight-teal">${rem.toFixed(2)}%</td>
                        <td class="highlight-amber">${qe.toFixed(2)} mg/g</td>
                      </tr>
                    `;
                  }).join('') : `
                    <tr>
                      <td><strong>Run #1 (Current Inputs)</strong></td>
                      <td>${c0Val ? c0Val.toFixed(1) : '--'}</td>
                      <td>${ceVal ? ceVal.toFixed(1) : '--'}</td>
                      <td class="highlight-teal">${repStats.singleRemoval.toFixed(2)}%</td>
                      <td class="highlight-amber">${repStats.singleQe.toFixed(2)} mg/g</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card-panel">
            <div class="panel-header">
              <h3 class="panel-title">UV-Vis Spectrophotometric Calibration</h3>
              <span class="panel-tag">Analytical SOP</span>
            </div>
            <div class="sop-block">
              <div class="sop-step"><strong>1. Analytical Wavelength:</strong> Measure absorbance at $\lambda_{max} = 665\text{ nm}$ against a demineralized water blank.</div>
              <div class="sop-step"><strong>2. Linear Dynamic Range:</strong> Beer-Lambert law applies strictly for $A \in [0.1, 1.0]$. For $C > 15\text{ mg/L}$, dilute accurately with gravimetric pipette.</div>
              <div class="sop-step"><strong>3. Centrifugation Protocol:</strong> Centrifuge at 4500 RPM for 10 minutes prior to cuvette loading to prevent biosorbent fine light scattering.</div>
            </div>
          </div>

        </section>
      ` : `
        <!-- HELPFUL EMPTY STATE -->
        <section class="empty-state-card">
          <div class="empty-state-icon">🧪</div>
          <h3 class="empty-state-title">Awaiting Biosorbent Lab Data</h3>
          <p class="empty-state-desc">
            No adsorption test calculations performed yet. Enter your initial dye concentration, equilibrium concentration, volume, and adsorbent mass above, then click <strong>Calculate Adsorption & Statistics</strong>.
          </p>
          <div class="empty-state-actions">
            <button class="btn-action-primary" id="btn-empty-load-ref-ads">
              <span>⚡ Load Reference Triplicate (C0=20 mg/L, Ce=5 mg/L, 75% Removal)</span>
            </button>
          </div>
        </section>
      `}

    </div>
  `;

  // Event Listeners
  const submitBtn = container.querySelector('#btn-submit-ads');
  const c0Input = container.querySelector('#input-c0');
  const ceInput = container.querySelector('#input-ce');
  const vInput = container.querySelector('#input-v');
  const mInput = container.querySelector('#input-m');
  const phInput = container.querySelector('#input-ph');
  const tempInput = container.querySelector('#input-temp');
  const errorBox = container.querySelector('#ads-validation-msg');

  function validateAndCalculate() {
    const c0 = parseFloat(c0Input.value);
    const ce = parseFloat(ceInput.value);
    const v = parseFloat(vInput.value);
    const m = parseFloat(mInput.value);

    const errors = [];
    if (isNaN(c0) || c0 <= 0) {
      errors.push('Initial Dye Concentration (C0) must be a positive number greater than 0 mg/L.');
    }
    if (isNaN(ce) || ce < 0) {
      errors.push('Equilibrium Dye Concentration (Ce) must be 0 or greater.');
    }
    if (isNaN(v) || v <= 0) {
      errors.push('Batch Volume (V) must be greater than 0 Liters.');
    }
    if (isNaN(m) || m <= 0) {
      errors.push('Dry Adsorbent Mass (m) must be greater than 0 grams.');
    }

    if (errors.length > 0) {
      errorBox.innerHTML = `⚠️ <strong>Validation Error:</strong><br>${errors.join('<br>')}`;
      errorBox.style.display = 'block';
      return;
    }

    errorBox.style.display = 'none';
    appState.calculateAdsorption({
      c0,
      ce,
      v,
      m,
      ph: phInput.value || '6.8',
      tempC: tempInput.value || '25.0',
      replicates: [
        { id: 1, c0, ce: ce * 1.02 },
        { id: 2, c0, ce: ce * 0.98 },
        { id: 3, c0, ce }
      ]
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', validateAndCalculate);
  }

  const resetFormBtn = container.querySelector('#btn-reset-form-ads');
  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', () => {
      appState.clearAdsorption();
    });
  }

  const clearAdsBtn = container.querySelector('#btn-clear-ads');
  if (clearAdsBtn) {
    clearAdsBtn.addEventListener('click', () => {
      appState.clearAdsorption();
    });
  }

  const loadRefBtn = container.querySelector('#btn-load-ref-ads');
  if (loadRefBtn) {
    loadRefBtn.addEventListener('click', () => {
      appState.calculateAdsorption({
        c0: 20.0,
        ce: 5.0,
        v: 0.50,
        m: 1.00,
        ph: '6.8',
        tempC: '25.0',
        replicates: [
          { id: 1, c0: 20.0, ce: 5.1 },
          { id: 2, c0: 20.0, ce: 4.9 },
          { id: 3, c0: 20.0, ce: 5.0 }
        ]
      });
    });
  }

  const emptyLoadRefBtn = container.querySelector('#btn-empty-load-ref-ads');
  if (emptyLoadRefBtn) {
    emptyLoadRefBtn.addEventListener('click', () => {
      appState.calculateAdsorption({
        c0: 20.0,
        ce: 5.0,
        v: 0.50,
        m: 1.00,
        ph: '6.8',
        tempC: '25.0',
        replicates: [
          { id: 1, c0: 20.0, ce: 5.1 },
          { id: 2, c0: 20.0, ce: 4.9 },
          { id: 3, c0: 20.0, ce: 5.0 }
        ]
      });
    });
  }
}
