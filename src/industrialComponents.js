import * as THREE from 'three';

/**
 * Reusable Industrial Components Factory
 * Generates realistic industrial sub-assemblies:
 * - Electric motors with cooling fins, terminal boxes, and fan cowls
 * - Gear reducers and drive housings
 * - Flanged pipe joints with hexagonal bolt rings
 * - Industrial manual handwheel valves and pneumatic control valves
 * - Process instrumentation (pressure gauges, RTD temperature transmitters, sight glasses)
 * - Structural I-beams, channel supports, and floor anchor feet
 * - Bolted manways, davit arms, and glass inspection sight ports
 * - 3D Technical Leader Labels
 */
export class IndustrialComponentsFactory {
  constructor(materialLibrary) {
    this.mat = materialLibrary;
  }

  // --- 1. ELECTRIC MOTORS & GEAR DRIVES ---
  createElectricMotor(options = {}) {
    const {
      length = 1.0,
      radius = 0.35,
      color = 'machineryHousingNavy',
      hasGearbox = true,
      gearboxLength = 0.6,
      orientation = 'z' // 'x', 'y', 'z'
    } = options;

    const motorGroup = new THREE.Group();
    const housingMat = this.mat.get(color);
    const steelMat = this.mat.get('stainlessSteel');
    const darkSteel = this.mat.get('darkIndustrialSteel');

    // Main stator cylinder with longitudinal cooling fins
    const statorGeo = new THREE.CylinderGeometry(radius, radius, length, 24);
    const stator = new THREE.Mesh(statorGeo, housingMat);
    stator.castShadow = true;
    stator.receiveShadow = true;
    motorGroup.add(stator);

    // 8 Longitudinal cooling fins around stator body
    const finGeo = new THREE.BoxGeometry(radius * 2.2, length * 0.85, 0.03);
    for (let i = 0; i < 4; i++) {
      const fin = new THREE.Mesh(finGeo, housingMat);
      fin.rotation.y = (i * Math.PI) / 4;
      motorGroup.add(fin);
    }

    // Rear cooling fan cowl (shroud)
    const cowlGeo = new THREE.CylinderGeometry(radius * 1.04, radius * 1.04, length * 0.25, 24);
    const cowl = new THREE.Mesh(cowlGeo, darkSteel);
    cowl.position.y = -length * 0.52;
    motorGroup.add(cowl);

    // Terminal conduit electrical box on top of stator
    const termBox = new THREE.Mesh(
      new THREE.BoxGeometry(radius * 0.8, radius * 0.6, radius * 0.7),
      darkSteel
    );
    termBox.position.set(0, 0, radius * 1.05);
    // Cable gland nut
    const gland = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.12, radius * 0.12, radius * 0.3, 8),
      steelMat
    );
    gland.rotation.x = Math.PI / 2;
    gland.position.set(0, 0, radius * 1.45);
    motorGroup.add(termBox, gland);

    // Drive shaft & bearing retainer
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.28, radius * 0.28, length * 0.4, 16),
      steelMat
    );
    shaft.position.y = length * 0.6;
    motorGroup.add(shaft);

    // Optional reduction gearbox
    if (hasGearbox) {
      const gbGeo = new THREE.BoxGeometry(radius * 2.3, gearboxLength, radius * 2.1);
      const gb = new THREE.Mesh(gbGeo, housingMat);
      gb.position.y = length * 0.5 + gearboxLength * 0.5;
      gb.castShadow = true;

      // Gearbox flanged output seal
      const outputFlange = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.9, radius * 0.9, 0.1, 16),
        darkSteel
      );
      outputFlange.position.y = gb.position.y + gearboxLength * 0.5 + 0.05;

      // Oil level inspection glass plug
      const oilPlug = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12),
        this.mat.get('reactorGlass')
      );
      oilPlug.rotation.x = Math.PI / 2;
      oilPlug.position.set(radius * 0.8, gb.position.y, radius * 1.06);

      motorGroup.add(gb, outputFlange, oilPlug);
    }

    // Orient motor
    if (orientation === 'x') {
      motorGroup.rotation.z = Math.PI / 2;
    } else if (orientation === 'z') {
      motorGroup.rotation.x = Math.PI / 2;
    }

    return motorGroup;
  }

  // --- 2. FLANGED PIPE JOINTS WITH BOLT RINGS ---
  createFlangePair(radius = 0.2, boltCount = 8) {
    const group = new THREE.Group();
    const steelMat = this.mat.get('stainlessSteel');
    const boltMat = this.mat.get('darkIndustrialSteel');

    const flangeR = radius * 1.6;
    const flangeThickness = 0.06;

    // Twin mating flanges
    for (let sign of [-1, 1]) {
      const flange = new THREE.Mesh(
        new THREE.CylinderGeometry(flangeR, flangeR, flangeThickness, 24),
        steelMat
      );
      flange.position.y = (flangeThickness * 0.5) * sign;
      group.add(flange);
    }

    // Gasket rim in between
    const gasket = new THREE.Mesh(
      new THREE.CylinderGeometry(flangeR * 0.95, flangeR * 0.95, 0.02, 24),
      boltMat
    );
    group.add(gasket);

    // Circumferential hex bolts
    const boltR = flangeR * 0.82;
    const boltLength = flangeThickness * 2.8;
    const boltGeo = new THREE.CylinderGeometry(0.025, 0.025, boltLength, 6);

    for (let i = 0; i < boltCount; i++) {
      const angle = (i * Math.PI * 2) / boltCount;
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      bolt.position.set(Math.cos(angle) * boltR, 0, Math.sin(angle) * boltR);
      group.add(bolt);
    }

    return group;
  }

  // --- 3. VALVES: MANUAL HANDWHEEL & PNEUMATIC ACTUATORS ---
  createManualValve(options = {}) {
    const {
      pipeRadius = 0.2,
      wheelColor = 0xef4444, // Red safety shutoff by default
      valveType = 'globe'
    } = options;

    const group = new THREE.Group();
    const darkSteel = this.mat.get('darkIndustrialSteel');
    const steelMat = this.mat.get('stainlessSteel');

    // Valve body (spherical center + flanged ends)
    const bodyGeo = new THREE.SphereGeometry(pipeRadius * 1.25, 16, 12);
    const body = new THREE.Mesh(bodyGeo, darkSteel);
    group.add(body);

    // Bonnet neck
    const bonnetHeight = pipeRadius * 1.6;
    const bonnet = new THREE.Mesh(
      new THREE.CylinderGeometry(pipeRadius * 0.45, pipeRadius * 0.6, bonnetHeight, 16),
      darkSteel
    );
    bonnet.position.y = bonnetHeight * 0.5;
    group.add(bonnet);

    // Rising stem
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(pipeRadius * 0.15, pipeRadius * 0.15, bonnetHeight * 1.4, 12),
      steelMat
    );
    stem.position.y = bonnetHeight * 0.8;
    group.add(stem);

    // Spoke handwheel
    const wheelR = pipeRadius * 1.4;
    const wheelMat = new THREE.MeshStandardMaterial({
      color: wheelColor,
      roughness: 0.35,
      metalness: 0.4
    });

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(wheelR, pipeRadius * 0.12, 8, 24),
      wheelMat
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = bonnetHeight + 0.1;

    // 4 spokes
    const spokeGeo = new THREE.CylinderGeometry(pipeRadius * 0.08, pipeRadius * 0.08, wheelR * 1.9, 8);
    const spoke1 = new THREE.Mesh(spokeGeo, wheelMat);
    spoke1.rotation.z = Math.PI / 2;
    spoke1.position.y = rim.position.y;
    const spoke2 = new THREE.Mesh(spokeGeo, wheelMat);
    spoke2.rotation.x = Math.PI / 2;
    spoke2.position.y = rim.position.y;

    group.add(rim, spoke1, spoke2);
    return group;
  }

  createPneumaticControlValve(pipeRadius = 0.2, signalColorHex = 0x0ea5e9) {
    const group = new THREE.Group();
    const darkSteel = this.mat.get('darkIndustrialSteel');
    const steelMat = this.mat.get('stainlessSteel');

    // Valve body
    const body = new THREE.Mesh(new THREE.SphereGeometry(pipeRadius * 1.3, 16, 12), darkSteel);
    group.add(body);

    // Valve yoke pillars
    const yokeH = pipeRadius * 1.8;
    for (let dx of [-pipeRadius * 0.4, pipeRadius * 0.4]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, yokeH, 8), steelMat);
      post.position.set(dx, yokeH * 0.5, 0);
      group.add(post);
    }

    // Positioner control box on side of yoke
    const posBox = new THREE.Mesh(
      new THREE.BoxGeometry(pipeRadius * 0.7, pipeRadius * 0.8, pipeRadius * 0.6),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.3 })
    );
    posBox.position.set(pipeRadius * 0.7, yokeH * 0.5, 0);
    group.add(posBox);

    // Diaphragm dome actuator housing
    const domeR = pipeRadius * 1.8;
    const domeMat = new THREE.MeshStandardMaterial({
      color: signalColorHex,
      roughness: 0.3,
      metalness: 0.6
    });

    const lowerDome = new THREE.Mesh(
      new THREE.CylinderGeometry(domeR, domeR * 0.6, pipeRadius * 0.6, 24),
      domeMat
    );
    lowerDome.position.y = yokeH + pipeRadius * 0.3;

    const upperDome = new THREE.Mesh(
      new THREE.SphereGeometry(domeR, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
      domeMat
    );
    upperDome.position.y = lowerDome.position.y + pipeRadius * 0.3;

    // Actuator air supply connection
    const airLine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, pipeRadius * 0.8, 8),
      steelMat
    );
    airLine.rotation.z = Math.PI / 2;
    airLine.position.set(domeR * 0.9, upperDome.position.y, 0);

    group.add(lowerDome, upperDome, airLine);
    return group;
  }

  // --- 4. INSTRUMENTATION: GAUGES, SENSORS & SIGHT GLASSES ---
  createPressureGauge(radius = 0.22, dialColor = '#ffffff') {
    const group = new THREE.Group();
    const steelMat = this.mat.get('stainlessSteel');
    const darkSteel = this.mat.get('darkIndustrialSteel');

    // Stem threaded connector
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8), steelMat);
    stem.position.y = 0.125;
    group.add(stem);

    // Gauge bezel case
    const caseGeo = new THREE.CylinderGeometry(radius, radius, 0.08, 32);
    const gaugeCase = new THREE.Mesh(caseGeo, steelMat);
    gaugeCase.rotation.x = Math.PI / 2;
    gaugeCase.position.set(0, 0.25 + radius, 0.04);
    group.add(gaugeCase);

    // Dial face canvas
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = dialColor;
    ctx.beginPath();
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fill();

    // Scale markings
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(64, 64, 48, Math.PI * 0.75, Math.PI * 2.25);
    ctx.stroke();

    // Needle
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(64, 64);
    ctx.lineTo(88, 36);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(64, 64, 6, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    const dialMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(radius * 1.85, radius * 1.85),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    );
    dialMesh.position.set(0, 0.25 + radius, 0.085);
    group.add(dialMesh);

    // Protective glass lens
    const glassLens = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, 0.01, 24),
      this.mat.get('reactorGlass')
    );
    glassLens.rotation.x = Math.PI / 2;
    glassLens.position.set(0, 0.25 + radius, 0.09);
    group.add(glassLens);

    return group;
  }

  createTemperatureTransmitter(height = 0.5) {
    const group = new THREE.Group();
    const steelMat = this.mat.get('stainlessSteel');

    // Thermowell thermoprobe insertion stem
    const probe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, height, 8), steelMat);
    probe.position.y = -height * 0.5;
    group.add(probe);

    // Hex bushing
    const bushing = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 6), steelMat);
    group.add(bushing);

    // Explosion-proof dual-compartment transmitter puck head (industrial blue)
    const headMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.6, roughness: 0.3 });
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.25, 24), headMat);
    head.rotation.z = Math.PI / 2;
    head.position.y = 0.2;
    group.add(head);

    // Display glass window on transmitter front
    const displayLens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16), this.mat.get('reactorGlass'));
    displayLens.rotation.z = Math.PI / 2;
    displayLens.position.set(0.13, 0.2, 0);
    group.add(displayLens);

    return group;
  }

  createSightGlass(height = 1.4, tubeRadius = 0.14, fluidColor = 0xf59e0b) {
    const group = new THREE.Group();
    const steelMat = this.mat.get('stainlessSteel');
    const glassMat = this.mat.get('reactorGlass');

    // Top and bottom isolation valves
    for (let sign of [-1, 1]) {
      const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.15, 16), steelMat);
      valve.position.y = (height * 0.5) * sign;
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16), steelMat);
      wheel.position.set(0.14, (height * 0.5) * sign, 0);
      wheel.rotation.y = Math.PI / 2;
      group.add(valve, wheel);
    }

    // Outer borosilicate glass tube
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(tubeRadius, tubeRadius, height * 0.85, 24), glassMat);
    group.add(tube);

    // Internal translucent fluid column
    const fluidMat = new THREE.MeshPhysicalMaterial({
      color: fluidColor,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1
    });
    const fluid = new THREE.Mesh(
      new THREE.CylinderGeometry(tubeRadius * 0.85, tubeRadius * 0.85, height * 0.55, 16),
      fluidMat
    );
    fluid.position.y = -height * 0.15;
    group.add(fluid);

    // 4 Armored protective tie rods around glass
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, height, 8), steelMat);
      rod.position.set(Math.cos(angle) * (tubeRadius * 1.4), 0, Math.sin(angle) * (tubeRadius * 1.4));
      group.add(rod);
    }

    return group;
  }

  // --- 5. STRUCTURAL FRAMES, I-BEAMS & CATWALKS ---
  createStructuralFrame(width = 6, height = 3.5, depth = 4) {
    const group = new THREE.Group();
    const steelMat = this.mat.get('darkIndustrialSteel');
    const footMat = this.mat.get('machineryHousingNavy');

    const colGeo = new THREE.BoxGeometry(0.24, height, 0.24);
    const beamGeoX = new THREE.BoxGeometry(width, 0.24, 0.18);
    const beamGeoZ = new THREE.BoxGeometry(0.18, 0.24, depth);

    // 4 Main columns with floor anchor plates
    for (let dx of [-width * 0.5, width * 0.5]) {
      for (let dz of [-depth * 0.5, depth * 0.5]) {
        const col = new THREE.Mesh(colGeo, steelMat);
        col.position.set(dx, height * 0.5, dz);
        col.castShadow = true;

        // Leveling anchor footplate
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.45), footMat);
        foot.position.set(dx, 0.04, dz);

        // Gusset stiffener plate
        const gusset = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.35, 0.15), steelMat);
        gusset.position.set(dx, 0.2, dz);

        group.add(col, foot, gusset);
      }
    }

    // Top perimeter beams
    const topBeamFront = new THREE.Mesh(beamGeoX, steelMat);
    topBeamFront.position.set(0, height - 0.12, depth * 0.5);
    const topBeamBack = new THREE.Mesh(beamGeoX, steelMat);
    topBeamBack.position.set(0, height - 0.12, -depth * 0.5);
    const topBeamLeft = new THREE.Mesh(beamGeoZ, steelMat);
    topBeamLeft.position.set(-width * 0.5, height - 0.12, 0);
    const topBeamRight = new THREE.Mesh(beamGeoZ, steelMat);
    topBeamRight.position.set(width * 0.5, height - 0.12, 0);

    group.add(topBeamFront, topBeamBack, topBeamLeft, topBeamRight);

    // Diagonal cross braces on sides for industrial realism
    const braceLen = Math.sqrt(height * height + depth * depth);
    const diagGeo = new THREE.BoxGeometry(0.08, braceLen * 0.95, 0.08);
    for (let dx of [-width * 0.5, width * 0.5]) {
      const diag1 = new THREE.Mesh(diagGeo, steelMat);
      diag1.position.set(dx, height * 0.5, 0);
      diag1.rotation.x = Math.atan2(depth, height);
      group.add(diag1);
    }

    return group;
  }

  createInspectionPort(radius = 0.4) {
    const group = new THREE.Group();
    const steelMat = this.mat.get('stainlessSteel');
    const glassMat = this.mat.get('reactorGlass');
    const boltMat = this.mat.get('darkIndustrialSteel');

    // Heavy bolted flange ring
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.35, radius * 1.35, 0.08, 24), steelMat);
    rim.rotation.x = Math.PI / 2;
    group.add(rim);

    // Borosilicate thick glass window
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.06, 24), glassMat);
    glass.rotation.x = Math.PI / 2;
    glass.position.z = 0.01;
    group.add(glass);

    // Wiper blade arm
    const wiperArm = new THREE.Mesh(new THREE.BoxGeometry(0.02, radius * 0.95, 0.02), boltMat);
    wiperArm.position.set(0, radius * 0.4, 0.05);
    wiperArm.rotation.z = 0.4;
    group.add(wiperArm);

    // 8 Circumferential hex bolts
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.1, 6), boltMat);
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(Math.cos(angle) * (radius * 1.2), Math.sin(angle) * (radius * 1.2), 0);
      group.add(bolt);
    }

    return group;
  }

  // --- 6. 3D TECHNICAL LEADER LABELS ---
  createTechnicalLabel(text, colorHex = '#38bdf8', subtext = '') {
    const group = new THREE.Group();
    group.userData = {
      isTechnicalLabel: true,
      isComponentLabel: true,
      text: text
    };

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Dark high-contrast glassmorphic background
    ctx.fillStyle = 'rgba(7, 11, 20, 0.92)';
    ctx.roundRect(6, 6, 500, 116, 14);
    ctx.fill();

    // Outer accent border
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 4;
    ctx.roundRect(6, 6, 500, 116, 14);
    ctx.stroke();

    // Left indicator tag
    ctx.fillStyle = colorHex;
    ctx.roundRect(16, 20, 8, 88, 4);
    ctx.fill();

    // Main text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(text, 36, 26);

    // Subtext if present
    if (subtext) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 20px "Inter", sans-serif';
      ctx.fillText(subtext, 36, 72);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.renderOrder = 99999;
    sprite.scale.set(4.0, 1.0, 1.0);
    sprite.userData = {
      isTechnicalLabel: true,
      isComponentLabel: true,
      text: text
    };
    group.add(sprite);

    // Leader line anchor stem
    const lineMat = new THREE.LineBasicMaterial({
      color: colorHex,
      linewidth: 2,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
      depthWrite: false
    });
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -0.45, 0),
      new THREE.Vector3(0, -1.2, 0)
    ]);
    const line = new THREE.Line(lineGeo, lineMat);
    line.renderOrder = 99998;
    group.add(line);

    // Pin marker dot at origin
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshBasicMaterial({ color: colorHex, depthTest: false, depthWrite: false })
    );
    dot.position.y = -1.2;
    dot.renderOrder = 99998;
    group.add(dot);

    return group;
  }
}
