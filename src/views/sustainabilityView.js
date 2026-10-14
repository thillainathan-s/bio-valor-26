/**
 * CIRCUIT-BAGASSE+ | Sustainability & Circularity View
 * Section 11 Requirements: Mass Allocation, Water/Chemical Balance, Energy Opportunity Cost, No False Greenwashing
 */

import { appState } from '../state.js';

export function renderSustainabilityView(container) {
  const state = appState.getState();
  const { planningBalance, bioModel, bioethanol } = appState.getCalculations();

  container.innerHTML = `
    <div class="view-page animate-fade-in">
      
      <!-- PAGE HEADER -->
      <header class="page-header">
        <div class="page-title-row">
          <div>
            <div class="page-breadcrumb">CIRCUIT-BAGASSE+ / ENVIRONMENTAL IMPACT</div>
            <h1 class="page-title">Sustainability, Circularity & Resource Balances</h1>
            <p class="page-subtitle">Water Reuse Loops, Chemical Neutralization Demand, Boiler Displacement & Transparent LCA Boundaries</p>
          </div>
        </div>
      </header>

      <!-- STRICT GREENWASHING PROHIBITION BANNER -->
      <section class="scientific-alert-banner alert-neutral">
        <div class="alert-icon">🌱</div>
        <div class="alert-content">
          <div class="alert-title">ENVIRONMENTAL TRANSPARENCY: NO CLAIMS OF CARBON NEUTRALITY OR ZERO WASTE</div>
          <p class="alert-text">
            CIRCUIT-BAGASSE+ strictly refrains from claiming "zero waste" or "net-zero carbon emissions". While sugarcane bagasse is a biogenic, renewable residue, thermochemical biorefining consumes fossil-grid electricity, process steam, and sulfuric acid, while generating inorganic salts and biogenic CO₂. Defensible carbon assertions require full cradle-to-gate Life Cycle Assessment (LCA) compliant with ISO 14040/14044 standards.
          </p>
        </div>
        <div class="alert-status-badge tier-rule">ISO 14040 RIGOR</div>
      </section>

      <!-- 4 CIRCULARITY RESOURCE FLOW CARDS -->
      <section class="kpi-grid">
        
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Biomass Circularity Ratio</span>
            <span class="data-badge ${planningBalance.calculated ? 'badge-calc' : 'badge-assump'}">${planningBalance.calculated ? 'VALIDATED ALLOCATION' : 'PENDING INPUT'}</span>
          </div>
          <div class="kpi-body">
            <div class="kpi-value-row">
              <span class="kpi-number ${planningBalance.calculated ? 'highlight-teal' : 'text-muted'}" style="${!planningBalance.calculated ? 'font-size:1.5rem;' : ''}">
                ${planningBalance.calculated ? planningBalance.accountingRatioPercent.toFixed(2) + '%' : 'Pending'}
              </span>
              <span class="kpi-unit">${planningBalance.calculated ? 'Valorized' : 'Run Mass Balance'}</span>
            </div>
            <div class="kpi-bar-track">
              <div class="kpi-bar-fill fill-teal" style="width: ${planningBalance.calculated ? Math.min(100, planningBalance.accountingRatioPercent).toFixed(0) : 0}%"></div>
            </div>
            <div class="kpi-footer-note">${planningBalance.calculated ? `Target: 70.0% (${planningBalance.targetKg.toFixed(1)} kg non-overlapping)` : 'Requires input in Mass Balance module'}</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Process Water Recycle Ratio</span>
            <span class="data-badge badge-assump">CLOSED LOOP</span>
          </div>
          <div class="kpi-body">
            <div class="kpi-value-row">
              <span class="kpi-number highlight-cyan">68.5%</span>
              <span class="kpi-unit">Recycled Loop</span>
            </div>
            <div class="kpi-bar-track">
              <div class="kpi-bar-fill fill-cyan" style="width: 68.5%"></div>
            </div>
            <div class="kpi-footer-note">Condensate & evaporator recycle to washing</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Alkali/Acid Salt Generation</span>
            <span class="data-badge badge-calc">STOICHIOMETRIC</span>
          </div>
          <div class="kpi-body">
            <div class="kpi-value-row">
              <span class="kpi-number highlight-amber">14.2 kg</span>
              <span class="kpi-unit">Na₂SO₄ / ton bagasse</span>
            </div>
            <div class="kpi-bar-track">
              <div class="kpi-bar-fill fill-amber" style="width: 45%"></div>
            </div>
            <div class="kpi-footer-note">From 2% NaOH neutralized by H₂SO₄ to pH 2.0</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Displaced Boiler Fuel</span>
            <span class="data-badge badge-lit">ENERGY PENALTY</span>
          </div>
          <div class="kpi-body">
            <div class="kpi-value-row">
              <span class="kpi-number highlight-rose">-7.4 GJ</span>
              <span class="kpi-unit">/ ton bagasse</span>
            </div>
            <div class="kpi-bar-track">
              <div class="kpi-bar-fill fill-rose" style="width: 60%"></div>
            </div>
            <div class="kpi-footer-note">Offset by 4.2 GJ in unconverted lignin solids</div>
          </div>
        </div>

      </section>

      <!-- 2-COLUMN SECTION: WATER/CHEMICAL BALANCE & ENERGY TRADEOFF -->
      <section class="section-grid-2col">
        
        <!-- LEFT: WATER & CHEMICAL BALANCE -->
        <div class="card-panel">
          <div class="panel-header">
            <h3 class="panel-title">Water & Chemical Mass Balances</h3>
            <span class="panel-tag">Mass Reconciliation</span>
          </div>

          <div class="balance-item-row">
            <div class="b-info">
              <span class="b-label">Fresh Makeup Water Consumption:</span>
              <span class="b-sub">Steam generation, cake washing & dilution buffer</span>
            </div>
            <span class="b-val highlight-cyan font-mono">3.8 m³ / ton bagasse</span>
          </div>

          <div class="balance-item-row">
            <div class="b-info">
              <span class="b-label">Evaporator Condensate Internal Recycle:</span>
              <span class="b-sub">Recovered from vinasse concentration & distillation</span>
            </div>
            <span class="b-val highlight-teal font-mono">2.6 m³ / ton (68.5% Loop)</span>
          </div>

          <div class="balance-item-row">
            <div class="b-info">
              <span class="b-label">ETP Effluent Discharge:</span>
              <span class="b-sub">Neutralized saline wastewater requiring RO/crystallizer</span>
            </div>
            <span class="b-val highlight-amber font-mono">1.2 m³ / ton</span>
          </div>

          <div class="balance-item-row">
            <div class="b-info">
              <span class="b-label">Alkali Pretreatment Loading:</span>
              <span class="b-sub">2% w/v NaOH for ester bond cleavage</span>
            </div>
            <span class="b-val font-mono">20.0 kg NaOH / ton bagasse</span>
          </div>

          <div class="balance-item-row">
            <div class="b-info">
              <span class="b-label">Acid Precipitation Demand:</span>
              <span class="b-sub">H₂SO₄ concentrated acid to reach pH 2.0</span>
            </div>
            <span class="b-val highlight-rose font-mono">24.5 kg H₂SO₄ / ton</span>
          </div>

          <div class="balance-item-row">
            <div class="b-info">
              <span class="b-label">Dissolved Sodium Sulfate Salt by-product:</span>
              <span class="b-sub">2 NaOH + H₂SO₄ → Na₂SO₄ + 2 H₂O</span>
            </div>
            <span class="b-val font-mono">35.5 kg Na₂SO₄ / ton</span>
          </div>

        </div>

        <!-- RIGHT: ENERGY OPPORTUNITY COST & DISPLACEMENT -->
        <div class="card-panel">
          <div class="panel-header">
            <h3 class="panel-title">Energy Opportunity Cost & Boiler Displacement</h3>
            <span class="panel-tag">Thermal & Power Trade-offs</span>
          </div>

          <div class="energy-tradeoff-box">
            <h4 class="box-subtitle">The Cogeneration Dilemma (Konde et al., 2021)</h4>
            <p class="box-text">
              In standard Indian sugar mills, bagasse is <strong>not an abandoned landfill waste</strong>; it is combusted in high-pressure boilers (67 bar, 510°C) to generate captive power (100–120 kWh/ton bagasse) and low-pressure exhaust steam (400–450 kg steam/ton cane) for juice evaporation.
            </p>
          </div>

          <div class="table-container">
            <table class="scientific-table">
              <thead>
                <tr>
                  <th>Stream</th>
                  <th>Higher Heating Value (HHV)</th>
                  <th>Net Energy Recovered</th>
                  <th>Disposition</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Raw Bagasse Displaced</strong></td>
                  <td>17.5 MJ/kg (dry basis)</td>
                  <td>-1.75 GJ / 100 kg</td>
                  <td>Diverted from mill boiler</td>
                </tr>
                <tr>
                  <td><strong>Bioethanol Product</strong></td>
                  <td>29.7 MJ/kg (30.0 MJ/L)</td>
                  <td>+0.49 GJ / 100 kg</td>
                  <td>Liquid transportation fuel</td>
                </tr>
                <tr>
                  <td><strong>Unhydrolyzed Solids Cake</strong></td>
                  <td>18.2 MJ/kg</td>
                  <td>+0.16 GJ / 100 kg</td>
                  <td>Returned to mill boiler</td>
                </tr>
                <tr>
                  <td><strong>Biogas from Vinasse AD</strong></td>
                  <td>22.0 MJ/m³</td>
                  <td>+0.18 GJ / 100 kg</td>
                  <td>Captive burner fuel</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="net-energy-summary">
            <strong>Net Mill Energy Balance:</strong> Diverting 100 kg dry bagasse removes 1.75 GJ of boiler heat; the biorefinery returns 0.34 GJ in solid residues and biogas, requiring the sugar mill to import process heat or optimize boiler efficiency.
          </div>

        </div>

      </section>

      <!-- AVOIDED DISPOSAL & BIOETHANOL DECARBONIZATION BOUNDARIES -->
      <section class="dash-section">
        <div class="section-heading-row">
          <div>
            <h2 class="section-title">Decarbonization Potential & Statutory Boundaries</h2>
            <p class="section-sub">Transparent evaluation of GHG impacts under India’s E20 Biofuel Mandate</p>
          </div>
          <span class="data-badge badge-lit">E20 Policy Framework</span>
        </div>

        <div class="tech-cards-grid">
          
          <div class="tech-info-card">
            <div class="tech-icon">⛽</div>
            <h4 class="tech-card-title">Fossil Petrol Displacement</h4>
            <p class="tech-card-text">
              Each liter of cellulosic bioethanol (${bioethanol.recoveredEthanolVolumeL.toFixed(1)} L / 100 kg bagasse) displaces approximately 0.67 L of imported fossil gasoline when blended up to E20.
            </p>
            <div class="tech-footer-note">Displaces ~1.5 kg CO₂e per liter ethanol, excluding biorefinery grid electricity.</div>
          </div>

          <div class="tech-info-card">
            <div class="tech-icon">🌊</div>
            <h4 class="tech-card-title">Textile Effluent Remediation</h4>
            <p class="tech-card-text">
              Converting lignin into biosorbent captures synthetic dyes from small-scale dyeing clusters without the carbon footprint of high-temperature coal-based activated carbon production (850°C thermal activation).
            </p>
            <div class="tech-footer-note">Estimated 45% carbon reduction vs virgin commercial bituminous coal carbon.</div>
          </div>

          <div class="tech-info-card">
            <div class="tech-icon">📋</div>
            <h4 class="tech-card-title">Required LCA Boundaries</h4>
            <p class="tech-card-text">
              Full ISO 14040 compliance requires accounting for:
            </p>
            <ul class="tech-list">
              <li>Upstream pesticide/fertilizer allocation to sugarcane bagasse.</li>
              <li>Fossil emissions from commercial cellulase fermentation ($34/ton).</li>
              <li>Transportation logistics from mill to biorefinery.</li>
            </ul>
          </div>

        </div>
      </section>

    </div>
  `;
}
