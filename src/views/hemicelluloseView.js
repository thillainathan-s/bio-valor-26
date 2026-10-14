/**
 * CIRCUIT-BAGASSE+ | Hemicellulose & Residuals View
 * Section 9 Requirements: Stream C Proposed Pathway, 9-Stream Structured Residual Ledger
 */

import { appState } from '../state.js';
import { RESIDUAL_LEDGER_DATA } from '../calculations.js';

export function renderHemicelluloseView(container) {
  const state = appState.getState();
  const { bioModel, planningBalance } = appState.getCalculations();

  container.innerHTML = `
    <div class="view-page animate-fade-in">
      
      <!-- PAGE HEADER -->
      <header class="page-header">
        <div class="page-title-row">
          <div>
            <div class="page-breadcrumb">CIRCUIT-BAGASSE+ / STREAM C & BYPRODUCTS</div>
            <h1 class="page-title">Hemicellulose Recovery Proposal & Residuals Ledger</h1>
            <p class="page-subtitle">Proposed Arabinoxylan Valorization Pathway, Secondary Effluent Tracking & Mass Closure</p>
          </div>
          <a href="#3d-modeling" class="btn-action-outline">
            <span>🏭 Inspect Residuals in 3D</span>
          </a>
        </div>
      </header>

      <!-- PROPOSED PATHWAY MANDATORY BANNER -->
      <section class="scientific-alert-banner alert-purple">
        <div class="alert-icon">🌾</div>
        <div class="alert-content">
          <div class="alert-title">STREAM C STATUS: PROPOSED — NOT EXPERIMENTALLY VALIDATED</div>
          <p class="alert-text">
            The hemicellulose recovery pathway describes an in-silico conceptual chemical engineering design. This liquor must <strong>NEVER</strong> be represented as purified hemicellulose or recovered monomeric pentose sugars without supporting HPLC and inhibitor assays. All recovery values are hypothetical proposals to identify future pilot research directions.
          </p>
        </div>
        <div class="alert-status-badge tier-prop">PROPOSED PATHWAY</div>
      </section>

      <!-- STREAM C CONCEPTUAL PROCESS CASCADE -->
      <section class="card-panel">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">Stream C Conceptual Recovery Architecture</h3>
            <p class="panel-sub">Fractionation of solubilized hemicellulose liquor into C5 pentose sugars, furfural & biogas ${planningBalance.calculated ? `(Basis: ${planningBalance.basis.toFixed(1)} kg)` : '(Illustrative 100 kg Baseline)'}</p>
          </div>
          <span class="data-badge badge-prop">${planningBalance.calculated ? 'User Basis' : 'Illustrative Basis'}</span>
        </div>

        <div class="stream-steps-flow step-flow-hemicellulose">
          <div class="step-box">
            <div class="step-num">01</div>
            <div class="step-name">Pretreatment Liquor</div>
            <div class="step-detail">${bioModel.pathwayC.streamCHemicelluloseInputKg.toFixed(2)} kg Solubilized Xylan</div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="step-box">
            <div class="step-num">02</div>
            <div class="step-name">Acid Post-Hydrolysis</div>
            <div class="step-detail">Dilute H₂SO₄ (1–2%), 120°C, 30 min</div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="step-box">
            <div class="step-num">03</div>
            <div class="step-name">Inhibitor Overliming</div>
            <div class="step-detail">Ca(OH)₂ Neutralization (pH 10 → 6.5)</div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="step-box">
            <div class="step-num">04</div>
            <div class="step-name">C5 Pentose Sugars</div>
            <div class="step-detail">${bioModel.pathwayC.proposedRecoveredPentoseSugarsKg.toFixed(2)} kg (D-Xylose / L-Arabinose)</div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="step-box highlight-step">
            <div class="step-num">05</div>
            <div class="step-name">Co-Products & Furfural</div>
            <div class="step-detail">${bioModel.pathwayC.proposedFurfuralCoproduceKg.toFixed(2)} kg Furfural / Resins</div>
          </div>
        </div>

        <div class="pathway-metric-strip">
          <div class="p-metric-item">
            <span class="p-label">Solubilized Hemicellulose Basis:</span>
            <strong class="highlight-purple">${bioModel.pathwayC.streamCHemicelluloseInputKg.toFixed(2)} kg</strong>
          </div>
          <div class="p-metric-item">
            <span class="p-label">Proposed Pentose Sugar Yield (65%):</span>
            <strong class="highlight-cyan">${bioModel.pathwayC.proposedRecoveredPentoseSugarsKg.toFixed(2)} kg</strong>
          </div>
          <div class="p-metric-item">
            <span class="p-label">Proposed Furfural Co-product (8%):</span>
            <strong class="highlight-amber">${bioModel.pathwayC.proposedFurfuralCoproduceKg.toFixed(2)} kg</strong>
          </div>
          <div class="p-metric-item">
            <span class="p-label">Residual Dilute Wash Liquor:</span>
            <strong>${bioModel.pathwayC.proposedStreamCResidualWashKg.toFixed(2)} kg</strong>
          </div>
        </div>
      </section>

      <!-- 6 ESSENTIAL FUTURE VALIDATION MILESTONES -->
      <section class="dash-section">
        <div class="section-heading-row">
          <div>
            <h2 class="section-title">Required Scientific Milestones Before Commercial Claim</h2>
            <p class="section-sub">Specific analytical protocols required to elevate Stream C from Proposed to Validated</p>
          </div>
          <span class="data-badge badge-lit">Verification Roadmap</span>
        </div>

        <div class="milestones-grid">
          
          <div class="milestone-card">
            <div class="ms-num">M1</div>
            <div class="ms-title">Compositional Characterization</div>
            <p class="ms-desc">
              Quantify degree of polymerization (DP), arabinose-to-xylose ratio, and O-acetyl substitution using high-field 1D/2D NMR and MALDI-TOF mass spectrometry.
            </p>
            <div class="ms-status">Status: Pending Sample Extraction</div>
          </div>

          <div class="milestone-card">
            <div class="ms-num">M2</div>
            <div class="ms-title">HPLC Monosaccharide Assay</div>
            <p class="ms-desc">
              Validate monomeric xylose, arabinose, and galactose yields using HPLC equipped with lead-form ion exchange column (Aminex HPX-87P) at 85°C with RI detection.
            </p>
            <div class="ms-status">Status: Analytical Assay Required</div>
          </div>

          <div class="milestone-card">
            <div class="ms-num">M3</div>
            <div class="ms-title">Inhibitor Profiling</div>
            <p class="ms-desc">
              Profile pseudo-lignin condensation byproducts, furfural, 5-hydroxymethylfurfural (HMF), and levulinic acid via GC-MS to determine yeast toxicity limits.
            </p>
            <div class="ms-status">Status: Detoxification Study Needed</div>
          </div>

          <div class="milestone-card">
            <div class="ms-num">M4</div>
            <div class="ms-title">Pentose Sugar Separation</div>
            <p class="ms-desc">
              Evaluate simulated moving bed (SMB) chromatography or nanofiltration membranes to separate pentoses from residual sodium sulfate salts.
            </p>
            <div class="ms-status">Status: Membrane Screening Needed</div>
          </div>

          <div class="milestone-card">
            <div class="ms-num">M5</div>
            <div class="ms-title">Microbial Compatibility Assay</div>
            <p class="ms-desc">
              Test fermentation using pentose-utilizing strains (<em>Scheffersomyces stipitis</em> or engineered xylose-isomerase <em>S. cerevisiae</em>).
            </p>
            <div class="ms-status">Status: Microbiological Challenge</div>
          </div>

          <div class="milestone-card">
            <div class="ms-num">M6</div>
            <div class="ms-title">Continuous Pilot Validation</div>
            <p class="ms-desc">
              Run continuous 120-hour steady-state campaign to confirm mass closure, fouling rates, and energetic payback before industrial deployment.
            </p>
            <div class="ms-status">Status: Pilot Engineering Phase</div>
          </div>

        </div>
      </section>

      <!-- THE COMPREHENSIVE 9-STREAM RESIDUAL LEDGER -->
      <section class="dash-section">
        <div class="section-heading-row">
          <div>
            <h2 class="section-title">The Structured Residuals & Byproducts Ledger</h2>
            <p class="section-sub">Comprehensive tracking of all 9 unconverted solids, effluents, spent chemicals, and remainder fractions</p>
          </div>
          <span class="data-badge badge-rule">Audit Compliance</span>
        </div>

        <div class="table-container">
          <table class="scientific-table residual-table">
            <thead>
              <tr>
                <th>Stream ID</th>
                <th>Stream Description</th>
                <th>Basis / State</th>
                <th>Est. Mass (kg)</th>
                <th>Proposed Destination</th>
                <th>Evidence Status</th>
                <th>Treatment / Safety Requirements</th>
                <th>Circularity Eligibility</th>
              </tr>
            </thead>
            <tbody>
              ${RESIDUAL_LEDGER_DATA.map(res => `
                <tr class="${res.accountingEligible ? '' : 'row-ineligible'}">
                  <td><strong class="font-mono highlight-cyan">${res.id}</strong></td>
                  <td>
                    <div class="res-stream-title">${res.description}</div>
                    <div class="res-stream-sub">${res.reason}</div>
                  </td>
                  <td><span class="badge-basis">${res.basis}</span></td>
                  <td class="font-bold highlight-amber">${res.estMassKg.toFixed(1)}</td>
                  <td>${res.destination}</td>
                  <td>
                    <span class="tier-badge-pill ${res.evidenceStatus.includes('Proposed') ? 'tier-proposed' : 'tier-literature'}">
                      ${res.evidenceStatus}
                    </span>
                  </td>
                  <td class="res-safety-cell">${res.safetyReq}</td>
                  <td>
                    <span class="eligibility-tag ${res.accountingEligible ? 'tag-eligible' : 'tag-ineligible'}">
                      ${res.accountingEligible ? '✓ Eligible' : '✕ Excluded'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- 3D MODEL CONNECTION NOTICE -->
      <section class="twin-connection-card">
        <div class="tc-icon">🏭</div>
        <div class="tc-content">
          <div class="tc-title">Residuals Management in the 3D Biorefinery Digital Twin</div>
          <p class="tc-desc">
            Residual solids and vinasse are routed into <strong>Unit 10 (Residuals Cogeneration & Anaerobic Digester)</strong>, while Stream C is handled in <strong>Unit C (Proposed Hemicellulose Recovery Unit)</strong>. You can visually inspect these equipment models and fluid transfer lines in the 3D Modeling view.
          </p>
        </div>
        <a href="#3d-modeling" class="btn-action-primary">Inspect Units in 3D →</a>
      </section>

    </div>
  `;
}
