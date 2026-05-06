export const frenchQuarterWorld = {
  title: 'French Quarter Night Walk',
  subtitle: 'Wrought iron, wet stones, neon, and pixel moonlight',
  hint: 'WASD move • Mouse look • E inspect • Shift sprint • Esc release',
  playerStart: { position: null, yaw: 0, pitch: 0 },
  build(ctx) {
    const { THREE, scene, textures, colliders, animations, interactables } = ctx;
    this.playerStart.position = new THREE.Vector3(0, 1.65, 58);
    this.playerStart.yaw = 0;

    const materials = createMaterials(THREE, textures);
    scene.background = new THREE.Color(0x050a16);
    scene.fog = new THREE.FogExp2(0x07101c, 0.014);

    scene.add(new THREE.AmbientLight(0x89b8ff, 0.32));
    const moon = new THREE.DirectionalLight(0xb9d1ff, 0.75);
    moon.position.set(-35, 65, 20);
    scene.add(moon);
    const warmFill = new THREE.HemisphereLight(0xffc486, 0x07101c, 0.42);
    scene.add(warmFill);

    buildSky(THREE, scene, textures, animations);
    buildGround(THREE, scene, materials, textures);
    buildStreets(THREE, scene, materials);
    buildQuarterBlocks(THREE, scene, materials, textures, colliders, interactables);
    buildSquare(THREE, scene, materials, textures, colliders, interactables);
    buildStreetFurniture(THREE, scene, materials, animations, interactables);
    buildBoundary(THREE, scene, materials, colliders);
  }
};

function createMaterials(THREE, textures) {
  const paving = textures.load('paving_roughness.jpg', { repeat: [28, 28] });
  const pavingBump = textures.load('paving_roughness.jpg', { repeat: [28, 28], colorSpace: THREE.NoColorSpace });
  const nightSky = textures.load('night_sky.gif', { repeat: [1, 1] });
  const pixelBrick = textures.load('pixel_brick.gif', { repeat: [3, 3] });
  const wood = textures.load('pixel_wood.gif', { repeat: [5, 1] });
  const carpet = textures.load('theater_carpet.webp', { repeat: [2, 2] });
  const mardi = textures.load('mardi_gras_street.gif', { repeat: [1, 1] });
  const rugGold = textures.load('rug_medallion_gold.gif', { repeat: [1, 1] });
  const rugRed = textures.load('rug_medallion_red.gif', { repeat: [1, 1] });
  const ironTex = textures.wroughtIron();
  const warmWindow = textures.warmWindow();

  return {
    paving: new THREE.MeshStandardMaterial({ color: 0x77777a, map: paving, bumpMap: pavingBump, bumpScale: 0.08, roughness: 0.96, metalness: 0.02 }),
    asphalt: new THREE.MeshStandardMaterial({ color: 0x10131a, roughness: 0.92, metalness: 0.05 }),
    sidewalk: new THREE.MeshStandardMaterial({ color: 0xa9a197, roughness: 0.88 }),
    curb: new THREE.MeshStandardMaterial({ color: 0x3d3d3d, roughness: 0.9 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x161b22, map: ironTex, roughness: 0.42, metalness: 0.72, transparent: true }),
    ironSolid: new THREE.MeshStandardMaterial({ color: 0x0d1118, roughness: 0.5, metalness: 0.8 }),
    warmWindow: new THREE.MeshBasicMaterial({ map: warmWindow, transparent: false }),
    darkGlass: new THREE.MeshStandardMaterial({ color: 0x071221, emissive: 0x090c15, roughness: 0.2, metalness: 0.1 }),
    roof: new THREE.MeshStandardMaterial({ color: 0x1a1c24, roughness: 0.85 }),
    trim: new THREE.MeshStandardMaterial({ color: 0xe7d8bd, roughness: 0.72 }),
    brick: new THREE.MeshStandardMaterial({ map: pixelBrick, color: 0xf2d5b7, roughness: 0.82 }),
    wood: new THREE.MeshStandardMaterial({ map: wood, color: 0xc28d54, roughness: 0.86 }),
    carpet: new THREE.MeshBasicMaterial({ map: carpet }),
    mardi: new THREE.MeshBasicMaterial({ map: mardi }),
    rugGold: new THREE.MeshBasicMaterial({ map: rugGold }),
    rugRed: new THREE.MeshBasicMaterial({ map: rugRed }),
    sky: new THREE.MeshBasicMaterial({ map: nightSky, side: THREE.BackSide, fog: false }),
    plant: new THREE.MeshStandardMaterial({ color: 0x2f7c4f, roughness: 0.9 }),
    plantDark: new THREE.MeshStandardMaterial({ color: 0x145432, roughness: 0.9 }),
    neonPink: new THREE.MeshBasicMaterial({ map: textures.neonText('BAR', '#ff4fd8', '#ffd1ff'), transparent: true }),
    neonCyan: new THREE.MeshBasicMaterial({ map: textures.neonText('JAZZ', '#4deaff', '#e2fdff'), transparent: true }),
    neonAmber: new THREE.MeshBasicMaterial({ map: textures.neonText('OYSTERS', '#ffba4d', '#fff0b5'), transparent: true }),
    neonGreen: new THREE.MeshBasicMaterial({ map: textures.neonText('COURTYARD', '#73ff8a', '#e7ffb6'), transparent: true }),
    stuccoPalette: [
      new THREE.MeshStandardMaterial({ map: textures.stucco('#5d514b', '#91776b'), roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ map: textures.stucco('#564b57', '#8b758f'), roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ map: textures.stucco('#625745', '#9a845c'), roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ map: textures.stucco('#4f5d5a', '#82948c'), roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ map: textures.stucco('#6a4b43', '#a27a6b'), roughness: 0.9 })
    ]
  };
}

