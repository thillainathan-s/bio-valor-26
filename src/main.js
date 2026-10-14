import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import './style.css';
import { MaterialLibrary } from './materials.js';
import { EquipmentFactory } from './equipment.js';
import { PipelineNetwork } from './pipelineNetwork.js';
import { ProcessAnimationController } from './processController.js';
import { BiorefineryHUD } from './hud.js';
import { IndustrialAudio } from './audio.js';
import { renderSidebar } from './sidebar.js';
import { renderTopAppBar } from './topBar.js';
import { BiorefineryRouter } from './router.js';
import { appState } from './state.js';

// Dedicated Pathway Palettes for Dynamic Machine Selection & Visual Differentiation
const MACHINE_PALETTES = {
  'machine-1': { color: 0xf59e0b, hex: '#f59e0b', name: 'Feedstock Storage & Shredder' },
  'machine-2': { color: 0x06b6d4, hex: '#06b6d4', name: 'Alkaline Pretreatment Reactor' },
  'machine-3': { color: 0x14b8a6, hex: '#14b8a6', name: 'Solid-Liquid Filter Press' },
  'machine-4': { color: 0x38bdf8, hex: '#38bdf8', name: 'Enzymatic Hydrolysis Bioreactor' },
  'machine-5': { color: 0xeab308, hex: '#eab308', name: 'Yeast Fermentation Bioreactor' },
  'machine-6': { color: 0xf97316, hex: '#f97316', name: 'Ethanol Distillation Column' },
  'machine-7': { color: 0xef4444, hex: '#ef4444', name: 'Lignin Acidification Reactor' },
  'machine-8': { color: 0xd97706, hex: '#d97706', name: 'Biosorbent Dryer & Granulator' },
  'machine-9': { color: 0xd946ef, hex: '#d946ef', name: 'Wastewater Dye Adsorption Column' },
  'machine-c': { color: 0xa855f7, hex: '#a855f7', name: 'Proposed Hemicellulose Recovery Unit' },
  'machine-10': { color: 0x10b981, hex: '#10b981', name: 'Residuals Cogeneration & Digester' }
};

