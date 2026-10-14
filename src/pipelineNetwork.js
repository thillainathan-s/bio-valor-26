import * as THREE from 'three';

/**
 * Creates transparent glass-jacketed industrial pipelines with visible flowing fluid cores
 * and animated particle streams running inside.
 */
export class PipelineNetwork {
  constructor(materialLibrary) {
    this.mat = materialLibrary;
    this.particleSystems = [];
    this.pipeGroup = new THREE.Group();
  }

  // Create a realistic transparent industrial pipe with visible internal fluid core and steel flanges
  createPipe(points, radius, fluidMaterialName, addFlanges = true) {
    const curve = new THREE.CatmullRomCurve3(points);

    // 1. Outer Transparent Borosilicate Glass / Acrylic Pipe Shell
    const outerGeo = new THREE.TubeGeometry(curve, 64, radius, 16, false);
    const outerMat = this.mat.get('transparentPipe');
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    outerMesh.renderOrder = 14;
    this.pipeGroup.add(outerMesh);

    // 2. Inner Visible Flowing Fluid Core Tube
    let baseMat = this.mat.get(fluidMaterialName) || this.mat.get('darkIndustrialSteel');
    const innerGeo = new THREE.TubeGeometry(curve, 64, radius * 0.72, 12, false);
    const innerMat = baseMat.clone();
    innerMat.transparent = true;
    innerMat.opacity = 0.72;
    innerMat.depthWrite = false;
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.renderOrder = 4;
    this.pipeGroup.add(innerMesh);

    // 3. Steel Couplings & Flanges at Joint Intervals
    if (addFlanges) {
      for (let t = 0.2; t <= 0.8; t += 0.3) {
        const pt = curve.getPoint(t);
        const tangent = curve.getTangent(t);
        const flange = new THREE.Mesh(
          new THREE.CylinderGeometry(radius * 1.55, radius * 1.55, radius * 0.45, 16),
          this.mat.get('darkIndustrialSteel')
        );
        flange.position.copy(pt);
        flange.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
        this.pipeGroup.add(flange);
      }
    }

    return curve;
  }

