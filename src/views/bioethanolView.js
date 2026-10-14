/**
 * CIRCUIT-BAGASSE+ | Bioethanol Calculator View
 * Section 7: Cellulose Enzymatic Hydrolysis, Gay-Lussac Fermentation & Thermal Recovery
 * Manual inputs, stoichiometric validation, empty states, and step-by-step audit.
 */

import { appState } from '../state.js';

export function renderBioethanolView(container) {
  const state = appState.getState();
  const { planningBalance, bioethanol } = appState.getCalculations();
  const isCalc = bioethanol.calculated;
  const eth = state.ethanol;

  // Check if mass balance was run so user can import cellulose easily
  const canImportFromMB = planningBalance.calculated && planningBalance.allocations && planningBalance.allocations.cellulose.allocatedKg > 0;
  const mbCelluloseKg = canImportFromMB ? planningBalance.allocations.cellulose.allocatedKg : 42.5;

  container.innerHTML = `
    <div class="view-page animate-fade-in">
      
      <!-- PAGE HEADER -->
      <header class="page-header">
        <div class="page-title-row">
          <div>
            <div class="page-breadcrumb">CIRCUIT-BAGASSE+ / STREAM A</div>
            <h1 class="page-title">Bioethanol Stoichiometric Engine & Recovery</h1>
            <p class="page-subtitle">Cellulose Enzymatic Hydrolysis, Gay-Lussac Fermentation & Azeotropic Recovery Modeling</p>
          </div>
          <div class="header-actions">
            <button class="btn-action-outline btn-load-ref" id="btn-load-ref-eth" title="Load Reference Literature Parameters">
              <span>⚡ Load Reference Baseline</span>
            </button>
            <button class="btn-action-outline btn-clear-inputs" id="btn-clear-eth" title="Clear all inputs and reset to empty state">
              <span>↺ Clear Inputs</span>
            </button>
          </div>
        </div>
      </header>

      <!-- PROMINENT LABEL BANNER -->
      <section class="scientific-alert-banner">
        <div class="alert-icon">⚗️</div>
        <div class="alert-content">
          <div class="alert-title">STOICHIOMETRIC SIMULATION ENGINE — IN-SILICO MODEL</div>
          <p class="alert-text">
            All stoichiometric yields are based on theoretical molecular mass conversion factors (hydration +11.1%, decarboxylation 0.511 g/g). These are unvalidated in-silico calculations and must not be reported as measured plant outputs. Fuel-grade anhydrous ethanol (&gt;99.5%) requires molecular sieve dehydration beyond standard distillation.
          </p>
        </div>
        <div class="alert-status-badge ${isCalc ? 'tier-calc' : 'tier-pending'}">${isCalc ? (eth.isReferenceScenario ? 'LITERATURE BASELINE' : 'USER CALCULATED') : 'AWAITING INPUT'}</div>
      </section>

      <!-- MANUAL INPUTS & PARAMETERS FORM -->
      <section class="card-panel manual-entry-panel">
        <div class="panel-header">
          <div class="panel-title-group">
            <span class="panel-icon">⚙️</span>
            <div>
              <h3 class="panel-title">Bioethanol Process Parameters</h3>
              <p class="panel-subtitle">Enter input glucan mass and stage conversion efficiencies to generate the stoichiometric model</p>
            </div>
          </div>
          ${canImportFromMB ? `
            <button type="button" class="btn-import-chip" id="btn-import-mb-cellulose" title="Use ${mbCelluloseKg.toFixed(2)} kg cellulose allocated from Mass Balance">
              <span>📥 Import from Mass Balance (${mbCelluloseKg.toFixed(2)} kg)</span>
            </button>
          ` : ''}
        </div>

        <form id="form-bioethanol" class="input-form-grid" onsubmit="return false;">
          <!-- 1. Cellulose Feedstock Input Mass -->
          <div class="form-field-card">
            <label class="field-label" for="input-cellulose-mass">
              <span>1. Cellulose Input Mass ($M_{cellulose}$):</span>
              <span class="unit-tag">kg dry glucan</span>
            </label>
            <input type="number" 
                   id="input-cellulose-mass" 
                   class="form-input-number highlight-cyan" 
                   min="0.1" 
                   max="10000" 
                   step="0.1" 
                   placeholder="e.g. 42.50"
                   value="${eth.celluloseInputKg !== '' && eth.celluloseInputKg !== null && eth.celluloseInputKg !== undefined ? eth.celluloseInputKg : ''}"
                   required>
            <div class="field-hint">PMC7801571 standard baseline: 42.5 kg glucan per 100 kg dry bagasse.</div>
          </div>

          <!-- 2. Hydrolysis Conversion % -->
          <div class="form-field-card">
            <label class="field-label" for="input-hyd-conv">
              <span>2. Hydrolysis Conversion ($\eta_{hyd}$):</span>
              <span class="unit-tag">%</span>
            </label>
            <input type="number" 
                   id="input-hyd-conv" 
                   class="form-input-number" 
                   min="1" 
                   max="100" 
                   step="1" 
                   placeholder="e.g. 80"
                   value="${eth.hydrolysisConversion !== '' && eth.hydrolysisConversion !== null && eth.hydrolysisConversion !== undefined ? (Number(eth.hydrolysisConversion) * 100).toFixed(0) : ''}"
                   required>
            <div class="field-hint">Enzyme conversion efficiency (prompt benchmark: 80%).</div>
          </div>

          <!-- 3. Fermentation Yield % of theoretical -->
          <div class="form-field-card">
            <label class="field-label" for="input-ferm-yield">
              <span>3. Fermentation Yield ($\eta_{ferm}$):</span>
              <span class="unit-tag">% theoretical</span>
            </label>
            <input type="number" 
                   id="input-ferm-yield" 
                   class="form-input-number highlight-teal" 
                   min="1" 
                   max="100" 
                   step="1" 
                   placeholder="e.g. 90"
                   value="${eth.fermentationYield !== '' && eth.fermentationYield !== null && eth.fermentationYield !== undefined ? (Number(eth.fermentationYield) * 100).toFixed(0) : ''}"
                   required>
            <div class="field-hint">Fraction of 0.5111 Gay-Lussac yield (prompt benchmark: 90%).</div>
          </div>

          <!-- 4. Distillation Recovery % -->
          <div class="form-field-card">
            <label class="field-label" for="input-dist-rec">
              <span>4. Thermal Distillation Recovery ($\eta_{rec}$):</span>
              <span class="unit-tag">%</span>
            </label>
            <input type="number" 
                   id="input-dist-rec" 
                   class="form-input-number highlight-amber" 
                   min="1" 
                   max="100" 
                   step="1" 
                   placeholder="e.g. 95"
                   value="${eth.ethanolRecovery !== '' && eth.ethanolRecovery !== null && eth.ethanolRecovery !== undefined ? (Number(eth.ethanolRecovery) * 100).toFixed(0) : ''}"
                   required>
            <div class="field-hint">Overhead column recovery (prompt benchmark: 95%).</div>
          </div>

          <!-- 5. Ethanol Density Assumption -->
          <div class="form-field-card">
            <label class="field-label" for="input-eth-density">
              <span>5. Ethanol Density ($\rho_{eth}$):</span>
              <span class="unit-tag">kg/L at 20°C</span>
            </label>
            <input type="number" 
                   id="input-eth-density" 
                   class="form-input-number" 
                   min="0.70" 
                   max="0.95" 
                   step="0.001" 
                   placeholder="0.789"
                   value="${eth.ethanolDensity || '0.789'}"
                   required>
            <div class="field-hint">Standard pure ethanol density: 0.789 kg/L.</div>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions-bar">
            <button type="button" class="btn-primary-action" id="btn-submit-eth">
              <span class="btn-icon">⚡</span>
              <span class="btn-text">Calculate Bioethanol Yield</span>
            </button>
            <button type="button" class="btn-secondary-action" id="btn-reset-form-eth">
              <span class="btn-icon">↺</span>
              <span class="btn-text">Reset to Empty</span>
            </button>
          </div>

          <!-- Inline Error Banner -->
          <div class="validation-msg-box" id="eth-validation-msg" style="display: none;"></div>
        </form>
      </section>

      <!-- RESULTS SECTION: Displays calculated metrics or informative empty state -->
      ${isCalc ? `
        <!-- RESULTS HIGHLIGHT CARDS -->
        <section class="kpi-grid">
          
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Cellulose Input</span>
              <span class="data-badge badge-calc">INPUT BASIS</span>
            </div>
            <div class="kpi-body">
              <div class="kpi-value-row">
                <span class="kpi-number highlight-cyan">${bioethanol.celluloseInputKg.toFixed(2)}</span>
                <span class="kpi-unit">kg glucan</span>
              </div>
              <div class="kpi-footer-note">Input dry biomass glucan charge</div>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Theoretical Glucose</span>
              <span class="data-badge badge-calc">180/162 RATIO</span>
            </div>
            <div class="kpi-body">
              <div class="kpi-value-row">
                <span class="kpi-number">${bioethanol.theoreticalGlucose.toFixed(2)}</span>
                <span class="kpi-unit">kg D-glucose</span>
              </div>
              <div class="kpi-footer-note">Hydration incorporates 1 mol H₂O per monomer (+11.1%)</div>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Glucose Produced</span>
              <span class="data-badge badge-calc">${(bioethanol.hydrolysisConversion * 100).toFixed(0)}% CONVERSION</span>
            </div>
            <div class="kpi-body">
              <div class="kpi-value-row">
                <span class="kpi-number highlight-teal">${bioethanol.glucoseProduced.toFixed(2)}</span>
                <span class="kpi-unit">kg C6 sugar</span>
              </div>
              <div class="kpi-footer-note">Hydrolyzed monomer pool for fermentation</div>
            </div>
          </div>

          <div class="kpi-card card-success-glow">
            <div class="kpi-header">
              <span class="kpi-label">Recovered Ethanol Mass</span>
              <span class="data-badge badge-calc">FINAL RECOVERED</span>
            </div>
            <div class="kpi-body">
              <div class="kpi-value-row">
                <span class="kpi-number highlight-emerald">${bioethanol.recoveredEthanolKg.toFixed(2)}</span>
                <span class="kpi-unit">kg</span>
              </div>
              <div class="kpi-footer-note">Liquid Volume: <strong class="highlight-cyan">${bioethanol.recoveredEthanolVolumeL.toFixed(2)} Liters</strong></div>
            </div>
          </div>

        </section>

        <!-- STEP-BY-STEP STOICHIOMETRIC FORMULAS -->
        <section class="section-grid-2col" style="margin-top: 24px;">
          
          <div class="card-panel">
            <div class="panel-header">
              <h3 class="panel-title">Step-by-Step Stoichiometric Audit</h3>
              <span class="panel-tag">Rigorous Equations</span>
            </div>

            <div class="formula-step-block">
              <div class="step-num">Step 1</div>
              <div class="step-title">Enzymatic Hydrolysis (180/162 Hydration):</div>
              <div class="step-eq">M_{gluc,theo} = M_{cell} \times (180.16 / 162.14) = ${bioethanol.celluloseInputKg.toFixed(2)} \times 1.1111 = <strong>${bioethanol.theoreticalGlucose.toFixed(2)} kg</strong></div>
              <div class="step-eq">M_{gluc,act} = M_{gluc,theo} \times \eta_{hyd} = ${bioethanol.theoreticalGlucose.toFixed(2)} \times ${bioethanol.hydrolysisConversion.toFixed(2)} = <strong class="highlight-cyan">${bioethanol.glucoseProduced.toFixed(2)} kg</strong></div>
            </div>

            <div class="formula-step-block">
              <div class="step-num">Step 2</div>
              <div class="step-title">Gay-Lussac Decarboxylation Fermentation:</div>
              <div class="step-eq">Y_{eth/gluc,theo} = (2 \times 46.07) / 180.16 = <strong>0.5111 g/g</strong></div>
              <div class="step-eq">M_{eth,theo} = M_{gluc,act} \times 0.5111 = ${bioethanol.glucoseProduced.toFixed(2)} \times 0.5111 = <strong>${bioethanol.theoreticalEthanol.toFixed(2)} kg</strong></div>
              <div class="step-eq">M_{eth,formed} = M_{eth,theo} \times \eta_{ferm} = ${bioethanol.theoreticalEthanol.toFixed(2)} \times ${bioethanol.fermentationYield.toFixed(2)} = <strong class="highlight-teal">${bioethanol.ethanolFormed.toFixed(2)} kg</strong></div>
            </div>

            <div class="formula-step-block">
              <div class="step-num">Step 3</div>
              <div class="step-title">Distillation Recovery & Volumetric Density:</div>
              <div class="step-eq">M_{eth,rec} = M_{eth,formed} \times \eta_{rec} = ${bioethanol.ethanolFormed.toFixed(2)} \times ${bioethanol.ethanolRecovery.toFixed(2)} = <strong class="highlight-emerald">${bioethanol.recoveredEthanolKg.toFixed(2)} kg</strong></div>
              <div class="step-eq">V_{eth,rec} = M_{eth,rec} / \rho_{eth} = ${bioethanol.recoveredEthanolKg.toFixed(2)} / ${bioethanol.ethanolDensity.toFixed(3)} = <strong class="highlight-cyan">${bioethanol.recoveredEthanolVolumeL.toFixed(2)} L</strong></div>
            </div>
          </div>

          <div class="card-panel">
            <div class="panel-header">
              <h3 class="panel-title">Bioprocess Inhibitors & Engineering Controls</h3>
              <span class="panel-tag">Technical Risks</span>
            </div>

            <div class="inhibitor-item">
              <div class="inhibitor-title">1. Furfural & 5-HMF</div>
              <p class="inhibitor-desc">Formed during pentose and hexose degradation under severe heat/acid. Inhibits yeast glycolytic enzymes, prolonging the fermentation lag phase.</p>
            </div>

            <div class="inhibitor-item">
              <div class="inhibitor-title">2. Acetic Acid & Phenolics</div>
              <p class="inhibitor-desc">Liberated from hemicellulose deacetylation and lignin dissolution. At concentrations >4 g/L, intracellular acidification halts ATP production.</p>
            </div>

            <div class="inhibitor-item">
              <div class="inhibitor-title">3. Engineering Mitigation</div>
              <p class="inhibitor-desc">Filter press solid-liquid washing (Machine 3) removes >92% of soluble inhibitors from the cellulose solid cake before enzymatic saccharification.</p>
            </div>
          </div>

        </section>
      ` : `
        <!-- HELPFUL EMPTY STATE -->
        <section class="empty-state-card">
          <div class="empty-state-icon">⚗️</div>
          <h3 class="empty-state-title">Awaiting Bioethanol Parameters</h3>
          <p class="empty-state-desc">
            No bioethanol calculation performed yet. Enter your glucan feedstock mass and stage conversion parameters above, then click <strong>Calculate Bioethanol Yield</strong> to run the stoichiometric model.
          </p>
          <div class="empty-state-actions">
            <button class="btn-action-primary" id="btn-empty-load-ref-eth">
              <span>⚡ Load Reference Literature Baseline (42.5 kg Glucan)</span>
            </button>
          </div>
        </section>
      `}

    </div>
  `;

  // Event Listeners
  const submitBtn = container.querySelector('#btn-submit-eth');
  const cellInput = container.querySelector('#input-cellulose-mass');
  const hydInput = container.querySelector('#input-hyd-conv');
  const fermInput = container.querySelector('#input-ferm-yield');
  const distInput = container.querySelector('#input-dist-rec');
  const densInput = container.querySelector('#input-eth-density');
  const errorBox = container.querySelector('#eth-validation-msg');

  function validateAndCalculate() {
    const cellVal = parseFloat(cellInput.value);
    const hydVal = parseFloat(hydInput.value);
    const fermVal = parseFloat(fermInput.value);
    const distVal = parseFloat(distInput.value);
    const densVal = parseFloat(densInput.value) || 0.789;

    const errors = [];
    if (isNaN(cellVal) || cellVal <= 0) {
      errors.push('Cellulose Input Mass must be a positive number greater than 0 kg.');
    }
    if (isNaN(hydVal) || hydVal <= 0 || hydVal > 100) {
      errors.push('Hydrolysis conversion must be between 1% and 100%.');
    }
    if (isNaN(fermVal) || fermVal <= 0 || fermVal > 100) {
      errors.push('Fermentation yield must be between 1% and 100% of theoretical.');
    }
    if (isNaN(distVal) || distVal <= 0 || distVal > 100) {
      errors.push('Distillation recovery must be between 1% and 100%.');
    }

    if (errors.length > 0) {
      errorBox.innerHTML = `⚠️ <strong>Validation Error:</strong><br>${errors.join('<br>')}`;
      errorBox.style.display = 'block';
      return;
    }

    errorBox.style.display = 'none';
    appState.calculateEthanol({
      celluloseInputKg: cellVal,
      hydrolysisConversion: hydVal / 100.0,
      fermentationYield: fermVal / 100.0,
      ethanolRecovery: distVal / 100.0,
      ethanolDensity: densVal
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', validateAndCalculate);
  }

  const importMbBtn = container.querySelector('#btn-import-mb-cellulose');
  if (importMbBtn) {
    importMbBtn.addEventListener('click', () => {
      cellInput.value = mbCelluloseKg.toFixed(2);
    });
  }

  const resetFormBtn = container.querySelector('#btn-reset-form-eth');
  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', () => {
      appState.clearEthanol();
    });
  }

  const clearEthBtn = container.querySelector('#btn-clear-eth');
  if (clearEthBtn) {
    clearEthBtn.addEventListener('click', () => {
      appState.clearEthanol();
    });
  }

  const loadRefBtn = container.querySelector('#btn-load-ref-eth');
  if (loadRefBtn) {
    loadRefBtn.addEventListener('click', () => {
      appState.calculateEthanol({
        celluloseInputKg: 42.5,
        hydrolysisConversion: 0.80,
        fermentationYield: 0.90,
        ethanolRecovery: 0.95,
        ethanolDensity: 0.789
      });
    });
  }

  const emptyLoadRefBtn = container.querySelector('#btn-empty-load-ref-eth');
  if (emptyLoadRefBtn) {
    emptyLoadRefBtn.addEventListener('click', () => {
      appState.calculateEthanol({
        celluloseInputKg: 42.5,
        hydrolysisConversion: 0.80,
        fermentationYield: 0.90,
        ethanolRecovery: 0.95,
        ethanolDensity: 0.789
      });
    });
  }
}
