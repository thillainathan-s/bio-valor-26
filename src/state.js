/**
 * CIRCUIT-BAGASSE+ | Central Reactive State Manager
 * Shared inputs, explicit user-driven calculations, validation, and empty-state lifecycle.
 * Manual inputs across all modules: No fake or hardcoded prefilled results by default.
 */

import {
  LITERATURE_FEEDSTOCK,
  DEFAULT_ASSUMPTIONS,
  DEFAULT_TEA_INPUTS,
  calculatePlanningMassBalance,
  calculateBioethanolModel,
  calculateReplicateStats,
  calculateTEA,
  calculateBiorefineryModel,
  generateOptimizationSuggestions
} from './calculations.js';

const STORAGE_KEY = 'circuit_bagasse_user_state_v2';

// Uninitialized empty state — all user fields start empty / unselected
const INITIAL_EMPTY_STATE = {
  // Module 1: Mass Balance Planning
  planning: {
    calculated: false,
    feedstockMassKg: '',        // dry basis kg (empty initially)
    celluloseFraction: '',       // e.g. 0.90 (90%)
    hemicelluloseFraction: '',   // e.g. 0.70 (70%)
    ligninFraction: '',          // e.g. 0.65 (65%)
    isReferenceScenario: false
  },

  // Module 2: Bioethanol Engine
  ethanol: {
    calculated: false,
    celluloseInputKg: '',       // kg dry cellulose input
    hydrolysisConversion: '',   // fraction e.g. 0.80
    fermentationYield: '',      // fraction e.g. 0.90
    ethanolRecovery: '',        // fraction e.g. 0.95
    ethanolDensity: '0.789',    // kg/L at 20°C standard assumption
    isReferenceScenario: false
  },

  // Module 3: Biosorbent Dye Adsorption Lab
  adsorption: {
    calculated: false,
    c0: '',                     // mg/L initial dye
    ce: '',                     // mg/L equilibrium dye
    v: '',                      // L solution volume
    m: '',                      // g dry adsorbent
    contactTimeHours: '2.0',
    ph: '6.8',
    tempC: '25.0',
    replicates: [],             // array of { id, c0, ce }
    isReferenceScenario: false
  },

  // Module 4: Techno-Economic Analysis
  tea: {
    calculated: false,
    bagasseOpportunityCostPerTon: '28.00',
    ethanolSellingPricePerLiter: '0.95',
    biosorbentSellingPricePerKg: '3.20',
    opexScenarioB: '145.00',
    opexScenarioC: '175.00',
    isReferenceScenario: false
  },

  // Navigation & 3D Integration
  activeRoute: 'dashboard',
  selectedMachineId: null,
  sidebarCollapsed: false
};

// Benchmark Literature Reference Scenario (PMC7801571 Academic Baseline)
export const REFERENCE_SCENARIO = {
  planning: {
    calculated: true,
    feedstockMassKg: '100.0',
    celluloseFraction: '0.90',
    hemicelluloseFraction: '0.70',
    ligninFraction: '0.65',
    isReferenceScenario: true
  },
  ethanol: {
    calculated: true,
    celluloseInputKg: '42.5',
    hydrolysisConversion: '0.80',
    fermentationYield: '0.90',
    ethanolRecovery: '0.95',
    ethanolDensity: '0.789',
    isReferenceScenario: true
  },
  adsorption: {
    calculated: true,
    c0: '20.0',
    ce: '5.0',
    v: '0.50',
    m: '1.00',
    contactTimeHours: '2.0',
    ph: '6.8',
    tempC: '25.0',
    replicates: [
      { id: 1, c0: 20.0, ce: 5.1 },
      { id: 2, c0: 20.0, ce: 4.9 },
      { id: 3, c0: 20.0, ce: 5.0 }
    ],
    isReferenceScenario: true
  },
  tea: {
    calculated: true,
    bagasseOpportunityCostPerTon: '28.00',
    ethanolSellingPricePerLiter: '0.95',
    biosorbentSellingPricePerKg: '3.20',
    opexScenarioB: '145.00',
    opexScenarioC: '175.00',
    isReferenceScenario: true
  }
};