  // Engineered industrial pipe support stanchion
  createPipeSupport(x, z, height, width = 2.0) {
    const supportMat = this.mat.get('pipeSupportSteel');
    const legGeo = new THREE.BoxGeometry(0.12, height, 0.12);
    const leg1 = new THREE.Mesh(legGeo, supportMat);
    leg1.position.set(x, height / 2, z - width / 2);
    const leg2 = new THREE.Mesh(legGeo, supportMat);
    leg2.position.set(x, height / 2, z + width / 2);

    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, width + 0.3), supportMat);
    crossbar.position.set(x, height - 0.05, z);

    this.pipeGroup.add(leg1, leg2, crossbar);
  }

  // Animated particle stream running INSIDE the transparent pipe
  createParticleStream(curve, count, size, colorHex, speed = 1.0) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const progress = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      progress[i] = i / count;
      const pt = curve.getPoint(progress[i]);
      positions[i * 3] = pt.x;
      positions[i * 3 + 1] = pt.y;
      positions[i * 3 + 2] = pt.z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle sprite canvas with bright radial glow
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.35, colorHex);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.PointsMaterial({
      size: size * 1.6,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true
    });

    const points = new THREE.Points(geometry, material);
    points.renderOrder = 8;
    this.pipeGroup.add(points);

    this.particleSystems.push({
      curve,
      count,
      progress,
      geometry,
      speed,
      active: true
    });
  }

  buildNetwork() {
    // -------------------------------------------------------------
    // INDUSTRIAL PIPE SUPPORT STANCHIONS
    // -------------------------------------------------------------
    this.createPipeSupport(-27, 0, 3.8, 1.4);
    this.createPipeSupport(-16, 0, 2.0, 1.4);
    this.createPipeSupport(-4.5, 4.0, 3.4, 2.4);
    this.createPipeSupport(-4.5, -4.0, 3.2, 2.4);
    this.createPipeSupport(2.0, 0, 2.4, 1.2);
    this.createPipeSupport(8.0, 0, 2.8, 1.2);
    this.createPipeSupport(8.5, 11, 2.8, 1.4);
    this.createPipeSupport(21.5, 11, 2.0, 1.4);
    this.createPipeSupport(8.5, -11, 2.4, 1.4);
    this.createPipeSupport(21.5, -11, 4.0, 1.4);

    // -------------------------------------------------------------
    // 0. FEEDSTOCK TRANSFER CONVEYOR: Machine 1 (Shredder) -> Machine 2 (Pretreatment)
    // -------------------------------------------------------------
    const curve1to2 = this.createPipe(
      [
        new THREE.Vector3(-31.4, 2.2, 0),
        new THREE.Vector3(-28.0, 3.2, 0),
        new THREE.Vector3(-25.0, 4.4, 0),
        new THREE.Vector3(-22.0, 5.5, 0)
      ],
      0.20,
      'bagasseRaw'
    );
    this.createParticleStream(curve1to2, 45, 0.5, '#d4a373', 1.0);

    // -------------------------------------------------------------
    // 1. PRETREATMENT SLURRY TRANSFER: Machine 2 -> Machine 3 (Solid-Liquid Separator)
    // -------------------------------------------------------------
    const curve2to3 = this.createPipe(
      [
        new THREE.Vector3(-20.2, 0.8, 0),
        new THREE.Vector3(-18.0, 1.8, 0),
        new THREE.Vector3(-15.0, 2.0, 0),
        new THREE.Vector3(-12.3, 2.0, 0)
      ],
      0.18,
      'ligninBrown'
    );
    this.createParticleStream(curve2to3, 40, 0.48, '#d97706', 0.95);

    // -------------------------------------------------------------
    // 2. STREAM A (Cellulose-Rich Solid Stream): Machine 3 -> Machine 4 (Hydrolysis) - TEAL
    // -------------------------------------------------------------
    const curve3to4 = this.createPipe(
      [
        new THREE.Vector3(-7.8, 2.4, 1.2),
        new THREE.Vector3(-5.0, 3.4, 3.5),
        new THREE.Vector3(-2.0, 4.0, 8.5),
        new THREE.Vector3(0.4, 4.4, 11.0)
      ],
      0.18,
      'celluloseTeal'
    );
    this.createParticleStream(curve3to4, 50, 0.5, '#0ea5e9', 1.1);

    // -------------------------------------------------------------
    // 3. STREAM B (Lignin-Rich Alkaline Black Liquor): Machine 3 -> Machine 7 (Acidification) - BROWN
    // -------------------------------------------------------------
    const curve3to7 = this.createPipe(
      [
        new THREE.Vector3(-7.8, 1.4, -1.2),
        new THREE.Vector3(-5.0, 3.2, -3.5),
        new THREE.Vector3(-2.0, 4.0, -8.5),
        new THREE.Vector3(0.4, 4.4, -11.0)
      ],
      0.18,
      'ligninBrown'
    );
    this.createParticleStream(curve3to7, 50, 0.5, '#92400e', 1.1);

    // -------------------------------------------------------------
    // 4. STREAM C (Hemicellulose-Rich Liquid Stream): Machine 3 -> Machine C (Sugar Recovery) - VIOLET
    // -------------------------------------------------------------
    const curve3toC = this.createPipe(
      [
        new THREE.Vector3(-7.8, 1.9, 0),
        new THREE.Vector3(-2.0, 2.4, 0),
        new THREE.Vector3(5.0, 2.8, 0),
        new THREE.Vector3(9.5, 3.4, 0),
        new THREE.Vector3(11.8, 3.6, 0)
      ],
      0.16,
      'hemicelluloseViolet'
    );
    this.createParticleStream(curve3toC, 55, 0.48, '#a855f7', 1.2);

    // -------------------------------------------------------------
    // 5. STREAM C PRODUCT: Proposed Recovered Pentose Syrup -> Storage Tank
    // -------------------------------------------------------------
    const curveCtoTank = this.createPipe(
      [
        new THREE.Vector3(13.2, 2.2, 0),
        new THREE.Vector3(14.5, 2.2, 1.0),
        new THREE.Vector3(15.6, 2.0, 1.4)
      ],
      0.12,
      'hemicelluloseSyrup'
    );
    this.createParticleStream(curveCtoTank, 30, 0.42, '#c084fc', 1.3);

    // -------------------------------------------------------------
    // 6. STREAM C RESIDUAL: Unrecovered Pentose Wash -> Machine 10 (Anaerobic Digester)
    // -------------------------------------------------------------
    const curveCtoResidue = this.createPipe(
      [
        new THREE.Vector3(16.4, 0.5, 0),
        new THREE.Vector3(25.0, 0.6, 0),
        new THREE.Vector3(33.0, 0.8, -1.2),
        new THREE.Vector3(36.8, 1.5, -2.4)
      ],
      0.14,
      'residualGrey'
    );
    this.createParticleStream(curveCtoResidue, 45, 0.38, '#64748b', 0.8);

    // -------------------------------------------------------------
    // 7. SEPARATOR RESIDUAL WASH DRAIN: Machine 3 -> Central Drainage Network
    // -------------------------------------------------------------
    const curve3Wash = this.createPipe(
      [
        new THREE.Vector3(-7.8, 0.45, 0),
        new THREE.Vector3(0.0, 0.4, 0),
        new THREE.Vector3(8.0, 0.4, 0),
        new THREE.Vector3(11.8, 0.4, 0)
      ],
      0.12,
      'residualGrey'
    );
    this.createParticleStream(curve3Wash, 35, 0.36, '#94a3b8', 0.7);

    // -------------------------------------------------------------
    // 8. PATHWAY A: Glucose Hydrolysate -> Machine 5 Fermenter - AMBER GLUCOSE
    // -------------------------------------------------------------
    const curve4to5 = this.createPipe(
      [
        new THREE.Vector3(3.6, 1.1, 11),
        new THREE.Vector3(7.0, 2.8, 11),
        new THREE.Vector3(10.5, 3.0, 11),
        new THREE.Vector3(13.2, 3.2, 11)
      ],
      0.16,
      'glucoseAmber'
    );
    this.createParticleStream(curve4to5, 40, 0.46, '#f59e0b', 1.1);

    // -------------------------------------------------------------
    // 9. PATHWAY A: Fermented Broth ("Beer") -> Machine 6 Distillation - GOLD
    // -------------------------------------------------------------
    const curve5to6 = this.createPipe(
      [
        new THREE.Vector3(16.8, 1.1, 11),
        new THREE.Vector3(20.5, 1.8, 11),
        new THREE.Vector3(24.0, 1.8, 11),
        new THREE.Vector3(26.4, 1.8, 11)
      ],
      0.16,
      'ethanolGold'
    );
    this.createParticleStream(curve5to6, 45, 0.45, '#fbbf24', 1.2);

    // -------------------------------------------------------------
    // 10. PATHWAY A: Distilled Hydrous Ethanol Run-down to Product Tank - BRIGHT GOLD
    // -------------------------------------------------------------
    const curve6Product = this.createPipe(
      [
        new THREE.Vector3(28.0, 8.1, 11),
        new THREE.Vector3(29.8, 6.2, 11),
        new THREE.Vector3(29.8, 3.2, 12.6),
        new THREE.Vector3(29.8, 2.2, 12.6)
      ],
      0.12,
      'ethanolGold'
    );
    this.createParticleStream(curve6Product, 35, 0.42, '#fde047', 1.4);

    // -------------------------------------------------------------
    // 11. PATHWAY A: Vinasse Stillage Bottoms -> Machine 10 Anaerobic Digester - GREY
    // -------------------------------------------------------------
    const curve6Vinasse = this.createPipe(
      [
        new THREE.Vector3(28.0, 0.6, 11),
        new THREE.Vector3(32.0, 0.6, 8.0),
        new THREE.Vector3(35.0, 0.8, 3.0),
        new THREE.Vector3(36.8, 1.6, -2.0)
      ],
      0.14,
      'residualGrey'
    );
    this.createParticleStream(curve6Vinasse, 40, 0.38, '#475569', 0.8);

    // -------------------------------------------------------------
    // 12. PATHWAY A: Unhydrolyzed Cellulose Solid Residue -> Machine 10 Cogeneration Boiler
    // -------------------------------------------------------------
    const curve4Residue = this.createPipe(
      [
        new THREE.Vector3(2.0, 0.6, 12.6),
        new THREE.Vector3(15.0, 0.8, 12.6),
        new THREE.Vector3(28.0, 0.8, 12.6),
        new THREE.Vector3(34.0, 1.2, 7.0),
        new THREE.Vector3(36.8, 2.2, 2.4)
      ],
      0.16,
      'celluloseTeal'
    );
    this.createParticleStream(curve4Residue, 45, 0.4, '#0ea5e9', 0.7);

    // -------------------------------------------------------------
    // 13. PATHWAY B: Lignin Cake -> Machine 8 Thermal Dryer / Granulator - BROWN
    // -------------------------------------------------------------
    const curve7to8 = this.createPipe(
      [
        new THREE.Vector3(3.9, 1.6, -10.2),
        new THREE.Vector3(8.0, 2.2, -11),
        new THREE.Vector3(11.0, 2.4, -11),
        new THREE.Vector3(12.6, 2.4, -11)
      ],
      0.16,
      'ligninBrown'
    );
    this.createParticleStream(curve7to8, 40, 0.44, '#78350f', 0.95);

    // -------------------------------------------------------------
    // 14. PATHWAY B: Biosorbent Granules Pneumatic Conveyor -> Machine 9 Dye Column - DARK
    // -------------------------------------------------------------
    const curve8to9 = this.createPipe(
      [
        new THREE.Vector3(17.4, 1.4, -11),
        new THREE.Vector3(21.0, 3.8, -11),
        new THREE.Vector3(24.5, 5.8, -11),
        new THREE.Vector3(26.6, 6.0, -11)
      ],
      0.14,
      'biosorbentGranules'
    );
    this.createParticleStream(curve8to9, 45, 0.44, '#1c1917', 1.2);

    // -------------------------------------------------------------
    // 15. PATHWAY B: Magenta Dye Wastewater Inflow -> Top of Column (Machine 9) - MAGENTA
    // -------------------------------------------------------------
    const curveDyeInflow = this.createPipe(
      [
        new THREE.Vector3(22.0, 6.4, -15.0),
        new THREE.Vector3(25.0, 6.4, -13.0),
        new THREE.Vector3(28.0, 6.4, -11)
      ],
      0.15,
      'dyeMagenta'
    );
    this.createParticleStream(curveDyeInflow, 45, 0.52, '#d946ef', 1.3);

    // -------------------------------------------------------------
    // 16. PATHWAY B: Clarified Treated Effluent Outflow -> Bottom of Column (Machine 9) - CRYSTAL BLUE
    // -------------------------------------------------------------
    const curveCleanOutflow = this.createPipe(
      [
        new THREE.Vector3(28.0, 0.8, -11),
        new THREE.Vector3(29.8, 1.3, -11),
        new THREE.Vector3(33.0, 1.2, -9.0),
        new THREE.Vector3(35.5, 1.2, -6.0)
      ],
      0.16,
      'treatedWaterBlue'
    );
    this.createParticleStream(curveCleanOutflow, 45, 0.48, '#38bdf8', 1.3);

    return this.pipeGroup;
  }

  update(delta) {
    for (let sys of this.particleSystems) {
      if (!sys.active) continue;
      const positions = sys.geometry.attributes.position.array;
      for (let i = 0; i < sys.count; i++) {
        sys.progress[i] += delta * 0.25 * sys.speed;
        if (sys.progress[i] > 1.0) {
          sys.progress[i] -= 1.0;
        }
        const pt = sys.curve.getPoint(sys.progress[i]);
        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;
      }
      sys.geometry.attributes.position.needsUpdate = true;
    }
  }
}
