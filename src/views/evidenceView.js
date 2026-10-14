/**
 * CIRCUIT-BAGASSE+ | Scientific Evidence & Reference Library View
 * Section 13 Requirements: Peer-Reviewed Reference Library (6 Exact Papers, PMC Links, Claims, Limitations)
 */

import { SCIENTIFIC_PAPERS } from '../calculations.js';

export function renderEvidenceView(container) {
  container.innerHTML = `
    <div class="view-page animate-fade-in">
      
      <!-- PAGE HEADER -->
      <header class="page-header">
        <div class="page-title-row">
          <div>
            <div class="page-breadcrumb">CIRCUIT-BAGASSE+ / ACADEMIC FOUNDATION</div>
            <h1 class="page-title">Scientific Evidence & Peer-Reviewed Reference Library</h1>
            <p class="page-subtitle">Curated Literature Evidence Base, Public Health PMC Identifiers, Supported Claims & Methodological Limitations</p>
          </div>
          <div class="evidence-stats-chip">
            <span class="chip-dot dot-success"></span>
            6 Peer-Reviewed Studies Indexed
          </div>
        </div>
      </header>

      <!-- ACADEMIC INTEGRITY NOTICE -->
      <section class="scientific-alert-banner alert-neutral">
        <div class="alert-icon">📚</div>
        <div class="alert-content">
          <div class="alert-title">ACADEMIC RIGOR & LITERATURE BOUNDARIES</div>
          <p class="alert-text">
            Every numeric parameter, reaction stoichiometry, and chemical assumption in CIRCUIT-BAGASSE+ is grounded in the peer-reviewed bioenergy literature. However, literature findings represent specific laboratory cultivars, recombinant enzymes, and bench reactor conditions. <strong>We strictly distinguish between literature findings and our physical validations</strong>.
          </p>
        </div>
      </section>

      <!-- SEARCH / FILTER TOOLBAR -->
      <div class="evidence-toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="input-evidence-search" class="evidence-search-input" placeholder="Search by author, topic, title, or DOI...">
        </div>
        <div class="filter-pills" id="evidence-filter-pills">
          <button class="filter-pill active" data-filter="all">All Disciplines (6)</button>
          <button class="filter-pill" data-filter="Pretreatment">Pretreatment & Composition</button>
          <button class="filter-pill" data-filter="Adsorption">Adsorption & Biosorbents</button>
          <button class="filter-pill" data-filter="Techno-Economic">Techno-Economics & India</button>
        </div>
      </div>

      <!-- PAPERS GRID -->
      <div class="papers-grid" id="papers-grid">
        ${SCIENTIFIC_PAPERS.map(paper => renderPaperCard(paper)).join('')}
      </div>

    </div>
  `;

  // Attach Filter and Search Handlers
  const searchInput = container.querySelector('#input-evidence-search');
  const filterPills = container.querySelectorAll('.filter-pill');
  const papersGrid = container.querySelector('#papers-grid');

  function filterPapers() {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const activePill = container.querySelector('.filter-pill.active')?.dataset.filter || 'all';

    const filtered = SCIENTIFIC_PAPERS.filter(p => {
      const matchQuery = !q || 
        p.title.toLowerCase().includes(q) || 
        p.citation.toLowerCase().includes(q) || 
        p.journal.toLowerCase().includes(q) || 
        p.topic.toLowerCase().includes(q) ||
        p.claimsSupported.toLowerCase().includes(q);

      const matchFilter = activePill === 'all' || 
        p.topic.toLowerCase().includes(activePill.toLowerCase());

      return matchQuery && matchFilter;
    });

    if (papersGrid) {
      if (filtered.length > 0) {
        papersGrid.innerHTML = filtered.map(renderPaperCard).join('');
      } else {
        papersGrid.innerHTML = `<div class="no-papers-found">No reference papers matched your search query.</div>`;
      }
    }
  }

  searchInput?.addEventListener('input', filterPapers);
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      filterPapers();
    });
  });
}

function renderPaperCard(paper) {
  return `
    <article class="paper-card" id="paper-${paper.id}">
      <div class="paper-header">
        <span class="paper-id-tag">${paper.id}</span>
        <span class="paper-year-pill">${paper.year}</span>
        <span class="paper-topic-tag">${paper.topic}</span>
      </div>

      <h3 class="paper-title">${paper.title}</h3>
      
      <div class="paper-meta-row">
        <span class="paper-citation"><strong>Authors:</strong> ${paper.citation}</span>
        <span class="paper-journal"><em>${paper.journal}</em>, ${paper.volume}</span>
      </div>

      <div class="paper-links-row">
        <span class="paper-doi"><strong>DOI:</strong> <a href="${paper.url}" target="_blank" rel="noopener noreferrer">${paper.doi} ↗</a></span>
        ${paper.pmc ? `
          <span class="paper-pmc">
            <span class="pmc-badge">PMC Open Access</span>
            <a href="${paper.url}" target="_blank" rel="noopener noreferrer">${paper.pmc} ↗</a>
          </span>
        ` : ''}
      </div>

      <div class="paper-content-box claims-box">
        <div class="content-box-title">✓ Specific Claims Supported in CIRCUIT-BAGASSE+:</div>
        <p class="content-box-text">${paper.claimsSupported}</p>
      </div>

      <div class="paper-content-box limitations-box">
        <div class="content-box-title">⚠️ Methodological Limitations on Applying Results:</div>
        <p class="content-box-text">${paper.limitations}</p>
      </div>
    </article>
  `;
}