function buildSky(THREE, scene, textures, animations) {
  const dome = new THREE.Mesh(new THREE.SphereGeometry(420, 48, 32), new THREE.MeshBasicMaterial({ map: textures.load('night_sky.gif'), side: THREE.BackSide, fog: false }));
  dome.rotation.y = Math.PI * 0.18;
  scene.add(dome);
  const stars = new THREE.BufferGeometry();
  const count = 1100;
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 110 + Math.random() * 270;
    positions[i * 3] = Math.cos(a) * r;
    positions[i * 3 + 1] = 28 + Math.random() * 120;
    positions[i * 3 + 2] = Math.sin(a) * r;
    phases[i] = Math.random() * Math.PI * 2;
  }
  stars.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.55, transparent: true, opacity: 0.86, fog: false });
  const starField = new THREE.Points(stars, starMat);
  scene.add(starField);
  animations.push((dt, t) => {
    dome.rotation.y += dt * 0.008;
    starMat.opacity = 0.68 + Math.sin(t * 0.8) * 0.12;
  });
}

function buildGround(THREE, scene, materials) {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 160, 24, 24), materials.paving);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  scene.add(ground);
}

function buildStreets(THREE, scene, materials) {
  const streetXs = [-54, -18, 18, 54];
  const streetZs = [-48, -16, 16, 48];
  for (const z of streetZs) addStreet(THREE, scene, materials, 0, z, 176, 9.5, 0);
  for (const x of streetXs) addStreet(THREE, scene, materials, x, 0, 148, 9.5, Math.PI / 2);
  const railMat = new THREE.MeshStandardMaterial({ color: 0x5c5553, metalness: 0.65, roughness: 0.36 });
  for (const offset of [-1.2, 1.2]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(160, 0.05, 0.08), railMat);
    rail.position.set(0, 0.043, 64 + offset);
    scene.add(rail);
  }
}

