import * as THREE from 'three';
import gsap from 'gsap';
import { IndustrialComponentsFactory } from './industrialComponents.js';

/**
 * BIOVALOR'26 — ADVANCED INDUSTRIAL 3D EQUIPMENT FACTORY
 * 
 * Generates realistic industrial equipment assemblies with:
 * 1. Convincing external industrial housings, frames, piping, valves, motors, and instruments.
 * 2. Detailed internal mechanisms (impellers, coils, trays, filter plates, shredders, packed beds).
 * 3. Animated physical/chemical material transformations (fibres, slurries, bubbles, vapours, dye capture).
 * 4. Three interactive inspection modes:
 *    - EXTERIOR VIEW (Rugged industrial plant housing)
 *    - INTERNAL INSPECTION VIEW (Selective cutaway opening with active internal transformation)
 *    - EXPLODED VIEW (Outer covers and sub-assemblies displaced to reveal internal arrangement)
 * 5. Clean 3D technical leader labels pointing to internal components.
 */
export class EquipmentFactory {
  constructor(materialLibrary, processController = null) {
    this.mat = materialLibrary;
    this.processController = processController;
    this.ind = new IndustrialComponentsFactory(materialLibrary);

    this.interactiveMachines = [];
    this.animatedComponents = [];
    this.showLabels = true;
  }

  setProcessController(controller) {
    this.processController = controller;
  }

  setLabelsVisible(show) {
    this.showLabels = show;
  }

  // Register interactive machine metadata and view mode switching
  registerMachine(group, id, name, category, stepNumber, cameraTarget, cameraPosition, description, internalCamPos = null) {
    group.userData = {
      isMachine: true,
      id,
      name,
      category,
      stepNumber,
      cameraTarget: cameraTarget.clone(),
      cameraPosition: cameraPosition.clone(),
      internalCameraPosition: (internalCamPos || cameraPosition).clone(),
      description,
      viewMode: 'exterior', // 'exterior', 'interior', 'exploded'
      isCutawayOpen: false,
      cutaways: [],
      explodedParts: [],
      internalLabels: [],
      setViewMode: (mode) => {
        group.userData.viewMode = mode;
        const isInt = mode === 'interior' || mode === 'exploded';
        const isExp = mode === 'exploded';

        // Animate cutaway panels
        group.userData.cutaways.forEach(item => {
          if (item.panel) {
            gsap.to(item.panel.position, {
              x: isInt ? item.openPos.x : item.closedPos.x,
              y: isInt ? item.openPos.y : item.closedPos.y,
              z: isInt ? item.openPos.z : item.closedPos.z,
              duration: 1.0,
              ease: 'power2.inOut'
            });
            if (item.panel.material) {
              gsap.to(item.panel.material, {
                opacity: isInt ? 0.15 : 1.0,
                duration: 0.8
              });
            }
          }
        });

        // Animate exploded parts
        group.userData.explodedParts.forEach(item => {
          gsap.to(item.mesh.position, {
            x: isExp ? item.explodedPos.x : item.normalPos.x,
            y: isExp ? item.explodedPos.y : item.normalPos.y,
            z: isExp ? item.explodedPos.z : item.normalPos.z,
            duration: 1.2,
            ease: 'power2.inOut'
          });
        });

        // Toggle internal technical leader labels (respects showLabels toggle)
        const canShow = this.showLabels !== false;
        group.userData.internalLabels.forEach(label => {
          label.visible = isInt && canShow;
          gsap.to(label.scale, {
            x: (isInt && canShow) ? 1 : 0,
            y: (isInt && canShow) ? 1 : 0,
            z: (isInt && canShow) ? 1 : 0,
            duration: 0.5,
            ease: 'back.out(1.5)'
          });
        });
      }
    };

    this.interactiveMachines.push(group);
    return group;
  }

  // Create machine 3D banner label — Compact, professional, reduced font size
  createMachineLabel(text, colorHex = '#38bdf8') {
    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 44;
    const ctx = canvas.getContext('2d');

    // High-contrast deep slate background pill card
    ctx.fillStyle = 'rgba(7, 13, 26, 0.92)';
    ctx.beginPath();
    ctx.roundRect(2, 2, 356, 40, 11);
    ctx.fill();

    // Machine Pathway Accent Border
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(2, 2, 356, 40, 11);
    ctx.stroke();

    // Luminous pathway indicator pip on the left
    ctx.fillStyle = colorHex;
    ctx.beginPath();
    ctx.arc(17, 22, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Clean, professional reduced typography with subtle shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 11.5px "Inter", "Segoe UI", -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 28, 22);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(material);
    sprite.renderOrder = 99999;
    sprite.scale.set(1.72, 0.21, 1.0);
    sprite.userData = {
      isBanner: true,
      normalScale: new THREE.Vector3(1.72, 0.21, 1.0),
      colorHex: colorHex,
      text: text
    };
    return sprite;
  }

