// Game setup, day/night, input, combat, chests, held item, crafting, save/load and render loop
let scene, camera, renderer, clock, steve, highlight, sun, hemi;
let locked = false, openedModal = null, thirdPerson = false;
let breakState = null, isNight = false;
let hand = null, handKey = '', swingT = 0;
let crackMesh = null;
const crackTex = [];
const dropsList = [];
const torchLights = [];
const itemTexCache = {};
const DAY_LEN = 240;
let dayTime = 30;
let chunkTimer = 0, spawnTimer = 3, hudTimer = 0;
let looted = new Set();
const SAVE_KEY = 'mineking_save_v2';

const overlay = document.getElementById('overlay');
const panel = document.getElementById('panel');
const craftpanel = document.getElementById('craftpanel');
const furnacepanel = document.getElementById('furnacepanel');
const progressEl = document.getElementById('progress');
const progressBar = progressEl.firstElementChild;
const infoEl = document.getElementById('info');
const flashEl = document.getElementById('flash');
const msgEl = document.getElementById('msg');
const skyDay = new THREE.Color(0x87ceeb), skyNight = new THREE.Color(0x070b22);

function showMsg(t){
  msgEl.textContent = t;
  msgEl.style.opacity = 1;
  clearTimeout(msgEl._t);
  msgEl._t = setTimeout(() => msgEl.style.opacity = 0, 2200);
}

function damagePlayer(d, pure){
  if (Player.health <= 0) return;
  if (!pure){
    const pts = Inventory.armorPoints();
    d = Math.max(1, Math.round(d * (1 - pts / 28)));
  }
  Player.health -= d;
  Sound.hurt();
  flashEl.style.opacity = 0.5;
  setTimeout(() => flashEl.style.opacity = 0, 130);
  Inventory.renderHUD();
  if (Player.health <= 0){
    showMsg('\ud83d\udc80 Tum mar gaye! Respawn...');
    Player.health = 20; Player.hunger = 20;
    Player.spawn();
  }
}

function loadData(){
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; }
}
function saveGame(){
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      seed: World.seed, edits: [...World.edits], looted: [...looted],
      px: Player.pos.x, py: Player.pos.y, pz: Player.pos.z,
      yaw: Player.yaw, pitch: Player.pitch,
      health: Player.health, hunger: Player.hunger,
      counts: Inventory.counts, tools: Inventory.tools,
      armorUnlocked: Inventory.armorUnlocked, equipped: Inventory.equipped,
      hasTable: Inventory.hasTable,
      dayTime,
    }));
  } catch (e) {}
}
function newWorld(){
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}

init();