function addStreet(THREE, scene, materials, x, z, length, width, rot) {
  const road = new THREE.Mesh(new THREE.PlaneGeometry(length, width), materials.asphalt);
  road.rotation.x = -Math.PI / 2;
  road.rotation.z = rot;
  road.position.set(x, 0.018, z);
  scene.add(road);

  const stripeMat = new THREE.MeshBasicMaterial({ color: 0xdccda5, transparent: true, opacity: 0.42 });
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(length, 0.13), stripeMat);
  stripe.rotation.x = -Math.PI / 2;
  stripe.rotation.z = rot;
  stripe.position.set(x, 0.024, z);
  scene.add(stripe);

  for (const side of [-1, 1]) {
    const walk = new THREE.Mesh(new THREE.PlaneGeometry(length, 2.3), materials.sidewalk);
    walk.rotation.x = -Math.PI / 2;
    walk.rotation.z = rot;
    const dx = Math.sin(rot) * side * (width / 2 + 1.15);
    const dz = Math.cos(rot) * side * (width / 2 + 1.15);
    walk.position.set(x + dx, 0.026, z + dz);
    scene.add(walk);
  }
}

function buildQuarterBlocks(THREE, scene, materials, textures, colliders, interactables) {
  const blocks = [];
  const xs = [-72, -36, 0, 36, 72];
  const zs = [-64, -32, 0, 32, 64];
  for (let xi = 0; xi < xs.length - 1; xi++) {
    for (let zi = 0; zi < zs.length - 1; zi++) {
      const x1 = xs[xi] + 7.2;
      const x2 = xs[xi + 1] - 7.2;
      const z1 = zs[zi] + 7.2;
      const z2 = zs[zi + 1] - 7.2;
      if (Math.abs((x1 + x2) / 2) < 20 && Math.abs((z1 + z2) / 2) < 20) continue;
      blocks.push({ x1, x2, z1, z2 });
    }
  }

  let seed = 0;
  for (const b of blocks) {
    addBlockSide(THREE, scene, materials, textures, colliders, interactables, b.x1, b.x2, b.z1, 'north', seed++);
    addBlockSide(THREE, scene, materials, textures, colliders, interactables, b.x1, b.x2, b.z2, 'south', seed++);
    addBlockSide(THREE, scene, materials, textures, colliders, interactables, b.z1, b.z2, b.x1, 'west', seed++);
    addBlockSide(THREE, scene, materials, textures, colliders, interactables, b.z1, b.z2, b.x2, 'east', seed++);
  }
}

function addBlockSide(THREE, scene, materials, textures, colliders, interactables, a1, a2, fixed, side, seed) {
  const sideIsZ = side === 'north' || side === 'south';
  const depthSign = side === 'north' || side === 'west' ? 1 : -1;
  const normalYaw = side === 'north' ? 0 : side === 'south' ? Math.PI : side === 'west' ? Math.PI / 2 : -Math.PI / 2;
  let cursor = a1;
  while (cursor < a2 - 4) {
    const width = Math.min(a2 - cursor, 6 + ((seed + Math.floor(cursor * 10)) % 5));
    const depth = 7 + ((seed + Math.floor(cursor)) % 4);
    const floors = 2 + ((seed + Math.floor(cursor * 3)) % 3);
    const height = floors * 3.15 + 1.4;
    const centerA = cursor + width / 2;
    const material = materials.stuccoPalette[Math.abs(seed + Math.floor(centerA)) % materials.stuccoPalette.length];
    const shopNames = ['BAR', 'JAZZ', 'OYSTERS', 'COURTYARD'];
    const sign = shopNames[Math.abs(seed + Math.floor(centerA * 2)) % shopNames.length];
    const group = makeBuilding(THREE, materials, textures, { width, depth, height, floors, material, sign, seed });
    if (sideIsZ) group.position.set(centerA, 0, fixed + depthSign * depth / 2);
    else group.position.set(fixed + depthSign * depth / 2, 0, centerA);
    group.rotation.y = normalYaw;
    scene.add(group);
    registerBox(group.position.x, group.position.z, sideIsZ ? width : depth, sideIsZ ? depth : width, colliders);
    if ((seed + Math.floor(cursor)) % 7 === 0) {
      const worldPos = new THREE.Vector3(group.position.x, 1.4, group.position.z);
      worldPos.x += Math.sin(normalYaw) * -2.8;
      worldPos.z += Math.cos(normalYaw) * -2.8;
      interactables.push({
        label: `inspect ${sign.toLowerCase()} facade`,
        title: `${sign} FACADE`,
        position: worldPos,
        text: `${sign} is built as a reusable facade module: stucco texture, warm window planes, shutters, sign glow, balcony railings, and collision box. New buildings can now be added as data instead of rewriting the whole world.`
      });
    }
    cursor += width + 0.5;
    seed += 1;
  }
}