  // =========================================================================
  // MACHINE 1: FEEDSTOCK STORAGE, CONVEYOR & DUAL-SHAFT SIZE REDUCTION UNIT
  // =========================================================================
  createMachine1() {
    const group = new THREE.Group();
    group.position.set(-36, 0, 0);

    const cutaways = [];
    const explodedParts = [];
    const internalLabels = [];

    // Heavy concrete foundation skid
    const base = new THREE.Mesh(new THREE.BoxGeometry(11, 0.6, 7.5), this.mat.get('darkIndustrialSteel'));
    base.position.y = 0.3;
    base.receiveShadow = true;
    const hazardStripe = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.2, 7.7), this.mat.get('equipmentBaseStripe'));
    hazardStripe.position.y = 0.1;
    group.add(base, hazardStripe);

    // 1. Raw Bagasse Storage Bunker (reinforced steel bays)
    const bunkerMat = this.mat.get('machineryHousingNavy');
    const bunkerBack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 5.2), bunkerMat);
    bunkerBack.position.set(-4.5, 1.9, 0);
    const bunkerSide1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.2, 0.3), bunkerMat);
    bunkerSide1.position.set(-3.2, 1.9, 2.45);
    const bunkerSide2 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.2, 0.3), bunkerMat);
    bunkerSide2.position.set(-3.2, 1.9, -2.45);
    group.add(bunkerBack, bunkerSide1, bunkerSide2);

    // Piles of fibrous bagasse raw feedstock
    const pile1 = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.0, 10), this.mat.get('bagasseRaw'));
    pile1.position.set(-3.3, 1.2, 0.5);
    const pile2 = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.6, 9), this.mat.get('bagasseRaw'));
    pile2.position.set(-3.1, 1.0, -1.1);
    group.add(pile1, pile2);

    // 2. Feed Hopper with Vibratory Feeder (Transparent Borosilicate Hopper)
    const hopperBody = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 0.7, 1.8, 4, 1, false, Math.PI / 4),
      this.mat.get('transparentMachineShell')
    );
    hopperBody.position.set(-1.0, 3.2, 0);
    hopperBody.renderOrder = 16;
    group.add(hopperBody);

    // Stainless steel reinforcement rim and throat flange on hopper
    const hopperRim = new THREE.Mesh(
      new THREE.BoxGeometry(2.35, 0.08, 2.35),
      this.mat.get('stainlessSteel')
    );
    hopperRim.position.set(-1.0, 4.1, 0);
    const hopperThroat = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.1, 1.05),
      this.mat.get('stainlessSteel')
    );
    hopperThroat.position.set(-1.0, 2.3, 0);
    group.add(hopperRim, hopperThroat);

    // Visible raw bagasse chunks accumulating inside the transparent hopper
    for (let i = 0; i < 6; i++) {
      const hChunk = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.08, 0),
        this.mat.get('bagasseRaw')
      );
      hChunk.position.set(-1.0 + (Math.random() - 0.5) * 0.6, 2.7 + Math.random() * 0.7, (Math.random() - 0.5) * 0.6);
      group.add(hChunk);
    }

    // Structural legs for hopper
    for (let dx of [-0.9, 0.9]) {
      for (let dz of [-0.9, 0.9]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, 0.12), this.mat.get('darkIndustrialSteel'));
        leg.position.set(-1.0 + dx, 1.5, dz);
        group.add(leg);
      }
    }

    // 3. Inclined Industrial Belt Conveyor
    const conveyorLen = 5.2;
    const conveyorAngle = Math.PI / 13;
    const conveyorFrame = new THREE.Mesh(new THREE.BoxGeometry(conveyorLen, 0.25, 1.2), this.mat.get('darkIndustrialSteel'));
    conveyorFrame.position.set(1.5, 1.8, 0);
    conveyorFrame.rotation.z = -conveyorAngle;
    group.add(conveyorFrame);

    // Conveyor rollers
    for (let i = -2; i <= 2; i++) {
      const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.15, 16), this.mat.get('stainlessSteel'));
      roller.rotation.x = Math.PI / 2;
      roller.position.set(1.5 + (i * 0.9 * Math.cos(conveyorAngle)), 1.7 - (i * 0.9 * Math.sin(conveyorAngle)), 0);
      group.add(roller);
    }

    // Conveyor Belt
    const belt = new THREE.Mesh(new THREE.BoxGeometry(conveyorLen * 0.98, 0.05, 1.05), this.mat.get('conveyorBelt'));
    belt.position.set(1.5, 1.95, 0);
    belt.rotation.z = -conveyorAngle;
    group.add(belt);

    // Drive motor for conveyor
    const conveyorMotor = this.ind.createElectricMotor({ length: 0.7, radius: 0.25, orientation: 'z' });
    conveyorMotor.position.set(3.8, 1.2, 0.9);
    group.add(conveyorMotor);

    // Moving irregular fibrous bagasse pieces on belt
    const fibersGroup = new THREE.Group();
    fibersGroup.position.copy(belt.position);
    fibersGroup.rotation.copy(belt.rotation);
    const fiberChunks = [];
    for (let i = 0; i < 12; i++) {
      const chunk = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.18 + (Math.random() * 0.08), 0),
        this.mat.get('bagasseRaw')
      );
      chunk.position.set(-2.0 + (i * 0.42), 0.1, (Math.random() - 0.5) * 0.65);
      chunk.scale.set(1.5, 0.6, 1.0);
      fibersGroup.add(chunk);
      fiberChunks.push({
        mesh: chunk,
        initialX: chunk.position.x,
        speed: 1.2
      });
    }
    group.add(fibersGroup);

    // 4. Heavy Dual-Shaft Shredder / Size-Reduction Housing (Transparent Inspection Casing)
    const shredderCasing = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 2.6, 2.2),
      this.mat.get('transparentMachineShell')
    );
    shredderCasing.position.set(4.4, 2.0, 0);
    shredderCasing.renderOrder = 16;
    group.add(shredderCasing);

    // Structural steel corner angle frames on shredder
    for (let sx of [-1.15, 1.15]) {
      for (let sz of [-1.05, 1.05]) {
        const anglePost = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 2.6, 0.1),
          this.mat.get('darkIndustrialSteel')
        );
        anglePost.position.set(4.4 + sx, 2.0, sz);
        group.add(anglePost);
      }
    }

    // Cutaway front panel on shredder housing that slides open during inspection
    const cutawayPanelMat = new THREE.MeshStandardMaterial({
      color: 0x142036,
      metalness: 0.5,
      roughness: 0.35,
      transparent: true,
      opacity: 1.0
    });
    const cutawayPanel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.3, 1.9), cutawayPanelMat);
    cutawayPanel.position.set(4.4, 2.0, 1.12);
    cutawayPanel.rotation.y = Math.PI / 2;
    group.add(cutawayPanel);

    cutaways.push({
      panel: cutawayPanel,
      closedPos: new THREE.Vector3(4.4, 2.0, 1.12),
      openPos: new THREE.Vector3(4.4, 2.0, 2.6) // slides outward
    });

    explodedParts.push({
      mesh: cutawayPanel,
      normalPos: new THREE.Vector3(4.4, 2.0, 1.12),
      explodedPos: new THREE.Vector3(4.4, 2.0, 3.2)
    });

    // Removable top feed chute hood
    const topChute = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.0, 0.9, 4, 1, false, Math.PI / 4), this.mat.get('stainlessSteel'));
    topChute.position.set(4.4, 3.6, 0);
    group.add(topChute);

    explodedParts.push({
      mesh: topChute,
      normalPos: new THREE.Vector3(4.4, 3.6, 0),
      explodedPos: new THREE.Vector3(4.4, 5.0, 0)
    });

    // Shredder drive assembly (heavy geared motor)
    const shredderMotor = this.ind.createElectricMotor({ length: 1.1, radius: 0.38, hasGearbox: true, orientation: 'z' });
    shredderMotor.position.set(4.4, 2.1, -1.6);
    group.add(shredderMotor);

    // INTERNAL MECHANISM: Dual Intermeshing Counter-Rotating Cutter Shafts with Star Blades
    const cuttersGroup = new THREE.Group();
    cuttersGroup.position.set(4.4, 2.0, 0);

    const shaft1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.7, 16), this.mat.get('stainlessSteel'));
    shaft1.rotation.x = Math.PI / 2;
    shaft1.position.set(-0.35, 0, 0);

    const shaft2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.7, 16), this.mat.get('stainlessSteel'));
    shaft2.rotation.x = Math.PI / 2;
    shaft2.position.set(0.35, 0, 0);

    // Intermeshing toothed cutter disks
    const bladeGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 8);
    const bladeMat = this.mat.get('stainlessSteel');
    const bladeDisks1 = [];
    const bladeDisks2 = [];

    for (let z = -0.6; z <= 0.6; z += 0.22) {
      const b1 = new THREE.Mesh(bladeGeo, bladeMat);
      b1.rotation.x = Math.PI / 2;
      b1.position.set(-0.35, 0, z);
      cuttersGroup.add(b1);
      bladeDisks1.push(b1);

      const b2 = new THREE.Mesh(bladeGeo, bladeMat);
      b2.rotation.x = Math.PI / 2;
      b2.position.set(0.35, 0, z + 0.11);
      cuttersGroup.add(b2);
      bladeDisks2.push(b2);
    }
    cuttersGroup.add(shaft1, shaft2);
    group.add(cuttersGroup);

    // Finely shredded bagasse particles falling through bottom screen into discharge chute
    const shreddedParticles = [];
    const shredGroup = new THREE.Group();
    shredGroup.position.set(4.4, 1.0, 0);
    for (let i = 0; i < 24; i++) {
      const p = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.04, 0.1),
        this.mat.get('bagasseRaw')
      );
      p.position.set((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.8);
      shredGroup.add(p);
      shreddedParticles.push({
        mesh: p,
        initialY: p.position.y,
        speed: 1.5 + Math.random()
      });
    }
    group.add(shredGroup);

    // 5. Digital Load-Cell Weigh Scale Display
    const scalePylon = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 0.12), this.mat.get('darkIndustrialSteel'));
    scalePylon.position.set(1.8, 1.0, 2.2);
    const scaleDisplay = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.12), this.mat.get('machineryHousingNavy'));
    scaleDisplay.position.set(1.8, 1.9, 2.2);
    const screenFace = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.4), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
    screenFace.position.set(1.8, 1.9, 2.27);
    group.add(scalePylon, scaleDisplay, screenFace);

    // Internal Technical Labels
    const lblConveyor = this.ind.createTechnicalLabel('INCLINED BELT CONVEYOR', '#f59e0b', 'Continuous Bagasse Transport');
    lblConveyor.position.set(1.5, 3.8, 0);
    lblConveyor.scale.set(0, 0, 0);
    const lblCutters = this.ind.createTechnicalLabel('DUAL ROTATING SHREDDER', '#0ea5e9', 'Mechanical Size Reduction');
    lblCutters.position.set(4.4, 4.4, 0);
    lblCutters.scale.set(0, 0, 0);
    const lblHopper = this.ind.createTechnicalLabel('RAW BAGASSE HOPPER', '#f59e0b', 'Storage & Calibrated Feed');
    lblHopper.position.set(-1.0, 5.0, 0);
    lblHopper.scale.set(0, 0, 0);

    group.add(lblConveyor, lblCutters, lblHopper);
    internalLabels.push(lblConveyor, lblCutters, lblHopper);

    // Machine 3D Label Banner
    const label = this.createMachineLabel('1. FEEDSTOCK STORAGE & SHREDDER', '#f59e0b');
    label.position.set(0, 7.2, 0);
    group.add(label);

    // Animation update loop
    this.animatedComponents.push({
      update: (delta) => {
        const isActive = this.processController ? this.processController.isMachineActive('machine-1') : true;
        if (!isActive) return;

        // Animate fiber chunks traveling along conveyor belt
        for (let item of fiberChunks) {
          item.mesh.position.x += item.speed * delta;
          if (item.mesh.position.x > 2.4) {
            item.mesh.position.x = -2.2;
          }
        }

        // Animate counter-rotating shredder shafts
        shaft1.rotation.y += delta * 7.0;
        shaft2.rotation.y -= delta * 7.0;
        for (let b of bladeDisks1) b.rotation.z += delta * 7.0;
        for (let b of bladeDisks2) b.rotation.z -= delta * 7.0;

        // Animate falling shredded particles
        for (let p of shreddedParticles) {
          p.mesh.position.y -= p.speed * delta;
          if (p.mesh.position.y < -0.4) {
            p.mesh.position.y = 0.4;
          }
        }
      }
    });

    const registered = this.registerMachine(
      group,
      'machine-1',
      'Feedstock Receiving, Storage Bunker & Shredder',
      'LITERATURE',
      1,
      new THREE.Vector3(-36, 2.0, 0),
      new THREE.Vector3(-36, 5.5, 9.5),
      'Bulk sugarcane bagasse storage, inclined conveyor transport, continuous load-cell weighing, and mechanical dual-shaft size reduction for surface area enhancement.',
      new THREE.Vector3(-32, 3.2, 4.5)
    );

    registered.userData.cutaways = cutaways;
    registered.userData.explodedParts = explodedParts;
    registered.userData.internalLabels = internalLabels;
    return registered;
  }

  // =========================================================================
  // MACHINE 2: ALKALINE PRETREATMENT REACTOR (VERTICAL PRESSURE VESSEL)
  // =========================================================================
  createMachine2() {
    const group = new THREE.Group();
    group.position.set(-22, 0, 0);

    const cutaways = [];
    const explodedParts = [];
    const internalLabels = [];

    // Concrete & steel foundation
    const base = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.5, 6.5), this.mat.get('darkIndustrialSteel'));
    base.position.y = 0.25;
    const hazardStripe = new THREE.Mesh(new THREE.BoxGeometry(6.7, 0.2, 6.7), this.mat.get('equipmentBaseStripe'));
    hazardStripe.position.y = 0.1;
    group.add(base, hazardStripe);

    // 4 Heavy structural steel support legs with anchor footpads
    for (let dx of [-1.8, 1.8]) {
      for (let dz of [-1.8, 1.8]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.2, 0.24), this.mat.get('darkIndustrialSteel'));
        leg.position.set(dx, 1.6, dz);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.5), this.mat.get('machineryHousingNavy'));
        foot.position.set(dx, 0.04, dz);
        group.add(leg, foot);
      }
    }

    // Main Transparent Reactor Vessel Shell
    const vesselRadius = 1.9;
    const vesselHeight = 4.2;
    const vesselY = 4.4;

    // Full back half of vessel - Transparent Borosilicate Reactor Wall
    const backVessel = new THREE.Mesh(
      new THREE.CylinderGeometry(vesselRadius, vesselRadius, vesselHeight, 32, 1, false, Math.PI * 0.5, Math.PI * 1.3),
      this.mat.get('transparentMachineShell')
    );
    backVessel.position.y = vesselY;
    group.add(backVessel);

    // Front cutaway wall sector that slides open in internal view
    const frontWallMat = this.mat.get('transparentMachineShell').clone();
    frontWallMat.opacity = 0.42;
    const frontWall = new THREE.Mesh(
      new THREE.CylinderGeometry(vesselRadius, vesselRadius, vesselHeight, 32, 1, false, -Math.PI * 0.5, Math.PI * 0.7),
      frontWallMat
    );
    frontWall.position.y = vesselY;
    group.add(frontWall);

    // Structural Stainless Steel Reinforcement Flange Rings
    for (let dy of [-vesselHeight * 0.38, 0, vesselHeight * 0.38]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(vesselRadius * 1.01, 0.04, 8, 32),
        this.mat.get('stainlessSteel')
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = vesselY + dy;
      group.add(ring);
    }

    cutaways.push({
      panel: frontWall,
      closedPos: new THREE.Vector3(0, vesselY, 0),
      openPos: new THREE.Vector3(0, vesselY, 2.2)
    });

    explodedParts.push({
      mesh: frontWall,
      normalPos: new THREE.Vector3(0, vesselY, 0),
      explodedPos: new THREE.Vector3(0, vesselY, 3.0)
    });

    // Dished Top Head & Bottom Conical Discharge
    const topDishedHead = new THREE.Mesh(
      new THREE.SphereGeometry(vesselRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45),
      this.mat.get('stainlessSteel')
    );
    topDishedHead.position.y = vesselY + vesselHeight * 0.5;
    group.add(topDishedHead);

    explodedParts.push({
      mesh: topDishedHead,
      normalPos: new THREE.Vector3(0, vesselY + vesselHeight * 0.5, 0),
      explodedPos: new THREE.Vector3(0, vesselY + vesselHeight * 0.5 + 1.8, 0)
    });

    const bottomCone = new THREE.Mesh(
      new THREE.CylinderGeometry(vesselRadius, 0.4, 1.4, 32),
      this.mat.get('stainlessSteel')
    );
    bottomCone.position.y = vesselY - vesselHeight * 0.5 - 0.7;
    group.add(bottomCone);

    // Top Agitator Motor Drive Assembly (Electric Motor + Helical Gearbox + Mechanical Seal)
    const topDrive = this.ind.createElectricMotor({
      length: 1.2,
      radius: 0.42,
      hasGearbox: true,
      gearboxLength: 0.7,
      orientation: 'y'
    });
    topDrive.position.set(0, vesselY + vesselHeight * 0.5 + 1.6, 0);
    group.add(topDrive);

    explodedParts.push({
      mesh: topDrive,
      normalPos: new THREE.Vector3(0, vesselY + vesselHeight * 0.5 + 1.6, 0),
      explodedPos: new THREE.Vector3(0, vesselY + vesselHeight * 0.5 + 3.4, 0)
    });

    // Inspection Sight Window on front
    const sightPort = this.ind.createInspectionPort(0.35);
    sightPort.position.set(0, vesselY + 0.8, vesselRadius * 0.96);
    group.add(sightPort);

    // Instruments: Digital Temperature Transmitter and Pressure Gauge
    const tempTransmitter = this.ind.createTemperatureTransmitter(0.4);
    tempTransmitter.position.set(vesselRadius * 0.9, vesselY + 1.2, 0.6);
    const pressureGauge = this.ind.createPressureGauge(0.24);
    pressureGauge.position.set(-vesselRadius * 0.85, vesselY + vesselHeight * 0.5 + 0.4, 0.8);
    group.add(tempTransmitter, pressureGauge);

    // Chemical Dosing Line (NaOH Sparger connection)
    const naohDosingPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 16), this.mat.get('stainlessSteel'));
    naohDosingPipe.position.set(1.2, vesselY + vesselHeight * 0.5 + 0.5, 0.6);
    const naohValve = this.ind.createPneumaticControlValve(0.12, 0x0ea5e9);
    naohValve.position.set(1.2, vesselY + vesselHeight * 0.5 + 1.2, 0.6);
    group.add(naohDosingPipe, naohValve);

    // ================= INTERNAL MECHANISM & FLUID ANIMATION =================
    const internalGroup = new THREE.Group();

    // Central Agitator Shaft
    const agitatorShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, vesselHeight + 1.2, 16), this.mat.get('stainlessSteel'));
    agitatorShaft.position.set(0, vesselY, 0);
    internalGroup.add(agitatorShaft);

    // Dual 4-Pitched-Blade Impeller Turbines (Lower & Upper)
    const impellerGroup1 = new THREE.Group();
    impellerGroup1.position.set(0, vesselY - 1.0, 0);
    const impellerGroup2 = new THREE.Group();
    impellerGroup2.position.set(0, vesselY + 0.6, 0);

    const bladeGeo = new THREE.BoxGeometry(0.55, 0.16, 0.03);
    const bladeMat = this.mat.get('stainlessSteel');
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const b1 = new THREE.Mesh(bladeGeo, bladeMat);
      b1.position.set(Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5);
      b1.rotation.y = angle;
      b1.rotation.x = 0.35; // pitched blade
      impellerGroup1.add(b1);

      const b2 = new THREE.Mesh(bladeGeo, bladeMat);
      b2.position.set(Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5);
      b2.rotation.y = angle;
      b2.rotation.x = 0.35;
      impellerGroup2.add(b2);
    }
    internalGroup.add(impellerGroup1, impellerGroup2);

    // Internal Steam Heating Coil (Helical Tube inside reactor wall)
    const coilPoints = [];
    for (let t = 0; t <= Math.PI * 12; t += 0.25) {
      const r = vesselRadius * 0.82;
      const y = vesselY - 1.5 + (t / (Math.PI * 12)) * 3.0;
      coilPoints.push(new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r));
    }
    const coilCurve = new THREE.CatmullRomCurve3(coilPoints);
    const coilMesh = new THREE.Mesh(
      new THREE.TubeGeometry(coilCurve, 120, 0.045, 8, false),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.6,
        metalness: 0.7,
        roughness: 0.2
      })
    );
    internalGroup.add(coilMesh);

    // NaOH Internal Ring Sparger (perforated ring below top liquid level)
    const spargerRing = new THREE.Mesh(
      new THREE.TorusGeometry(vesselRadius * 0.65, 0.035, 8, 24),
      this.mat.get('stainlessSteel')
    );
    spargerRing.rotation.x = Math.PI / 2;
    spargerRing.position.set(0, vesselY + 1.2, 0);
    internalGroup.add(spargerRing);

    // Pretreatment Bagasse Slurry Volume (Translucent Brown-Amber Swirling Slurry)
    const slurryGeo = new THREE.CylinderGeometry(vesselRadius * 0.92, vesselRadius * 0.92, vesselHeight * 0.75, 32);
    const slurryMat = new THREE.MeshPhysicalMaterial({
      color: 0x78350f,
      emissive: 0x451a03,
      emissiveIntensity: 0.35,
      transmission: 0.5,
      transparent: true,
      opacity: 0.82,
      roughness: 0.25
    });
    const slurryMesh = new THREE.Mesh(slurryGeo, slurryMat);
    slurryMesh.position.set(0, vesselY - 0.4, 0);
    internalGroup.add(slurryMesh);

    // Swirling slurry vortex particle system (bagasse fibres swelling under NaOH action)
    const slurryParticles = [];
    const particleCount = 45;
    const partGeo = new THREE.DodecahedronGeometry(0.08, 0);
    const partMat = this.mat.get('bagasseRaw');
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(partGeo, partMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.4 + Math.random() * (vesselRadius * 0.75);
      const y = vesselY - 1.4 + Math.random() * (vesselHeight * 0.7);
      p.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      internalGroup.add(p);
      slurryParticles.push({
        mesh: p,
        angle,
        radius,
        baseY: y,
        speed: 1.5 + Math.random() * 1.5
      });
    }

    group.add(internalGroup);

    // Internal Technical Labels
    const lblImpeller = this.ind.createTechnicalLabel('MIXING IMPELLER', '#0ea5e9', 'Dual 4-Pitched-Blade Turbines');
    lblImpeller.position.set(0, vesselY + 2.4, 0);
    lblImpeller.scale.set(0, 0, 0);
    const lblHeating = this.ind.createTechnicalLabel('HEATING ZONE', '#f59e0b', 'Internal Steam Heating Coil (100°C)');
    lblHeating.position.set(-1.6, vesselY + 0.2, 0);
    lblHeating.scale.set(0, 0, 0);
    const lblSlurry = this.ind.createTechnicalLabel('BIOMASS SLURRY', '#78350f', 'NaOH Delignification (61% solubilization)');
    lblSlurry.position.set(1.6, vesselY - 0.8, 0);
    lblSlurry.scale.set(0, 0, 0);
    const lblDosing = this.ind.createTechnicalLabel('NAOH CHEMICAL DOSING', '#0ea5e9', 'Perforated Dispersion Ring Sparger');
    lblDosing.position.set(1.2, vesselY + vesselHeight * 0.5 + 2.0, 0.6);
    lblDosing.scale.set(0, 0, 0);

    group.add(lblImpeller, lblHeating, lblSlurry, lblDosing);
    internalLabels.push(lblImpeller, lblHeating, lblSlurry, lblDosing);

    // 3D Banner
    const label = this.createMachineLabel('2. ALKALINE PRETREATMENT REACTOR', '#0ea5e9');
    label.position.set(0, 9.8, 0);
    group.add(label);

    // Animation update
    this.animatedComponents.push({
      update: (delta) => {
        const isActive = this.processController ? this.processController.isMachineActive('machine-2') : true;
        if (!isActive) return;

        // Animate rotating impellers and shaft
        agitatorShaft.rotation.y += delta * 4.5;
        impellerGroup1.rotation.y += delta * 4.5;
        impellerGroup2.rotation.y += delta * 4.5;

        // Animate swirling vortex particle motion
        for (let sp of slurryParticles) {
          sp.angle += sp.speed * delta;
          sp.mesh.position.x = Math.cos(sp.angle) * sp.radius;
          sp.mesh.position.z = Math.sin(sp.angle) * sp.radius;
          sp.mesh.position.y = sp.baseY + Math.sin(sp.angle * 2) * 0.15;
        }

        // Slight thermal emissive pulse on heating coil
        coilMesh.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.003) * 0.25;
      }
    });

    const registered = this.registerMachine(
      group,
      'machine-2',
      'Alkaline Pretreatment Reactor (NaOH)',
      'LITERATURE',
      2,
      new THREE.Vector3(-22, 4.0, 0),
      new THREE.Vector3(-22, 6.5, 9.5),
      'Thermochemical deconstruction unit (2% NaOH, 100°C) breaking biomass recalcitrance, solubilizing 61.0% of lignin into alkaline black liquor while preserving cellulose microfibrils in the solid fraction.',
      new THREE.Vector3(-19, 4.5, 4.8)
    );

    registered.userData.cutaways = cutaways;
    registered.userData.explodedParts = explodedParts;
    registered.userData.internalLabels = internalLabels;
    return registered;
  }

  // =========================================================================
  // MACHINE 3: SOLID-LIQUID SEPARATOR (HORIZONTAL PLATE FILTER PRESS)
  // =========================================================================
  createMachine3() {
    const group = new THREE.Group();
    group.position.set(-10, 0, 0);

    const cutaways = [];
    const explodedParts = [];
    const internalLabels = [];

    // Structural floor pad
    const base = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.5, 5.5), this.mat.get('darkIndustrialSteel'));
    base.position.y = 0.25;
    const hazardStripe = new THREE.Mesh(new THREE.BoxGeometry(8.7, 0.2, 5.7), this.mat.get('equipmentBaseStripe'));
    hazardStripe.position.y = 0.1;
    group.add(base, hazardStripe);

    // Heavy Industrial Filter Press Frame
    // Stationary Fixed Head at left (-3.2), Movable Follower Head, Hydraulic Ram at right (+3.2)
    const fixedHead = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.2, 2.6), this.mat.get('machineryHousingNavy'));
    fixedHead.position.set(-3.2, 2.0, 0);
    const hydraulicHead = new THREE.Mesh(new THREE.BoxGeometry(1.0, 3.2, 2.6), this.mat.get('machineryHousingNavy'));
    hydraulicHead.position.set(3.2, 2.0, 0);
    group.add(fixedHead, hydraulicHead);

    // Hydraulic Ram Cylinder and Piston Rod
    const ramCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.0, 24), this.mat.get('darkIndustrialSteel'));
    ramCylinder.rotation.z = Math.PI / 2;
    ramCylinder.position.set(4.0, 2.0, 0);
    const ramPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.8, 24), this.mat.get('polishedChrome'));
    ramPiston.rotation.z = Math.PI / 2;
    ramPiston.position.set(2.4, 2.0, 0);
    group.add(ramCylinder, ramPiston);

    // Twin Heavy Side Tension Tie-Bars
    for (let dz of [-1.1, 1.1]) {
      const tieBar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6.4, 16), this.mat.get('polishedChrome'));
      tieBar.rotation.z = Math.PI / 2;
      tieBar.position.set(0, 2.0, dz);
      group.add(tieBar);
    }

    // Pack of 16 Recessed Filter Press Plates
    const filterPlatesGroup = new THREE.Group();
    const plateGeo = new THREE.BoxGeometry(0.12, 2.4, 2.2);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.6,
      roughness: 0.35
    });

    const plateMeshes = [];
    for (let i = 0; i < 16; i++) {
      const plate = new THREE.Mesh(plateGeo, plateMat);
      const x = -2.4 + (i * 0.28);
      plate.position.set(x, 2.0, 0);

      // Filter cloth insert (recessed chamber)
      const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(0.02, 2.0),
        new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
      );
      cloth.position.set(0.065, 0, 0);
      plate.add(cloth);

      filterPlatesGroup.add(plate);
      plateMeshes.push(plate);
    }
    group.add(filterPlatesGroup);

    // Transparent Safety Splash Curtains / Inspection Guards (Front & Rear)
    const splashCurtain = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.4, 0.08), this.mat.get('transparentMachineShell'));
    splashCurtain.position.set(0, 2.0, 1.35);
    splashCurtain.renderOrder = 16;
    const splashRear = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.4, 0.08), this.mat.get('transparentMachineShell'));
    splashRear.position.set(0, 2.0, -1.35);
    splashRear.renderOrder = 16;
    group.add(splashCurtain, splashRear);

    cutaways.push({
      panel: splashCurtain,
      closedPos: new THREE.Vector3(0, 2.0, 1.35),
      openPos: new THREE.Vector3(0, 3.8, 1.35) // slides upwards
    });

    explodedParts.push({
      mesh: splashCurtain,
      normalPos: new THREE.Vector3(0, 2.0, 1.35),
      explodedPos: new THREE.Vector3(0, 4.2, 2.2)
    });

    // 1. Solid Cake Bottom Discharge Chute (STREAM A - CELLULOSE CAKE) with Transparent Viewing Windows
    const cakeChute = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.6, 2.0), this.mat.get('transparentMachineShell'));
    cakeChute.position.set(0, 0.6, 0);
    cakeChute.renderOrder = 15;
    const cakeConveyor = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.1, 1.2), this.mat.get('conveyorBelt'));
    cakeConveyor.position.set(0, 0.3, 0);
    group.add(cakeChute, cakeConveyor);

    // Cellulose Cake Solid Blocks dropping onto conveyor (Teal)
    const cakeBlocks = [];
    for (let i = -2; i <= 2; i++) {
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.15, 0.8),
        this.mat.get('celluloseTeal')
      );
      block.position.set(i * 0.9, 0.42, 0);
      group.add(block);
      cakeBlocks.push(block);
    }

    // 2. Filtrate Collection Manifolds on Fixed Head
    // Manifold 1: STREAM B (Lignin-rich Black Liquor - Amber/Brown)
    const manifoldB = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 16), this.mat.get('ligninBrown'));
    manifoldB.position.set(-3.7, 1.8, -0.6);
    const valveB = this.ind.createManualValve({ pipeRadius: 0.12, wheelColor: 0x92400e });
    valveB.position.set(-3.7, 1.8, -0.6);
    group.add(manifoldB, valveB);

    // Manifold 2: STREAM C (Hemicellulose-rich Liquid - Violet)
    const manifoldC = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 16), this.mat.get('hemicelluloseViolet'));
    manifoldC.position.set(-3.7, 1.8, 0.6);
    const valveC = this.ind.createManualValve({ pipeRadius: 0.12, wheelColor: 0x9333ea });
    valveC.position.set(-3.7, 1.8, 0.6);
    group.add(manifoldC, valveC);

    // Manifold 3: SPENT WASH TO DRAIN SUMP
    const drainPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 16), this.mat.get('residualGrey'));
    drainPipe.position.set(-3.7, 0.8, 0);
    group.add(drainPipe);

    // Internal Technical Labels
    const lblHydraulic = this.ind.createTechnicalLabel('HYDRAULIC RAM CYLINDER', '#38bdf8', 'Plate Clamping Force (150 bar)');
    lblHydraulic.position.set(3.2, 4.0, 0);
    lblHydraulic.scale.set(0, 0, 0);
    const lblPlates = this.ind.createTechnicalLabel('RECESSED FILTER PLATES', '#334155', 'Cake Consolidation Chambers');
    lblPlates.position.set(0, 4.0, 0);
    lblPlates.scale.set(0, 0, 0);
    const lblStreamA = this.ind.createTechnicalLabel('STREAM A: CELLULOSE CAKE', '#0ea5e9', 'High-Solids Washed Fibre to Hydrolysis');
    lblStreamA.position.set(0, 0.9, -1.4);
    lblStreamA.scale.set(0, 0, 0);
    const lblStreamB = this.ind.createTechnicalLabel('STREAM B: ALKALINE BLACK LIQUOR', '#92400e', 'Solubilized Lignin to Precipitation');
    lblStreamB.position.set(-3.7, 2.9, -1.0);
    lblStreamB.scale.set(0, 0, 0);
    const lblStreamC = this.ind.createTechnicalLabel('STREAM C: HEMICELLULOSE LIQUID', '#9333ea', 'Solubilized Xylan to Proposed Recovery');
    lblStreamC.position.set(-3.7, 2.9, 1.0);
    lblStreamC.scale.set(0, 0, 0);

    group.add(lblHydraulic, lblPlates, lblStreamA, lblStreamB, lblStreamC);
    internalLabels.push(lblHydraulic, lblPlates, lblStreamA, lblStreamB, lblStreamC);

    // 3D Banner
    const label = this.createMachineLabel('3. SOLID-LIQUID FRACTIONATION PRESS', '#14b8a6');
    label.position.set(0, 7.4, 0);
    group.add(label);

    // Animation update
    this.animatedComponents.push({
      update: (delta) => {
        const isActive = this.processController ? this.processController.isMachineActive('machine-3') : true;
        if (!isActive) return;

        // Subtle hydraulic cycle breathing
        const ramCycle = Math.sin(Date.now() * 0.002);
        ramPiston.position.x = 2.4 + ramCycle * 0.12;

        // Move discharged cellulose cake blocks
        for (let b of cakeBlocks) {
          b.position.x += delta * 0.8;
          if (b.position.x > 2.6) b.position.x = -2.2;
        }
      }
    });

    const registered = this.registerMachine(
      group,
      'machine-3',
      'Solid-Liquid Fractionation (Filter Press)',
      'CALCULATED ESTIMATE',
      3,
      new THREE.Vector3(-10, 2.5, 0),
      new THREE.Vector3(-10, 5.5, 9.5),
      'Multi-chamber recessed plate filter press fractionating pretreated slurry into Stream A (cellulose cake to bioethanol), Stream B (alkaline black liquor to lignin biosorbent), and Stream C (hemicellulose liquid to proposed recovery). Residual wash drains to central sump.',
      new THREE.Vector3(-7, 3.2, 4.2)
    );

    registered.userData.cutaways = cutaways;
    registered.userData.explodedParts = explodedParts;
    registered.userData.internalLabels = internalLabels;
    return registered;
  }

  // =========================================================================
  // MACHINE 4: ENZYMATIC HYDROLYSIS REACTOR (PATHWAY A)
  // =========================================================================
  createMachine4() {
    const group = new THREE.Group();
    group.position.set(2, 0, 11);

    const cutaways = [];
    const explodedParts = [];
    const internalLabels = [];

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 6), this.mat.get('darkIndustrialSteel'));
    base.position.y = 0.25;
    const hazardStripe = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.2, 6.2), this.mat.get('equipmentBaseStripe'));
    hazardStripe.position.y = 0.1;
    group.add(base, hazardStripe);

    // Vessel Body
    const r = 1.7;
    const h = 3.8;
    const y = 3.6;

    // Back vessel - Transparent Borosilicate Bioreactor Wall
    const backVessel = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, h, 32, 1, false, Math.PI * 0.5, Math.PI * 1.3),
      this.mat.get('transparentMachineShell')
    );
    backVessel.position.y = y;
    group.add(backVessel);

    // Front cutaway wall - Transparent
    const frontWallMat = this.mat.get('transparentMachineShell').clone();
    frontWallMat.opacity = 0.42;
    const frontWall = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, h, 32, 1, false, -Math.PI * 0.5, Math.PI * 0.7),
      frontWallMat
    );
    frontWall.position.y = y;
    group.add(frontWall);

    // Structural Stainless Steel Reinforcement Flange Rings
    for (let dy of [-h * 0.38, 0, h * 0.38]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r * 1.01, 0.04, 8, 32),
        this.mat.get('stainlessSteel')
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y + dy;
      group.add(ring);
    }

    cutaways.push({
      panel: frontWall,
      closedPos: new THREE.Vector3(0, y, 0),
      openPos: new THREE.Vector3(0, y, 2.0)
    });

    explodedParts.push({
      mesh: frontWall,
      normalPos: new THREE.Vector3(0, y, 0),
      explodedPos: new THREE.Vector3(0, y, 2.8)
    });

    // Top Dished Head & Motor Drive
    const topHead = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), this.mat.get('stainlessSteel'));
    topHead.position.y = y + h * 0.5;
    const topMotor = this.ind.createElectricMotor({ length: 1.0, radius: 0.38, hasGearbox: true, orientation: 'y' });
    topMotor.position.set(0, y + h * 0.5 + 1.4, 0);
    group.add(topHead, topMotor);

    explodedParts.push({
      mesh: topMotor,
      normalPos: new THREE.Vector3(0, y + h * 0.5 + 1.4, 0),
      explodedPos: new THREE.Vector3(0, y + h * 0.5 + 3.0, 0)
    });

    // Enzyme dosing port and automated valve
    const enzymeDosing = this.ind.createPneumaticControlValve(0.12, 0x38bdf8);
    enzymeDosing.position.set(1.1, y + h * 0.5 + 0.8, 0.4);
    group.add(enzymeDosing);

    // Sight Glass on front
    const sightPort = this.ind.createInspectionPort(0.32);
    sightPort.position.set(0, y + 0.6, r * 0.96);
    group.add(sightPort);

    // INTERNAL MECHANISM: Helical Ribbon Agitator & Bio-catalytic Enzyme Conversion
    const internalGroup = new THREE.Group();

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, h + 0.8, 16), this.mat.get('stainlessSteel'));
    shaft.position.y = y;
    internalGroup.add(shaft);

    // Helical Ribbon Impeller
    const ribbonPoints = [];
    for (let t = 0; t <= Math.PI * 8; t += 0.3) {
      const radius = r * 0.72;
      const py = y - 1.4 + (t / (Math.PI * 8)) * 2.8;
      ribbonPoints.push(new THREE.Vector3(Math.cos(t) * radius, py, Math.sin(t) * radius));
    }
    const ribbonCurve = new THREE.CatmullRomCurve3(ribbonPoints);
    const ribbonMesh = new THREE.Mesh(new THREE.TubeGeometry(ribbonCurve, 80, 0.06, 8, false), this.mat.get('stainlessSteel'));
    internalGroup.add(ribbonMesh);

    // Amber Glucose Syrup Fluid Volume (Translucent)
    const glucoseFluid = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.92, r * 0.92, h * 0.75, 32),
      this.mat.get('glucoseAmber')
    );
    glucoseFluid.position.set(0, y - 0.4, 0);
    internalGroup.add(glucoseFluid);

    // Suspended Cellulose Fibres converting into glowing biocatalytic enzyme markers
    const enzymeParticles = [];
    const count = 35;
    for (let i = 0; i < count; i++) {
      const p = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.08, 0),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      const angle = Math.random() * Math.PI * 2;
      const rad = 0.3 + Math.random() * (r * 0.65);
      const py = y - 1.2 + Math.random() * (h * 0.65);
      p.position.set(Math.cos(angle) * rad, py, Math.sin(angle) * rad);
      internalGroup.add(p);
      enzymeParticles.push({
        mesh: p,
        angle,
        rad,
        baseY: py,
        speed: 1.2 + Math.random()
      });
    }

    group.add(internalGroup);

    // Internal Technical Labels
    const lblRibbon = this.ind.createTechnicalLabel('HELICAL RIBBON AGITATOR', '#38bdf8', 'High-Viscosity Slurry Circulation');
    lblRibbon.position.set(0, y + 2.2, 0);
    lblRibbon.scale.set(0, 0, 0);
    const lblEnzyme = this.ind.createTechnicalLabel('ENZYME ADDITION', '#0ea5e9', 'Cellulase Cocktail (15 FPU/g)');
    lblEnzyme.position.set(1.1, y + h * 0.5 + 1.8, 0.4);
    lblEnzyme.scale.set(0, 0, 0);
    const lblGlucose = this.ind.createTechnicalLabel('GLUCOSE SYRUP SOLUTION', '#f59e0b', 'Hydrolysis Product (180/162 Factor)');
    lblGlucose.position.set(-1.4, y - 0.8, 0);
    lblGlucose.scale.set(0, 0, 0);

    group.add(lblRibbon, lblEnzyme, lblGlucose);
    internalLabels.push(lblRibbon, lblEnzyme, lblGlucose);

    // 3D Banner
    const label = this.createMachineLabel('4. ENZYMATIC HYDROLYSIS REACTOR', '#38bdf8');
    label.position.set(0, 9.0, 0);
    group.add(label);

    // Animation update
    this.animatedComponents.push({
      update: (delta) => {
        const isActive = this.processController ? this.processController.isMachineActive('machine-4') : true;
        if (!isActive) return;

        shaft.rotation.y += delta * 2.8;
        ribbonMesh.rotation.y += delta * 2.8;

        for (let ep of enzymeParticles) {
          ep.angle += ep.speed * delta;
          ep.mesh.position.x = Math.cos(ep.angle) * ep.rad;
          ep.mesh.position.z = Math.sin(ep.angle) * ep.rad;
          ep.mesh.position.y = ep.baseY + Math.sin(ep.angle * 3) * 0.12;
        }
      }
    });

    const registered = this.registerMachine(
      group,
      'machine-4',
      'Enzymatic Hydrolysis Reactor',
      'CALCULATED ESTIMATE',
      4,
      new THREE.Vector3(2, 3.5, 11),
      new THREE.Vector3(2, 6.0, 19.5),
      'Cellulase enzymatic reactor operating at 50°C and pH 4.8. Cleaves cellulose polymer chains into fermentable D-glucose syrup with stoichiometric hydration factor (180/162).',
      new THREE.Vector3(4.5, 3.8, 14.5)
    );

    registered.userData.cutaways = cutaways;
    registered.userData.explodedParts = explodedParts;
    registered.userData.internalLabels = internalLabels;
    return registered;
  }

  // =========================================================================
  // MACHINE 5: YEAST FERMENTATION TANK (PATHWAY A)
  // =========================================================================
  createMachine5() {
    const group = new THREE.Group();
    group.position.set(15, 0, 11);

    const cutaways = [];
    const explodedParts = [];
    const internalLabels = [];

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 6), this.mat.get('darkIndustrialSteel'));
    base.position.y = 0.25;
    const hazardStripe = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.2, 6.2), this.mat.get('equipmentBaseStripe'));
    hazardStripe.position.y = 0.1;
    group.add(base, hazardStripe);

    const r = 1.8;
    const h = 4.2;
    const y = 3.8;

    // Back vessel - Transparent Borosilicate Fermenter Wall
    const backVessel = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, h, 32, 1, false, Math.PI * 0.5, Math.PI * 1.3),
      this.mat.get('transparentMachineShell')
    );
    backVessel.position.y = y;
    group.add(backVessel);

    // Front cutaway - Transparent
    const frontWallMat = this.mat.get('transparentMachineShell').clone();
    frontWallMat.opacity = 0.42;
    const frontWall = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, h, 32, 1, false, -Math.PI * 0.5, Math.PI * 0.7),
      frontWallMat
    );
    frontWall.position.y = y;
    group.add(frontWall);

    // Structural Stainless Steel Reinforcement Flange Rings
    for (let dy of [-h * 0.38, 0, h * 0.38]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r * 1.01, 0.04, 8, 32),
        this.mat.get('stainlessSteel')
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y + dy;
      group.add(ring);
    }

    cutaways.push({
      panel: frontWall,
      closedPos: new THREE.Vector3(0, y, 0),
      openPos: new THREE.Vector3(0, y, 2.2)
    });

    explodedParts.push({
      mesh: frontWall,
      normalPos: new THREE.Vector3(0, y, 0),
      explodedPos: new THREE.Vector3(0, y, 3.0)
    });

    // Top Head with CO2 Off-Gas Vent Stack & Relief Valve
    const topHead = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), this.mat.get('stainlessSteel'));
    topHead.position.y = y + h * 0.5;
    group.add(topHead);

    const co2VentPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.4, 16), this.mat.get('stainlessSteel'));
    co2VentPipe.position.set(0, y + h * 0.5 + 1.2, 0);
    const co2ReliefValve = this.ind.createManualValve({ pipeRadius: 0.1, wheelColor: 0x38bdf8 });
    co2ReliefValve.position.set(0, y + h * 0.5 + 1.6, 0);
    group.add(co2VentPipe, co2ReliefValve);

    explodedParts.push({
      mesh: topHead,
      normalPos: new THREE.Vector3(0, y + h * 0.5, 0),
      explodedPos: new THREE.Vector3(0, y + h * 0.5 + 2.0, 0)
    });

    // Top Drive Motor (Low-shear gentle agitator)
    const motor = this.ind.createElectricMotor({ length: 0.8, radius: 0.3, orientation: 'y' });
    motor.position.set(-0.8, y + h * 0.5 + 0.8, 0);
    group.add(motor);

    // INTERNAL MECHANISM: Broth Volume, Yeast Cell Clusters & Rising Biogenic CO2 Bubbles
    const internalGroup = new THREE.Group();

    // Fermenting Broth Liquid
    const brothMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.92, r * 0.92, h * 0.78, 32),
      this.mat.get('glucoseAmber')
    );
    brothMesh.position.set(0, y - 0.3, 0);
    internalGroup.add(brothMesh);

    // Low-shear marine hydrofoil propeller at bottom
    const propeller = new THREE.Group();
    propeller.position.set(0, y - 1.2, 0);
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.12), this.mat.get('stainlessSteel'));
      blade.rotation.y = (i * Math.PI * 2) / 3;
      blade.rotation.x = 0.3;
      propeller.add(blade);
    }
    internalGroup.add(propeller);

    // Rising Biogenic CO2 Micro-Bubbles
    const bubbleCount = 65;
    const bubbles = [];
    const bubbleGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const bubbleMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.85 });

    for (let i = 0; i < bubbleCount; i++) {
      const b = new THREE.Mesh(bubbleGeo, bubbleMat);
      const rad = Math.random() * (r * 0.75);
      const angle = Math.random() * Math.PI * 2;
      const by = y - 1.4 + Math.random() * (h * 0.75);
      b.position.set(Math.cos(angle) * rad, by, Math.sin(angle) * rad);
      internalGroup.add(b);
      bubbles.push({
        mesh: b,
        baseY: by,
        speed: 0.8 + Math.random() * 1.2,
        rad,
        angle
      });
    }

    group.add(internalGroup);

    // Internal Technical Labels
    const lblFermentation = this.ind.createTechnicalLabel('FERMENTATION ZONE', '#f59e0b', 'Saccharomyces cerevisiae (32°C)');
    lblFermentation.position.set(0, y + 2.2, 0);
    lblFermentation.scale.set(0, 0, 0);
    const lblCo2 = this.ind.createTechnicalLabel('VAPOUR OUTLET (CO2)', '#38bdf8', 'Biogenic Off-Gas (0.5111 Stoichiometric)');
    lblCo2.position.set(0, y + h * 0.5 + 2.4, 0);
    lblCo2.scale.set(0, 0, 0);
    const lblBroth = this.ind.createTechnicalLabel('FERMENTATION BROTH', '#d97706', 'Dilute Bioethanol Harvest to Distillation');
    lblBroth.position.set(-1.4, y - 0.8, 0);
    lblBroth.scale.set(0, 0, 0);

    group.add(lblFermentation, lblCo2, lblBroth);
    internalLabels.push(lblFermentation, lblCo2, lblBroth);

    // 3D Banner
    const label = this.createMachineLabel('5. YEAST FERMENTATION TANK', '#f59e0b');
    label.position.set(0, 9.2, 0);
    group.add(label);

    // Animation update
    this.animatedComponents.push({
      update: (delta) => {
        const isActive = this.processController ? this.processController.isMachineActive('machine-5') : true;
        if (!isActive) return;

        propeller.rotation.y += delta * 3.0;

        // Animate rising biogenic CO2 bubbles
        for (let b of bubbles) {
          b.mesh.position.y += b.speed * delta;
          b.mesh.position.x = Math.cos(b.angle + Date.now() * 0.001) * b.rad;
          b.mesh.position.z = Math.sin(b.angle + Date.now() * 0.001) * b.rad;
          if (b.mesh.position.y > y + h * 0.4) {
            b.mesh.position.y = y - 1.4;
          }
        }
      }
    });

    const registered = this.registerMachine(
      group,
      'machine-5',
      'Yeast Fermentation Tank',
      'CALCULATED ESTIMATE',
      5,
      new THREE.Vector3(15, 3.5, 11),
      new THREE.Vector3(15, 6.0, 19.5),
      'Anaerobic Saccharomyces cerevisiae fermenter converting monomeric D-glucose into dilute bioethanol broth and biogenic CO2 off-gas via Gay-Lussac stoichiometry (theoretical maximum 0.5111 kg/kg).',
      new THREE.Vector3(17.5, 3.8, 14.5)
    );

    registered.userData.cutaways = cutaways;
    registered.userData.explodedParts = explodedParts;
    registered.userData.internalLabels = internalLabels;
    return registered;
  }

  // =========================================================================
  // MACHINE 6: ETHANOL DISTILLATION COLUMN, REBOILER & CONDENSER (PATHWAY A)
  // =========================================================================
  createMachine6() {
    const group = new THREE.Group();
    group.position.set(28, 0, 11);

    const cutaways = [];
    const explodedParts = [];
    const internalLabels = [];

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.5, 6.5), this.mat.get('darkIndustrialSteel'));
    base.position.y = 0.25;
    const hazardStripe = new THREE.Mesh(new THREE.BoxGeometry(6.7, 0.2, 6.7), this.mat.get('equipmentBaseStripe'));
    hazardStripe.position.y = 0.1;
    group.add(base, hazardStripe);

    // Tall Multi-Section Fractionating Column Shell
    const colR = 0.95;
    const colH = 7.5;
    const colY = 4.6;

    // Back cylinder - Transparent Fractionating Column Wall
    const backCol = new THREE.Mesh(
      new THREE.CylinderGeometry(colR, colR, colH, 24, 1, false, Math.PI * 0.5, Math.PI * 1.3),
      this.mat.get('transparentMachineShell')
    );
    backCol.position.set(-1.2, colY, 0);
    group.add(backCol);

    // Front cutaway - Transparent
    const frontWallMat = this.mat.get('transparentMachineShell').clone();
    frontWallMat.opacity = 0.40;
    const frontCol = new THREE.Mesh(
      new THREE.CylinderGeometry(colR, colR, colH, 24, 1, false, -Math.PI * 0.5, Math.PI * 0.7),
      frontWallMat
    );
    frontCol.position.set(-1.2, colY, 0);
    group.add(frontCol);

    // Circumferential Section Flanges Between Trays
    for (let i = 0; i < 9; i++) {
      const ty = colY - 3.2 + (i * 0.8);
      const flange = new THREE.Mesh(
        new THREE.TorusGeometry(colR * 1.02, 0.035, 8, 24),
        this.mat.get('stainlessSteel')
      );
      flange.rotation.x = Math.PI / 2;
      flange.position.set(-1.2, ty, 0);
      group.add(flange);
    }

    cutaways.push({
      panel: frontCol,
      closedPos: new THREE.Vector3(-1.2, colY, 0),
      openPos: new THREE.Vector3(-1.2, colY, 1.8)
    });

    explodedParts.push({
      mesh: frontCol,
      normalPos: new THREE.Vector3(-1.2, colY, 0),
      explodedPos: new THREE.Vector3(-1.2, colY, 2.5)
    });

    // Column structural support skirt
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(colR * 1.15, colR * 1.3, 1.4, 24), this.mat.get('darkIndustrialSteel'));
    skirt.position.set(-1.2, 0.7, 0);
    group.add(skirt);

    // INTERNAL MECHANISM: 8 Visible Bubble-Cap Fractionating Trays with Downcomers
    const trayGroup = new THREE.Group();
    trayGroup.position.set(-1.2, 0, 0);
    const trayGeo = new THREE.CylinderGeometry(colR * 0.9, colR * 0.9, 0.06, 24);
    const trayMat = this.mat.get('stainlessSteel');
    const trays = [];

    for (let i = 0; i < 8; i++) {
      const ty = colY - 2.8 + (i * 0.8);
      const tray = new THREE.Mesh(trayGeo, trayMat);
      tray.position.y = ty;

      // Miniature bubble-caps on tray
      for (let bx of [-0.3, 0.3]) {
        for (let bz of [-0.3, 0.3]) {
          const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8), this.mat.get('darkIndustrialSteel'));
          cap.position.set(bx, 0.06, bz);
          tray.add(cap);
        }
      }
      trayGroup.add(tray);
      trays.push(tray);
    }
    group.add(trayGroup);

    // Rising ethanol vapour particles inside column
    const vapourParticles = [];
    const vapGroup = new THREE.Group();
    vapGroup.position.set(-1.2, 0, 0);
    for (let i = 0; i < 30; i++) {
      const v = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.8 })
      );
      v.position.set((Math.random() - 0.5) * 0.8, colY - 2.8 + Math.random() * 5.6, (Math.random() - 0.5) * 0.8);
      vapGroup.add(v);
      vapourParticles.push({
        mesh: v,
        speed: 1.8 + Math.random() * 1.2
      });
    }
    group.add(vapGroup);

    // 1. Bottom Thermosiphon Reboiler Vessel (Boiling bottom fraction)
    const reboiler = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.8, 16), this.mat.get('stainlessSteel'));
    reboiler.rotation.x = Math.PI / 2;
    reboiler.position.set(-1.2, 1.8, -1.8);
    group.add(reboiler);

    // 2. Overhead Shell-and-Tube Condenser
    const condenser = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 2.4, 24), this.mat.get('stainlessSteel'));
    condenser.rotation.z = Math.PI / 2;
    condenser.position.set(1.4, colY + 2.8, 0);
    group.add(condenser);

    // Overhead Vapour Pipe from Column Top to Condenser
    const ovhdCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.2, colY + colH * 0.5, 0),
      new THREE.Vector3(-1.2, colY + colH * 0.5 + 0.8, 0),
      new THREE.Vector3(0.2, colY + 2.8, 0)
    ]);
    const ovhdPipe = new THREE.Mesh(new THREE.TubeGeometry(ovhdCurve, 32, 0.14, 12, false), this.mat.get('stainlessSteel'));
    group.add(ovhdPipe);

    // 3. Hydrous Ethanol Distillate Receiver Collection Tank
    const receiver = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2.2, 24), this.mat.get('stainlessSteel'));
    receiver.position.set(2.0, 1.6, 0);
    const receiverSight = this.ind.createSightGlass(1.2, 0.08, 0xfbbf24);
    receiverSight.position.set(2.0, 1.6, 0.85);
    group.add(receiver, receiverSight);

    // Internal Technical Labels
    const lblTrays = this.ind.createTechnicalLabel('BUBBLE-CAP TRAYS', '#fbbf24', 'Vapour-Liquid Multi-Stage Equilibrium');
    lblTrays.position.set(-1.2, colY + 3.8, 0);
    lblTrays.scale.set(0, 0, 0);
    const lblCondenser = this.ind.createTechnicalLabel('CONDENSER', '#38bdf8', 'Cooling Water Latent Heat Removal');
    lblCondenser.position.set(1.4, colY + 4.2, 0);
    lblCondenser.scale.set(0, 0, 0);
    const lblEthanol = this.ind.createTechnicalLabel('RECOVERED ETHANOL ESTIMATE', '#fbbf24', 'Hydrous Azeotrope (~93-95% ABV)');
    lblEthanol.position.set(2.0, 3.2, 0);
    lblEthanol.scale.set(0, 0, 0);

    group.add(lblTrays, lblCondenser, lblEthanol);
    internalLabels.push(lblTrays, lblCondenser, lblEthanol);

    // 3D Banner
    const label = this.createMachineLabel('6. ETHANOL DISTILLATION COLUMN', '#fbbf24');
    label.position.set(0, 12.2, 0);
    group.add(label);

    // Animation update
    this.animatedComponents.push({
      update: (delta) => {
        const isActive = this.processController ? this.processController.isMachineActive('machine-6') : true;
        if (!isActive) return;

        // Animate rising vapour particles
        for (let vp of vapourParticles) {
          vp.mesh.position.y += vp.speed * delta;
          if (vp.mesh.position.y > colY + 3.2) {
            vp.mesh.position.y = colY - 2.8;
          }
        }
      }
    });

    const registered = this.registerMachine(
      group,
      'machine-6',
      'Ethanol Distillation Column & Condenser',
      'CALCULATED ESTIMATE',
      6,
      new THREE.Vector3(28, 4.8, 11),
      new THREE.Vector3(28, 7.5, 20.0),
      'Fractionating column and shell-and-tube condenser concentrating ethanol to the hydrous azeotrope (~93-95% ABV). Modelled output: Recovered ethanol estimate. Note: Fuel-grade purity requires molecular sieve dehydration.',
      new THREE.Vector3(30.5, 4.5, 14.5)
    );

    registered.userData.cutaways = cutaways;
    registered.userData.explodedParts = explodedParts;
    registered.userData.internalLabels = internalLabels;
    return registered;
  }

  // =========================================================================
  // MACHINE 7: LIGNIN ACIDIFICATION & PRECIPITATION VESSEL (PATHWAY B)
  // =========================================================================
  createMachine7() {
    const group = new THREE.Group();
    group.position.set(2, 0, -11);

    const cutaways = [];
    const explodedParts = [];
    const internalLabels = [];

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 6), this.mat.get('darkIndustrialSteel'));
    base.position.y = 0.25;
    const hazardStripe = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.2, 6.2), this.mat.get('equipmentBaseStripe'));
    hazardStripe.position.y = 0.1;
    group.add(base, hazardStripe);

    const r = 1.6;
    const h = 3.6;
    const y = 3.4;

    // Back vessel - Transparent Acid-Resistant Reactor Wall
    const backVessel = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, h, 24, 1, false, Math.PI * 0.5, Math.PI * 1.3),
      this.mat.get('transparentMachineShell')
    );
    backVessel.position.y = y;
    group.add(backVessel);

    // Front cutaway - Transparent
    const frontWallMat = this.mat.get('transparentMachineShell').clone();
    frontWallMat.opacity = 0.42;
    const frontWall = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, h, 24, 1, false, -Math.PI * 0.5, Math.PI * 0.7),
      frontWallMat
    );
    frontWall.position.y = y;
    group.add(frontWall);

    // Structural Stainless Steel Reinforcement Rings
    for (let dy of [-h * 0.35, 0, h * 0.35]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r * 1.01, 0.04, 8, 24),
        this.mat.get('stainlessSteel')
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y + dy;
      group.add(ring);
    }

    cutaways.push({
      panel: frontWall,
      closedPos: new THREE.Vector3(0, y, 0),
      openPos: new THREE.Vector3(0, y, 1.9)
    });

    explodedParts.push({
      mesh: frontWall,
      normalPos: new THREE.Vector3(0, y, 0),
      explodedPos: new THREE.Vector3(0, y, 2.7)
    });

    // Top Agitator Drive
    const motor = this.ind.createElectricMotor({ length: 0.9, radius: 0.32, hasGearbox: true, orientation: 'y' });
    motor.position.set(0, y + h * 0.5 + 1.2, 0);
    group.add(motor);

    // H2SO4 Acid Dosing Pipe with Metering Pump & Dip Tube
    const acidDosing = this.ind.createPneumaticControlValve(0.1, 0xef4444);
    acidDosing.position.set(1.0, y + h * 0.5 + 0.6, 0);
    group.add(acidDosing);

    // INTERNAL MECHANISM: High-Shear Propeller, Black Liquor to Brown Lignin Flocculation
    const internalGroup = new THREE.Group();

    // High shear impeller shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, h + 0.6, 16), this.mat.get('stainlessSteel'));
    shaft.position.y = y;
    const prop = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 4), this.mat.get('stainlessSteel'));
    prop.position.set(0, y - 0.8, 0);
    internalGroup.add(shaft, prop);

    // Dark alkaline black liquor fluid volume
    const liquorMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.92, r * 0.92, h * 0.75, 24),
      this.mat.get('ligninBrown')
    );
    liquorMesh.position.set(0, y - 0.4, 0);
    internalGroup.add(liquorMesh);

    // Precipitating solid brown lignin floccule particles (growing and flocculating)
    const ligninParticles = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      const p = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.09, 0),
        new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 })
      );
      const angle = Math.random() * Math.PI * 2;
      const rad = 0.2 + Math.random() * (r * 0.68);
      const py = y - 1.2 + Math.random() * (h * 0.65);
      p.position.set(Math.cos(angle) * rad, py, Math.sin(angle) * rad);
      internalGroup.add(p);
      ligninParticles.push({
        mesh: p,
        angle,
        rad,
        baseY: py,
        speed: 2.2 + Math.random() * 1.5
      });
    }

    group.add(internalGroup);

    // Internal Technical Labels
    const lblAcid = this.ind.createTechnicalLabel('H2SO4 ACID INJECTION', '#ef4444', 'Controlled Acidification to pH 2.0');
    lblAcid.position.set(1.0, y + h * 0.5 + 1.8, 0);
    lblAcid.scale.set(0, 0, 0);
    const lblFloc = this.ind.createTechnicalLabel('LIGNIN PRECIPITATION ZONE', '#78350f', 'Soluble Phenolics to Insoluble Floccules');
    lblFloc.position.set(0, y + 2.2, 0);
    lblFloc.scale.set(0, 0, 0);
    const lblSlurry = this.ind.createTechnicalLabel('PRECIPITATED LIGNIN SLURRY', '#451a03', 'Acid-Insoluble Fraction to Washing');
    lblSlurry.position.set(-1.4, y - 0.8, 0);
    lblSlurry.scale.set(0, 0, 0);

    group.add(lblAcid, lblFloc, lblSlurry);
    internalLabels.push(lblAcid, lblFloc, lblSlurry);

    // 3D Banner
    const label = this.createMachineLabel('7. LIGNIN PRECIPITATION TANK', '#92400e');
    label.position.set(0, 9.0, 0);
    group.add(label);

    // Animation update
    this.animatedComponents.push({
      update: (delta) => {
        const isActive = this.processController ? this.processController.isMachineActive('machine-7') : true;
        if (!isActive) return;

        shaft.rotation.y += delta * 6.0;
        prop.rotation.y += delta * 6.0;

        for (let lp of ligninParticles) {
          lp.angle += lp.speed * delta;
          lp.mesh.position.x = Math.cos(lp.angle) * lp.rad;
          lp.mesh.position.z = Math.sin(lp.angle) * lp.rad;
          lp.mesh.position.y = lp.baseY + Math.sin(lp.angle * 2) * 0.1;
        }
      }
    });

    const registered = this.registerMachine(
      group,
      'machine-7',
      'Lignin Acidification & Precipitation Vessel',
      'CALCULATED ESTIMATE',
      7,
      new THREE.Vector3(2, 3.2, -11),
      new THREE.Vector3(2, 5.8, -2.5),
      'Acidification contactor dosing dilute H2SO4 to drop pH from alkaline black liquor down to pH 2.0, flocculating and precipitating acid-insoluble lignin macromolecules.',
      new THREE.Vector3(4.5, 3.5, -7.5)
    );

    registered.userData.cutaways = cutaways;
    registered.userData.explodedParts = explodedParts;
    registered.userData.internalLabels = internalLabels;
    return registered;
  }

  // =========================================================================
  // MACHINE 8: WASHING, DRYING & BIOSORBENT PREPARATION (PATHWAY B)
  // =========================================================================
  createMachine8() {
    const group = new THREE.Group();
    group.position.set(15, 0, -11);

    const cutaways = [];
    const explodedParts = [];
    const internalLabels = [];

    // Structural Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.5, 6.5), this.mat.get('darkIndustrialSteel'));
    base.position.y = 0.25;
    const hazardStripe = new THREE.Mesh(new THREE.BoxGeometry(8.7, 0.2, 6.7), this.mat.get('equipmentBaseStripe'));
    hazardStripe.position.y = 0.1;
    group.add(base, hazardStripe);

    // DISTINCT UNIT 8A: Rotary Vacuum Drum Filter & Spray Washer (Left: x = -2.4) — Transparent Inspection Trough
    const washTrough = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 2.2), this.mat.get('transparentMachineShell'));
    washTrough.position.set(-2.4, 1.2, 0);
    washTrough.renderOrder = 16;
    const troughRim = new THREE.Mesh(new THREE.BoxGeometry(2.46, 0.08, 2.26), this.mat.get('stainlessSteel'));
    troughRim.position.set(-2.4, 1.9, 0);
    group.add(washTrough, troughRim);

    // Rotating perforated wash drum
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const washDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.8, 24), drumMat);
    washDrum.rotation.z = Math.PI / 2;
    washDrum.position.set(-2.4, 1.7, 0);
    group.add(washDrum);

    // Wash water spray header nozzles above drum
    const sprayBar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 12), this.mat.get('stainlessSteel'));
    sprayBar.rotation.z = Math.PI / 2;
    sprayBar.position.set(-2.4, 2.6, 0);
    group.add(sprayBar);

    // Doctor scraper blade discharging wet lignin cake
    const scraper = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 1.8), this.mat.get('darkIndustrialSteel'));
    scraper.position.set(-1.6, 1.6, 0);
    scraper.rotation.z = 0.5;
    group.add(scraper);

    // DISTINCT UNIT 8B: Rotary Convective Dryer with Hot Air Heating & Lifter Flights (Center: x = 0.6) — Transparent Drum
    const dryerFrame = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.3, 1.8), this.mat.get('darkIndustrialSteel'));
    dryerFrame.position.set(0.6, 0.8, 0);
    group.add(dryerFrame);

    const dryerDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 2.6, 24), this.mat.get('transparentMachineShell'));
    dryerDrum.rotation.z = Math.PI / 2 - 0.08; // slightly inclined
    dryerDrum.position.set(0.6, 1.9, 0);
    dryerDrum.renderOrder = 16;
    group.add(dryerDrum);

    // Stainless steel riding rings / tires on dryer drum
    for (let dx of [-0.8, 0.8]) {
      const tireRing = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.04, 8, 24), this.mat.get('stainlessSteel'));
      tireRing.rotation.y = Math.PI / 2;
      tireRing.position.set(0.6 + dx, 1.9 - dx * 0.08, 0);
      group.add(tireRing);
    }

    // Internal lifting flights tumbling dark lignin cake inside transparent dryer
    const internalFlightsGroup = new THREE.Group();
    internalFlightsGroup.position.copy(dryerDrum.position);
    internalFlightsGroup.rotation.copy(dryerDrum.rotation);
    for (let a = 0; a < 6; a++) {
      const flight = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.18, 2.2),
        this.mat.get('stainlessSteel')
      );
      flight.rotation.z = (a * Math.PI) / 3;
      flight.position.set(Math.cos(flight.rotation.z) * 0.62, Math.sin(flight.rotation.z) * 0.62, 0);
      internalFlightsGroup.add(flight);
    }
    // Tumbling dark lignin granules inside dryer
    for (let k = 0; k < 10; k++) {
      const tumbleCake = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.08, 0),
        this.mat.get('ligninBrown')
      );
      tumbleCake.position.set((Math.random() - 0.5) * 0.4, -0.4 + Math.random() * 0.3, (Math.random() - 0.5) * 1.8);
      internalFlightsGroup.add(tumbleCake);
    }
    group.add(internalFlightsGroup);

    // Moisture Vapour Exhaust Duct & Cyclone
    const exhaustDuct = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.6, 16), this.mat.get('stainlessSteel'));
    exhaustDuct.position.set(1.6, 3.2, 0);
    group.add(exhaustDuct);

    // DISTINCT UNIT 8C: Biosorbent Hammer Mill Pulverizer & Storage Hopper (Right: x = 3.2) — Transparent Mill Casing
    const millHousing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 1.6), this.mat.get('transparentMachineShell'));
    millHousing.position.set(3.2, 1.6, 0);
    millHousing.renderOrder = 16;
    const millFrame = this.ind.createStructuralFrame(1.65, 1.85, 1.65);
    millFrame.position.set(3.2, 0.7, 0);
    group.add(millHousing, millFrame);

    // Internal rotating pulverizer rotor shaft with hammers
    const hammerRotor = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.1, 12), this.mat.get('stainlessSteel'));
    hammerRotor.rotation.x = Math.PI / 2;
    hammerRotor.position.set(3.2, 1.6, 0);
    group.add(hammerRotor);

    // Final Biosorbent Collection Storage Hopper (Transparent Glass Hopper)
    const hopper = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.25, 1.2, 16), this.mat.get('transparentMachineShell'));
    hopper.position.set(3.2, 3.2, 0);
    hopper.renderOrder = 16;
    const hopperRim = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.03, 8, 24), this.mat.get('stainlessSteel'));
    hopperRim.rotation.x = Math.PI / 2;
    hopperRim.position.set(3.2, 3.8, 0);
    group.add(hopper, hopperRim);

    // Calibrated Porous Biosorbent Granules falling into hopper (Black/Dark Brown)
    const granules = [];
    const granGroup = new THREE.Group();
    granGroup.position.set(3.2, 2.4, 0);
    for (let i = 0; i < 20; i++) {
      const g = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.05, 0),
        new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 })
      );
      g.position.set((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.4);
      granGroup.add(g);
      granules.push({ mesh: g, speed: 1.4 + Math.random() });
    }
    group.add(granGroup);

    // Internal Technical Labels
    const lblWasher = this.ind.createTechnicalLabel('ROTARY DRUM WASHER', '#94a3b8', 'Salt Removal & Spent Acid Wash Drain');
    lblWasher.position.set(-2.4, 3.4, 0);
    lblWasher.scale.set(0, 0, 0);
    const lblDryer = this.ind.createTechnicalLabel('ROTARY DRYER', '#f59e0b', 'Thermal Moisture Removal (105°C)');
    lblDryer.position.set(0.6, 3.6, 0);
    lblDryer.scale.set(0, 0, 0);
    const lblMill = this.ind.createTechnicalLabel('HAMMER MILL PULVERIZER', '#78350f', 'Calibrated Porous Biosorbent Granules');
    lblMill.position.set(3.2, 4.4, 0);
    lblMill.scale.set(0, 0, 0);

    group.add(lblWasher, lblDryer, lblMill);
    internalLabels.push(lblWasher, lblDryer, lblMill);

    // 3D Banner
    const label = this.createMachineLabel('8. WASHING, DRYING & BIOSORBENT PREP', '#78350f');
    label.position.set(0, 8.4, 0);
    group.add(label);

    // Animation update
    this.animatedComponents.push({
      update: (delta) => {
        const isActive = this.processController ? this.processController.isMachineActive('machine-8') : true;
        if (!isActive) return;

        washDrum.rotation.x += delta * 1.5;
        dryerDrum.rotation.y += delta * 2.2;
        hammerRotor.rotation.y += delta * 12.0;

        for (let g of granules) {
          g.mesh.position.y -= g.speed * delta;
          if (g.mesh.position.y < -0.3) g.mesh.position.y = 0.3;
        }
      }
    });

    const registered = this.registerMachine(
      group,
      'machine-8',
      'Washing, Drying & Biosorbent Preparation',
      'CALCULATED ESTIMATE',
      8,
      new THREE.Vector3(15, 2.5, -11),
      new THREE.Vector3(15, 5.5, -2.5),
      'Multi-stage preparation train: rotary vacuum drum washing to remove sodium sulfate salts, convective thermal drying (105°C) to isolate dry lignin, and mechanical milling into calibrated porous biosorbent granules.',
      new THREE.Vector3(17.5, 3.2, -7.5)
    );

    registered.userData.cutaways = cutaways;
    registered.userData.explodedParts = explodedParts;
    registered.userData.internalLabels = internalLabels;
    return registered;
  }

  // =========================================================================
  // MACHINE 9: WASTEWATER ADSORPTION COLUMN (PATHWAY B)
  // =========================================================================
  createMachine9() {
    const group = new THREE.Group();
    group.position.set(28, 0, -11);

    const cutaways = [];
    const explodedParts = [];
    const internalLabels = [];

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 6), this.mat.get('darkIndustrialSteel'));
    base.position.y = 0.25;
    const hazardStripe = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.2, 6.2), this.mat.get('equipmentBaseStripe'));
    hazardStripe.position.y = 0.1;
    group.add(base, hazardStripe);

    const colR = 0.85;
    const colH = 6.2;
    const colY = 4.2;

    // Structural skid framing around column
    const frame = this.ind.createStructuralFrame(2.4, 7.2, 2.4);
    frame.position.set(0, 0, 0);
    group.add(frame);

    // Transparent Glass Contactor Column Cylinder
    const glassColumn = new THREE.Mesh(
      new THREE.CylinderGeometry(colR, colR, colH, 32),
      this.mat.get('reactorGlass')
    );
    glassColumn.position.y = colY;
    group.add(glassColumn);

    // Top and Bottom Dished End Flanges
    const topCap = new THREE.Mesh(new THREE.CylinderGeometry(colR * 1.3, colR, 0.35, 24), this.mat.get('stainlessSteel'));
    topCap.position.y = colY + colH * 0.5 + 0.17;
    const bottomCap = new THREE.Mesh(new THREE.CylinderGeometry(colR, colR * 1.3, 0.35, 24), this.mat.get('stainlessSteel'));
    bottomCap.position.y = colY - colH * 0.5 - 0.17;
    group.add(topCap, bottomCap);

    // INTERNAL MECHANISM: Fixed Biosorbent Bed, Dye Marker Stream Adsorption
    const internalGroup = new THREE.Group();

    // Top Retaining Screen & Bottom Support Screen
    const screenGeo = new THREE.CylinderGeometry(colR * 0.95, colR * 0.95, 0.05, 24);
    const screenMat = this.mat.get('stainlessSteel');
    const topScreen = new THREE.Mesh(screenGeo, screenMat);
    topScreen.position.y = colY + 1.2;
    const bottomScreen = new THREE.Mesh(screenGeo, screenMat);
    bottomScreen.position.y = colY - 2.0;
    internalGroup.add(topScreen, bottomScreen);

    // Packed Biosorbent Bed (Porous Black/Brown Granules Layer)
    const bedHeight = 3.2;
    const bedMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(colR * 0.94, colR * 0.94, bedHeight, 24),
      new THREE.MeshStandardMaterial({
        color: 0x1c1917,
        roughness: 0.95,
        transparent: true,
        opacity: 0.92
      })
    );
    bedMesh.position.y = colY - 0.4;
    internalGroup.add(bedMesh);

    // Blue/Purple Dye Contaminant Markers trickling downward from top inlet
    const dyeMarkers = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      const d = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xd946ef }) // Methylene blue / textile dye
      );
      const rad = Math.random() * (colR * 0.7);
      const angle = Math.random() * Math.PI * 2;
      const py = colY + 1.2 + Math.random() * 1.6;
      d.position.set(Math.cos(angle) * rad, py, Math.sin(angle) * rad);
      internalGroup.add(d);
      dyeMarkers.push({
        mesh: d,
        angle,
        rad,
        speed: 1.2 + Math.random() * 0.8
      });
    }

    // Visually Clear / Treated Water Stream emerging at bottom into treated water tank (Transparent Inspection Vessel)
    const treatedWaterShell = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 1.85, 24), this.mat.get('transparentMachineShell'));
    treatedWaterShell.position.set(2.2, 1.4, 0);
    treatedWaterShell.renderOrder = 16;
    const treatedWaterTank = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 1.7, 24), this.mat.get('treatedWaterBlue'));
    treatedWaterTank.position.set(2.2, 1.35, 0);
    group.add(treatedWaterShell, treatedWaterTank);

    group.add(internalGroup);

    // Internal Technical Labels
    const lblInlet = this.ind.createTechnicalLabel('WASTEWATER INLET', '#d946ef', 'Methylene Blue Textile Dye (C0 = 120 mg/L)');
    lblInlet.position.set(0, colY + colH * 0.5 + 1.4, 0);
    lblInlet.scale.set(0, 0, 0);
    const lblBed = this.ind.createTechnicalLabel('BIOSORBENT BED', '#1c1917', 'Lignin Fixed-Bed Contactor (Porous Matrix)');
    lblBed.position.set(0, colY + 0.4, 0);
    lblBed.scale.set(0, 0, 0);
    const lblOutlet = this.ind.createTechnicalLabel('TREATED-WATER OUTLET', '#38bdf8', 'TREATED WATER — MODELLED PROCESS OUTPUT');
    lblOutlet.position.set(2.2, 2.8, 0);
    lblOutlet.scale.set(0, 0, 0);

    group.add(lblInlet, lblBed, lblOutlet);
    internalLabels.push(lblInlet, lblBed, lblOutlet);

    // 3D Banner
    const label = this.createMachineLabel('9. WASTEWATER ADSORPTION COLUMN', '#d946ef');
    label.position.set(0, 11.2, 0);
    group.add(label);

    // Animation update
    this.animatedComponents.push({
      update: (delta) => {
        const isActive = this.processController ? this.processController.isMachineActive('machine-9') : true;
        if (!isActive) return;

        // Animate dye markers moving down and capturing on the bed
        for (let dm of dyeMarkers) {
          dm.mesh.position.y -= dm.speed * delta;
          // As markers enter the bed, they attenuate/fade to represent adsorption
          if (dm.mesh.position.y < colY + 0.8 && dm.mesh.position.y > colY - 0.4) {
            dm.mesh.scale.set(0.6, 0.6, 0.6);
          } else if (dm.mesh.position.y <= colY - 0.4) {
            // Captured
            dm.mesh.position.y = colY + 2.6;
            dm.mesh.scale.set(1.0, 1.0, 1.0);
          }
        }
      }
    });

    const registered = this.registerMachine(
      group,
      'machine-9',
      'Wastewater Dye Adsorption Column',
      'CALCULATED ESTIMATE',
      9,
      new THREE.Vector3(28, 4.0, -11),
      new THREE.Vector3(28, 6.8, -2.5),
      'Fixed-bed contactor removing textile dyes (Methylene Blue) onto porous lignin biosorbent. Modelled output: TREATED WATER — MODELLED PROCESS OUTPUT. Critical notice: "Visually clear water is NOT guaranteed safe drinking water without analytical assay."',
      new THREE.Vector3(30.5, 4.2, -7.5)
    );

    registered.userData.cutaways = cutaways;
    registered.userData.explodedParts = explodedParts;
    registered.userData.internalLabels = internalLabels;
    return registered;
  }

  // =========================================================================
  // MACHINE C: HEMICELLULOSE SUGAR RECOVERY UNIT (PATHWAY C — PROPOSED)
  // =========================================================================
  createMachineC() {
    const group = new THREE.Group();
    group.position.set(14, 0, 0);

    const cutaways = [];
    const explodedParts = [];
    const internalLabels = [];

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(7, 0.5, 5.5), this.mat.get('darkIndustrialSteel'));
    base.position.y = 0.25;
    const hazardStripe = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.2, 5.7), this.mat.get('equipmentBaseStripe'));
    hazardStripe.position.y = 0.1;
    group.add(base, hazardStripe);

    // 1. Stream C Buffer Storage Tank (Transparent Borosilicate Tank)
    const tankR = 1.3;
    const tankH = 3.2;
    const tankY = 2.4;
    const bufferTank = new THREE.Mesh(new THREE.CylinderGeometry(tankR, tankR, tankH, 24), this.mat.get('transparentMachineShell'));
    bufferTank.position.set(-1.8, tankY, 0);
    bufferTank.renderOrder = 16;
    const tankTopCap = new THREE.Mesh(new THREE.SphereGeometry(tankR, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.35), this.mat.get('stainlessSteel'));
    tankTopCap.position.set(-1.8, tankY + tankH * 0.5, 0);
    // Internal violet liquid level
    const tankLiquid = new THREE.Mesh(new THREE.CylinderGeometry(tankR * 0.95, tankR * 0.95, tankH * 0.65, 24), this.mat.get('hemicelluloseViolet'));
    tankLiquid.position.set(-1.8, tankY - tankH * 0.15, 0);
    group.add(bufferTank, tankTopCap, tankLiquid);

    const tankSight = this.ind.createSightGlass(1.8, 0.1, 0x9333ea);
    tankSight.position.set(-1.8, tankY, 1.35);
    group.add(tankSight);

    // 2. Proposed Pentose Sugar Catalytic Recovery Reactor (Transparent Reactor Vessel)
    const reactorBody = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.2, 24), this.mat.get('transparentMachineShell'));
    reactorBody.position.set(1.6, tankY, 0);
    reactorBody.renderOrder = 16;
    const reactorCap = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.35), this.mat.get('stainlessSteel'));
    reactorCap.position.set(1.6, tankY + 1.6, 0);

    // Internal spiral catalytic coil bundle inside reactor
    const coilCurve = new THREE.CatmullRomCurve3(
      Array.from({ length: 28 }, (_, i) => {
        const t = (i / 27) * Math.PI * 6;
        return new THREE.Vector3(Math.cos(t) * 0.65, (i / 27) * 2.2 - 1.1, Math.sin(t) * 0.65);
      })
    );
    const coilMesh = new THREE.Mesh(new THREE.TubeGeometry(coilCurve, 64, 0.04, 8, false), this.mat.get('stainlessSteel'));
    coilMesh.position.set(1.6, tankY, 0);
    group.add(reactorBody, reactorCap, coilMesh);

    // Swirling arabinoxylan pentose syrup inside reactor
    const syrupMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2.4, 16), this.mat.get('hemicelluloseSyrup'));
    syrupMesh.position.set(1.6, tankY, 0);
    group.add(syrupMesh);

    // Prominent Status Signboard
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 0.08), this.mat.get('machineryHousingNavy'));
    signBoard.position.set(0, 4.4, 1.4);
    const signFace = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 0.9), new THREE.MeshBasicMaterial({ color: 0x7c3aed }));
    signFace.position.set(0, 4.4, 1.45);
    group.add(signBoard, signFace);

    // Internal Technical Labels
    const lblTank = this.ind.createTechnicalLabel('STREAM C BUFFER TANK', '#9333ea', 'Receives Arabinoxylan-Rich Liquid');
    lblTank.position.set(-1.8, 4.6, 0);
    lblTank.scale.set(0, 0, 0);
    const lblProposed = this.ind.createTechnicalLabel('PROPOSED PENTOSE RECOVERY', '#a855f7', 'PROPOSED HEMICELLULOSE SUGAR RECOVERY — NOT EXPERIMENTALLY VALIDATED');
    lblProposed.position.set(1.6, 4.8, 0);
    lblProposed.scale.set(0, 0, 0);

    group.add(lblTank, lblProposed);
    internalLabels.push(lblTank, lblProposed);

    // 3D Banner
    const label = this.createMachineLabel('C. HEMICELLULOSE SUGAR RECOVERY (PROPOSED)', '#a855f7');
    label.position.set(0, 8.6, 0);
    group.add(label);

    // Animation update
    this.animatedComponents.push({
      update: (delta) => {
        const isActive = this.processController ? this.processController.isMachineActive('machine-c') : true;
        if (!isActive) return;
        syrupMesh.rotation.y += delta * 2.0;
      }
    });

    const registered = this.registerMachine(
      group,
      'machine-c',
      'Hemicellulose Sugar Recovery Unit (Proposed)',
      'PROPOSED (UNVALIDATED)',
      10,
      new THREE.Vector3(14, 2.5, 0),
      new THREE.Vector3(14, 5.0, 8.5),
      'Separately routed Stream C carrying solubilized arabinoxylan oligomers. Investigates post-hydrolysis recovery into monomeric pentose sugars (D-xylose, L-arabinose). Explicitly designated: PROPOSED HEMICELLULOSE SUGAR RECOVERY — NOT EXPERIMENTALLY VALIDATED.',
      new THREE.Vector3(16.5, 3.2, 4.5)
    );

    registered.userData.cutaways = cutaways;
    registered.userData.explodedParts = explodedParts;
    registered.userData.internalLabels = internalLabels;
    return registered;
  }

  // =========================================================================
  // MACHINE 10: RESIDUAL-STREAM MANAGEMENT & DRY-FEEDSTOCK MASS LEDGER
  // =========================================================================
  createMachine10() {
    const group = new THREE.Group();
    group.position.set(40, 0, 0);

    const cutaways = [];
    const explodedParts = [];
    const internalLabels = [];

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.5, 10.5), this.mat.get('darkIndustrialSteel'));
    base.position.y = 0.25;
    const hazardStripe = new THREE.Mesh(new THREE.BoxGeometry(8.7, 0.2, 10.7), this.mat.get('equipmentBaseStripe'));
    hazardStripe.position.y = 0.1;
    group.add(base, hazardStripe);

    // 1. Biomethane Anaerobic Digester (Transparent Vessel with Internal 3-Phase Separator)
    const digester = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.75),
      this.mat.get('transparentMachineShell')
    );
    digester.position.set(-1.8, 2.2, -2.5);
    digester.renderOrder = 16;
    const digesterBase = new THREE.Mesh(new THREE.CylinderGeometry(2.22, 2.22, 0.2, 32), this.mat.get('stainlessSteel'));
    digesterBase.position.set(-1.8, 0.6, -2.5);

    // Internal dark vinasse anaerobic sludge bed
    const digesterSludge = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 1.9, 1.6, 24),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 })
    );
    digesterSludge.position.set(-1.8, 1.3, -2.5);

    // Internal 3-phase gas-liquid-solid conical separator hood
    const sepCone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.1, 24, 1, true), this.mat.get('stainlessSteel'));
    sepCone.position.set(-1.8, 2.5, -2.5);

    // Biogas top collector dome & safety flame arrestor
    const biogasDome = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.7, 16), this.mat.get('stainlessSteel'));
    biogasDome.position.set(-1.8, 3.8, -2.5);
    group.add(digester, digesterBase, digesterSludge, sepCone, biogasDome);

    // 2. Cogeneration Solid-Fuel Boiler (Transparent Casing with Visible Furnace Glow & Water Tubes)
    const boilerFrame = this.ind.createStructuralFrame(2.9, 4.5, 2.9);
    boilerFrame.position.set(-1.8, 0.25, 2.5);
    const furnaceWindow = new THREE.Mesh(new THREE.BoxGeometry(2.8, 4.4, 2.8), this.mat.get('transparentMachineShell'));
    furnaceWindow.position.set(-1.8, 2.4, 2.5);
    furnaceWindow.renderOrder = 16;

    // Glowing internal combustion furnace fire core
    const fireCore = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.85, 1),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    fireCore.position.set(-1.8, 1.4, 2.5);

    // Vertical water-tube steam generator bundle
    const tubeBankGroup = new THREE.Group();
    for (let tx of [-0.65, 0, 0.65]) {
      for (let tz of [-0.65, 0, 0.65]) {
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.0, 12), this.mat.get('stainlessSteel'));
        tube.position.set(-1.8 + tx, 2.8, 2.5 + tz);
        tubeBankGroup.add(tube);
      }
    }

    // Upper Steam Drum Header
    const steamDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 2.4, 16), this.mat.get('stainlessSteel'));
    steamDrum.rotation.z = Math.PI / 2;
    steamDrum.position.set(-1.8, 4.2, 2.5);

    const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 3.4, 16), this.mat.get('stainlessSteel'));
    stack.position.set(-1.8, 6.2, 2.5);
    group.add(boilerFrame, furnaceWindow, fireCore, tubeBankGroup, steamDrum, stack);

    // 3. Central Drainage Sump Manifold
    const sump = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 2.2), this.mat.get('darkIndustrialSteel'));
    sump.position.set(-3.2, 0.4, 0);
    const sumpGrate = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.0), new THREE.MeshBasicMaterial({ color: 0x475569 }));
    sumpGrate.rotation.x = -Math.PI / 2;
    sumpGrate.position.set(-3.2, 0.71, 0);
    group.add(sump, sumpGrate);

    // 4. Central Non-Overlapping Feedstock Accounting Hologram Display
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.8, 4.2), this.mat.get('machineryHousingNavy'));
    pylon.position.set(2.2, 2.4, 0);
    const hologram = new THREE.Mesh(
      new THREE.PlaneGeometry(4.0, 2.6),
      new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.9 })
    );
    hologram.position.set(2.42, 2.6, 0);
    hologram.rotation.y = Math.PI / 2;
    group.add(pylon, hologram);

    // Internal Technical Labels
    const lblDigester = this.ind.createTechnicalLabel('ANAEROBIC DIGESTER', '#38bdf8', 'Vinasse to Biomethane Fuel');
    lblDigester.position.set(-1.8, 5.0, -2.5);
    lblDigester.scale.set(0, 0, 0);
    const lblBoiler = this.ind.createTechnicalLabel('COGENERATION BOILER', '#f59e0b', 'Solid Residual Steam Generation');
    lblBoiler.position.set(-1.8, 8.2, 2.5);
    lblBoiler.scale.set(0, 0, 0);
    const lblLedger = this.ind.createTechnicalLabel('DRY-FEEDSTOCK MASS LEDGER', '#0ea5e9', 'Non-Overlapping Balance Accounting');
    lblLedger.position.set(2.2, 5.2, 0);
    lblLedger.scale.set(0, 0, 0);

    group.add(lblDigester, lblBoiler, lblLedger);
    internalLabels.push(lblDigester, lblBoiler, lblLedger);

    // 3D Banner
    const label = this.createMachineLabel('10. RESIDUALS & MASS-BALANCE LEDGER', '#64748b');
    label.position.set(0, 10.0, 0);
    group.add(label);

    const registered = this.registerMachine(
      group,
      'machine-10',
      'Residual Management & Accounting Ledger',
      'CALCULATED ESTIMATE',
      11,
      new THREE.Vector3(40, 3.0, 0),
      new THREE.Vector3(40, 6.0, 9.8),
      'Integrated residual stream recovery (biogas digester and solid-fuel boiler) and centralized dry-feedstock mass ledger validating strict non-overlapping mass conservation against target: "Target — requires mass-balance validation".',
      new THREE.Vector3(42.5, 3.8, 4.5)
    );

    registered.userData.cutaways = cutaways;
    registered.userData.explodedParts = explodedParts;
    registered.userData.internalLabels = internalLabels;
    return registered;
  }

  // =========================================================================
  // BUILD COMPLETE FACILITY
  // =========================================================================
  buildFacility() {
    const facilityGroup = new THREE.Group();

    facilityGroup.add(this.createMachine1());
    facilityGroup.add(this.createMachine2());
    facilityGroup.add(this.createMachine3());
    facilityGroup.add(this.createMachine4());
    facilityGroup.add(this.createMachine5());
    facilityGroup.add(this.createMachine6());
    facilityGroup.add(this.createMachine7());
    facilityGroup.add(this.createMachine8());
    facilityGroup.add(this.createMachine9());
    facilityGroup.add(this.createMachineC());
    facilityGroup.add(this.createMachine10());

    return {
      facilityGroup,
      interactiveMachines: this.interactiveMachines,
      animatedComponents: this.animatedComponents
    };
  }
}
