/**
 * CIRCUIT-BAGASSE+ | Comprehensive Project Report View
 * Section 14 Requirements: Full Hackathon Technical Dossier, 30s/2min Pitch Scripts, Print/Export
 */

import { appState } from '../state.js';
import { RESIDUAL_LEDGER_DATA, SCIENTIFIC_PAPERS } from '../calculations.js';

export function renderReportView(container) {
  const state = appState.getState();
  const { planningBalance, bioethanol, repStats, bioModel, tea } = appState.getCalculations();

  container.innerHTML = `
    <div class="view-page animate-fade-in report-print-container">
      
      <!-- REPORT HEADER & PRINT/EXPORT ACTIONS (Hidden on print) -->
      <header class="page-header no-print">
        <div class="page-title-row">
          <div>
            <div class="page-breadcrumb">CIRCUIT-BAGASSE+ / TECHNICAL DOSSIER</div>
            <h1 class="page-title">Comprehensive Biorefinery Engineering Report</h1>
            <p class="page-subtitle">BIOVALOR 2026 Hackathon Official Project Dossier & Pitch Scripts</p>
          </div>
          <div class="report-actions-row">
            <button class="btn-action-primary" id="btn-print-report">
              <span>🖨️ Print / Save as PDF</span>
            </button>
            <button class="btn-action-outline" id="btn-export-json">
              <span>💾 Export Model JSON</span>
            </button>
          </div>
        </div>
      </header>

      <!-- CALCULATION STATUS BANNER -->
      <section class="scientific-alert-banner ${planningBalance.calculated ? 'alert-cyan' : 'alert-neutral'} no-print">
        <div class="alert-icon">${planningBalance.calculated ? '✅' : 'ℹ️'}</div>
        <div class="alert-content">
          <div class="alert-title">${planningBalance.calculated ? 'REPORT STATUS: LIVE USER-CALCULATED DATA' : 'REPORT STATUS: AWAITING USER MODULE CALCULATIONS'}</div>
          <p class="alert-text">
            ${planningBalance.calculated 
              ? 'This dossier reflects your custom validated mass balance and process parameters. Double-counting checks have passed.'
              : 'User inputs have not been calculated yet. Academic literature baseline values (PMC7801571) are referenced below for presentation structure. Enter your data in the respective modules or click "Load Benchmark Reference" in the top bar to run a pre-validated scenario.'}
          </p>
        </div>
        <div class="alert-status-badge ${planningBalance.calculated ? 'tier-rule' : 'tier-lit'}">
          ${planningBalance.calculated ? 'USER VALIDATED' : 'LITERATURE PREVIEW'}
        </div>
      </section>

      <!-- PRINT COVER PAGE -->
      <div class="print-cover-box">
        <div class="print-badge">BIOVALOR 2026 COMPETITION ENTRY</div>
        <h1 class="print-project-title">CIRCUIT-BAGASSE+</h1>
        <div class="print-project-sub">Smart Integrated Biorefinery for Waste-to-Value Conversion</div>
        <p class="print-project-tagline">“One Biomass. Multiple Value Streams. Measurable Circularity.”</p>
        <div class="print-meta-grid">
          <div><strong>Theme:</strong> Waste to Wealth</div>
          <div><strong>Date:</strong> October 2026</div>
          <div><strong>Primary Feedstock:</strong> Sugarcane Bagasse</div>
          <div><strong>Circularity Ratio:</strong> ${planningBalance.calculated ? planningBalance.accountingRatioPercent.toFixed(3) + '%' : 'Pending Calculation'}</div>
        </div>
      </div>

      <!-- 1. CONCISE JUDGE-FACING PITCH SECTION (30s & 2min) -->
      <section class="report-section highlight-pitch-section">
        <h2 class="report-h2">1. Judge-Facing Presentation Pitch Scripts</h2>
        <p class="section-sub-text">Calibrated speaking scripts for fast-paced hackathon jury evaluations</p>

        <div class="pitch-box-grid">
          
          <!-- 30-SECOND ELEVATOR PITCH -->
          <div class="pitch-card pitch-30s">
            <div class="pitch-header">
              <span class="pitch-badge">⚡ 30-Second Elevator Pitch</span>
              <span class="pitch-timer">~75 words</span>
            </div>
            <blockquote class="pitch-quote">
              “Judges, sugarcane mills currently burn wet bagasse for low-efficiency boiler steam. <strong>CIRCUIT-BAGASSE+</strong> unlocks this wasted carbon by cascading a single dry bagasse stream into three distinct value streams: we convert crystalline cellulose into clean second-generation bioethanol, transform alkali-extracted lignin into high-surface biosorbents for textile wastewater remediation, and recover residual pentoses for clean biogas. With an illustrative non-overlapping circularity accounting ratio of <strong>${planningBalance.calculated ? planningBalance.accountingRatioPercent.toFixed(1) + '%' : '70.7%'}</strong>, we turn industrial waste into measurable wealth.”
            </blockquote>
          </div>

          <!-- 2-MINUTE TECHNICAL PRESENTATION PITCH -->
          <div class="pitch-card pitch-2min">
            <div class="pitch-header">
              <span class="pitch-badge">🎙️ 2-Minute Comprehensive Pitch</span>
              <span class="pitch-timer">~280 words</span>
            </div>
            <blockquote class="pitch-quote">
              “Respected jury members, conventional biofuel projects fail either from prohibitive enzyme costs or single-product economics. <strong>CIRCUIT-BAGASSE+</strong> solves both challenges through an integrated biorefinery architecture connected to an interactive 3D digital twin.<br><br>
              Starting from 100 kg of dry bagasse containing 42.5 kg cellulose, 25.8 kg hemicellulose, and 22.1 kg lignin, we apply a mild alkaline pretreatment to cleave ester crosslinks without severe carbohydrate degradation. This yields a cellulose-rich solid cake that undergoes enzymatic saccharification with cellulases and yeast fermentation, recovering <strong>${bioethanol.calculated ? bioethanol.recoveredEthanolKg.toFixed(2) + ' kg (or ' + bioethanol.recoveredEthanolVolumeL.toFixed(2) + ' liters)' : '16.71 kg (or 21.18 liters)'}</strong> of bioethanol.<br><br>
              Simultaneously, rather than treating the black liquor as toxic waste, we acid-precipitate technical lignin at pH 2.0, producing <strong>${bioModel.pathwayB.finalBiosorbentKg.toFixed(2)} kg</strong> of functional biosorbent capable of <strong>${bioModel.wastewater.dyeRemovalEfficiencyPercent.toFixed(0)}%</strong> methylene blue dye removal from textile effluents. Our third stream recovers C5 pentoses, while all unconverted residues and vinasse are tracked in a 9-stream mass-closure ledger for cogeneration and anaerobic digestion.<br><br>
              Crucially, our engineering platform implements rigorous double-counting prevention: water of hydration ($180/162$) is strictly deducted, and unvalidated claims are transparently flagged. Techno-economically, coproduct biosorbent sales add +$${(tea.incrementalVsA || 27.50).toFixed(2)} per ton over existing boiler baseline. CIRCUIT-BAGASSE+ proves that sustainable circularity and commercial viability can coexist.”
            </blockquote>
          </div>

        </div>
      </section>

      <!-- 2. EXECUTIVE SUMMARY & PROBLEM STATEMENT -->
      <section class="report-section">
        <h2 class="report-h2">2. Executive Summary & Problem Statement</h2>
        <div class="report-body-text">
          <p>
            Sugarcane is one of the world's most productive C4 agricultural crops, generating over 540 million metric tons of bagasse annually. In countries like India, sugarcane bagasse has historically been burned in mill boilers at low thermodynamic efficiency (~50%) solely to satisfy seasonal process steam and electrical demand. However, with the national mandate to reach 20% ethanol blending (E20) and rising environmental regulations against textile dye effluents in industrial corridors (such as Tirupur and Surat), traditional single-purpose combustion represents an underutilization of valuable structural biopolymers.
          </p>
          <p>
            <strong>CIRCUIT-BAGASSE+</strong> introduces a smart integrated biorefinery paradigm. By sequentially fractionating sugarcane bagasse into its fundamental macromolecular constituents—cellulose, hemicellulose, and lignin—the system generates three high-value streams while maintaining an audited, non-overlapping mass balance targeting &gt;70% circular feedstock valorization.
          </p>
        </div>
      </section>

      <!-- 3. PROCESS FLOW & BIOTECHNOLOGY PRINCIPLES -->
      <section class="report-section">
        <h2 class="report-h2">3. Process Architecture & Biotechnology Principles</h2>
        <div class="report-body-text">
          <p>
            The biorefinery employs sequential thermochemical fractionation and biocatalytic transformations:
          </p>
          <ul>
            <li><strong>Pretreatment:</strong> 2.0% w/v NaOH at 100°C for 2 hours cleaves ester linkages between hemicellulose and lignin, solubilizing ~61% of lignin into black liquor while preserving solid cellulose.</li>
            <li><strong>Enzymatic Hydrolysis:</strong> Cellulase cocktails (CBH I, CBH II, EG, β-glucosidase) cleave β-1,4-glucosidic bonds. Water of hydration ($180/162 = 1.111$) expands 42.5 kg cellulose into up to 47.22 kg theoretical D-glucose.</li>
            <li><strong>Fermentation & Distillation:</strong> Hexose sugars are anaerobically metabolized by <em>Saccharomyces cerevisiae</em> via the EMP pathway, yielding bioethanol and biogenic CO₂ according to Gay-Lussac stoichiometry ($0.511\text{ g/g}$). Fractional distillation recovers hydrous ethanol at 93.5% ABV.</li>
            <li><strong>Lignin Biosorbent Recovery:</strong> Controlled acidification of black liquor with H₂SO₄ to pH 2.0 induces protonation and precipitation of technical alkali lignin. Mild drying at 105°C and sizing produce granulated biosorbent with high dye adsorption capacity ($q_e = 7.5\text{ mg/g}$).</li>
          </ul>
        </div>
      </section>

      <!-- 4. MASS BALANCE & STOICHIOMETRIC RECONCILIATION -->
      <section class="report-section">
        <h2 class="report-h2">4. Mass Balance & Double-Counting Audit</h2>
        <div class="report-body-text">
          <p>
            In accordance with BIOVALOR 2026 rules, material allocation is governed by strict non-overlapping mass tracking. The illustrative planning scenario yields:
          </p>
          <div class="table-container">
            <table class="scientific-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Dry Basis Mass</th>
                  <th>Allocated Fraction</th>
                  <th>Allocated Mass</th>
                  <th>Destination Stream</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cellulose</td>
                  <td>${planningBalance.calculated ? (planningBalance.allocations?.cellulose?.dryBasisKg || 42.50).toFixed(2) : '42.50'} kg</td>
                  <td>${state.planning.calculated && state.planning.celluloseFraction ? (Number(state.planning.celluloseFraction) * 100).toFixed(0) : '90'}%</td>
                  <td>${(planningBalance.allocations?.cellulose?.allocatedKg || 38.25).toFixed(3)} kg</td>
                  <td>Pathway A: Bioethanol</td>
                  <td>Literature Stoichiometry</td>
                </tr>
                <tr>
                  <td>Hemicellulose</td>
                  <td>${planningBalance.calculated ? (planningBalance.allocations?.hemicellulose?.dryBasisKg || 25.80).toFixed(2) : '25.80'} kg</td>
                  <td>${state.planning.calculated && state.planning.hemicelluloseFraction ? (Number(state.planning.hemicelluloseFraction) * 100).toFixed(0) : '70'}%</td>
                  <td>${(planningBalance.allocations?.hemicellulose?.allocatedKg || 18.06).toFixed(3)} kg</td>
                  <td>Pathway C: Proposed Pentoses</td>
                  <td>Proposed (Unvalidated)</td>
                </tr>
                <tr>
                  <td>Acid-Insoluble Lignin</td>
                  <td>${planningBalance.calculated ? (planningBalance.allocations?.lignin?.dryBasisKg || 22.10).toFixed(2) : '22.10'} kg</td>
                  <td>${state.planning.calculated && state.planning.ligninFraction ? (Number(state.planning.ligninFraction) * 100).toFixed(0) : '65'}%</td>
                  <td>${(planningBalance.allocations?.lignin?.allocatedKg || 14.365).toFixed(3)} kg</td>
                  <td>Pathway B: Lignin Biosorbent</td>
                  <td>Literature Validated</td>
                </tr>
                <tr>
                  <td>Unassigned Remainder</td>
                  <td>${planningBalance.calculated ? (planningBalance.allocations?.remainder?.dryBasisKg || 9.60).toFixed(2) : '9.60'} kg</td>
                  <td>0%</td>
                  <td>0.000 kg</td>
                  <td>Sump (Quarantine)</td>
                  <td>Excluded from Recovery</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th colspan="3">Total Feedstock Allocation Ratio:</th>
                  <th colspan="3" class="highlight-teal font-bold">${planningBalance.calculated ? planningBalance.accountingRatioPercent.toFixed(3) + '%' : '70.675%'} (${planningBalance.calculated ? planningBalance.totalAllocatedKg.toFixed(3) : '70.675'} kg / ${planningBalance.calculated ? planningBalance.basis.toFixed(1) : '100.0'} kg)</th>
                </tr>
              </tfoot>
            </table>
          </div>
          <p class="disclaimer-text">
            <strong>Audit Note:</strong> Double counting is mathematically prevented. Glucose mass (${(bioethanol.glucoseProduced || 21.0).toFixed(2)} kg) and ethanol mass (${(bioethanol.recoveredEthanolKg || 16.71).toFixed(2)} kg) are NOT added to cellulose mass; only the primary feedstock allocation fraction is credited.
          </p>
        </div>
      </section>

      <!-- 5. TECHNO-ECONOMIC ANALYSIS SUMMARY -->
      <section class="report-section">
        <h2 class="report-h2">5. Techno-Economic Feasibility & Sensitivity Summary</h2>
        <div class="report-body-text">
          <p>
            Economic performance was evaluated across three scenarios on a 1-ton dry bagasse basis:
          </p>
          <div class="table-container">
            <table class="scientific-table">
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Gross Revenue ($/t)</th>
                  <th>OPEX ($/t)</th>
                  <th>Bagasse Opp. Cost ($/t)</th>
                  <th>Net Margin ($/t)</th>
                  <th>Incremental vs Boiler</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>A: Boiler Baseline</strong></td>
                  <td>$${tea.calculated ? tea.scenarioA.revenue.toFixed(2) : '28.00'}</td>
                  <td>$${tea.calculated ? tea.scenarioA.cost.toFixed(2) : '12.00'}</td>
                  <td>—</td>
                  <td>$${tea.calculated ? tea.scenarioA.net.toFixed(2) : '16.00'}</td>
                  <td>Baseline Ref</td>
                </tr>
                <tr>
                  <td><strong>B: Bioethanol Only</strong></td>
                  <td>$${tea.calculated ? tea.scenarioB.revenue.toFixed(2) : '201.21'}</td>
                  <td>$${tea.calculated ? tea.scenarioB.cost.toFixed(2) : '145.00'}</td>
                  <td>$${Number(state.tea.bagasseOpportunityCostPerTon || 28).toFixed(2)}</td>
                  <td>$${tea.calculated ? tea.scenarioB.net.toFixed(2) : '28.21'}</td>
                  <td>${tea.calculated ? ((tea.scenarioB.net - tea.scenarioA.net >= 0 ? '+' : '') + '$' + (tea.scenarioB.net - tea.scenarioA.net).toFixed(2) + '/t') : '+$12.21/t'}</td>
                </tr>
                <tr>
                  <td><strong>C: Integrated Biorefinery</strong></td>
                  <td>$${tea.calculated ? tea.scenarioC.revenue.toFixed(2) : '247.11'}</td>
                  <td>$${tea.calculated ? tea.scenarioC.cost.toFixed(2) : '175.00'}</td>
                  <td>$${Number(state.tea.bagasseOpportunityCostPerTon || 28).toFixed(2)}</td>
                  <td class="highlight-emerald font-bold">$${tea.calculated ? tea.scenarioC.net.toFixed(2) : '44.11'}</td>
                  <td class="highlight-emerald font-bold">+$${(tea.incrementalVsA || 28.11).toFixed(2)}/t</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Key Finding:</strong> Integrated processing generates +$${(tea.incrementalVsA || 28.11).toFixed(2)}/ton incremental value over burning bagasse. Cellulase enzyme cost ($${Number(state.tea.enzymeCostPerTon || 34.00).toFixed(2)}/ton) and biosorbent pricing ($${Number(state.tea.biosorbentSellingPricePerKg || 3.20).toFixed(2)}/kg) represent the greatest sensitivity variables.
          </p>
        </div>
      </section>

      <!-- 6. LIMITATIONS & FUTURE RESEARCH ROADMAP -->
      <section class="report-section">
        <h2 class="report-h2">6. Limitations, Safety & Future Validation Roadmap</h2>
        <div class="report-body-text">
          <ul>
            <li><strong>Hydrous vs Anhydrous Ethanol:</strong> Distillate contains ~6.5% water azeotrope. Fuel-grade blending requires molecular sieve dehydration.</li>
            <li><strong>Wastewater Safety:</strong> Dye decolorization captures color but does not ensure heavy metal, surfactant, or pathogen removal. Treated water must undergo complete toxicity bioassays before discharge.</li>
            <li><strong>Stream C Hemicellulose:</strong> Remains designated as PROPOSED pending continuous pilot validation of C5 sugar recovery.</li>
            <li><strong>Bagasse Diversion Penalty:</strong> Diverting bagasse from mill boilers requires balancing thermal energy with unconverted lignin combustion or biogas recovery.</li>
          </ul>
        </div>
      </section>

      <!-- 7. SCIENTIFIC REFERENCES -->
      <section class="report-section">
        <h2 class="report-h2">7. Peer-Reviewed Academic Bibliography</h2>
        <ol class="bibliography-list">
          ${SCIENTIFIC_PAPERS.map(p => `
            <li>
              <strong>${p.citation}</strong>. “${p.title}”. <em>${p.journal}</em>, ${p.volume} (${p.year}). DOI: <a href="${p.url}" target="_blank">${p.doi}</a>.
            </li>
          `).join('')}
        </ol>
      </section>

    </div>
  `;

  // Attach Print and Export Handlers
  const printBtn = container.querySelector('#btn-print-report');
  const exportBtn = container.querySelector('#btn-export-json');

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const exportData = {
        project: 'CIRCUIT-BAGASSE+',
        event: 'BIOVALOR 2026',
        exportTimestamp: new Date().toISOString(),
        state: appState.getState(),
        calculatedOutputs: appState.getCalculations(),
        residualLedger: RESIDUAL_LEDGER_DATA
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CIRCUIT_BAGASSE_PLUS_MODEL_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
}