function makeBuilding(THREE, materials, textures, options) {
  const { width, depth, height, floors, material, sign, seed } = options;
  const g = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  shell.position.y = height / 2;
  g.add(shell);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 0.6, 0.35, depth + 0.6), materials.roof);
  roof.position.y = height + 0.16;
  g.add(roof);

  const cornice = new THREE.Mesh(new THREE.BoxGeometry(width + 0.8, 0.28, 0.28), materials.trim);
  cornice.position.set(0, height - 0.25, -depth / 2 - 0.17);
  g.add(cornice);

  const doorW = Math.min(1.45, width * 0.28);
  const door = new THREE.Mesh(new THREE.BoxGeometry(doorW, 2.25, 0.08), materials.darkGlass);
  door.position.set(0, 1.15, -depth / 2 - 0.055);
  g.add(door);

  const signMaterial = sign === 'BAR' ? materials.neonPink : sign === 'JAZZ' ? materials.neonCyan : sign === 'OYSTERS' ? materials.neonAmber : materials.neonGreen;
  const signPlane = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(width * 0.72, 5.4), 1.18), signMaterial);
  signPlane.position.set(0, 2.85, -depth / 2 - 0.08);
  g.add(signPlane);

  const awningMat = new THREE.MeshStandardMaterial({ color: seed % 2 ? 0x7a1436 : 0x17496a, roughness: 0.8 });
  const awning = new THREE.Mesh(new THREE.BoxGeometry(Math.min(width * 0.68, 5.2), 0.28, 1.05), awningMat);
  awning.position.set(0, 2.36, -depth / 2 - 0.52);
  awning.rotation.x = -0.18;
  g.add(awning);

  const windowMat = materials.warmWindow;
  const shutterMat = new THREE.MeshStandardMaterial({ color: seed % 3 === 0 ? 0x23415a : seed % 3 === 1 ? 0x315338 : 0x5f2537, roughness: 0.76 });
  const columns = Math.max(2, Math.floor(width / 2.3));
  for (let floor = 0; floor < floors; floor++) {
    const y = 1.45 + floor * 3.05;
    for (let c = 0; c < columns; c++) {
      const x = -width * 0.39 + (columns === 1 ? 0 : c * (width * 0.78 / (columns - 1)));
      if (floor === 0 && Math.abs(x) < doorW * 0.75) continue;
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 1.35), windowMat);
      win.position.set(x, y, -depth / 2 - 0.07);
      g.add(win);
      const left = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.45, 0.06), shutterMat);
      const right = left.clone();
      left.position.set(x - 0.58, y, -depth / 2 - 0.09);
      right.position.set(x + 0.58, y, -depth / 2 - 0.09);
      g.add(left, right);
    }
  }

  if (floors >= 2) {
    const gallery = makeBalcony(THREE, materials, width + 0.6, textures);
    gallery.position.set(0, 3.32, -depth / 2 - 0.82);
    g.add(gallery);
    for (let x = -width / 2 + 0.8; x <= width / 2 - 0.8; x += 2.3) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 3.1, 10), materials.ironSolid);
      post.position.set(x, 1.7, -depth / 2 - 0.96);
      g.add(post);
    }
  }

  if (seed % 5 === 0) {
    const mural = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(width * 0.72, 5.6), 2.0), materials.mardi);
    mural.position.set(0, height * 0.68, -depth / 2 - 0.085);
    g.add(mural);
  }

  return g;
}

