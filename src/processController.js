/**
 * BIOVALOR'26 — Centralized Process Animation Controller
 * 
 * Coordinates industrial equipment states and sequential biorefinery flows:
 * - IDLE: Equipment at standby
 * - READY: Material staged at inlet
 * - PROCESSING: Internal physical/chemical transformation actively running
 * - OUTPUT_TRANSFER: Product discharging through piping network
 * - PAUSED: All dynamic animations frozen
 * - COMPLETE: Stage cycle finished
 * 
 * Supports both Guided Automated Sequence and Independent Machine Inspection.
 */
export class ProcessAnimationController {
  constructor(interactiveMachines, pipelineNetwork, hud, audio) {
    this.interactiveMachines = interactiveMachines;
    this.pipelineNetwork = pipelineNetwork;
    this.hud = hud;
    this.audio = audio;

    // Track state per machine ID
    this.machineStates = {
      'machine-1': 'IDLE',
      'machine-2': 'IDLE',
      'machine-3': 'IDLE',
      'machine-4': 'IDLE',
      'machine-5': 'IDLE',
      'machine-6': 'IDLE',
      'machine-7': 'IDLE',
      'machine-8': 'IDLE',
      'machine-9': 'IDLE',
      'machine-c': 'IDLE',
      'machine-10': 'IDLE'
    };

    this.isPaused = false;
    this.inspectedMachineId = null;
    this.isTourActive = false;
    this.processTime = 0;
  }

  setMachineState(id, state) {
    if (this.machineStates[id] !== undefined) {
      this.machineStates[id] = state;
      const machine = this.interactiveMachines.find(m => m.userData.id === id);
      if (machine && machine.userData.updateStateBadge) {
        machine.userData.updateStateBadge(state);
      }
      if (this.hud && this.inspectedMachineId === id) {
        this.hud.updateInspectorStateBadge(state);
      }
    }
  }

  getMachineState(id) {
    return this.machineStates[id] || 'IDLE';
  }

  isMachineActive(id) {
    if (this.isPaused) return false;
    // If the machine is currently under close inspection, keep its internal animation running
    if (this.inspectedMachineId === id) return true;
    const state = this.machineStates[id];
    return state === 'PROCESSING' || state === 'OUTPUT_TRANSFER';
  }

  // Set all machines to a baseline state
  setAllIdle() {
    Object.keys(this.machineStates).forEach(id => {
      this.setMachineState(id, 'IDLE');
    });
  }

  // Start guided sequential process
  startSequentialTour(stageIndex = 0) {
    this.isTourActive = true;
    this.isPaused = false;
    this.setAllIdle();
    this.activateTourStage(stageIndex);
  }

  activateTourStage(stageIndex) {
    const stageMap = [
      'machine-1',
      'machine-2',
      'machine-3',
      'machine-4',
      'machine-5',
      'machine-6',
      'machine-7',
      'machine-8',
      'machine-9',
      'machine-c',
      'machine-10'
    ];

    if (stageIndex >= stageMap.length) {
      this.isTourActive = false;
      return;
    }

    const currentId = stageMap[stageIndex];
    // Put current machine in PROCESSING
    this.setMachineState(currentId, 'PROCESSING');

    // Optionally set preceding machine to COMPLETE or OUTPUT_TRANSFER
    if (stageIndex > 0) {
      const prevId = stageMap[stageIndex - 1];
      this.setMachineState(prevId, 'COMPLETE');
    }

    // Special simultaneous branches for biorefinery split after Machine 3:
    if (currentId === 'machine-4') {
      // Pathway A active; Pathway B & C staged
      this.setMachineState('machine-7', 'READY');
      this.setMachineState('machine-c', 'READY');
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  setInspectedMachine(id) {
    this.inspectedMachineId = id;
    if (id) {
      // Ensure inspected machine is visibly alive in PROCESSING state for inspection
      this.setMachineState(id, 'PROCESSING');
    }
  }

  clearInspectedMachine() {
    this.inspectedMachineId = null;
  }

  update(delta) {
    if (this.isPaused) return;
    this.processTime += delta;
  }
}