function init(){
  scene = new THREE.Scene();
  scene.background = skyDay.clone();
  scene.fog = new THREE.Fog(skyDay.clone(), 45, 120);
  camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 500);
  camera.rotation.order = 'YXZ';
  scene.add(camera); // needed so the held item (camera child) renders
  renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(renderer.domElement);

  hemi = new THREE.HemisphereLight(0xeeeeff, 0x668844, 0.9);
  scene.add(hemi);
  sun = new THREE.DirectionalLight(0xfff2cc, 0.8);
  sun.position.set(60, 100, 40);
  scene.add(sun);
  // torch light pool: nearest placed torches get real light
  for (let i = 0; i < 6; i++){
    const l = new THREE.PointLight(0xffb050, 0, 10);
    scene.add(l); torchLights.push(l);
  }

  const sd = loadData();
  World.init(sd ? sd.seed : (Date.now() % 1000000007));
  if (sd){
    World.edits = new Map(sd.edits);
    looted = new Set(sd.looted || []);
    Object.assign(Inventory.counts, sd.counts || {});
    Object.assign(Inventory.tools, sd.tools || {});
    Object.assign(Inventory.armorUnlocked, sd.armorUnlocked || {});
    Object.assign(Inventory.equipped, sd.equipped || {});
    Inventory.hasTable = !!sd.hasTable;
    Player.health = sd.health ?? 20;
    Player.hunger = sd.hunger ?? 20;
    dayTime = sd.dayTime ?? 30;
  }

  let scx = 0, scz = 0;
  if (sd){ scx = Math.floor(sd.px / 16); scz = Math.floor(sd.pz / 16); }
  for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++)
    World.buildChunk(scene, scx + dx, scz + dz);

  if (sd){
    Player.pos.set(sd.px, sd.py, sd.pz);
    Player.yaw = sd.yaw || 0; Player.pitch = sd.pitch || 0;
  } else {
    Player.spawn();
  }

  steve = createSteve(); steve.visible = false; scene.add(steve);

  highlight = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1.002, 1.002, 1.002)),
    new THREE.LineBasicMaterial({ color: 0x111111 }));
  highlight.visible = false; scene.add(highlight);

  // Minecraft-style block crack overlay
  loadCrackTextures();
  crackMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.005, 1.005, 1.005),
    new THREE.MeshBasicMaterial({ map: crackTex[0], transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  crackMesh.visible = false; scene.add(crackMesh);

  Inventory.renderHotbar(); Inventory.renderHUD(); Inventory.renderPanel(); Inventory.renderCraft();
  bindEvents();
  setInterval(saveGame, 8000);
  addEventListener('beforeunload', saveGame);
  clock = new THREE.Clock();
  animate();
}

function bindEvents(){
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
  overlay.addEventListener('click', e => {
    if (e.target.id === 'btn-new'){ newWorld(); return; }
    Sound.init();
    renderer.domElement.requestPointerLock();
  });
  document.addEventListener('pointerlockchange', () => {
    locked = document.pointerLockElement === renderer.domElement;
    overlay.style.display = (locked || openedModal) ? 'none' : 'flex';
    if (!locked){ Player.keys = {}; breakState = null; }
  });
  document.addEventListener('mousemove', e => {
    if (!locked) return;
    Player.yaw -= e.movementX * 0.0022;
    Player.pitch -= e.movementY * 0.0022;
    Player.pitch = Math.max(-1.55, Math.min(1.55, Player.pitch));
  });
  document.addEventListener('keydown', e => {
    if (e.code === 'KeyV' || e.code === 'F5'){ e.preventDefault(); thirdPerson = !thirdPerson; return; }
    if (e.code === 'KeyE'){ e.preventDefault(); toggleModal(panel); return; }
    if (e.code === 'KeyC'){ e.preventDefault(); Inventory.renderCraft(); toggleModal(craftpanel); return; }
    if (e.code === 'KeyM'){ Sound.muted = !Sound.muted; showMsg(Sound.muted ? '\ud83d\udd07 Sound band' : '\ud83d\udd0a Sound chalu'); return; }
    if (locked){
      Player.keys[e.code] = true;
      if (e.code.startsWith('Digit')){
        const n = +e.code.slice(5);
        if (n >= 1 && n <= 9) Inventory.select(n - 1);
      }
    }
  });
  document.addEventListener('keyup', e => { Player.keys[e.code] = false; });
  addEventListener('wheel', e => { if (locked) Inventory.select(Inventory.sel + (e.deltaY > 0 ? 1 : -1)); });
  document.addEventListener('mousedown', e => {
    if (!locked) return;
    swingT = 0.25;
    if (e.button === 0){ if (!tryAttack()) Player.keys.__break = true; }
    if (e.button === 2) rightClick();
  });
  document.addEventListener('mouseup', e => {
    if (e.button === 0){ Player.keys.__break = false; breakState = null; }
  });
  document.addEventListener('contextmenu', e => e.preventDefault());
}

function toggleModal(el){
  if (openedModal === el){ closeModal(); return; }
  if (openedModal) openedModal.style.display = 'none';
  openedModal = el;
  el.style.display = 'block';
  document.exitPointerLock();
}
function closeModal(){
  if (openedModal) openedModal.style.display = 'none';
  openedModal = null;
  renderer.domElement.requestPointerLock();
}
function closePanel(){ closeModal(); }
function closeCraft(){ closeModal(); }
function closeFurnace(){ closeModal(); }

// Fast voxel raycast (DDA)
function getTarget(){
  const dir = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);
  const o = new THREE.Vector3(Player.pos.x, Player.pos.y + Player.EYE, Player.pos.z);
  let x = Math.floor(o.x), y = Math.floor(o.y), z = Math.floor(o.z);
  const sx = dir.x >= 0 ? 1 : -1, sy = dir.y >= 0 ? 1 : -1, sz = dir.z >= 0 ? 1 : -1;
  const tdx = Math.abs(1 / (dir.x || 1e-9)), tdy = Math.abs(1 / (dir.y || 1e-9)), tdz = Math.abs(1 / (dir.z || 1e-9));
  let tmx = (sx > 0 ? (x + 1 - o.x) : (o.x - x)) * tdx;
  let tmy = (sy > 0 ? (y + 1 - o.y) : (o.y - y)) * tdy;
  let tmz = (sz > 0 ? (z + 1 - o.z) : (o.z - z)) * tdz;
  let nx = 0, ny = 0, nz = 0, t = 0;
  for (let i = 0; i < 64; i++){
    if (tmx < tmy && tmx < tmz){ x += sx; t = tmx; tmx += tdx; nx = -sx; ny = 0; nz = 0; }
    else if (tmy < tmz){ y += sy; t = tmy; tmy += tdy; nx = 0; ny = -sy; nz = 0; }
    else { z += sz; t = tmz; tmz += tdz; nx = 0; ny = 0; nz = -sz; }
    if (t > 6) return null;
    const bt = World.get(x, y, z);
    if (bt && bt !== 9) return { x, y, z, type: bt, n: { x: nx, y: ny, z: nz } };
  }
  return null;
}