function makeBalcony(THREE, materials, width) {
  const g = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(width, 0.12, 1.25), materials.wood);
  deck.position.y = 0;
  g.add(deck);
  const rail = new THREE.Mesh(new THREE.PlaneGeometry(width, 0.82), materials.iron);
  rail.position.set(0, 0.52, -0.64);
  g.add(rail);
  const top = new THREE.Mesh(new THREE.BoxGeometry(width, 0.08, 0.08), materials.ironSolid);
  top.position.set(0, 0.93, -0.67);
  g.add(top);
  return g;
}

function buildSquare(THREE, scene, materials, textures, colliders, interactables) {
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(32, 32), materials.paving);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, 0.04, 0);
  scene.add(plaza);

  const fenceMat = materials.ironSolid;
  for (const z of [-16, 16]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(34, 0.25, 0.15), fenceMat);
    rail.position.set(0, 1.05, z);
    scene.add(rail);
  }
  for (const x of [-16, 16]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.25, 34), fenceMat);
    rail.position.set(x, 1.05, 0);
    scene.add(rail);
  }

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 0.8, 20), materials.trim);
  base.position.set(0, 0.45, 0);
  scene.add(base);
  const statue = new THREE.Group();
  const horse = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.9, 0.9), new THREE.MeshStandardMaterial({ color: 0x4d4035, roughness: 0.55, metalness: 0.3 }));
  horse.position.y = 1.35;
  statue.add(horse);
  const rider = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 1.3, 12), new THREE.MeshStandardMaterial({ color: 0x5b4b3b, roughness: 0.55, metalness: 0.3 }));
  rider.position.set(0.15, 2.15, 0);
  statue.add(rider);
  statue.position.set(0, 0.55, 0);
  scene.add(statue);

  const cathedral = makeCathedralFacade(THREE, materials);
  cathedral.position.set(0, 0, -31);
  scene.add(cathedral);
  registerBox(0, -34, 27, 7, colliders);

  const rug = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), materials.rugGold);
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(27, 0.052, 6);
  scene.add(rug);

  interactables.push({
    label: 'inspect Cathedral Square',
    title: 'CATHEDRAL SQUARE',
    position: new THREE.Vector3(0, 1.5, -12),
    text: 'This central square is the anchor landmark. The next repo iteration can swap this stylized facade for a dedicated St. Louis Cathedral module, but this build already has collision, lamps, plaza geometry, and an inspect point.'
  });
}

function makeCathedralFacade(THREE, materials) {
  const g = new THREE.Group();
  const facadeMat = new THREE.MeshStandardMaterial({ color: 0xd8d2c5, roughness: 0.85 });
  const main = new THREE.Mesh(new THREE.BoxGeometry(18, 14, 2.2), facadeMat);
  main.position.y = 7;
  g.add(main);
  for (const x of [-8.2, 8.2]) {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(4.5, 20, 2.4), facadeMat);
    tower.position.set(x, 10, 0);
    g.add(tower);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(2.6, 7, 4), facadeMat);
    spire.position.set(x, 23.5, 0);
    spire.rotation.y = Math.PI / 4;
    g.add(spire);
  }
  const rose = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), materials.warmWindow);
  rose.position.set(0, 10.7, -1.13);
  g.add(rose);
  const door = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.4, 0.1), materials.darkGlass);
  door.position.set(0, 2.2, -1.16);
  g.add(door);
  return g;
}