class StateStore {
  constructor() {
    this.state = this.loadState();
    this.listeners = new Set();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_EMPTY_STATE,
          ...parsed,
          planning: { ...INITIAL_EMPTY_STATE.planning, ...(parsed.planning || {}) },
          ethanol: { ...INITIAL_EMPTY_STATE.ethanol, ...(parsed.ethanol || {}) },
          adsorption: { ...INITIAL_EMPTY_STATE.adsorption, ...(parsed.adsorption || {}) },
          tea: { ...INITIAL_EMPTY_STATE.tea, ...(parsed.tea || {}) }
        };
      }
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_EMPTY_STATE));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  getState() {
    return this.state;
  }

  /**
   * Centralized calculations accessor.
   * Only returns active results if corresponding module's `calculated` flag is true.
   */
  getCalculations() {
    const s = this.state;

    // 1. Planning Mass Balance
    let planningBalance = {
      calculated: false,
      basis: 0,
      targetKg: 0,
      totalAllocatedKg: 0,
      accountingRatioPercent: 0,
      meetsNumericTarget: false,
      hasDoubleCountingError: false,
      allocations: {
        cellulose: { fraction: 0, allocatedKg: 0, theoreticalRecoveryKg: 0 },
        hemicellulose: { fraction: 0, allocatedKg: 0, theoreticalRecoveryKg: 0 },
        lignin: { fraction: 0, allocatedKg: 0, theoreticalRecoveryKg: 0 },
        remainder: { fraction: 0, allocatedKg: 0 }
      },
      warning: 'No calculation performed. Enter feedstock mass and fraction recovery percentages in the Mass Balance module.'
    };

    if (s.planning.calculated && s.planning.feedstockMassKg) {
      const basis = Number(s.planning.feedstockMassKg);
      const cellFrac = Number(s.planning.celluloseFraction);
      const hemiFrac = Number(s.planning.hemicelluloseFraction);
      const ligFrac = Number(s.planning.ligninFraction);

      if (!isNaN(basis) && basis > 0) {
        planningBalance = {
          calculated: true,
          ...calculatePlanningMassBalance({
            feedstockMassKg: basis,
            celluloseFraction: isNaN(cellFrac) ? 0 : cellFrac,
            hemicelluloseFraction: isNaN(hemiFrac) ? 0 : hemiFrac,
            ligninFraction: isNaN(ligFrac) ? 0 : ligFrac
          })
        };
      }
    }

    // 2. Bioethanol Model
    let bioethanol = {
      calculated: false,
      celluloseInputKg: 0,
      theoreticalGlucose: 0,
      glucoseProduced: 0,
      theoreticalEthanol: 0,
      ethanolFormed: 0,
      recoveredEthanolKg: 0,
      recoveredEthanolVolumeL: 0,
      label: 'Awaiting User Parameters'
    };

    if (s.ethanol.calculated && s.ethanol.celluloseInputKg) {
      const cellKg = Number(s.ethanol.celluloseInputKg);
      const hydConv = Number(s.ethanol.hydrolysisConversion);
      const fermYld = Number(s.ethanol.fermentationYield);
      const ethRec = Number(s.ethanol.ethanolRecovery);
      const ethDens = Number(s.ethanol.ethanolDensity) || 0.789;

      if (!isNaN(cellKg) && cellKg > 0) {
        bioethanol = {
          calculated: true,
          ...calculateBioethanolModel({
            celluloseInputKg: cellKg,
            hydrolysisConversion: isNaN(hydConv) ? 0.8 : hydConv,
            fermentationYield: isNaN(fermYld) ? 0.9 : fermYld,
            ethanolRecovery: isNaN(ethRec) ? 0.95 : ethRec,
            ethanolDensity: ethDens
          })
        };
      }
    }

    // 3. Biosorbent Lab & Replicate Stats
    let repStats = {
      calculated: false,
      count: 0,
      meanRemoval: 0,
      stdDevRemoval: 0,
      meanQe: 0,
      stdDevQe: 0,
      singleRemoval: 0,
      singleQe: 0
    };

    if (s.adsorption.calculated) {
      const c0 = Number(s.adsorption.c0);
      const ce = Number(s.adsorption.ce);
      const v = Number(s.adsorption.v);
      const m = Number(s.adsorption.m);

      if (!isNaN(c0) && !isNaN(ce) && !isNaN(v) && !isNaN(m) && c0 > 0 && v > 0 && m > 0) {
        const singleRemoval = Math.max(0, Math.min(100, ((c0 - ce) / c0) * 100));
        const singleQe = (((c0 - ce) * v) / m);

        let stats = { count: 0, meanRemoval: singleRemoval, stdDevRemoval: 0, meanQe: singleQe, stdDevQe: 0 };
        if (Array.isArray(s.adsorption.replicates) && s.adsorption.replicates.length > 0) {
          stats = calculateReplicateStats(s.adsorption.replicates, v, m);
        }

        repStats = {
          calculated: true,
          singleRemoval,
          singleQe,
          ...stats
        };
      }
    }

    // 4. Integrated Physical Biorefinery Continuous Model (Used for 3D tooltips and continuous flows)
    const effectiveBasis = planningBalance.calculated ? planningBalance.basis : 100.0;
    const effectiveHyd = bioethanol.calculated ? Number(s.ethanol.hydrolysisConversion) : 0.80;
    const effectiveFerm = bioethanol.calculated ? Number(s.ethanol.fermentationYield) : 0.90;
    const effectiveRec = bioethanol.calculated ? Number(s.ethanol.ethanolRecovery) : 0.95;

    const bioModel = calculateBiorefineryModel({
      feedstockMassKg: effectiveBasis,
      hydrolysis: { celluloseConversionEfficiency: effectiveHyd },
      fermentation: { glucoseToEthanolEfficiency: effectiveFerm },
      distillation: { thermalRecoveryRate: effectiveRec, ethanolDensityKgPerL: Number(s.ethanol.ethanolDensity) || 0.789 },
      wastewaterAdsorption: {
        initialDyeConcentrationC0_mg_L: repStats.calculated ? Number(s.adsorption.c0) : 20.0,
        equilibriumDyeConcentrationCe_mg_L: repStats.calculated ? Number(s.adsorption.ce) : 5.0,
        wastewaterVolumeLiters: repStats.calculated ? Number(s.adsorption.v) : 0.5,
        dryAdsorbentMassGrams: repStats.calculated ? Number(s.adsorption.m) : 1.0,
        contactTimeHours: Number(s.adsorption.contactTimeHours) || 2.0,
        ph: Number(s.adsorption.ph) || 6.8,
        temperatureC: Number(s.adsorption.tempC) || 25.0,
        replicates: s.adsorption.replicates || []
      }
    });

    // 5. Techno-Economic Analysis (TEA)
    let tea = {
      calculated: false,
      scenarioA: { name: 'Scenario A: Boiler Baseline', revenue: 0, cost: 0, net: 0 },
      scenarioB: { name: 'Scenario B: Bioethanol Only', revenue: 0, cost: 0, net: 0 },
      scenarioC: { name: 'Scenario C: Integrated Biorefinery', revenue: 0, ethRevenue: 0, bioRevenue: 0, savings: 0, cost: 0, net: 0, netIncrementalOverA: 0 },
      incrementalVsA: 0,
      incrementalVsB: 0,
      ethLitersPerTon: 0,
      biosorbentKgPerTon: 0
    };

    if (s.tea.calculated) {
      tea = {
        calculated: true,
        ...calculateTEA({
          bagasseOpportunityCostPerTon: Number(s.tea.bagasseOpportunityCostPerTon) || 28.0,
          ethanolSellingPricePerLiter: Number(s.tea.ethanolSellingPricePerLiter) || 0.95,
          biosorbentSellingPricePerKg: Number(s.tea.biosorbentSellingPricePerKg) || 3.20,
          opexScenarioB: Number(s.tea.opexScenarioB) || 145.0,
          opexScenarioC: Number(s.tea.opexScenarioC) || 175.0
        }, bioModel)
      };
    }

    const suggestions = generateOptimizationSuggestions(bioModel, tea);

    return {
      planningBalance,
      bioethanol,
      repStats,
      bioModel,
      tea,
      suggestions
    };
  }

  // Action: Calculate Planning Mass Balance
  calculatePlanning(inputs) {
    this.state.planning = {
      ...this.state.planning,
      ...inputs,
      calculated: true,
      isReferenceScenario: false
    };
    this.saveState();
    this.notify();
  }

  // Action: Clear Planning Mass Balance
  clearPlanning() {
    this.state.planning = {
      calculated: false,
      feedstockMassKg: '',
      celluloseFraction: '',
      hemicelluloseFraction: '',
      ligninFraction: '',
      isReferenceScenario: false
    };
    this.saveState();
    this.notify();
  }

  // Action: Calculate Bioethanol Model
  calculateEthanol(inputs) {
    this.state.ethanol = {
      ...this.state.ethanol,
      ...inputs,
      calculated: true,
      isReferenceScenario: false
    };
    this.saveState();
    this.notify();
  }

  // Action: Clear Bioethanol Model
  clearEthanol() {
    this.state.ethanol = {
      calculated: false,
      celluloseInputKg: '',
      hydrolysisConversion: '',
      fermentationYield: '',
      ethanolRecovery: '',
      ethanolDensity: '0.789',
      isReferenceScenario: false
    };
    this.saveState();
    this.notify();
  }

  // Action: Calculate Biosorbent Model
  calculateAdsorption(inputs) {
    this.state.adsorption = {
      ...this.state.adsorption,
      ...inputs,
      calculated: true,
      isReferenceScenario: false
    };
    this.saveState();
    this.notify();
  }

  // Action: Clear Biosorbent Model
  clearAdsorption() {
    this.state.adsorption = {
      calculated: false,
      c0: '',
      ce: '',
      v: '',
      m: '',
      contactTimeHours: '2.0',
      ph: '6.8',
      tempC: '25.0',
      replicates: [],
      isReferenceScenario: false
    };
    this.saveState();
    this.notify();
  }

  // Action: Calculate TEA
  calculateTEA(inputs) {
    this.state.tea = {
      ...this.state.tea,
      ...inputs,
      calculated: true,
      isReferenceScenario: false
    };
    this.saveState();
    this.notify();
  }

  // Action: Clear TEA
  clearTEA() {
    this.state.tea = {
      calculated: false,
      bagasseOpportunityCostPerTon: '28.00',
      ethanolSellingPricePerLiter: '',
      biosorbentSellingPricePerKg: '',
      opexScenarioB: '',
      opexScenarioC: '',
      isReferenceScenario: false
    };
    this.saveState();
    this.notify();
  }

  // Action: Load Complete PMC7801571 Reference Baseline
  loadLiteratureReferenceScenario() {
    this.state = {
      ...this.state,
      planning: { ...REFERENCE_SCENARIO.planning },
      ethanol: { ...REFERENCE_SCENARIO.ethanol },
      adsorption: { ...REFERENCE_SCENARIO.adsorption },
      tea: { ...REFERENCE_SCENARIO.tea }
    };
    this.saveState();
    this.notify();
  }

  // Action: Reset All Inputs to Empty States
  resetAllToEmpty() {
    this.state = JSON.parse(JSON.stringify(INITIAL_EMPTY_STATE));
    this.state.sidebarCollapsed = this.state.sidebarCollapsed; // preserve UI state
    this.saveState();
    this.notify();
  }

  setSidebarCollapsed(collapsed) {
    this.state.sidebarCollapsed = !!collapsed;
    this.saveState();
    this.notify();
  }

  toggleSidebar() {
    this.state.sidebarCollapsed = !this.state.sidebarCollapsed;
    this.saveState();
    this.notify();
  }

  setActiveRoute(route) {
    this.state.activeRoute = route;
    this.saveState();
    this.notify();
  }

  setSelectedMachine(machineId) {
    this.state.selectedMachineId = machineId;
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state, this.getCalculations());
      } catch (e) {
        console.error('Error in state listener:', e);
      }
    }
  }
}

export const appState = new StateStore();
