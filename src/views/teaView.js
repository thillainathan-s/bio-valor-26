/**
 * CIRCUIT-BAGASSE+ | Techno-Economic Analysis (TEA) View
 * Section 10: Multi-Scenario Financial Comparison, Manual Inputs & Empty States
 */

import { appState } from '../state.js';

export function renderTEAView(container) {
  const state = appState.getState();
  const { tea, bioModel } = appState.getCalculations();
  const p = state.tea;
  const isCalc = tea.calculated;

  container.innerHTML = `
    <div class="view-page animate-fade-in">
      
      <!-- PAGE HEADER -->
      <header class="page-header">
        <div class="page-title-row">
          <div>
            <div class="page-breadcrumb">CIRCUIT-BAGASSE+ / ECONOMIC ASSESSMENT</div>
            <h1 class="page-title">Techno-Economic Analysis (TEA) & Scenario Comparison</h1>
            <p class="page-subtitle">Comparative Operating Margin: Boiler Baseline vs Ethanol-Only vs Integrated Biorefinery</p>
          </div>
          <div class="header-actions">
            <button class="btn-action-outline btn-load-ref" id="btn-load-ref-tea" title="Load Academic Literature Assumptions">
              <span>⚡ Load Literature Assumptions</span>
            </button>
            <button class="btn-action-outline btn-clear-inputs" id="btn-clear-tea" title="Clear all inputs and reset to empty state">
              <span>↺ Clear Inputs</span>
            </button>
          </div>
        </div>
      </header>

      <!-- PROMINENT PRICING & MARKET DISCLAIMER -->
      <section class="scientific-alert-banner alert-warning-amber">
        <div class="alert-icon">💡</div>
        <div class="alert-content">
          <div class="alert-title">ILLUSTRATIVE ECONOMIC ASSUMPTIONS — NOT VERIFIED INDIAN MARKET SPOT PRICES</div>
          <p class="alert-text">
            All prices ($0.95/L ethanol, $3.20/kg biosorbent, $28/ton bagasse boiler opportunity cost) represent illustrative academic engineering assumptions derived from literature (Gubicza et al., 2016; Konde et al., 2021). <strong>Never claim that integrated processing is automatically more profitable</strong> without rigorous local vendor quotes and off-take purchase agreements.
          </p>
        </div>
        <div class="alert-status-badge ${isCalc ? 'tier-calc' : 'tier-pending'}">${isCalc ? (p.isReferenceScenario ? 'LITERATURE ASSUMPTIONS' : 'USER SCENARIO') : 'AWAITING INPUT'}</div>
      </section>

      <!-- MANUAL ECONOMIC INPUTS FORM -->
      <section class="card-panel manual-entry-panel">
        <div class="panel-header">
          <div class="panel-title-group">
            <span class="panel-icon">📈</span>
            <div>
              <h3 class="panel-title">Economic Assumptions & Market Pricing</h3>
              <p class="panel-subtitle">Configure feedstock opportunity cost, off-take market selling prices, and estimated operating expenditures (OPEX)</p>
            </div>
          </div>
          <span class="panel-tag">${isCalc ? 'Calculated' : 'Manual Entry'}</span>
        </div>

        <form id="form-tea" class="input-form-grid" onsubmit="return false;">
          <!-- 1. Bagasse Opportunity Cost -->
          <div class="form-field-card">
            <label class="field-label" for="input-tea-bagasse">
              <span>1. Bagasse Opportunity Cost:</span>
              <span class="unit-tag">$/ton dry basis</span>
            </label>
            <input type="number" 
                   id="input-tea-bagasse" 
                   class="form-input-number highlight-amber" 
                   min="0" 
                   max="500" 
                   step="1" 
                   placeholder="e.g. 28.00"
                   value="${p.bagasseOpportunityCostPerTon || ''}"
                   required>
            <div class="field-hint">Opportunity value of bagasse burned in existing boilers.</div>
          </div>

          <!-- 2. Ethanol Market Price -->
          <div class="form-field-card">
            <label class="field-label" for="input-tea-ethanol-price">
              <span>2. Bioethanol Selling Price:</span>
              <span class="unit-tag">$/Liter</span>
            </label>
            <input type="number" 
                   id="input-tea-ethanol-price" 
                   class="form-input-number highlight-cyan" 
                   min="0.1" 
                   max="10" 
                   step="0.05" 
                   placeholder="e.g. 0.95"
                   value="${p.ethanolSellingPricePerLiter || ''}"
                   required>
            <div class="field-hint">Illustrative wholesale hydrous ethanol price.</div>
          </div>

          <!-- 3. Biosorbent Market Price -->
          <div class="form-field-card">
            <label class="field-label" for="input-tea-sorbent-price">
              <span>3. Biosorbent Selling Price:</span>
              <span class="unit-tag">$/kg dry granules</span>
            </label>
            <input type="number" 
                   id="input-tea-sorbent-price" 
                   class="form-input-number highlight-teal" 
                   min="0.1" 
                   max="50" 
                   step="0.1" 
                   placeholder="e.g. 3.20"
                   value="${p.biosorbentSellingPricePerKg || ''}"
                   required>
            <div class="field-hint">Illustrative granular biosorbent market price.</div>
          </div>

          <!-- 4. OPEX Scenario B -->
          <div class="form-field-card">
            <label class="field-label" for="input-tea-opex-b">
              <span>4. OPEX Scenario B (Ethanol-Only):</span>
              <span class="unit-tag">$/ton bagasse</span>
            </label>
            <input type="number" 
                   id="input-tea-opex-b" 
                   class="form-input-number" 
                   min="10" 
                   max="1000" 
                   step="5" 
                   placeholder="e.g. 145.00"
                   value="${p.opexScenarioB || ''}"
                   required>
            <div class="field-hint">Chemicals, enzymes, steam & power for ethanol only.</div>
          </div>

          <!-- 5. OPEX Scenario C -->
          <div class="form-field-card">
            <label class="field-label" for="input-tea-opex-c">
              <span>5. OPEX Scenario C (Integrated):</span>
              <span class="unit-tag">$/ton bagasse</span>
            </label>
            <input type="number" 
                   id="input-tea-opex-c" 
                   class="form-input-number" 
                   min="10" 
                   max="1000" 
                   step="5" 
                   placeholder="e.g. 175.00"
                   value="${p.opexScenarioC || ''}"
                   required>
            <div class="field-hint">Chemicals, acid precipitation, washing, drying & sizing.</div>
          </div>

          <!-- Actions Bar -->
          <div class="form-actions-bar">
            <button type="button" class="btn-primary-action" id="btn-submit-tea">
              <span class="btn-icon">⚡</span>
              <span class="btn-text">Run Techno-Economic Evaluation</span>
            </button>
            <button type="button" class="btn-secondary-action" id="btn-reset-form-tea">
              <span class="btn-icon">↺</span>
              <span class="btn-text">Reset to Empty</span>
            </button>
          </div>

          <!-- Inline Error Banner -->
          <div class="validation-msg-box" id="tea-validation-msg" style="display: none;"></div>
        </form>
      </section>

      <!-- RESULTS SECTION: Renders Scenarios A, B, C or clean empty state -->
      ${isCalc ? `
        <!-- 3 SCENARIO COMPARISON TILES -->
        <section class="scenario-grid">
          
          <!-- SCENARIO A: BOILER FUEL BASELINE -->
          <div class="scenario-card">
            <div class="scenario-badge">SCENARIO A</div>
            <h3 class="scenario-title">Existing Mill Boiler Fuel (Baseline)</h3>
            <p class="scenario-desc">Direct combustion of raw bagasse in sugar mill boilers for internal process steam and cogenerated electricity.</p>
            
            <div class="scenario-financial-strip">
              <div class="fin-row">
                <span class="fin-label">Fuel Value (Avoided Coal/Gas):</span>
                <span class="fin-val highlight-amber">$${tea.scenarioA.revenue.toFixed(2)}/t</span>
              </div>
              <div class="fin-row">
                <span class="fin-label">Collection & Handling Cost:</span>
                <span class="fin-val font-mono">$${tea.scenarioA.cost.toFixed(2)}/t</span>
              </div>
              <div class="fin-row total-row">
                <span class="fin-label">Net Baseline Contribution:</span>
                <span class="fin-val highlight-teal font-bold">$${tea.scenarioA.net.toFixed(2)}/t</span>
              </div>
            </div>
            <div class="scenario-tag baseline-tag">Baseline Reference</div>
          </div>

          <!-- SCENARIO B: BIOETHANOL ONLY -->
          <div class="scenario-card">
            <div class="scenario-badge">SCENARIO B</div>
            <h3 class="scenario-title">Bioethanol-Only Biorefinery</h3>
            <p class="scenario-desc">Enzymatic saccharification & distillation (~${tea.ethLitersPerTon.toFixed(1)} L/ton bagasse). Black liquor lignin is sent to wastewater/boiler without recovery.</p>
            
            <div class="scenario-financial-strip">
              <div class="fin-row">
                <span class="fin-label">Ethanol Gross Revenue:</span>
                <span class="fin-val highlight-cyan">$${tea.scenarioB.revenue.toFixed(2)}/t</span>
              </div>
              <div class="fin-row">
                <span class="fin-label">Operating Cost (OPEX):</span>
                <span class="fin-val font-mono">$${tea.scenarioB.cost.toFixed(2)}/t</span>
              </div>
              <div class="fin-row">
                <span class="fin-label">Bagasse Opportunity Cost:</span>
                <span class="fin-val font-mono">$${(Number(p.bagasseOpportunityCostPerTon) || 28).toFixed(2)}/t</span>
              </div>
              <div class="fin-row total-row">
                <span class="fin-label">Net Operating Margin:</span>
                <span class="fin-val ${tea.scenarioB.net >= 0 ? 'highlight-emerald' : 'highlight-rose'} font-bold">
                  $${tea.scenarioB.net.toFixed(2)}/t
                </span>
              </div>
            </div>
            <div class="scenario-tag single-tag">Single-Product Process</div>
          </div>

          <!-- SCENARIO C: INTEGRATED BIOREFINERY -->
          <div class="scenario-card card-primary-highlight">
            <div class="scenario-badge badge-integrated">SCENARIO C (PROPOSED)</div>
            <h3 class="scenario-title">Integrated Ethanol + Lignin Biosorbent</h3>
            <p class="scenario-desc">Co-production of hydrous ethanol (~${tea.ethLitersPerTon.toFixed(1)} L/t) and granulated biosorbent (~${tea.biosorbentKgPerTon.toFixed(1)} kg/t).</p>
            
            <div class="scenario-financial-strip">
              <div class="fin-row">
                <span class="fin-label">Total Co-Product Revenue:</span>
                <span class="fin-val highlight-teal font-bold">$${tea.scenarioC.revenue.toFixed(2)}/t</span>
              </div>
              <div class="fin-row sub-row">
                <span class="fin-label">&bull; Bioethanol Revenue:</span>
                <span class="fin-val">$${(tea.ethLitersPerTon * (Number(p.ethanolSellingPricePerLiter) || 0.95)).toFixed(2)}/t</span>
              </div>
              <div class="fin-row sub-row">
                <span class="fin-label">&bull; Biosorbent Revenue:</span>
                <span class="fin-val">$${(tea.biosorbentKgPerTon * (Number(p.biosorbentSellingPricePerKg) || 3.20)).toFixed(2)}/t</span>
              </div>
              <div class="fin-row">
                <span class="fin-label">Integrated OPEX:</span>
                <span class="fin-val font-mono">$${tea.scenarioC.cost.toFixed(2)}/t</span>
              </div>
              <div class="fin-row">
                <span class="fin-label">Bagasse Opportunity Cost:</span>
                <span class="fin-val font-mono">$${(Number(p.bagasseOpportunityCostPerTon) || 28).toFixed(2)}/t</span>
              </div>
              <div class="fin-row total-row">
                <span class="fin-label">Net Integrated Margin:</span>
                <span class="fin-val highlight-emerald font-bold">
                  $${tea.scenarioC.net.toFixed(2)}/t
                </span>
              </div>
              <div class="fin-row delta-row">
                <span class="fin-label">Incremental Margin vs Scenario A:</span>
                <span class="fin-val ${tea.scenarioC.netIncrementalOverA >= 0 ? 'highlight-teal' : 'highlight-rose'} font-bold">
                  ${tea.scenarioC.netIncrementalOverA >= 0 ? '+' : ''}$${tea.scenarioC.netIncrementalOverA.toFixed(2)}/t
                </span>
              </div>
            </div>
            <div class="scenario-tag integrated-tag">Multi-Product Integrated</div>
          </div>

        </section>
      ` : `
        <!-- HELPFUL EMPTY STATE -->
        <section class="empty-state-card">
          <div class="empty-state-icon">📈</div>
          <h3 class="empty-state-title">Awaiting Economic Assumptions</h3>
          <p class="empty-state-desc">
            No techno-economic assessment has been calculated yet. Configure your feedstock cost, market selling prices, and OPEX assumptions above, then click <strong>Run Techno-Economic Evaluation</strong>.
          </p>
          <div class="empty-state-actions">
            <button class="btn-action-primary" id="btn-empty-load-ref-tea">
              <span>⚡ Load Literature Assumptions ($28/t Bagasse, $0.95/L Ethanol, $3.20/kg Sorbent)</span>
            </button>
          </div>
        </section>
      `}

    </div>
  `;

  // Event Listeners
  const submitBtn = container.querySelector('#btn-submit-tea');
  const bagasseInput = container.querySelector('#input-tea-bagasse');
  const ethPriceInput = container.querySelector('#input-tea-ethanol-price');
  const sorbPriceInput = container.querySelector('#input-tea-sorbent-price');
  const opexBInput = container.querySelector('#input-tea-opex-b');
  const opexCInput = container.querySelector('#input-tea-opex-c');
  const errorBox = container.querySelector('#tea-validation-msg');

  function validateAndCalculate() {
    const bagasse = parseFloat(bagasseInput.value);
    const ethPrice = parseFloat(ethPriceInput.value);
    const sorbPrice = parseFloat(sorbPriceInput.value);
    const opexB = parseFloat(opexBInput.value);
    const opexC = parseFloat(opexCInput.value);

    const errors = [];
    if (isNaN(bagasse) || bagasse < 0) {
      errors.push('Bagasse opportunity cost must be 0 or greater ($/ton).');
    }
    if (isNaN(ethPrice) || ethPrice <= 0) {
      errors.push('Ethanol selling price must be greater than 0 ($/L).');
    }
    if (isNaN(sorbPrice) || sorbPrice <= 0) {
      errors.push('Biosorbent selling price must be greater than 0 ($/kg).');
    }
    if (isNaN(opexB) || opexB <= 0) {
      errors.push('Scenario B OPEX must be greater than 0 ($/ton).');
    }
    if (isNaN(opexC) || opexC <= 0) {
      errors.push('Scenario C OPEX must be greater than 0 ($/ton).');
    }

    if (errors.length > 0) {
      errorBox.innerHTML = `⚠️ <strong>Validation Error:</strong><br>${errors.join('<br>')}`;
      errorBox.style.display = 'block';
      return;
    }

    errorBox.style.display = 'none';
    appState.calculateTEA({
      bagasseOpportunityCostPerTon: bagasse,
      ethanolSellingPricePerLiter: ethPrice,
      biosorbentSellingPricePerKg: sorbPrice,
      opexScenarioB: opexB,
      opexScenarioC: opexC
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', validateAndCalculate);
  }

  const resetFormBtn = container.querySelector('#btn-reset-form-tea');
  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', () => {
      appState.clearTEA();
    });
  }

  const clearTeaBtn = container.querySelector('#btn-clear-tea');
  if (clearTeaBtn) {
    clearTeaBtn.addEventListener('click', () => {
      appState.clearTEA();
    });
  }

  const loadRefBtn = container.querySelector('#btn-load-ref-tea');
  if (loadRefBtn) {
    loadRefBtn.addEventListener('click', () => {
      appState.calculateTEA({
        bagasseOpportunityCostPerTon: 28.00,
        ethanolSellingPricePerLiter: 0.95,
        biosorbentSellingPricePerKg: 3.20,
        opexScenarioB: 145.00,
        opexScenarioC: 175.00
      });
    });
  }

  const emptyLoadRefBtn = container.querySelector('#btn-empty-load-ref-tea');
  if (emptyLoadRefBtn) {
    emptyLoadRefBtn.addEventListener('click', () => {
      appState.calculateTEA({
        bagasseOpportunityCostPerTon: 28.00,
        ethanolSellingPricePerLiter: 0.95,
        biosorbentSellingPricePerKg: 3.20,
        opexScenarioB: 145.00,
        opexScenarioC: 175.00
      });
    });
  }
}