function buildStreetFurniture(THREE, scene, materials, animations, interactables) {
  const lampPositions = [];
  for (const z of [-48, -16, 16, 48]) for (const x of [-70, -44, -18, 18, 44, 70]) lampPositions.push([x, z + 5.7]);
  for (const x of [-54, -18, 18, 54]) for (const z of [-62, -35, -8, 8, 35, 62]) lampPositions.push([x + 5.7, z]);
  for (let i = 0; i < lampPositions.length; i++) {
    const [x, z] = lampPositions[i];
    const lamp = makeGasLamp(THREE, materials, animations, i);
    lamp.position.set(x, 0, z);
    scene.add(lamp);
  }

  for (const [x, z, rot] of [[-28, 27, 0.2], [39, -38, -0.5], [66, 22, 0.7], [-61, -49, -0.2]]) {
    const oak = makeLiveOak(THREE, materials);
    oak.position.set(x, 0, z);
    oak.rotation.y = rot;
    scene.add(oak);
  }

  const streetcar = makeStreetcar(THREE, materials);
  scene.add(streetcar);
  animations.push((dt, t) => {
    streetcar.position.x = -78 + ((t * 7) % 156);
    streetcar.position.z = 64;
  });

  interactables.push({
    label: 'inspect streetcar line',
    title: 'STREETCAR LINE',
    position: new THREE.Vector3(-10, 1.5, 63),
    text: 'The streetcar is deliberately lightweight: a moving group plus two rail strips. It gives the world life without loading a heavy model file.'
  });
}

function makeGasLamp(THREE, materials, animations, index) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.0, 10), materials.ironSolid);
  post.position.y = 1.5;
  g.add(post);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.42), new THREE.MeshStandardMaterial({ color: 0x20160d, emissive: 0x2b1608, roughness: 0.35 }));
  head.position.y = 3.15;
  g.add(head);
  const glow = new THREE.PointLight(0xffb45e, 0.75, 14, 1.8);
  glow.position.y = 3.15;
  g.add(glow);
  animations.push((dt, t) => {
    glow.intensity = 0.58 + Math.sin(t * 4.2 + index) * 0.08 + Math.random() * 0.04;
  });
  return g;
}

function makeLiveOak(THREE, materials) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.68, 5.2, 10), new THREE.MeshStandardMaterial({ color: 0x4b3323, roughness: 0.92 }));
  trunk.position.y = 2.6;
  g.add(trunk);
  for (const [x, y, z, sx, sy, sz] of [[0, 5.7, 0, 4.8, 2.0, 4.2], [-2.4, 5.0, -0.4, 3.7, 1.7, 3.0], [2.1, 5.1, 0.8, 3.5, 1.8, 3.4]]) {
    const crown = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), materials.plantDark);
    crown.position.set(x, y, z);
    crown.scale.set(sx, sy, sz);
    g.add(crown);
  }
  return g;
}

function makeStreetcar(THREE, materials) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x9b1f22, roughness: 0.66, metalness: 0.08 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xf0c75e, roughness: 0.5 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(9, 2.7, 2.4), bodyMat);
  body.position.y = 1.6;
  g.add(body);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.38, 2.7), trimMat);
  roof.position.y = 3.1;
  g.add(roof);
  for (let x = -3.4; x <= 3.4; x += 1.7) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.8), materials.warmWindow);
    win.position.set(x, 1.85, -1.23);
    g.add(win);
  }
  return g;
}

function buildBoundary(THREE, scene, materials, colliders) {
  const walls = [
    { x: 0, z: -78, w: 180, d: 2 },
    { x: 0, z: 78, w: 180, d: 2 },
    { x: -89, z: 0, w: 2, d: 160 },
    { x: 89, z: 0, w: 2, d: 160 }
  ];
  for (const b of walls) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(b.w, 8, b.d), materials.brick);
    wall.position.set(b.x, 4, b.z);
    scene.add(wall);
    registerBox(b.x, b.z, b.w, b.d, colliders);
  }
}

function registerBox(cx, cz, width, depth, colliders) {
  colliders.push({ minX: cx - width / 2, maxX: cx + width / 2, minZ: cz - depth / 2, maxZ: cz + depth / 2 });
}