class BiorefineryApp {
  constructor() {
    this.canvas = document.getElementById('canvas3d');
    this.hudOverlay = document.getElementById('hud-overlay');

    this.audio = new IndustrialAudio();
    this.matLib = new MaterialLibrary();

    // Scene & Renderer
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070b14);
    this.scene.fog = new THREE.FogExp2(0x070b14, 0.012);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 300);
    // Initial facility overview position - comfortably frames all 11 units with clear headroom
    this.camera.position.set(0, 28, 68);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04; // keep above floor
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 120;
    this.controls.target.set(0, 2.5, 0);

    // Raycaster for 3D interactions
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // State
    this.interactiveMachines = [];
    this.animatedComponents = [];
    this.currentTourStage = -1;
    this.isTourRunning = false;
    this.isTourPaused = false;
    this.tourTimeline = null;
    this.selectedMachine = null;
    this.showLabels = true;
    this.clock = new THREE.Clock();

    // Setup Components
    this.setupEnvironment();
    this.setupLighting();
    this.setupSelectionRig();
    this.buildBiorefinery();
    this.setupHUD();
    this.setupEvents();

    // Collapsible Left Sidebar & Top App Bar Integration
    const sidebarContainer = document.getElementById('app-sidebar');
    if (sidebarContainer) {
      renderSidebar(sidebarContainer, this);
      appState.subscribe(() => {
        renderSidebar(sidebarContainer, this);
      });
    }

    const topBarContainer = document.getElementById('top-app-bar');
    if (topBarContainer) {
      renderTopAppBar(topBarContainer, this);
      appState.subscribe(() => {
        renderTopAppBar(topBarContainer, this);
      });
    }

    this.router = new BiorefineryRouter(this);
    this.router.init();

    // Start initial cinematic camera transition
    this.playInitialCinematicIntro();

    // Render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupEnvironment() {
    // Factory concrete floor with markings
    const floorGeo = new THREE.PlaneGeometry(160, 100);
    const floor = new THREE.Mesh(floorGeo, this.matLib.get('factoryFloor'));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Industrial roof structural truss grid
    const trussMat = this.matLib.get('darkIndustrialSteel');
    for (let x = -50; x <= 50; x += 20) {
      const column = new THREE.Mesh(new THREE.BoxGeometry(0.8, 16, 0.8), trussMat);
      column.position.set(x, 8, -25);
      const columnBack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 16, 0.8), trussMat);
      columnBack.position.set(x, 8, 25);
      const trussBeam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 50), trussMat);
      trussBeam.position.set(x, 16, 0);
      this.scene.add(column, columnBack, trussBeam);
    }
  }

  setupLighting() {
    // Ambient light - dark navy industrial tint
    this.ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    this.scene.add(this.ambientLight);

    // Main directional sunlight / key light
    this.keyLight = new THREE.DirectionalLight(0xf8fafc, 2.2);
    this.keyLight.position.set(25, 45, 30);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 10;
    this.keyLight.shadow.camera.far = 120;
    this.keyLight.shadow.camera.left = -60;
    this.keyLight.shadow.camera.right = 60;
    this.keyLight.shadow.camera.top = 35;
    this.keyLight.shadow.camera.bottom = -35;
    this.keyLight.shadow.bias = -0.0005;
    this.scene.add(this.keyLight);

    // Teal fill light on Pathway A
    this.tealFill = new THREE.DirectionalLight(0x0ea5e9, 1.4);
    this.tealFill.position.set(10, 20, 35);
    this.scene.add(this.tealFill);

    // Warm amber fill light on Pathway B
    this.amberFill = new THREE.DirectionalLight(0xf59e0b, 1.3);
    this.amberFill.position.set(10, 20, -35);
    this.scene.add(this.amberFill);

    // Machine spot accent lights
    const spots = [
      { pos: [-36, 12, 0], color: 0xf59e0b, intensity: 3.0 }, // Feedstock
      { pos: [-22, 14, 0], color: 0x0ea5e9, intensity: 3.5 }, // Pretreatment
      { pos: [-10, 12, 0], color: 0x14b8a6, intensity: 3.0 }, // Separation
      { pos: [2, 12, 11], color: 0x38bdf8, intensity: 3.0 },  // Hydrolysis
      { pos: [15, 12, 11], color: 0xf59e0b, intensity: 3.0 }, // Fermentation
      { pos: [28, 14, 11], color: 0xfbbf24, intensity: 3.5 }, // Distillation
      { pos: [2, 12, -11], color: 0x92400e, intensity: 3.0 }, // Lignin Precip
      { pos: [15, 12, -11], color: 0x78350f, intensity: 3.0 },// Biosorbent Prep
      { pos: [28, 14, -11], color: 0xd946ef, intensity: 3.5 },// Dye Column
      { pos: [14, 13, 0], color: 0xa855f7, intensity: 3.2 },  // Machine C (Proposed Sugar Recovery)
      { pos: [40, 14, 0], color: 0x64748b, intensity: 3.0 }   // Residuals & Ledger
    ];

    spots.forEach(s => {
      const spot = new THREE.SpotLight(s.color, s.intensity, 25, Math.PI / 4, 0.4, 1);
      spot.position.set(s.pos[0], s.pos[1], s.pos[2]);
      spot.target.position.set(s.pos[0], 2, s.pos[2]);
      this.scene.add(spot);
      this.scene.add(spot.target);
    });
  }

  // Dedicated 3D Interactive Selection Rig & Focus Illumination
  setupSelectionRig() {
    this.selectionGroup = new THREE.Group();
    this.selectionGroup.visible = false;

    // 1. Concentric rotating holographic floor rings
    const outerGeo = new THREE.RingGeometry(2.7, 2.9, 36);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    this.selectionOuterRing = new THREE.Mesh(outerGeo, outerMat);
    this.selectionOuterRing.rotation.x = -Math.PI / 2;

    const innerGeo = new THREE.RingGeometry(2.0, 2.18, 36);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });
    this.selectionInnerRing = new THREE.Mesh(innerGeo, innerMat);
    this.selectionInnerRing.rotation.x = -Math.PI / 2;

    // 2. Ground beacon disc with pulse glow
    const discGeo = new THREE.CircleGeometry(2.0, 32);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.selectionBeaconDisc = new THREE.Mesh(discGeo, discMat);
    this.selectionBeaconDisc.rotation.x = -Math.PI / 2;

    // 3. 4 Corner L-bracket tick marks framing equipment base
    const bracketMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2, transparent: true, opacity: 0.9 });
    this.selectionBracketMat = bracketMat;
    const bracketGroup = new THREE.Group();
    const s = 3.5;
    const pts = [
      [-s, -s], [s, -s], [s, s], [-s, s]
    ];
    for (let [bx, bz] of pts) {
      const dx = bx > 0 ? -0.55 : 0.55;
      const dz = bz > 0 ? -0.55 : 0.55;
      const bGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(bx + dx, 0.02, bz),
        new THREE.Vector3(bx, 0.02, bz),
        new THREE.Vector3(bx, 0.02, bz + dz)
      ]);
      bracketGroup.add(new THREE.Line(bGeo, bracketMat));
    }

    // 4. Vertical holographic laser scan cylinder
    const cylinderGeo = new THREE.CylinderGeometry(2.4, 2.6, 6.8, 32, 1, true);
    const cylinderMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.selectionHoloCylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
    this.selectionHoloCylinder.position.y = 3.4;

    this.selectionGroup.add(this.selectionOuterRing, this.selectionInnerRing, this.selectionBeaconDisc, bracketGroup, this.selectionHoloCylinder);
    this.scene.add(this.selectionGroup);

    // 5. Floating 3D Target Marker Beacon & Reticle (Hovers above clicked machine)
    this.selectionBeaconGroup = new THREE.Group();
    this.selectionBeaconGroup.visible = false;

    // Inverted 4-sided pyramid pointer
    const arrowGeo = new THREE.ConeGeometry(0.34, 0.72, 4);
    const arrowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    this.selectionBeaconArrow = new THREE.Mesh(arrowGeo, arrowMat);
    this.selectionBeaconArrow.rotation.x = Math.PI; // Point downwards
    this.selectionBeaconArrow.position.y = 0;

    // Orbiting target reticle ring
    const reticleGeo = new THREE.RingGeometry(0.52, 0.62, 32);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    this.selectionReticleRing = new THREE.Mesh(reticleGeo, reticleMat);
    this.selectionReticleRing.rotation.x = -Math.PI / 2;
    this.selectionReticleRing.position.y = 0.44;

    // Crosshair tick marks
    const chMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
    this.selectionCrosshairMat = chMat;
    const chGroup = new THREE.Group();
    for (let a = 0; a < 4; a++) {
      const ang = (a * Math.PI) / 2;
      const r1 = 0.65;
      const r2 = 0.90;
      const chGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(ang) * r1, 0.44, Math.sin(ang) * r1),
        new THREE.Vector3(Math.cos(ang) * r2, 0.44, Math.sin(ang) * r2)
      ]);
      chGroup.add(new THREE.Line(chGeo, chMat));
    }

    this.selectionBeaconGroup.add(this.selectionBeaconArrow, this.selectionReticleRing, chGroup);
    this.scene.add(this.selectionBeaconGroup);

    // 6. Dedicated Selection Inspection Spotlight (Overhead highlight)
    this.selectionSpotlight = new THREE.SpotLight(0x38bdf8, 0, 50, Math.PI / 4.6, 0.72, 1.2);
    this.selectionSpotlight.position.set(0, 24, 0);
    this.selectionSpotlightTarget = new THREE.Object3D();
    this.selectionSpotlight.target = this.selectionSpotlightTarget;
    this.scene.add(this.selectionSpotlight, this.selectionSpotlightTarget);

    // 7. Dedicated Core Radiance PointLight (Inside machine for internal vessel glow)
    this.selectionPointLight = new THREE.PointLight(0x38bdf8, 0, 10.0, 1.2);
    this.scene.add(this.selectionPointLight);

    // 8. Subtle Holographic 3D Outline Cage with Corner Brackets
    this.selectionCageMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      linewidth: 1.5
    });
    this.selectionCage = new THREE.Group();
    this.selectionCage.visible = false;
    this.scene.add(this.selectionCage);
  }

  // Apply visual highlight to selected machine and differentiate it from all others
  applySelectionHighlight(machineGroup) {
    if (!machineGroup) return;

    const pal = MACHINE_PALETTES[machineGroup.userData.id] || { color: 0x38bdf8, hex: '#38bdf8' };

    // Dim global facility lighting so selected machine stands out dramatically
    if (this.ambientLight) gsap.to(this.ambientLight, { intensity: 0.45, duration: 0.5 });
    if (this.keyLight) gsap.to(this.keyLight, { intensity: 1.0, duration: 0.5 });
    if (this.tealFill) gsap.to(this.tealFill, { intensity: 0.45, duration: 0.5 });
    if (this.amberFill) gsap.to(this.amberFill, { intensity: 0.45, duration: 0.5 });

    // Update dynamic pathway colors on selection holographic rig
    this.selectionOuterRing.material.color.setHex(pal.color);
    this.selectionInnerRing.material.color.setHex(pal.color);
    this.selectionBeaconDisc.material.color.setHex(pal.color);
    this.selectionHoloCylinder.material.color.setHex(pal.color);
    if (this.selectionBracketMat) this.selectionBracketMat.color.setHex(pal.color);
    if (this.selectionBeaconArrow) this.selectionBeaconArrow.material.color.setHex(pal.color);
    if (this.selectionReticleRing) this.selectionReticleRing.material.color.setHex(pal.color);
    if (this.selectionCrosshairMat) this.selectionCrosshairMat.color.setHex(pal.color);
    if (this.selectionCageMat) this.selectionCageMat.color.setHex(pal.color);

    // Rebuild subtle outline corner cage snugly framing the equipment
    while (this.selectionCage.children.length > 0) {
      const c = this.selectionCage.children[0];
      if (c.geometry) c.geometry.dispose();
      this.selectionCage.remove(c);
    }
    const bbox = new THREE.Box3().setFromObject(machineGroup);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const hx = Math.max(size.x * 0.48, 1.8);
    const hy = Math.min(size.y * 0.80, 8.2);
    const hz = Math.max(size.z * 0.48, 1.8);
    const yMin = 0.05;
    const yMax = hy;
    const cornerLen = Math.min(0.65, hx * 0.35);
    const cornerPts = [];
    for (let cx of [-hx, hx]) {
      for (let cy of [yMin, yMax]) {
        for (let cz of [-hz, hz]) {
          const sgnX = cx > 0 ? -1 : 1;
          const sgnY = cy > yMin ? -1 : 1;
          const sgnZ = cz > 0 ? -1 : 1;
          cornerPts.push(new THREE.Vector3(cx, cy, cz), new THREE.Vector3(cx + sgnX * cornerLen, cy, cz));
          cornerPts.push(new THREE.Vector3(cx, cy, cz), new THREE.Vector3(cx, cy + sgnY * cornerLen, cz));
          cornerPts.push(new THREE.Vector3(cx, cy, cz), new THREE.Vector3(cx, cy + sgnZ * cornerLen));
        }
      }
    }
    const cageGeo = new THREE.BufferGeometry().setFromPoints(cornerPts);
    const cageMesh = new THREE.LineSegments(cageGeo, this.selectionCageMat);
    this.selectionCage.add(cageMesh);
    this.selectionCage.position.set(machineGroup.position.x, 0, machineGroup.position.z);
    this.selectionCage.visible = true;

    // Move holographic selection ring to machine base
    this.selectionGroup.visible = true;
    gsap.to(this.selectionGroup.position, {
      x: machineGroup.position.x,
      y: 0.05,
      z: machineGroup.position.z,
      duration: 0.6,
      ease: 'power2.out'
    });

    // Overhead inspection spotlight bathed in machine's distinct color
    this.selectionSpotlight.color.setHex(pal.color);
    this.selectionSpotlight.position.set(machineGroup.position.x, 24, machineGroup.position.z + 5);
    this.selectionSpotlightTarget.position.copy(machineGroup.position);
    gsap.to(this.selectionSpotlight, { intensity: 5.8, duration: 0.5 });

    // Internal radiance point light making equipment vessel glow with machine's pathway hue
    this.selectionPointLight.color.setHex(pal.color);
    this.selectionPointLight.position.set(machineGroup.position.x, 3.2, machineGroup.position.z);
    gsap.to(this.selectionPointLight, { intensity: 3.2, duration: 0.5 });

    // Position floating pointer chevron beacon right above machine banner
    let bannerY = 8.5;
    machineGroup.traverse(child => {
      if (child.isSprite && child.userData && child.userData.isBanner) {
        bannerY = child.position.y;
      }
    });
    this.beaconBaseY = bannerY + 0.68;
    this.selectionBeaconGroup.position.set(machineGroup.position.x, this.beaconBaseY, machineGroup.position.z);
    this.selectionBeaconGroup.visible = true;

    // Highlight selected machine banner and dim all other machine banners
    this.interactiveMachines.forEach(m => {
      const isCurrent = (m === machineGroup);
      m.traverse(child => {
        if (child.isSprite && child.userData && child.userData.isBanner) {
          child.material.opacity = isCurrent ? 1.0 : 0.15;
          const targetScale = isCurrent
            ? child.userData.normalScale.clone().multiplyScalar(1.22)
            : child.userData.normalScale.clone().multiplyScalar(0.85);
          gsap.to(child.scale, {
            x: targetScale.x,
            y: targetScale.y,
            z: targetScale.z,
            duration: 0.35
          });
        }
      });
    });
  }

  // Clear 3D selection highlight and restore uniform overview appearance
  clearSelectionHighlight() {
    if (this.selectionCage) {
      this.selectionCage.visible = false;
    }

    if (this.selectionBeaconGroup) {
      this.selectionBeaconGroup.visible = false;
    }

    // Restore full facility global lighting
    if (this.ambientLight) gsap.to(this.ambientLight, { intensity: 1.2, duration: 0.5 });
    if (this.keyLight) gsap.to(this.keyLight, { intensity: 2.2, duration: 0.5 });
    if (this.tealFill) gsap.to(this.tealFill, { intensity: 1.4, duration: 0.5 });
    if (this.amberFill) gsap.to(this.amberFill, { intensity: 1.3, duration: 0.5 });

    if (this.selectionSpotlight) {
      gsap.to(this.selectionSpotlight, {
        intensity: 0,
        duration: 0.4
      });
    }

    if (this.selectionPointLight) {
      gsap.to(this.selectionPointLight, {
        intensity: 0,
        duration: 0.4,
        onComplete: () => {
          if (this.selectionGroup) this.selectionGroup.visible = false;
        }
      });
    }

    this.interactiveMachines.forEach(m => {
      m.traverse(child => {
        if (child.isSprite && child.userData && child.userData.isBanner) {
          child.material.opacity = 0.95;
          gsap.to(child.scale, {
            x: child.userData.normalScale.x,
            y: child.userData.normalScale.y,
            z: child.userData.normalScale.z,
            duration: 0.35
          });
        }
      });
    });
  }

  buildBiorefinery() {
    // 1. Build Machines
    this.equipmentFactory = new EquipmentFactory(this.matLib);
    const { facilityGroup, interactiveMachines, animatedComponents } = this.equipmentFactory.buildFacility();
    this.scene.add(facilityGroup);
    this.interactiveMachines = interactiveMachines;
    this.animatedComponents = animatedComponents;

    // 2. Build Pipeline & Particle Flow Network
    this.pipelineNetwork = new PipelineNetwork(this.matLib);
    const pipelineGroup = this.pipelineNetwork.buildNetwork();
    this.scene.add(pipelineGroup);

    // 3. Central Process Animation Controller
    this.processController = new ProcessAnimationController(
      this.interactiveMachines,
      this.pipelineNetwork,
      null,
      this.audio
    );
    this.equipmentFactory.setProcessController(this.processController);
  }

  setupHUD() {
    this.hud = new BiorefineryHUD(
      this.hudOverlay,
      (machineId) => this.focusMachineById(machineId),
      (action) => this.handleCameraControl(action),
      (config) => {},
      this.audio,
      (viewMode) => this.handleViewModeChange(viewMode),
      (labelsVisible) => this.setLabelsVisible(labelsVisible)
    );
    this.processController.hud = this.hud;
  }

  setupEvents() {
    this.onWindowResize = () => {
      const view3d = document.getElementById('view-3d');
      const mainArea = document.getElementById('main-area');
      const topBar = document.getElementById('top-app-bar');
      const topH = topBar ? topBar.offsetHeight : 54;
      const w = (view3d && view3d.clientWidth > 0)
        ? view3d.clientWidth
        : (mainArea && mainArea.clientWidth > 0 ? mainArea.clientWidth : window.innerWidth - (appState.getState().sidebarCollapsed ? 68 : 260));
      const h = (view3d && view3d.clientHeight > 0)
        ? view3d.clientHeight
        : Math.max(300, (mainArea && mainArea.clientHeight > 0 ? mainArea.clientHeight - topH : window.innerHeight - topH));
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    window.addEventListener('resize', this.onWindowResize);

    // Mouse click raycasting on 3D objects
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      for (let hit of intersects) {
        let cur = hit.object;
        while (cur && cur !== this.scene) {
          if (cur.userData && cur.userData.isMachine) {
            this.audio.playClick();
            this.stopTour();
            this.focusMachine(cur);
            return;
          }
          cur = cur.parent;
        }
      }
    });

    // Mouse move for hover cursor pointer
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      let found = false;
      for (let hit of intersects) {
        let cur = hit.object;
        while (cur && cur !== this.scene) {
          if (cur.userData && cur.userData.isMachine) {
            found = true;
            break;
          }
          cur = cur.parent;
        }
        if (found) break;
      }
      this.canvas.style.cursor = found ? 'pointer' : 'default';
    });

    // User interrupts tour when manually dragging orbit controls
    this.controls.addEventListener('start', () => {
      if (this.isTourRunning) {
        this.stopTour();
      }
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.handleCameraControl('toggle_pause');
      } else if (e.key === 'r' || e.key === 'R') {
        this.handleCameraControl('restart');
      } else if (e.key === 'o' || e.key === 'O' || e.key === 'h' || e.key === 'H') {
        this.handleCameraControl('overview');
      } else if (e.key === 'e' || e.key === 'E') {
        this.hud.setViewMode('exterior');
      } else if (e.key === 'i' || e.key === 'I') {
        this.hud.setViewMode('interior');
      } else if (e.key === 'x' || e.key === 'X') {
        this.hud.setViewMode('exploded');
      } else if (e.key === 'c' || e.key === 'C') {
        this.focusMachineById('machine-c');
      } else if (e.key === 'm' || e.key === 'M') {
        this.hud.toggleMassBalancePanel();
      } else if (e.key === 'l' || e.key === 'L') {
        this.toggleLabels();
      } else if (e.key >= '1' && e.key <= '9') {
        const id = `machine-${e.key}`;
        this.focusMachineById(id);
      } else if (e.key === '0') {
        this.focusMachineById('machine-10');
      }
    });
  }

  // Handle switching between Exterior, Internal Inspection, and Exploded view modes
  handleViewModeChange(mode) {
    if (!this.selectedMachine) return;
    this.audio.playWhoosh();

    if (this.selectedMachine.userData.setViewMode) {
      this.selectedMachine.userData.setViewMode(mode);
    }

    const targetLook = this.selectedMachine.userData.cameraTarget;
    let targetPos = this.selectedMachine.userData.cameraPosition;

    if (mode === 'interior') {
      targetPos = this.selectedMachine.userData.internalCameraPosition || targetPos;
      this.processController.setInspectedMachine(this.selectedMachine.userData.id);
    } else if (mode === 'exploded') {
      // Pull camera back slightly to fit displaced exploded subassemblies
      targetPos = new THREE.Vector3(
        targetLook.x + (targetPos.x - targetLook.x) * 1.35,
        targetPos.y + 1.6,
        targetLook.z + (targetPos.z - targetLook.z) * 1.35
      );
      this.processController.setInspectedMachine(this.selectedMachine.userData.id);
    } else {
      // Exterior view
      this.processController.setInspectedMachine(this.selectedMachine.userData.id);
    }

    gsap.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.4,
      ease: 'power2.inOut',
      onUpdate: () => this.controls.update()
    });

    gsap.to(this.controls.target, {
      x: targetLook.x,
      y: targetLook.y,
      z: targetLook.z,
      duration: 1.4,
      ease: 'power2.inOut'
    });
  }

  // Initial Cinematic Camera Sequence on Application Launch
  playInitialCinematicIntro() {
    this.hud.setNarration(
      'FACILITY INITIALIZATION',
      'CIRCUIT-BAGASSE+ — Integrated Valorization of Sugarcane Bagasse into Bioethanol, Lignin Biosorbent, and Proposed Hemicellulose Sugar Recovery.'
    );

    gsap.timeline()
      .to(this.camera.position, {
        x: -28,
        y: 14,
        z: 32,
        duration: 4.5,
        ease: 'power2.inOut',
        onUpdate: () => this.controls.update()
      })
      .to(this.controls.target, {
        x: -15,
        y: 2.5,
        z: 0,
        duration: 4.5,
        ease: 'power2.inOut'
      }, '<')
      .to(this.camera.position, {
        x: 0,
        y: 28,
        z: 68,
        duration: 3.5,
        ease: 'power2.out',
        onUpdate: () => this.controls.update()
      })
      .to(this.controls.target, {
        x: 0,
        y: 2.0,
        z: 0,
        duration: 3.5,
        ease: 'power2.out'
      }, '<')
      .call(() => {
        this.hud.setNarration(
          'EXPLORATION READY',
          'Explore freely with orbit/zoom/pan, click any unit to inspect internal mechanisms, or click PLAY COMPLETE PROCESS for the guided sequence.'
        );
      });
  }

  // Handle camera and tour playback controls
  handleCameraControl(action) {
    switch (action) {
      case 'overview':
        this.stopTour();
        if (this.selectedMachine && this.selectedMachine.userData.setViewMode) {
          this.selectedMachine.userData.setViewMode('exterior');
        }
        this.selectedMachine = null;
        this.clearSelectionHighlight();
        this.processController.clearInspectedMachine();
        this.hud.closeInspector();
        this.audio.playWhoosh();
        gsap.to(this.camera.position, {
          x: 0,
          y: 28,
          z: 68,
          duration: 1.8,
          ease: 'power2.inOut',
          onUpdate: () => this.controls.update()
        });
        gsap.to(this.controls.target, {
          x: 0,
          y: 2.0,
          z: 0,
          duration: 1.8,
          ease: 'power2.inOut'
        });
        this.hud.setNarration('FULL FACILITY OVERVIEW', 'Panoramic view of the integrated sugarcane bagasse biorefinery.');
        break;

      case 'close_inspector':
        if (this.selectedMachine && this.selectedMachine.userData.setViewMode) {
          this.selectedMachine.userData.setViewMode('exterior');
        }
        this.selectedMachine = null;
        this.clearSelectionHighlight();
        this.processController.clearInspectedMachine();
        break;

      case 'play_complete':
        if (this.isTourRunning) {
          this.stopTour();
        } else {
          this.startCompleteTour(0);
        }
        break;

      case 'toggle_pause':
        if (!this.isTourRunning) {
          this.startCompleteTour(0);
          return;
        }
        if (this.isTourPaused) {
          this.resumeTour();
        } else {
          this.pauseTour();
        }
        break;

      case 'restart':
        this.stopTour();
        this.startCompleteTour(0);
        break;
    }
  }

  // Guided cinematic sequence across all equipment
  startCompleteTour(startIndex = 0) {
    this.isTourRunning = true;
    this.isTourPaused = false;
    this.currentTourStage = startIndex;
    this.hud.setPlaybackState(true, false);
    this.processController.startSequentialTour(startIndex);

    const tourStages = [
      {
        machineId: 'machine-1',
        tag: 'STAGE 1: FEEDSTOCK PREPARATION',
        narration: 'Sugarcane bagasse arrives at the storage bay, is sized in shredders, and weighed. Baseline 100 kg dry composition: 42.5 kg Cellulose, 25.8 kg Hemicellulose, 22.1 kg Lignin, 9.6 kg Remainder.'
      },
      {
        machineId: 'machine-2',
        tag: 'STAGE 2: ALKALINE PRETREATMENT',
        narration: 'NaOH thermochemical reactor disrupts biomass recalcitrance, solubilizing 61% of lignin into black liquor while preserving cellulose microfibrils in the solid fraction.'
      },
      {
        machineId: 'machine-3',
        tag: 'STAGE 3: SOLID-LIQUID FRACTIONATION (3-STREAM SPLIT)',
        narration: 'High-pressure filter press fractionates pretreated biomass into Stream A (cellulose cake, Teal), Stream B (alkaline black liquor, Brown), and Stream C (hemicellulose-rich liquid, Violet). Residual wash drains to central sump.'
      },
      {
        machineId: 'machine-4',
        tag: 'STAGE 4: ENZYMATIC HYDROLYSIS (PATHWAY A)',
        narration: 'Cellulase cocktail cleaves cellulose polymer chains into fermentable D-glucose syrup. Incorporates hydration stoichiometry factor (180/162).'
      },
      {
        machineId: 'machine-5',
        tag: 'STAGE 5: YEAST FERMENTATION (PATHWAY A)',
        narration: 'Anaerobic Saccharomyces cerevisiae fermenter converts glucose into dilute bioethanol broth and biogenic CO2 off-gas via Gay-Lussac reaction (0.5111 theoretical yield).'
      },
      {
        machineId: 'machine-6',
        tag: 'STAGE 6: ETHANOL DISTILLATION (PATHWAY A)',
        narration: 'Fractionating column concentrates ethanol to hydrous azeotrope (~93-95% ABV). Note: Fuel-grade anhydrous ethanol requires molecular sieves.'
      },
      {
        machineId: 'machine-7',
        tag: 'STAGE 7: LIGNIN ACIDIFICATION (PATHWAY B)',
        narration: 'Controlled H2SO4 injection drops pH to 2.0, causing acid-insoluble lignin to flocculate and precipitate from black liquor, recovered on a rotary vacuum drum.'
      },
      {
        machineId: 'machine-8',
        tag: 'STAGE 8: BIOSORBENT PREPARATION (PATHWAY B)',
        narration: 'Thermal drying at 105°C and calibrated mechanical screening produce high-surface-area porous lignin biosorbent granules.'
      },
      {
        machineId: 'machine-9',
        tag: 'STAGE 9: WASTEWATER DYE ADSORPTION (PATHWAY B)',
        narration: 'Fixed-bed contactor removes textile dye (Methylene Blue). CRITICAL PRINCIPLE: "Visually clear water is NOT guaranteed safe drinking water without analytical assay."'
      },
      {
        machineId: 'machine-c',
        tag: 'STAGE 10: HEMICELLULOSE SUGAR RECOVERY (PATHWAY C — PROPOSED)',
        narration: 'Separately routed Stream C investigates post-hydrolysis recovery into monomeric pentose sugars (D-xylose, L-arabinose) and furfural co-products. Explicitly designated: PROPOSED — NOT EXPERIMENTALLY VALIDATED.'
      },
      {
        machineId: 'machine-10',
        tag: 'STAGE 11: RESIDUALS & DRY-FEEDSTOCK MASS BALANCES',
        narration: 'Unhydrolyzed cellulose/lignin solids and vinasse are collected for solid fuel and biomethane. Strict non-overlapping ledger accounts for all fractions. 70% Target labelled: "Target — requires mass-balance validation".'
      }
    ];

    const playStage = (index) => {
      if (!this.isTourRunning) return;
      if (index >= tourStages.length) {
        this.stopTour();
        this.handleCameraControl('overview');
        this.hud.setNarration('TOUR COMPLETE', 'The full CIRCUIT-BAGASSE+ process sequence has completed.');
        return;
      }

      this.currentTourStage = index;
      const stage = tourStages[index];
      const machine = this.interactiveMachines.find(m => m.userData.id === stage.machineId);

      if (machine) {
        // Update previous machine if any to exterior
        if (this.selectedMachine && this.selectedMachine !== machine && this.selectedMachine.userData.setViewMode) {
          this.selectedMachine.userData.setViewMode('exterior');
        }
        this.selectedMachine = machine;
        this.applySelectionHighlight(machine);

        // Activate sequential stage in process controller
        this.processController.activateTourStage(index);

        // Switch inspected machine to interior cutaway view
        if (machine.userData.setViewMode) {
          machine.userData.setViewMode('interior');
        }

        this.hud.showMachineInspector(stage.machineId);
        this.hud.setNarration(stage.tag, stage.narration);
        this.audio.playWhoosh();

        const targetPos = this.calculateComfortableCameraPos(machine);

        this.tourTimeline = gsap.timeline({
          onComplete: () => {
            // Dwell on machine for 4.5 seconds to allow reading
            this.tourTimeline = gsap.delayedCall(4.5, () => {
              playStage(index + 1);
            });
          }
        });

        this.tourTimeline
          .to(this.camera.position, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: 2.2,
            ease: 'power2.inOut',
            onUpdate: () => this.controls.update()
          })
          .to(this.controls.target, {
            x: machine.userData.cameraTarget.x,
            y: machine.userData.cameraTarget.y,
            z: machine.userData.cameraTarget.z,
            duration: 2.2,
            ease: 'power2.inOut'
          }, '<');
      }
    };

    playStage(startIndex);
  }

  pauseTour() {
    this.isTourPaused = true;
    this.hud.setPlaybackState(true, true);
    this.processController.pause();
    if (this.tourTimeline) {
      this.tourTimeline.pause();
    }
  }

  resumeTour() {
    this.isTourPaused = false;
    this.hud.setPlaybackState(true, false);
    this.processController.resume();
    if (this.tourTimeline) {
      this.tourTimeline.resume();
    }
  }

  stopTour() {
    this.isTourRunning = false;
    this.isTourPaused = false;
    this.hud.setPlaybackState(false, false);
    if (this.tourTimeline) {
      this.tourTimeline.kill();
      this.tourTimeline = null;
    }
    this.clearSelectionHighlight();
    // Return all machines to exterior
    this.interactiveMachines.forEach(m => {
      if (m.userData && m.userData.setViewMode) {
        m.userData.setViewMode('exterior');
      }
    });
  }

  focusMachineById(id) {
    const machine = this.interactiveMachines.find(m => m.userData.id === id);
    if (machine) {
      this.stopTour();
      this.focusMachine(machine);
    }
  }

  focusMachine(machineGroup) {
    // Reset any previous machine view mode to exterior
    if (this.selectedMachine && this.selectedMachine !== machineGroup) {
      if (this.selectedMachine.userData.setViewMode) {
        this.selectedMachine.userData.setViewMode('exterior');
      }
    }

    this.selectedMachine = machineGroup;
    this.applySelectionHighlight(machineGroup);
    this.audio.playWhoosh();

    // Default to internal inspection view
    if (machineGroup.userData.setViewMode) {
      machineGroup.userData.setViewMode('interior');
    }
    this.processController.setInspectedMachine(machineGroup.userData.id);

    const targetLook = machineGroup.userData.cameraTarget;
    const targetPos = this.calculateComfortableCameraPos(machineGroup);

    gsap.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => this.controls.update()
    });

    gsap.to(this.controls.target, {
      x: targetLook.x,
      y: targetLook.y,
      z: targetLook.z,
      duration: 1.6,
      ease: 'power2.inOut'
    });

    this.hud.showMachineInspector(machineGroup.userData.id);
    this.hud.setNarration(
      machineGroup.userData.name.toUpperCase(),
      machineGroup.userData.description
    );
  }

  calculateComfortableCameraPos(machineGroup) {
    const targetLook = machineGroup.userData.cameraTarget 
      ? machineGroup.userData.cameraTarget.clone() 
      : machineGroup.position.clone();

    // Determine viewing direction from defined camera position
    let dir = new THREE.Vector3();
    if (machineGroup.userData.cameraPosition) {
      dir.subVectors(machineGroup.userData.cameraPosition, targetLook);
    }
    if (dir.length() < 0.1) {
      dir.set(0, 0.45, 1.0);
    }
    dir.normalize();

    // Set comfortable viewing distance based on machine scale (reduces zoom intensity)
    const id = machineGroup.userData.id;
    let dist = 15.5; // standard comfortable distance

    if (id === 'machine-6' || id === 'machine-9') {
      // Tall fractionating / adsorption columns (height 11-13 units)
      dist = 18.5;
    } else if (id === 'machine-1' || id === 'machine-3' || id === 'machine-10') {
      // Wide complexes (Conveyor bunker, Filter Press, Cogeneration)
      dist = 17.5;
    } else if (id === 'machine-2' || id === 'machine-4' || id === 'machine-5' || id === 'machine-7' || id === 'machine-8' || id === 'machine-c') {
      // Process reactors & dryers
      dist = 15.5;
    }

    // Maintain a comfortable downward perspective (elevation 22° - 26°)
    dir.y = Math.max(0.36, Math.min(0.50, dir.y));
    dir.normalize();

    return targetLook.clone().add(dir.multiplyScalar(dist));
  }

  setLabelsVisible(show) {
    this.showLabels = show;
    if (this.equipmentFactory) {
      this.equipmentFactory.setLabelsVisible(show);
    }

    // Instantly show or hide all 3D labels on all machines
    for (let machine of this.interactiveMachines) {
      machine.traverse((child) => {
        if (child.isSprite || (child.userData && (child.userData.isBanner || child.userData.isMachineLabel || child.userData.isTechnicalLabel || child.userData.isComponentLabel))) {
          child.visible = show;
        }
      });

      if (machine.userData && Array.isArray(machine.userData.internalLabels)) {
        for (let lbl of machine.userData.internalLabels) {
          lbl.visible = show;
          lbl.traverse(c => {
            c.visible = show;
          });
        }
      }
    }

    if (this.hud) {
      this.hud.setLabelToggleState(show);
    }
  }

  toggleLabels() {
    this.setLabelsVisible(!this.showLabels);
  }

  animate() {
    requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.1);

    // Update camera controls
    this.controls.update();

    // Update centralized process animation controller
    if (this.processController) {
      this.processController.update(delta);
    }

    // Update physical machine animations
    for (let comp of this.animatedComponents) {
      comp.update(delta);
    }

    // Update animated pipeline particle streams
    if (this.pipelineNetwork) {
      this.pipelineNetwork.update(delta);
    }

    // Animate 3D selection highlight halo & floating beacon
    if (this.selectionGroup && this.selectionGroup.visible) {
      this.selectionOuterRing.rotation.z += delta * 1.1;
      this.selectionInnerRing.rotation.z -= delta * 0.7;
      this.selectionBeaconDisc.scale.setScalar(1.0 + Math.sin(Date.now() * 0.005) * 0.08);
      this.selectionHoloCylinder.rotation.y += delta * 0.35;
    }
    if (this.selectionBeaconGroup && this.selectionBeaconGroup.visible) {
      const t = Date.now() * 0.004;
      this.selectionBeaconGroup.position.y = this.beaconBaseY + Math.sin(t) * 0.14;
      this.selectionBeaconArrow.rotation.y += delta * 2.2;
      this.selectionReticleRing.rotation.z -= delta * 1.8;
    }
    if (this.selectionCage && this.selectionCage.visible && this.selectionCageMat) {
      this.selectionCageMat.opacity = 0.65 + Math.sin(Date.now() * 0.005) * 0.25;
    }

    // Render frame
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize Application once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new BiorefineryApp();
});
