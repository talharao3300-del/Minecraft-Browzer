// Player physics, health, hunger and Steve character model
const Player = {
  pos: new THREE.Vector3(), vel: new THREE.Vector3(),
  yaw: 0, pitch: 0, onGround: false, inWater: false,
  W: 0.3, H: 1.8, EYE: 1.62,
  health: 20, hunger: 20, starveT: 0, regenT: 0,
  keys: {},
  spawn(){
    World.ensureChunk(0, 0);
    const bx = 8, bz = 8;
    let y = World.MAXY;
    while (y > 1 && !World.isSolid(bx, y - 1, bz)) y--;
    this.pos.set(bx + 0.5, y + 0.2, bz + 0.5);
    this.vel.set(0, 0, 0);
  },
  update(dt){
    const fx0 = Math.floor(this.pos.x), fz0 = Math.floor(this.pos.z);
    this.inWater = World.get(fx0, Math.floor(this.pos.y + 0.2), fz0) === 9
                || World.get(fx0, Math.floor(this.pos.y + 1), fz0) === 9;
    let mx = 0, mz = 0;
    if (this.keys['KeyW']) mz++;
    if (this.keys['KeyS']) mz--;
    if (this.keys['KeyD']) mx++;
    if (this.keys['KeyA']) mx--;
    const sprinting = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) && (mx || mz);
    const sp = sprinting ? 7 : 4.3;
    const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw);
    const rx = Math.cos(this.yaw), rz = -Math.sin(this.yaw);
    let dx = fx * mz + rx * mx, dz = fz * mz + rz * mx;
    const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    const mult = this.inWater ? 0.55 : 1;
    this.vel.x = dx * sp * mult;
    this.vel.z = dz * sp * mult;
    if (this.inWater){
      this.vel.y -= 10 * dt;
      if (this.keys['Space']) this.vel.y = 3.2;
      this.vel.y = Math.max(this.vel.y, -4);
    } else {
      this.vel.y -= 24 * dt;
      if (this.keys['Space'] && this.onGround) this.vel.y = 8.2;
    }
    this.pos.x += this.vel.x * dt; this.resolve(0);
    this.onGround = false;
    this.pos.y += this.vel.y * dt; this.resolve(1);
    this.pos.z += this.vel.z * dt; this.resolve(2);
    if (this.pos.y < -20) this.spawn();
    // hunger
    this.hunger = Math.max(0, this.hunger - dt * (sprinting ? 0.1 : ((mx || mz) ? 0.03 : 0.012)));
    if (this.hunger <= 0){
      this.starveT += dt;
      if (this.starveT > 3){ this.starveT = 0; damagePlayer(1, true); }
    } else if (this.hunger >= 18 && this.health < 20){
      this.regenT += dt;
      if (this.regenT > 2.5){
        this.regenT = 0;
        this.health = Math.min(20, this.health + 1);
        this.hunger = Math.max(0, this.hunger - 0.4);
      }
    }
  },
  resolve(axis){
    const w = this.W, h = this.H, p = this.pos;
    const x0 = Math.floor(p.x - w), x1 = Math.floor(p.x + w);
    const y0 = Math.floor(p.y), y1 = Math.floor(p.y + h);
    const z0 = Math.floor(p.z - w), z1 = Math.floor(p.z + w);
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++){
      if (!World.isSolid(x, y, z)) continue;
      if (axis === 0){
        if (this.vel.x > 0) p.x = x - w - 0.001;
        else if (this.vel.x < 0) p.x = x + 1 + w + 0.001;
        this.vel.x = 0;
      } else if (axis === 1){
        if (this.vel.y > 0) p.y = y - h - 0.001;
        else { p.y = y + 1; this.onGround = true; }
        this.vel.y = 0;
      } else {
        if (this.vel.z > 0) p.z = z - w - 0.001;
        else if (this.vel.z < 0) p.z = z + 1 + w + 0.001;
        this.vel.z = 0;
      }
    }
  },
  intersectsBlock(x, y, z){
    const w = this.W, p = this.pos;
    return p.x + w > x && p.x - w < x + 1
        && p.y + this.H > y && p.y < y + 1
        && p.z + w > z && p.z - w < z + 1;
  }
};

function createSteve(){
  const g = new THREE.Group();
  const skin = new THREE.MeshLambertMaterial({ color: 0xc8986a });
  const shirt = new THREE.MeshLambertMaterial({ color: 0x00a8a8 });
  const pants = new THREE.MeshLambertMaterial({ color: 0x3b3bd1 });
  const hair = new THREE.MeshLambertMaterial({ color: 0x5a3a1e });
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), [skin, skin, hair, skin, skin, skin]);
  head.position.y = 1.75; g.add(head);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.25), shirt);
  body.position.y = 1.125; g.add(body);
  function limb(mat){
    const piv = new THREE.Group();
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.75, 0.25), mat);
    m.position.y = -0.375; piv.add(m);
    piv.userData.mesh = m;
    return piv;
  }
  const armL = limb(skin); armL.position.set(-0.375, 1.5, 0); g.add(armL);
  const armR = limb(skin); armR.position.set(0.375, 1.5, 0); g.add(armR);
  const legL = limb(pants); legL.position.set(-0.125, 0.75, 0); g.add(legL);
  const legR = limb(pants); legR.position.set(0.125, 0.75, 0); g.add(legR);
  // real Steve skin (downloaded at runtime, colored fallback if offline)
  Mobs.loadSkin('player/wide/steve.png', img => {
    head.material = Mobs.boxMats(img, 0, 0, 8, 8, 8);
    body.material = Mobs.boxMats(img, 16, 16, 8, 12, 4);
    armR.userData.mesh.material = Mobs.boxMats(img, 40, 16, 4, 12, 4);
    armL.userData.mesh.material = Mobs.boxMats(img, 32, 48, 4, 12, 4);
    legR.userData.mesh.material = Mobs.boxMats(img, 0, 16, 4, 12, 4);
    legL.userData.mesh.material = Mobs.boxMats(img, 16, 48, 4, 12, 4);
  });
  g.userData = { armL, armR, legL, legR, phase: 0 };
  g.scale.set(0.92, 0.92, 0.92);
  return g;
}
