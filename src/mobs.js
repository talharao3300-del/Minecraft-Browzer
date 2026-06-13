// Mobs: sheep, cows, zombies, creepers - with real Minecraft skin textures (downloaded at runtime)
const SKIN_BASE = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.4/assets/minecraft/textures/entity/';
const Mobs = {
  list: [],
  arrows: [],
  matCache: {},
  skinCache: {},
  DEFS: {
    sheep:    { passive: true,  hp: 8,  speed: 1.1, W: 0.45, H: 1.3 },
    cow:      { passive: true,  hp: 10, speed: 1.0, W: 0.5,  H: 1.5 },
    pig:      { passive: true,  hp: 8,  speed: 1.0, W: 0.45, H: 1.0 },
    zombie:   { passive: false, hp: 20, speed: 1.9, W: 0.3,  H: 1.8, dmg: 3 },
    creeper:  { passive: false, hp: 15, speed: 2.3, W: 0.3,  H: 1.6 },
    skeleton: { passive: false, hp: 18, speed: 1.6, W: 0.3,  H: 1.8, dmg: 3, ranged: true },
    spider:   { passive: false, hp: 14, speed: 2.6, W: 0.55, H: 0.8, dmg: 3 },
  },
  mat(c){ return this.matCache[c] || (this.matCache[c] = new THREE.MeshLambertMaterial({ color: c })); },

  loadSkin(path, cb){
    if (this.skinCache[path] === 'failed') return;
    if (this.skinCache[path]){ cb(this.skinCache[path]); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { this.skinCache[path] = img; cb(img); };
    img.onerror = () => { this.skinCache[path] = 'failed'; };
    img.src = SKIN_BASE + path;
  },
  // Map a Minecraft box-UV region (origin u,v with box dims w,h,d in texture px) to 6 face materials
  boxMats(img, u, v, w, h, d){
    const crop = (x, y, cw, ch) => {
      const c = document.createElement('canvas'); c.width = cw; c.height = ch;
      c.getContext('2d').drawImage(img, x, y, cw, ch, 0, 0, cw, ch);
      const t = new THREE.CanvasTexture(c);
      t.magFilter = t.minFilter = THREE.NearestFilter;
      return new THREE.MeshLambertMaterial({ map: t });
    };
    const top = crop(u + d, v, w, d), bottom = crop(u + d + w, v, w, d);
    const right = crop(u, v + d, d, h), front = crop(u + d, v + d, w, h);
    const left = crop(u + d + w, v + d, d, h), back = crop(u + d + w + d, v + d, w, h);
    return [left, right, top, bottom, back, front]; // [+x,-x,+y,-y,+z,-z], front = -z
  },
  // Single material from a texture patch (for wool / hide panels)
  patchMat(img, x, y, w, h){
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h);
    const t = new THREE.CanvasTexture(c);
    t.magFilter = t.minFilter = THREE.NearestFilter;
    return new THREE.MeshLambertMaterial({ map: t });
  },
  // Texture patch rotated 90 degrees (for horizontal body panels)
  rotPatch(img, x, y, w, h){
    const c = document.createElement('canvas'); c.width = h; c.height = w;
    const ctx = c.getContext('2d');
    ctx.translate(h / 2, w / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(img, x, y, w, h, -w / 2, -h / 2, w, h);
    const t = new THREE.CanvasTexture(c);
    t.magFilter = t.minFilter = THREE.NearestFilter;
    return new THREE.MeshLambertMaterial({ map: t });
  },

  makeModel(type){
    const g = new THREE.Group();
    const B = (w, h, d, c, x, y, z) => {
      const ms = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.mat(c));
      ms.position.set(x, y, z); g.add(ms); return ms;
    };
    const legs = [];
    const faceBits = [];
    if (type === 'sheep'){
      const body = B(0.9, 0.7, 1.3, '#e8e8e8', 0, 0.95, 0);
      const head = B(0.4, 0.4, 0.4, '#dcd0c8', 0, 1.25, -0.8);
      faceBits.push(B(0.1, 0.08, 0.04, '#222', -0.09, 1.3, -1.01));
      faceBits.push(B(0.1, 0.08, 0.04, '#222', 0.09, 1.3, -1.01));
      [[-0.28,-0.4],[0.28,-0.4],[-0.28,0.4],[0.28,0.4]].forEach(p => legs.push(B(0.26, 0.6, 0.26, '#cfc7bf', p[0], 0.3, p[1])));
      this.loadSkin('sheep/sheep_fur.png', img => {
        const wool = this.patchMat(img, 36, 14, 8, 10);
        body.material = wool;
        legs.forEach(l => l.material = this.patchMat(img, 2, 18, 4, 8));
      });
      this.loadSkin('sheep/sheep.png', img => {
        head.material = this.boxMats(img, 0, 0, 6, 6, 8);
        faceBits.forEach(f => g.remove(f));
      });
    } else if (type === 'cow'){
      const body = B(1.0, 0.75, 1.4, '#6b4226', 0, 1.05, 0);
      const head = B(0.45, 0.45, 0.4, '#7a4f2d', 0, 1.35, -0.9);
      B(0.3, 0.18, 0.1, '#d8d8d8', 0, 1.25, -1.12);
      [[-0.3,-0.45],[0.3,-0.45],[-0.3,0.45],[0.3,0.45]].forEach(p => legs.push(B(0.2, 0.68, 0.2, '#5a3a20', p[0], 0.34, p[1])));
      this.loadSkin('cow/cow.png', img => {
        head.material = this.boxMats(img, 0, 0, 8, 8, 6);
        const side = this.rotPatch(img, 28, 14, 12, 18);
        const top = this.patchMat(img, 28, 4, 12, 10);
        const front = this.patchMat(img, 18, 14, 10, 18);
        body.material = [side, side, top, top, front, front];
        legs.forEach(l => l.material = this.boxMats(img, 0, 16, 4, 12, 4));
      });
    } else if (type === 'pig'){
      const body = B(0.85, 0.6, 1.2, '#f0a0a0', 0, 0.75, 0);
      const head = B(0.5, 0.5, 0.45, '#f0a8a8', 0, 0.8, -0.78);
      const snout = B(0.25, 0.18, 0.08, '#e88a8a', 0, 0.72, -1.04);
      [[-0.26,-0.4],[0.26,-0.4],[-0.26,0.4],[0.26,0.4]].forEach(p => legs.push(B(0.22, 0.45, 0.22, '#e09090', p[0], 0.22, p[1])));
      this.loadSkin('pig/pig.png', img => {
        head.material = this.boxMats(img, 0, 0, 8, 8, 8);
        snout.material = this.patchMat(img, 17, 17, 4, 3);
        const side = this.rotPatch(img, 28, 16, 10, 16);
        const top = this.patchMat(img, 28, 8, 10, 8);
        body.material = [side, side, top, top, top, top];
        legs.forEach(l => l.material = this.boxMats(img, 0, 16, 4, 6, 4));
      });
    } else if (type === 'skeleton'){
      const head = B(0.5, 0.5, 0.5, '#c8c8c8', 0, 1.75, 0);
      faceBits.push(B(0.1, 0.08, 0.05, '#1a1a1a', -0.12, 1.8, -0.26));
      faceBits.push(B(0.1, 0.08, 0.05, '#1a1a1a', 0.12, 1.8, -0.26));
      const body = B(0.5, 0.75, 0.2, '#b8b8b8', 0, 1.125, 0);
      const arms = [];
      [[-0.32],[0.32]].forEach(p => {
        const a = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.7, 0.13), this.mat('#c0c0c0'));
        a.rotation.x = Math.PI / 2;
        a.position.set(p[0], 1.42, -0.28);
        g.add(a); arms.push(a);
      });
      const bow = B(0.05, 0.5, 0.08, '#6a4a2a', 0, 1.42, -0.62);
      bow.rotation.z = 0.3;
      [[-0.11],[0.11]].forEach(p => legs.push(B(0.14, 0.75, 0.14, '#c0c0c0', p[0], 0.375, 0)));
      this.loadSkin('skeleton/skeleton.png', img => {
        head.material = this.boxMats(img, 0, 0, 8, 8, 8);
        body.material = this.boxMats(img, 16, 16, 8, 12, 4);
        arms.forEach(a => a.material = this.boxMats(img, 40, 16, 2, 12, 2));
        legs.forEach(l => l.material = this.boxMats(img, 0, 16, 2, 12, 2));
        faceBits.forEach(f => g.remove(f));
      });
    } else if (type === 'spider'){
      const abdomen = B(0.8, 0.55, 0.8, '#2a2218', 0, 0.55, 0.45);
      const head = B(0.5, 0.45, 0.5, '#352b1e', 0, 0.5, -0.35);
      faceBits.push(B(0.08, 0.08, 0.04, '#c01818', -0.14, 0.58, -0.61));
      faceBits.push(B(0.08, 0.08, 0.04, '#c01818', 0.14, 0.58, -0.61));
      faceBits.push(B(0.06, 0.06, 0.04, '#e03030', -0.05, 0.5, -0.61));
      faceBits.push(B(0.06, 0.06, 0.04, '#e03030', 0.05, 0.5, -0.61));
      [[-0.5,-0.25],[0.5,-0.25],[-0.5,0.25],[0.5,0.25]].forEach(p => {
        const l = B(0.12, 0.5, 0.12, '#241c12', p[0], 0.25, p[1]);
        l.rotation.z = p[0] < 0 ? 0.5 : -0.5;
        legs.push(l);
      });
      this.loadSkin('spider/spider.png', img => {
        head.material = this.boxMats(img, 32, 4, 8, 8, 8);
        abdomen.material = this.patchMat(img, 16, 20, 10, 10);
      });
    } else if (type === 'zombie'){
      const head = B(0.5, 0.5, 0.5, '#44aa44', 0, 1.75, 0);
      faceBits.push(B(0.1, 0.08, 0.05, '#1a1a1a', -0.12, 1.8, -0.26));
      faceBits.push(B(0.1, 0.08, 0.05, '#1a1a1a', 0.12, 1.8, -0.26));
      const body = B(0.5, 0.75, 0.25, '#2a7a2a', 0, 1.125, 0);
      // arms: vertical boxes rotated to point forward, so skin UVs map correctly
      const arms = [];
      [[-0.36],[0.36]].forEach(p => {
        const a = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 0.22), this.mat('#3f9f3f'));
        a.rotation.x = Math.PI / 2;
        a.position.set(p[0], 1.42, -0.3);
        g.add(a); arms.push(a);
      });
      [[-0.125],[0.125]].forEach(p => legs.push(B(0.24, 0.75, 0.24, '#2d2d8a', p[0], 0.375, 0)));
      this.loadSkin('zombie/zombie.png', img => {
        head.material = this.boxMats(img, 0, 0, 8, 8, 8);
        body.material = this.boxMats(img, 16, 16, 8, 12, 4);
        arms.forEach(a => a.material = this.boxMats(img, 40, 16, 4, 12, 4));
        legs.forEach(l => l.material = this.boxMats(img, 0, 16, 4, 12, 4));
        faceBits.forEach(f => g.remove(f));
      });
    } else { // creeper
      const body = B(0.5, 1.05, 0.5, '#4cbb4c', 0, 1.0, 0);
      const head = B(0.55, 0.55, 0.55, '#4cbb4c', 0, 1.85, 0);
      faceBits.push(B(0.12, 0.12, 0.04, '#111', -0.13, 1.95, -0.29));
      faceBits.push(B(0.12, 0.12, 0.04, '#111', 0.13, 1.95, -0.29));
      faceBits.push(B(0.12, 0.2, 0.04, '#111', 0, 1.78, -0.29));
      faceBits.push(B(0.07, 0.12, 0.04, '#111', -0.11, 1.72, -0.29));
      faceBits.push(B(0.07, 0.12, 0.04, '#111', 0.11, 1.72, -0.29));
      [[-0.16,-0.3],[0.16,-0.3],[-0.16,0.3],[0.16,0.3]].forEach(p => legs.push(B(0.22, 0.45, 0.25, '#3fa33f', p[0], 0.22, p[1])));
      this.loadSkin('creeper/creeper.png', img => {
        head.material = this.boxMats(img, 0, 0, 8, 8, 8);
        body.material = this.boxMats(img, 16, 16, 8, 12, 4);
        legs.forEach(l => l.material = this.boxMats(img, 0, 16, 4, 6, 4));
        faceBits.forEach(f => g.remove(f));
      });
    }
    g.userData.legs = legs;
    return g;
  },

  spawn(type, x, y, z, scene){
    const d = this.DEFS[type];
    const model = this.makeModel(type);
    const m = {
      type, passive: d.passive, hp: d.hp, speed: d.speed, W: d.W, H: d.H, dmg: d.dmg || 0,
      pos: new THREE.Vector3(x, y, z), vel: new THREE.Vector3(),
      yaw: Math.random() * 6.28, phase: 0, onGround: false,
      dirT: 0, wYaw: 0, wMove: false, fuse: null, hitCd: 0, model,
    };
    model.userData.mobRef = m;
    model.position.copy(m.pos);
    scene.add(model);
    this.list.push(m);
  },

  remove(i, scene){
    const m = this.list[i];
    scene.remove(m.model);
    this.list.splice(i, 1);
  },

  count(passive){ return this.list.filter(m => m.passive === passive).length; },

  resolveAxis(m, axis){
    const w = m.W, h = m.H, p = m.pos;
    const x0 = Math.floor(p.x - w), x1 = Math.floor(p.x + w);
    const y0 = Math.floor(p.y), y1 = Math.floor(p.y + h);
    const z0 = Math.floor(p.z - w), z1 = Math.floor(p.z + w);
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++){
      if (!World.isSolid(x, y, z)) continue;
      if (axis === 0){
        if (m.vel.x > 0) p.x = x - w - 0.001; else if (m.vel.x < 0) p.x = x + 1 + w + 0.001;
        m.vel.x = 0;
      } else if (axis === 1){
        if (m.vel.y > 0) p.y = y - h - 0.001; else { p.y = y + 1; m.onGround = true; }
        m.vel.y = 0;
      } else {
        if (m.vel.z > 0) p.z = z - w - 0.001; else if (m.vel.z < 0) p.z = z + 1 + w + 0.001;
        m.vel.z = 0;
      }
    }
  },

  update(dt, scene, isNight){
    for (let i = this.list.length - 1; i >= 0; i--){
      const m = this.list[i];
      const dx = Player.pos.x - m.pos.x, dz = Player.pos.z - m.pos.z;
      const dist = Math.hypot(dx, dz) || 0.001;
      if (dist > 70 || m.pos.y < -20){ this.remove(i, scene); continue; }
      let vx = 0, vz = 0;
      if (!m.passive){
        if (!isNight){
          m.hp -= dt * 1.5;
          if (m.hp <= 0){ this.remove(i, scene); continue; }
        }
        if (dist < 18){
          m.yaw = Math.atan2(-dx, -dz);
          vx = dx / dist * m.speed; vz = dz / dist * m.speed;
          if (m.type === 'skeleton'){
            // door se teer maarta hai, paas aao to peeche hat'ta hai
            if (dist < 7){ vx = -vx; vz = -vz; }
            else if (dist <= 13){ vx = 0; vz = 0; }
            m.hitCd -= dt;
            if (m.hitCd <= 0 && dist < 15){ m.hitCd = 2.2; this.shootArrow(m, scene); }
          }
          if (m.type === 'creeper'){
            if (dist < 2.6){
              if (m.fuse === null) m.fuse = 1.5;
              m.fuse -= dt; vx = 0; vz = 0;
              const s = 1 + 0.18 * Math.sin((1.5 - m.fuse) * 25);
              m.model.scale.set(s, s, s);
              if (m.fuse <= 0){ this.explode(m, scene); continue; }
            } else { m.fuse = null; m.model.scale.set(1, 1, 1); }
          }
          if (m.type === 'spider'){
            if (dist < 4 && dist > 1.8 && m.onGround){
              m.lungeT = (m.lungeT || 0) - dt;
              if (m.lungeT <= 0){ m.lungeT = 1.8; m.vel.y = 6; }
            }
            if (dist < 1.5){
              m.hitCd -= dt;
              if (m.hitCd <= 0){ m.hitCd = 1.3; damagePlayer(m.dmg); }
            }
          }
          if (m.type === 'zombie' && dist < 1.4){
            m.hitCd -= dt;
            if (m.hitCd <= 0){ m.hitCd = 1.2; damagePlayer(m.dmg); }
          }
        } else { this.wander(m, dt); vx = m._wx; vz = m._wz; }
      } else {
        this.wander(m, dt); vx = m._wx; vz = m._wz;
        if (Math.random() < dt * 0.02 && dist < 14) (m.type === 'sheep' ? Sound.baa() : Sound.moo());
      }
      m.vel.x = vx; m.vel.z = vz;
      const inW = World.get(Math.floor(m.pos.x), Math.floor(m.pos.y + 0.3), Math.floor(m.pos.z)) === 9;
      if (inW) m.vel.y = Math.max(m.vel.y, 1.5);
      else m.vel.y -= 24 * dt;
      const bx = m.pos.x, bz = m.pos.z;
      m.pos.x += m.vel.x * dt; this.resolveAxis(m, 0);
      m.onGround = false;
      m.pos.y += m.vel.y * dt; this.resolveAxis(m, 1);
      m.pos.z += m.vel.z * dt; this.resolveAxis(m, 2);
      const wanted = Math.hypot(vx, vz);
      if (m.onGround && wanted > 0.3){
        const moved = Math.hypot(m.pos.x - bx, m.pos.z - bz);
        if (moved < wanted * dt * 0.4) m.vel.y = 8;
      }
      m.model.position.copy(m.pos);
      m.model.rotation.y = m.yaw;
      m.phase += Math.hypot(vx, vz) * dt * 3;
      m.model.userData.legs.forEach((l, j) => { l.rotation.x = Math.sin(m.phase * 2) * 0.5 * (j % 2 ? 1 : -1); });
    }
    this.updateArrows(dt, scene);
  },

  shootArrow(m, scene){
    const from = new THREE.Vector3(m.pos.x, m.pos.y + 1.5, m.pos.z);
    const to = new THREE.Vector3(Player.pos.x, Player.pos.y + 1.3, Player.pos.z);
    const dir = to.sub(from).normalize();
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, 0.5),
      this.mat('#9a9a9a'));
    mesh.position.copy(from);
    scene.add(mesh);
    this.arrows.push({ pos: from, vel: dir.multiplyScalar(16), mesh, age: 0 });
    Sound.bow();
  },
  updateArrows(dt, scene){
    for (let i = this.arrows.length - 1; i >= 0; i--){
      const a = this.arrows[i];
      a.age += dt;
      a.vel.y -= 9 * dt;
      a.pos.addScaledVector(a.vel, dt);
      a.mesh.position.copy(a.pos);
      a.mesh.lookAt(a.pos.x + a.vel.x, a.pos.y + a.vel.y, a.pos.z + a.vel.z);
      const hitBlock = World.isSolid(Math.floor(a.pos.x), Math.floor(a.pos.y), Math.floor(a.pos.z));
      const pd = Math.hypot(Player.pos.x - a.pos.x, Player.pos.y + 0.9 - a.pos.y, Player.pos.z - a.pos.z);
      if (pd < 0.8){ damagePlayer(3); }
      if (pd < 0.8 || hitBlock || a.age > 5){
        scene.remove(a.mesh);
        this.arrows.splice(i, 1);
      }
    }
  },

  wander(m, dt){
    m.dirT -= dt;
    if (m.dirT <= 0){
      m.dirT = 2 + Math.random() * 3;
      m.wYaw = Math.random() * Math.PI * 2;
      m.wMove = Math.random() < 0.6;
    }
    if (m.wMove){
      m.yaw = m.wYaw;
      m._wx = -Math.sin(m.yaw) * m.speed * 0.6;
      m._wz = -Math.cos(m.yaw) * m.speed * 0.6;
    } else { m._wx = 0; m._wz = 0; }
  },

  damage(m, dmg, dir, scene){
    m.hp -= dmg;
    m.vel.x += dir.x * 5; m.vel.z += dir.z * 5; m.vel.y = 4;
    if (m.hp <= 0){
      if (m.type === 'cow'){ Inventory.counts.rawfood += 2; showMsg('\ud83e\udd69 +2 Raw Khana (furnace mein pakao!)'); }
      else if (m.type === 'pig'){ Inventory.counts.rawfood += 2; showMsg('\ud83e\udd69 +2 Raw Khana (furnace mein pakao!)'); }
      else if (m.type === 'sheep'){ Inventory.counts.rawfood += 1; showMsg('\ud83e\udd69 +1 Raw Khana'); }
      else if (m.type === 'zombie' && Math.random() < 0.3){ Inventory.counts.rawfood += 1; showMsg('\ud83e\udd69 +1 Raw Khana'); }
      else if (m.type === 'skeleton' && Math.random() < 0.5){ Inventory.counts.stick += 2; showMsg('\ud83e\uddb4 +2 Stick'); }
      Inventory.renderHotbar();
      const i = this.list.indexOf(m);
      if (i >= 0) this.remove(i, scene);
    }
  },

  explode(m, scene){
    Sound.explode();
    const cx = m.pos.x, cy = m.pos.y + 0.8, cz = m.pos.z, R = 2.6;
    const chunksToRebuild = new Set();
    for (let x = Math.floor(cx - R); x <= Math.floor(cx + R); x++)
      for (let y = Math.max(1, Math.floor(cy - R)); y <= Math.floor(cy + R); y++)
        for (let z = Math.floor(cz - R); z <= Math.floor(cz + R); z++){
          const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy, z + 0.5 - cz);
          if (d > R) continue;
          const t = World.get(x, y, z);
          if (t && t !== 9 && BLOCKS[t].hard !== Infinity){
            World.set(x, y, z, 0);
            const ccx = Math.floor(x / 16), ccz = Math.floor(z / 16);
            for (let ax = -1; ax <= 1; ax++) for (let az = -1; az <= 1; az++)
              chunksToRebuild.add((ccx + ax) + '|' + (ccz + az));
          }
        }
    for (const k of chunksToRebuild){
      const c = World.chunks.get(k);
      if (c && c.built){ const p = k.split('|'); World.buildChunk(scene, +p[0], +p[1]); }
    }
    const pd = Math.hypot(Player.pos.x - cx, Player.pos.y + 0.9 - cy, Player.pos.z - cz);
    if (pd < 6) damagePlayer(Math.max(1, Math.round(14 * (1 - pd / 6))));
    const i = this.list.indexOf(m);
    if (i >= 0) this.remove(i, scene);
  },
};