function tryAttack(){
  if (!Mobs.list.length) return false;
  const rc = new THREE.Raycaster();
  rc.far = 3.5;
  rc.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = rc.intersectObjects(Mobs.list.map(m => m.model), true);
  if (!hits.length) return false;
  let o = hits[0].object;
  while (o && !(o.userData && o.userData.mobRef)) o = o.parent;
  if (!o) return false;
  const s = Inventory.slot();
  const dmg = (s.kind === 'tool' && s.tool === 'sword') ? Inventory.swordDamage() : 2;
  const dir = new THREE.Vector3(-Math.sin(Player.yaw), 0, -Math.cos(Player.yaw));
  Mobs.damage(o.userData.mobRef, dmg, dir, scene);
  Sound.hit();
  return true;
}

function eatFood(){
  if (Inventory.counts.food <= 0 && Inventory.counts.rawfood <= 0){
    Sound.deny(); showMsg('Khana khatam! Janwar maaro ya leaves todo'); return;
  }
  if (Player.hunger >= 19.5){ Sound.deny(); return; }
  if (Inventory.counts.food > 0){
    Inventory.counts.food--;
    Player.hunger = Math.min(20, Player.hunger + 7);
  } else {
    Inventory.counts.rawfood--;
    Player.hunger = Math.min(20, Player.hunger + 3);
    showMsg('🥩 Raw khana (+3) - furnace mein pakao to +7 milega!');
  }
  Sound.eat();
  Inventory.renderHotbar(); Inventory.renderHUD();
}

function lootChest(x, y, z){
  const k = x + '|' + y + '|' + z;
  if (looted.has(k)){ showMsg('Chest khali hai'); Sound.deny(); return; }
  looted.add(k);
  const gains = [];
  const add = (item, n, label) => { if (n > 0){ Inventory.counts[item] += n; gains.push('+' + n + ' ' + label); } };
  add('iron', Math.floor(Math.random() * 4), 'Iron');
  add('coal', Math.floor(Math.random() * 5), 'Coal');
  if (Math.random() < 0.35) add('diamond', 1 + Math.floor(Math.random() * 2), 'Diamond');
  add('food', 1 + Math.floor(Math.random() * 3), 'Khana');
  add('stick', Math.floor(Math.random() * 5), 'Stick');
  add('planks', Math.floor(Math.random() * 7), 'Planks');
  showMsg('\ud83c\udf81 Loot: ' + (gains.join(', ') || 'kuch nahi mila'));
  Sound.craft();
  Inventory.renderHotbar();
}

function rightClick(){
  const t = getTarget();
  if (t && t.type === 13){ lootChest(t.x, t.y, t.z); return; }
  if (t && t.type === 17){ Inventory.renderFurnace(); toggleModal(furnacepanel); return; }
  if (t && (t.type === 20 || t.type === 21)){
    if (t.type === 21 && Player.intersectsBlock(t.x, t.y, t.z)){ Sound.deny(); return; }
    World.set(t.x, t.y, t.z, t.type === 20 ? 21 : 20);
    World.rebuildAt(scene, t.x, t.z);
    Sound.place();
    return;
  }
  const s = Inventory.slot();
  if (s.kind === 'food'){ eatFood(); return; }
  if (s.kind !== 'block') return;
  if ((Inventory.counts[s.item] || 0) <= 0){ Sound.deny(); showMsg('Blocks khatam! Mine karke jama karo'); return; }
  if (!t) return;
  const x = t.x + t.n.x, y = t.y + t.n.y, z = t.z + t.n.z;
  const cur = World.get(x, y, z);
  if (cur !== 0 && cur !== 9) return;
  if (Player.intersectsBlock(x, y, z)) return;
  World.set(x, y, z, s.id);
  World.rebuildAt(scene, x, z);
  Inventory.counts[s.item]--;
  Inventory.renderHotbar();
  Sound.place();
}

