import * as THREE from 'three';

// Procedural Canvas Texture Generators
function createHazardStripeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f59e0b'; // Amber yellow
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#0f172a'; // Dark slate
  ctx.beginPath();
  for (let i = -256; i < 512; i += 64) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 32, 0);
    ctx.lineTo(i - 32, 256);
    ctx.lineTo(i - 64, 256);
    ctx.closePath();
  }
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
  return texture;
}

function createBrushedMetalTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#a0abbd';
  ctx.fillRect(0, 0, 256, 256);

  // Micro fine brush lines
  for (let i = 0; i < 2000; i++) {
    const y = Math.random() * 256;
    const alpha = 0.05 + Math.random() * 0.12;
    ctx.strokeStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(40,50,70,${alpha})`;
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

function createConveyorBeltTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1e2430';
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = '#2d3748';
  for (let y = 0; y < 128; y += 8) {
    ctx.fillRect(0, y, 128, 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 8);
  return texture;
}

function createFactoryFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Dark industrial concrete
  ctx.fillStyle = '#0c1220';
  ctx.fillRect(0, 0, 512, 512);

  // Floor grid tiles
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  const tileSize = 64;
  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Subtle concrete noise
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const bright = Math.random() * 20;
    ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.03})`;
    ctx.fillRect(x, y, 1, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

export class MaterialLibrary {
  constructor() {
    this.textures = {
      hazard: createHazardStripeTexture(),
      brushedMetal: createBrushedMetalTexture(),
      conveyor: createConveyorBeltTexture(),
      floor: createFactoryFloorTexture()
    };

    // Shared realistic materials
    this.materials = {
      // Structural and Metals
      stainlessSteel: new THREE.MeshStandardMaterial({
        color: 0xdde4ec,
        metalness: 0.88,
        roughness: 0.22,
        map: this.textures.brushedMetal,
        envMapIntensity: 1.2
      }),
      polishedChrome: new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        metalness: 0.95,
        roughness: 0.1,
        envMapIntensity: 1.5
      }),
      darkIndustrialSteel: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.6,
        roughness: 0.45
      }),
      machineryHousingNavy: new THREE.MeshStandardMaterial({
        color: 0x142036,
        metalness: 0.4,
        roughness: 0.35
      }),
      equipmentBaseStripe: new THREE.MeshStandardMaterial({
        map: this.textures.hazard,
        roughness: 0.6,
        metalness: 0.2
      }),
      factoryFloor: new THREE.MeshStandardMaterial({
        map: this.textures.floor,
        roughness: 0.75,
        metalness: 0.15
      }),
      conveyorBelt: new THREE.MeshStandardMaterial({
        map: this.textures.conveyor,
        roughness: 0.85,
        metalness: 0.1
      }),

      // Borosilicate Sight Glasses & Inspection Windows
      reactorGlass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.9,
        opacity: 1.0,
        transparent: true,
        roughness: 0.08,
        ior: 1.48,
        thickness: 0.6,
        metalness: 0.05
      }),
      tintedGlass: new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        transmission: 0.82,
        opacity: 0.85,
        transparent: true,
        roughness: 0.12,
        ior: 1.5,
        thickness: 0.4
      }),
      // Transparent Borosilicate Pipe & Transparent Machine Casing for Full Internal Visibility
      transparentPipe: new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.22,
        roughness: 0.05,
        metalness: 0.15,
        reflectivity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        side: THREE.DoubleSide,
        depthWrite: false
      }),
      transparentMachineShell: new THREE.MeshPhysicalMaterial({
        color: 0xebf8ff,
        transparent: true,
        opacity: 0.26,
        roughness: 0.08,
        metalness: 0.18,
        reflectivity: 0.85,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        side: THREE.DoubleSide,
        depthWrite: false
      }),
      glowFluidCore: new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      }),

      // Pathway Color Schemes
      // Teal: Cellulose-rich solid pathway
      celluloseTeal: new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        emissive: 0x0284c7,
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.5
      }),
      celluloseFibers: new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.9,
        metalness: 0.05
      }),

      // Amber: Glucose syrup & Bioethanol pathway
      glucoseAmber: new THREE.MeshPhysicalMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.3,
        transmission: 0.65,
        transparent: true,
        opacity: 0.85,
        roughness: 0.15,
        ior: 1.36
      }),
      ethanolGold: new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xb45309,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.6
      }),

      // Brown: Lignin-rich material & Biosorbent pathway
      ligninBrown: new THREE.MeshStandardMaterial({
        color: 0x78350f,
        emissive: 0x451a03,
        emissiveIntensity: 0.25,
        roughness: 0.5,
        metalness: 0.3
      }),
      biosorbentGranules: new THREE.MeshStandardMaterial({
        color: 0x271910,
        roughness: 0.95,
        metalness: 0.05
      }),

      // Blue: Treated Wastewater / Clean effluent
      treatedWaterBlue: new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.25,
        transmission: 0.9,
        transparent: true,
        opacity: 0.7,
        roughness: 0.05,
        ior: 1.33
      }),

      // Magenta / Purple: Dye Contaminants stream
      dyeMagenta: new THREE.MeshPhysicalMaterial({
        color: 0xd946ef,
        emissive: 0xa21caf,
        emissiveIntensity: 0.45,
        transmission: 0.55,
        transparent: true,
        opacity: 0.85,
        roughness: 0.1,
        ior: 1.35
      }),

      // Grey: General Residual & Wash Streams
      residualGrey: new THREE.MeshStandardMaterial({
        color: 0x64748b,
        emissive: 0x334155,
        emissiveIntensity: 0.2,
        roughness: 0.4,
        metalness: 0.4
      }),

      // Green: Validated / Successful Status ONLY
      successGreen: new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x16a34a,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.5
      }),

      // Active status glowing indicators
      ledGreen: new THREE.MeshBasicMaterial({ color: 0x22c55e }),
      ledAmber: new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
      ledTeal: new THREE.MeshBasicMaterial({ color: 0x06b6d4 }),
      ledBlue: new THREE.MeshBasicMaterial({ color: 0x3b82f6 }),
      ledMagenta: new THREE.MeshBasicMaterial({ color: 0xe879f9 }),

      // Fibrous Sugarcane Bagasse Raw Material
      bagasseRaw: new THREE.MeshStandardMaterial({
        color: 0xd4a373,
        roughness: 0.92,
        metalness: 0.04
      }),

      // Purple/Violet: Hemicellulose-Rich Liquid Stream (Stream C) & Proposed Sugar Recovery
      hemicelluloseViolet: new THREE.MeshStandardMaterial({
        color: 0x9333ea,
        emissive: 0x6b21a8,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.45
      }),
      hemicelluloseSyrup: new THREE.MeshPhysicalMaterial({
        color: 0xa855f7,
        emissive: 0x7c3aed,
        emissiveIntensity: 0.3,
        transmission: 0.7,
        transparent: true,
        opacity: 0.85,
        roughness: 0.18,
        ior: 1.38
      }),
      pipeSupportSteel: new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.75,
        roughness: 0.35
      })
    };
  }

  get(name) {
    return this.materials[name] || this.materials.stainlessSteel;
  }
}
