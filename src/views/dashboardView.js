/**
 * CIRCUIT-BAGASSE+ | Dashboard View (Default Landing Page)
 * Central Command Center for BIOVALOR 2026 Hackathon
 * Spacious, responsive, scientifically rigorous, with informative empty states and readiness tracker.
 */

import { appState } from '../state.js';
import { JUDGE_CHALLENGE_QUESTIONS } from '../calculations.js';

export function renderDashboardView(container) {
  const state = appState.getState();
  const { planningBalance, bioethanol, repStats, tea, suggestions } = appState.getCalculations();

  const isMbCalc = planningBalance.calculated;
  const isEthCalc = bioethanol.calculated;
  const isAdsCalc = repStats.calculated;
  const isTeaCalc = tea.calculated;

  const totalCalculated = [isMbCalc, isEthCalc, isAdsCalc, isTeaCalc].filter(Boolean).length;

  container.innerHTML = `
    <div class="dashboard-page animate-fade-in">
      
      <!-- HERO COMMAND BANNER -->
      <section class="dash-hero-card">
        <div class="hero-left">
          <div class="event-pill">
            <span class="pulse-indicator"></span>
            BIOVALOR 2026 HACKATHON — WASTE TO WEALTH
          </div>
          <h1 class="hero-title">CIRCUIT-BAGASSE<span class="accent-text">+</span></h1>
          <div class="hero-subtitle">Smart Integrated Biorefinery for Waste-to-Value Conversion</div>
          <p class="hero-tagline">“One Biomass. Multiple Value Streams. Measurable Circularity.”</p>
          
          <div class="hero-meta-strip">
            <span class="meta-tag"><strong class="highlight-cyan">Feedstock:</strong> Sugarcane Bagasse</span>
            <span class="meta-tag"><strong class="highlight-teal">Primary Pathways:</strong> 3 Co-Product Streams</span>
            <span class="meta-tag"><strong class="highlight-amber">Circularity Target:</strong> ≥ 70.0% Recovery</span>
            <span class="meta-tag status-proposed"><strong class="highlight-purple">Status:</strong> Digital Twin Simulation</span>
          </div>
        </div>

        <div class="hero-right-cta">
          <div class="twin-launch-box">
            <div class="twin-icon">🏭</div>
            <div class="twin-info">
              <div class="twin-title">Interactive 3D Digital Twin</div>
              <div class="twin-desc">11 industrial machines, transparent shells, particle fluid flows & inspection cutaways</div>
            </div>
            <a href="#3d-modeling" class="btn-launch-3d" id="btn-hero-launch-3d">
              <span>Launch 3D Model</span>
              <span class="arrow-icon">→</span>
            </a>
          </div>
        </div>
      </section>

      <!-- SYSTEM READINESS & WORKFLOW TRACKER BANNER -->
      <section class="workflow-readiness-panel">
        <div class="readiness-header-row">
          <div class="readiness-title-group">
            <h3 class="readiness-panel-title">Facility Model Status</h3>
            <span class="readiness-count-badge ${totalCalculated === 4 ? 'count-complete' : 'count-partial'}">
              ${totalCalculated} / 4 Modules Active
            </span>
          </div>
          <div class="readiness-actions">
            ${totalCalculated < 4 ? `
              <button class="btn-benchmark-quick" id="btn-dash-load-ref" title="Load literature benchmark data across all modules">
                <span>⚡ Load Literature Baseline (PMC7801571)</span>
              </button>
            ` : `
              <button class="btn-clear-quick" id="btn-dash-clear-all" title="Reset all modules to empty state">
                <span>↺ Clear All Data</span>
              </button>
            `}
          </div>
        </div>

        <div class="modules-status-grid">
          <!-- Module 1: Mass Balance -->
          <div class="mod-status-tile ${isMbCalc ? 'status-active' : 'status-empty'}">
            <div class="mod-tile-top">
              <span class="mod-icon">⚖️</span>
              <span class="mod-status-tag ${isMbCalc ? 'tag-ready' : 'tag-pending'}">${isMbCalc ? 'Calculated' : 'Pending'}</span>
            </div>
            <div class="mod-tile-title">Mass Balance</div>
            <div class="mod-tile-metric">${isMbCalc ? `${planningBalance.accountingRatioPercent.toFixed(2)}% Allocated` : 'No inputs entered'}</div>
            <a href="#mass-balance" class="mod-tile-link">${isMbCalc ? 'Review Ledger →' : 'Enter Inputs →'}</a>
          </div>

          <!-- Module 2: Bioethanol -->
          <div class="mod-status-tile ${isEthCalc ? 'status-active' : 'status-empty'}">
            <div class="mod-tile-top">
              <span class="mod-icon">⚗️</span>
              <span class="mod-status-tag ${isEthCalc ? 'tag-ready' : 'tag-pending'}">${isEthCalc ? 'Calculated' : 'Pending'}</span>
            </div>
            <div class="mod-tile-title">Bioethanol Engine</div>
            <div class="mod-tile-metric">${isEthCalc ? `${bioethanol.recoveredEthanolKg.toFixed(2)} kg (${bioethanol.recoveredEthanolVolumeL.toFixed(1)} L)` : 'No inputs entered'}</div>
            <a href="#bioethanol" class="mod-tile-link">${isEthCalc ? 'Review Yields →' : 'Enter Inputs →'}</a>
          </div>

          <!-- Module 3: Biosorbent Lab -->
          <div class="mod-status-tile ${isAdsCalc ? 'status-active' : 'status-empty'}">
            <div class="mod-tile-top">
              <span class="mod-icon">🧪</span>
              <span class="mod-status-tag ${isAdsCalc ? 'tag-ready' : 'tag-pending'}">${isAdsCalc ? 'Calculated' : 'Pending'}</span>
            </div>
            <div class="mod-tile-title">Biosorbent Lab</div>
            <div class="mod-tile-metric">${isAdsCalc ? `${repStats.singleRemoval.toFixed(1)}% Removal (qe: ${repStats.singleQe.toFixed(1)} mg/g)` : 'No inputs entered'}</div>
            <a href="#biosorbent" class="mod-tile-link">${isAdsCalc ? 'Review Adsorption →' : 'Enter Inputs →'}</a>
          </div>

          <!-- Module 4: TEA -->
          <div class="mod-status-tile ${isTeaCalc ? 'status-active' : 'status-empty'}">
            <div class="mod-tile-top">
              <span class="mod-icon">📈</span>
              <span class="mod-status-tag ${isTeaCalc ? 'tag-ready' : 'tag-pending'}">${isTeaCalc ? 'Calculated' : 'Pending'}</span>
            </div>
            <div class="mod-tile-title">Economic Analysis</div>
            <div class="mod-tile-metric">${isTeaCalc ? `Margin: $${tea.scenarioC.net.toFixed(2)}/t (+$${tea.scenarioC.netIncrementalOverA.toFixed(2)})` : 'No inputs entered'}</div>
            <a href="#tea" class="mod-tile-link">${isTeaCalc ? 'Review Financials →' : 'Enter Inputs →'}</a>
          </div>
        </div>
      </section>

      <!-- PROMINENT SCIENTIFIC DISCLAIMER -->
      <section class="scientific-alert-banner">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <div class="alert-title">SCIENTIFIC INTEGRITY NOTICE — RIGOROUS REPRODUCIBILITY</div>
          <p class="alert-text">
            CIRCUIT-BAGASSE+ operates on strictly transparent engineering models. Unvalidated assumptions and literature benchmarks are never presented as measured pilot achievements. All calculations require verified user data or literature references.
          </p>
        </div>
        <div class="alert-status-badge tier-calc">RIGOROUS MODEL</div>
      </section>

      <!-- 8 KEY PERFORMANCE INDICATOR (KPI) CARDS (WITH ADAPTIVE EMPTY STATES) -->
      <section class="dash-section">
        <div class="section-heading-row">
          <div>
            <h2 class="section-title">Key Biorefinery Performance Indicators</h2>
            <p class="section-sub">Stoichiometric outputs and operating metrics generated from current user inputs</p>
          </div>
        </div>

        <div class="kpi-grid">
          
          <!-- KPI 1: Dry Feedstock Basis -->
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Dry Feedstock Input</span>
              <span class="data-badge ${isMbCalc ? 'badge-calc' : 'badge-pending'}">${isMbCalc ? 'USER BASIS' : 'PENDING'}</span>
            </div>
            <div class="kpi-body">
              ${isMbCalc ? `
                <div class="kpi-value-row">
                  <span class="kpi-number highlight-amber">${planningBalance.basis.toFixed(1)}</span>
                  <span class="kpi-unit">kg dry bagasse</span>
                </div>
                <div class="kpi-bar-track">
                  <div class="kpi-bar-fill fill-amber" style="width: 100%"></div>
                </div>
                <div class="kpi-footer-note">Cellulose: ${(planningBalance.basis * 0.425).toFixed(1)} kg | Hemi: ${(planningBalance.basis * 0.258).toFixed(1)} kg | Lignin: ${(planningBalance.basis * 0.221).toFixed(1)} kg</div>
              ` : `
                <div class="kpi-empty-body">
                  <span class="empty-kpi-val">-- kg</span>
                  <p class="empty-kpi-hint">Awaiting feedstock mass entry</p>
                  <a href="#mass-balance" class="kpi-config-link">Configure in Mass Balance →</a>
                </div>
              `}
            </div>
          </div>

          <!-- KPI 2: Circularity Target (70%) -->
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Circularity Target</span>
              <span class="data-badge badge-rule">COMPETITION RULE</span>
            </div>
            <div class="kpi-body">
              <div class="kpi-value-row">
                <span class="kpi-number highlight-teal">70.0%</span>
                <span class="kpi-unit">(${isMbCalc ? `${planningBalance.targetKg.toFixed(1)} kg` : 'Target Mass'})</span>
              </div>
              <div class="kpi-bar-track">
                <div class="kpi-bar-fill fill-teal" style="width: 70%"></div>
              </div>
              <div class="kpi-footer-note">Minimum eligible non-overlapping biomass allocation</div>
            </div>
          </div>

          <!-- KPI 3: Calculated Allocation Ratio -->
          <div class="kpi-card ${isMbCalc && planningBalance.accountingRatioPercent >= 70 ? 'card-success-glow' : ''}">
            <div class="kpi-header">
              <span class="kpi-label">Feedstock Allocation</span>
              <span class="data-badge ${isMbCalc ? 'badge-calc' : 'badge-pending'}">${isMbCalc ? 'CALCULATED' : 'PENDING'}</span>
            </div>
            <div class="kpi-body">
              ${isMbCalc ? `
                <div class="kpi-value-row">
                  <span class="kpi-number ${planningBalance.accountingRatioPercent >= 70 ? 'highlight-teal' : 'highlight-rose'}">
                    ${planningBalance.accountingRatioPercent.toFixed(2)}%
                  </span>
                  <span class="kpi-unit">(${planningBalance.totalAllocatedKg.toFixed(2)} kg)</span>
                </div>
                <div class="kpi-bar-track">
                  <div class="kpi-bar-fill ${planningBalance.accountingRatioPercent >= 70 ? 'fill-emerald' : 'fill-rose'}" style="width: ${Math.min(100, planningBalance.accountingRatioPercent)}%"></div>
                </div>
                <div class="kpi-footer-note ${planningBalance.accountingRatioPercent >= 70 ? 'highlight-emerald' : 'highlight-rose'}">
                  ${planningBalance.accountingRatioPercent >= 70 ? '✓ Meets Competition 70% Target' : 'Below 70% Target Threshold'}
                </div>
              ` : `
                <div class="kpi-empty-body">
                  <span class="empty-kpi-val">--%</span>
                  <p class="empty-kpi-hint">Requires mass balance calculation</p>
                  <a href="#mass-balance" class="kpi-config-link">Calculate Mass Balance →</a>
                </div>
              `}
            </div>
          </div>

          <!-- KPI 4: Glucose Production -->
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Fermentable Glucose</span>
              <span class="data-badge ${isEthCalc ? 'badge-calc' : 'badge-pending'}">${isEthCalc ? 'HYDROLYZED' : 'PENDING'}</span>
            </div>
            <div class="kpi-body">
              ${isEthCalc ? `
                <div class="kpi-value-row">
                  <span class="kpi-number highlight-cyan">${bioethanol.glucoseProduced.toFixed(2)}</span>
                  <span class="kpi-unit">kg C6 sugar</span>
                </div>
                <div class="kpi-bar-track">
                  <div class="kpi-bar-fill fill-cyan" style="width: ${(bioethanol.hydrolysisConversion * 100).toFixed(0)}%"></div>
                </div>
                <div class="kpi-footer-note">Enzymatic conversion: ${(bioethanol.hydrolysisConversion * 100).toFixed(0)}% with 180/162 hydration</div>
              ` : `
                <div class="kpi-empty-body">
                  <span class="empty-kpi-val">-- kg</span>
                  <p class="empty-kpi-hint">Awaiting hydrolysis parameters</p>
                  <a href="#bioethanol" class="kpi-config-link">Configure Bioethanol →</a>
                </div>
              `}
            </div>
          </div>

          <!-- KPI 5: Recovered Bioethanol -->
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Hydrous Bioethanol</span>
              <span class="data-badge ${isEthCalc ? 'badge-calc' : 'badge-pending'}">${isEthCalc ? 'RECOVERED' : 'PENDING'}</span>
            </div>
            <div class="kpi-body">
              ${isEthCalc ? `
                <div class="kpi-value-row">
                  <span class="kpi-number highlight-emerald">${bioethanol.recoveredEthanolKg.toFixed(2)}</span>
                  <span class="kpi-unit">kg (${bioethanol.recoveredEthanolVolumeL.toFixed(1)} L)</span>
                </div>
                <div class="kpi-bar-track">
                  <div class="kpi-bar-fill fill-emerald" style="width: 85%"></div>
                </div>
                <div class="kpi-footer-note">Hydrous distillate (~93.5% ABV)</div>
              ` : `
                <div class="kpi-empty-body">
                  <span class="empty-kpi-val">-- L</span>
                  <p class="empty-kpi-hint">Awaiting fermentation calculation</p>
                  <a href="#bioethanol" class="kpi-config-link">Calculate Bioethanol →</a>
                </div>
              `}
            </div>
          </div>

          <!-- KPI 6: Biosorbent Dye Removal -->
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Dye Adsorption Removal</span>
              <span class="data-badge ${isAdsCalc ? 'badge-calc' : 'badge-pending'}">${isAdsCalc ? 'MEASURED TEST' : 'PENDING'}</span>
            </div>
            <div class="kpi-body">
              ${isAdsCalc ? `
                <div class="kpi-value-row">
                  <span class="kpi-number highlight-teal">${repStats.singleRemoval.toFixed(1)}%</span>
                  <span class="kpi-unit">(qe: ${repStats.singleQe.toFixed(1)} mg/g)</span>
                </div>
                <div class="kpi-bar-track">
                  <div class="kpi-bar-fill fill-teal" style="width: ${Math.min(100, repStats.singleRemoval)}%"></div>
                </div>
                <div class="kpi-footer-note">C0 = ${state.adsorption.c0} mg/L -> Ce = ${state.adsorption.ce} mg/L</div>
              ` : `
                <div class="kpi-empty-body">
                  <span class="empty-kpi-val">--%</span>
                  <p class="empty-kpi-hint">Awaiting adsorption assay data</p>
                  <a href="#biosorbent" class="kpi-config-link">Configure Biosorbent Lab →</a>
                </div>
              `}
            </div>
          </div>

          <!-- KPI 7: Integrated Net Margin -->
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Scenario C Net Margin</span>
              <span class="data-badge ${isTeaCalc ? 'badge-calc' : 'badge-pending'}">${isTeaCalc ? 'TEA MODEL' : 'PENDING'}</span>
            </div>
            <div class="kpi-body">
              ${isTeaCalc ? `
                <div class="kpi-value-row">
                  <span class="kpi-number highlight-emerald">$${tea.scenarioC.net.toFixed(2)}</span>
                  <span class="kpi-unit">/ ton bagasse</span>
                </div>
                <div class="kpi-bar-track">
                  <div class="kpi-bar-fill fill-emerald" style="width: 75%"></div>
                </div>
                <div class="kpi-footer-note highlight-teal">Incremental: +$${tea.scenarioC.netIncrementalOverA.toFixed(2)}/t over boiler baseline</div>
              ` : `
                <div class="kpi-empty-body">
                  <span class="empty-kpi-val">-- $/t</span>
                  <p class="empty-kpi-hint">Awaiting economic parameters</p>
                  <a href="#tea" class="kpi-config-link">Run Economic Analysis →</a>
                </div>
              `}
            </div>
          </div>

          <!-- KPI 8: Unassigned Remainder -->
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Quarantine Remainder</span>
              <span class="data-badge badge-rule">PMC7801571</span>
            </div>
            <div class="kpi-body">
              <div class="kpi-value-row">
                <span class="kpi-number font-mono">9.6%</span>
                <span class="kpi-unit">(${isMbCalc ? `${(planningBalance.basis * 0.096).toFixed(2)} kg` : '9.6 kg Basis'})</span>
              </div>
              <div class="kpi-bar-track">
                <div class="kpi-bar-fill" style="width: 9.6%; background: rgba(148, 163, 184, 0.4);"></div>
              </div>
              <div class="kpi-footer-note highlight-rose">Cannot be claimed without analytical ash assay</div>
            </div>
          </div>

        </div>
      </section>

      <!-- 3 PRIMARY BIOREFINERY PRODUCT PATHWAYS -->
      <section class="dash-section">
        <div class="section-heading-row">
          <div>
            <h2 class="section-title">Co-Product Valorization Architecture</h2>
            <p class="section-sub">Integrated biorefinery topology converting bagasse into distinct commercial fractions</p>
          </div>
        </div>

        <div class="pathways-grid">
          
          <!-- PATHWAY A -->
          <div class="pathway-card border-cyan">
            <div class="pathway-top">
              <span class="pathway-badge badge-stream-a">PATHWAY A</span>
              <span class="pathway-fraction">CELLULOSE (42.5%)</span>
            </div>
            <h3 class="pathway-title">Enzymatic Bioethanol</h3>
            <p class="pathway-desc">Alkaline pretreatment solid cake undergoes enzymatic saccharification with cellulase enzymes, followed by anaerobic yeast fermentation and fractional distillation.</p>
            <div class="pathway-stats">
              <div class="pstat-row">
                <span>Glucan Fraction:</span>
                <strong class="highlight-cyan">${isMbCalc ? `${planningBalance.allocations.cellulose.allocatedKg.toFixed(2)} kg` : '42.5 kg basis'}</strong>
              </div>
              <div class="pstat-row">
                <span>Distillate Product:</span>
                <strong class="highlight-teal">${isEthCalc ? `${bioethanol.recoveredEthanolVolumeL.toFixed(1)} Liters` : 'Requires Calculation'}</strong>
              </div>
            </div>
            <a href="#bioethanol" class="pathway-link">Open Bioethanol Engine →</a>
          </div>

          <!-- PATHWAY B -->
          <div class="pathway-card border-amber">
            <div class="pathway-top">
              <span class="pathway-badge badge-stream-b">PATHWAY B</span>
              <span class="pathway-fraction">LIGNIN (22.1%)</span>
            </div>
            <h3 class="pathway-title">Lignin-Rich Biosorbent</h3>
            <p class="pathway-desc">Solubilized alkaline black liquor is acidified to pH 2.0 with H2SO4 to precipitate kraft/alkali lignin. The cake is washed, dried, and pulverized into porous wastewater adsorbent granules.</p>
            <div class="pathway-stats">
              <div class="pstat-row">
                <span>Lignin Fraction:</span>
                <strong class="highlight-amber">${isMbCalc ? `${planningBalance.allocations.lignin.allocatedKg.toFixed(2)} kg` : '22.1 kg basis'}</strong>
              </div>
              <div class="pstat-row">
                <span>Dye Adsorption:</span>
                <strong class="highlight-teal">${isAdsCalc ? `${repStats.singleRemoval.toFixed(1)}% Removal` : 'Requires Lab Data'}</strong>
              </div>
            </div>
            <a href="#biosorbent" class="pathway-link">Open Biosorbent Lab →</a>
          </div>

          <!-- PATHWAY C -->
          <div class="pathway-card border-purple">
            <div class="pathway-top">
              <span class="pathway-badge badge-stream-c">PATHWAY C</span>
              <span class="pathway-fraction">HEMICELLULOSE (25.8%)</span>
            </div>
            <h3 class="pathway-title">Proposed Pentose Recovery</h3>
            <p class="pathway-desc">Liquid fraction enriched in arabinoxylan hemicellulose is subjected to candidate post-hydrolysis for monomeric D-xylose, L-arabinose, and platform furfural chemicals.</p>
            <div class="pathway-stats">
              <div class="pstat-row">
                <span>Hemicellulose Fraction:</span>
                <strong class="highlight-purple">${isMbCalc ? `${planningBalance.allocations.hemicellulose.allocatedKg.toFixed(2)} kg` : '25.8 kg basis'}</strong>
              </div>
              <div class="pstat-row">
                <span>Validation Tier:</span>
                <span class="badge-prop">PROPOSED CONCEPT</span>
              </div>
            </div>
            <a href="#hemicellulose" class="pathway-link">Explore Stream C →</a>
          </div>

        </div>
      </section>

      <!-- JUDGE CHALLENGE DEFENSE SECTION -->
      <section class="dash-section" style="margin-top: 36px;">
        <div class="section-heading-row">
          <div>
            <h2 class="section-title">Scientific Defense & Audit Answers</h2>
            <p class="section-sub">Explicit engineering clarifications addressing common evaluation challenges</p>
          </div>
        </div>

        <div class="qa-grid">
          ${JUDGE_CHALLENGE_QUESTIONS.slice(0, 4).map((qa, i) => `
            <div class="qa-card">
              <div class="qa-q-row">
                <span class="qa-num">Q${i + 1}</span>
                <h4 class="qa-q-text">${qa.question}</h4>
              </div>
              <p class="qa-a-text">${qa.answer}</p>
              <div class="qa-source-tag">${qa.source}</div>
            </div>
          `).join('')}
        </div>
      </section>

    </div>
  `;

  // Attach Dashboard Event Handlers
  const loadRefBtn = container.querySelector('#btn-dash-load-ref');
  if (loadRefBtn) {
    loadRefBtn.addEventListener('click', () => {
      appState.loadLiteratureReferenceScenario();
    });
  }

  const clearAllBtn = container.querySelector('#btn-dash-clear-all');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (confirm('Clear all data and reset dashboard to empty initial state?')) {
        appState.resetAllToEmpty();
      }
    });
  }
}