function updateBreaking(dt, target){
  if (!Player.keys.__break || !target || !BLOCKS[target.type] || BLOCKS[target.type].hard === Infinity){
    breakState = null; progressEl.style.display = 'none';
    if (crackMesh) crackMesh.visible = false;
    return;
  }
  if (!breakState || breakState.x !== target.x || breakState.y !== target.y || breakState.z !== target.z){
    const b = BLOCKS[target.type];
    const s = Inventory.slot();
    let time = b.hard * 0.35;
    if (s.kind === 'tool' && s.tool === b.tool) time /= Inventory.toolSpeed(s.tool);
    breakState = { x: target.x, y: target.y, z: target.z, progress: 0, time: Math.max(time, 0.08) };
  }
  breakState.progress += dt;
  progressEl.style.display = 'block';
  progressBar.style.width = Math.min(100, breakState.progress / breakState.time * 100) + '%';
  // crack animation (destroy stages)
  if (crackMesh){
    crackMesh.visible = true;
    crackMesh.position.set(breakState.x + 0.5, breakState.y + 0.5, breakState.z + 0.5);
    const st = Math.min(9, Math.floor(breakState.progress / breakState.time * 10));
    if (crackTex[st] && crackMesh.material.map !== crackTex[st]){
      crackMesh.material.map = crackTex[st];
      crackMesh.material.needsUpdate = true;
    }
  }
  if (breakState.progress >= breakState.time){
    const bt = World.get(breakState.x, breakState.y, breakState.z);
    World.set(breakState.x, breakState.y, breakState.z, 0);
    World.rebuildAt(scene, breakState.x, breakState.z);
    spawnDrop(bt, breakState.x + 0.5, breakState.y + 0.6, breakState.z + 0.5);
    Sound.breakBlock();
    breakState = null; progressEl.style.display = 'none';
    if (crackMesh) crackMesh.visible = false;
  }
}

// crack textures: real destroy stages with procedural fallback
function makeCrackCanvas(stage){
  const c = document.createElement('canvas'); c.width = c.height = 16;
  const ctx = c.getContext('2d');
  let s = stage * 7919 + 13;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  ctx.strokeStyle = 'rgba(20,20,20,0.85)'; ctx.lineWidth = 1;
  for (let j = 0; j < (stage + 1) * 2; j++){
    ctx.beginPath();
    let x = rnd() * 16, y = rnd() * 16;
    ctx.moveTo(x, y);
    for (let k = 0; k < 3; k++){ x += (rnd() - 0.5) * 8; y += (rnd() - 0.5) * 8; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = t.minFilter = THREE.NearestFilter;
  return t;
}
function loadCrackTextures(){
  const base = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.4/assets/minecraft/textures/block/';
  for (let i = 0; i < 10; i++){
    crackTex[i] = makeCrackCanvas(i);
    ((idx) => {
      new THREE.TextureLoader().setCrossOrigin('anonymous').load(base + 'destroy_stage_' + idx + '.png', t => {
        t.magFilter = t.minFilter = THREE.NearestFilter;
        crackTex[idx] = t;
      }, undefined, () => {});
    })(i);
  }
}

// item drops: broken blocks pop out and get picked up like Minecraft
function spawnDrop(bt, x, y, z){
  if (!BLOCKS[bt]) return;
  const m = new THREE.Mesh(BLOCKS[bt].geo || World.boxGeo, BLOCKS[bt].mats);
  m.scale.set(0.25, 0.25, 0.25);
  m.position.set(x, y, z);
  scene.add(m);
  dropsList.push({ bt, mesh: m, vel: new THREE.Vector3((Math.random() - 0.5) * 2, 4, (Math.random() - 0.5) * 2), age: 0 });
}
function updateDrops(dt){
  for (let i = dropsList.length - 1; i >= 0; i--){
    const d = dropsList[i];
    d.age += dt;
    const p = d.mesh.position;
    const dx = Player.pos.x - p.x, dy = (Player.pos.y + 0.9) - p.y, dz = Player.pos.z - p.z;
    const dist = Math.hypot(dx, dy, dz);
    if (dist < 2.2 && d.age > 0.5){
      p.x += dx / dist * 8 * dt; p.y += dy / dist * 8 * dt; p.z += dz / dist * 8 * dt;
    } else {
      d.vel.y -= 18 * dt;
      p.addScaledVector(d.vel, dt);
      if (d.vel.y < 0 && World.isSolid(Math.floor(p.x), Math.floor(p.y - 0.13), Math.floor(p.z))){
        p.y = Math.floor(p.y - 0.13) + 1.13;
        d.vel.set(0, 0, 0);
      }
    }
    d.mesh.rotation.y += dt * 2.5;
    if (dist < 0.9 && d.age > 0.4){
      Inventory.addDrop(d.bt);
      Sound.pop();
      scene.remove(d.mesh);
      dropsList.splice(i, 1);
      continue;
    }
    if (d.age > 60){ scene.remove(d.mesh); dropsList.splice(i, 1); }
  }
}
function loadItemTex(url, cb){
  if (itemTexCache[url] === 'failed') return;
  if (itemTexCache[url]){ cb(itemTexCache[url]); return; }
  new THREE.TextureLoader().setCrossOrigin('anonymous').load(url, t => {
    t.magFilter = t.minFilter = THREE.NearestFilter;
    itemTexCache[url] = t;
    cb(t);
  }, undefined, () => { itemTexCache[url] = 'failed'; });
}

// Held item in hand (first person, Minecraft style - real item sprites when online)
function buildHand(s){
  const g = new THREE.Group();
  const useSprite = url => loadItemTex(url, tex => {
    while (g.children.length) g.remove(g.children[0]);
    const pl = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.5),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }));
    g.add(pl);
    g.rotation.set(0.15, 0.6, -0.35);
    g.userData.baseRx = 0.15;
  });
  if (s.kind === 'block'){
    const m = new THREE.Mesh(BLOCKS[s.id].geo || World.boxGeo, BLOCKS[s.id].mats);
    m.scale.set(0.28, 0.28, 0.28);
    g.add(m);
    g.rotation.set(0.2, 0.6, 0);
  } else if (s.kind === 'tool'){
    const tier = Inventory.tools[s.tool];
    const TC = { wood: '#8a6a3e', stone: '#9a9a9a', iron: '#d8d8d8', diamond: '#4aedd9' };
    const stickM = new THREE.MeshLambertMaterial({ color: '#6a4a2a' });
    const headM = new THREE.MeshLambertMaterial({ color: TC[tier] || '#d8d8d8' });
    const stick = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.45, 0.05), stickM);
    g.add(stick);
    if (s.tool === 'pickaxe'){
      const h = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.07), headM);
      h.position.y = 0.24; g.add(h);
    } else if (s.tool === 'axe'){
      const h = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.07), headM);
      h.position.set(0.08, 0.21, 0); g.add(h);
    } else {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.45, 0.03), headM);
      blade.position.y = 0.43; g.add(blade);
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.06), stickM);
      guard.position.y = 0.2; g.add(guard);
    }
    g.rotation.set(0.5, 0.3, -0.5);
    useSprite(Inventory.toolImg(s.tool));
  } else { // food
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.18), new THREE.MeshLambertMaterial({ color: '#a05a2a' }));
    g.add(m);
    g.rotation.set(0.2, 0.4, 0);
    useSprite(ITEM_TEX_BASE + 'cooked_beef.png');
  }
  g.position.set(0.42, -0.42, -0.65);
  g.userData.baseRx = g.rotation.x;
  return g;
}
function updateHand(){
  const s = Inventory.slot();
  const key = s.kind + (s.id || s.tool || 'food') + (s.kind === 'tool' ? Inventory.tools[s.tool] : '');
  if (key === handKey && hand) return;
  handKey = key;
  if (hand){ camera.remove(hand); hand = null; }
  hand = buildHand(s);
  camera.add(hand);
}

function surfaceY(x, z){
  for (let y = World.MAXY; y > 0; y--) if (World.isSolid(x, y, z)) return y + 1;
  return World.WATER + 1;
}

function trySpawns(){
  if (Mobs.count(true) < 8){
    const p = ['sheep', 'cow', 'pig'];
    spawnMob(p[Math.floor(Math.random() * p.length)]);
  }
  if (isNight && Mobs.count(false) < 8){
    const r = Math.random();
    spawnMob(r < 0.35 ? 'zombie' : r < 0.6 ? 'skeleton' : r < 0.8 ? 'spider' : 'creeper');
  }
}
function spawnMob(type){
  const a = Math.random() * Math.PI * 2, d = 14 + Math.random() * 16;
  const x = Math.floor(Player.pos.x + Math.cos(a) * d), z = Math.floor(Player.pos.z + Math.sin(a) * d);
  World.ensureChunk(Math.floor(x / 16), Math.floor(z / 16));
  const y = surfaceY(x, z);
  if (!World.isSolid(x, y - 1, z)) return;
  Mobs.spawn(type, x + 0.5, y, z + 0.5, scene);
}

function updateTorchLights(){
  const near = [];
  for (const k of World.torches){
    const p = k.split('|');
    const dx = +p[0] - Player.pos.x, dy = +p[1] - Player.pos.y, dz = +p[2] - Player.pos.z;
    const d2 = dx * dx + dy * dy + dz * dz;
    if (d2 < 900) near.push([d2, +p[0], +p[1], +p[2]]);
  }
  near.sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < torchLights.length; i++){
    const l = torchLights[i];
    if (i < near.length){
      l.position.set(near[i][1] + 0.5, near[i][2] + 0.7, near[i][3] + 0.5);
      l.intensity = isNight ? 1.5 : 0.5;
    } else l.intensity = 0;
  }
}

function updateSky(){
  const f = dayTime / DAY_LEN * Math.PI * 2;
  const sunH = Math.sin(f);
  const light = Math.max(0.05, Math.min(1, sunH * 1.3 + 0.2));
  const c = skyNight.clone().lerp(skyDay, light);
  scene.background.copy(c);
  scene.fog.color.copy(c);
  sun.intensity = 0.85 * Math.max(0.02, light);
  hemi.intensity = 0.2 + 0.75 * light;
  sun.position.set(Math.cos(f) * 100, Math.sin(f) * 100 + 20, 40);
  isNight = sunH < -0.12;
}

function updateCamera(){
  camera.rotation.y = Player.yaw;
  camera.rotation.x = Player.pitch;
  const eye = new THREE.Vector3(Player.pos.x, Player.pos.y + Player.EYE, Player.pos.z);
  if (thirdPerson){
    const dir = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);
    camera.position.copy(eye).addScaledVector(dir, -3.8);
  } else {
    camera.position.copy(eye);
  }
  steve.visible = thirdPerson;
}

function updateSteve(dt){
  if (!thirdPerson) return;
  steve.position.copy(Player.pos);
  steve.rotation.y = Player.yaw;
  const speed = Math.hypot(Player.vel.x, Player.vel.z);
  const u = steve.userData;
  u.phase += speed * dt * 2.2;
  const a = speed > 0.1 ? Math.sin(u.phase * 2) * 0.6 : 0;
  u.armL.rotation.x = a; u.armR.rotation.x = -a;
  u.legL.rotation.x = -a; u.legR.rotation.x = a;
}

function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (locked){
    dayTime = (dayTime + dt) % DAY_LEN;
    Player.update(dt);
    Mobs.update(dt, scene, isNight);
    spawnTimer -= dt;
    if (spawnTimer <= 0){ spawnTimer = 2.5; trySpawns(); }
    chunkTimer -= dt;
    if (chunkTimer <= 0){ chunkTimer = 0.25; World.updateLoaded(scene, Player.pos.x, Player.pos.z); }
    hudTimer -= dt;
    if (hudTimer <= 0){ hudTimer = 0.5; Inventory.renderHUD(); updateTorchLights(); }
    updateDrops(dt);
  }
  const target = locked ? getTarget() : null;
  if (target){
    highlight.visible = true;
    highlight.position.set(target.x + 0.5, target.y + 0.5, target.z + 0.5);
  } else highlight.visible = false;
  if (locked) updateBreaking(dt, target);
  if (Player.keys.__break && target) swingT = Math.max(swingT, 0.15);
  updateHand();
  if (hand){
    hand.visible = !thirdPerson;
    if (swingT > 0){
      swingT -= dt;
      const p = 1 - Math.max(swingT, 0) / 0.25;
      hand.rotation.x = hand.userData.baseRx - Math.sin(p * Math.PI) * 0.7;
    } else {
      hand.rotation.x = hand.userData.baseRx;
    }
  }
  updateSky();
  updateCamera();
  updateSteve(dt);
  infoEl.textContent = 'XYZ: ' + Player.pos.x.toFixed(1) + ' / ' + Player.pos.y.toFixed(1) + ' / ' + Player.pos.z.toFixed(1)
    + (isNight ? '  \ud83c\udf19 Raat - mobs se bacho!' : '  \u2600\ufe0f Din')
    + (thirdPerson ? '  \u00b7 3rd person (V)' : '');
  renderer.render(scene, camera);
}
