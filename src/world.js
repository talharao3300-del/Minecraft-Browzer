// Infinite chunked voxel world: lazy generation, structures and instanced-mesh rendering
const World = {
  CHUNK: 16, WATER: 12, MAXY: 69, seed: 1,
  blocks: new Map(),
  edits: new Map(),
  torches: new Set(),
  generating: false,
  chunks: new Map(), // "cx|cz" -> { generated, built, meshes }
  boxGeo: new THREE.BoxGeometry(1, 1, 1),
  key: (x, y, z) => x + '|' + y + '|' + z,
  chunkKey: (cx, cz) => cx + '|' + cz,

  init(seed) {
    this.seed = seed;
    this.blocks.clear(); this.chunks.clear(); this.edits.clear(); this.torches.clear();
  },
  get(x, y, z) { return this.blocks.get(this.key(x, y, z)) || 0; },
  set(x, y, z, t) {
    const k = this.key(x, y, z);
    t ? this.blocks.set(k, t) : this.blocks.delete(k);
    if (t === 19) this.torches.add(k); else this.torches.delete(k);
    if (!this.generating) this.edits.set(k, t);
  },
  isSolid(x, y, z) { const t = this.get(x, y, z); return t !== 0 && !(BLOCKS[t] && BLOCKS[t].noSolid); },

  hash(x, z, seed) {
    let h = (x * 374761393 + z * 668265263 + seed * 1446549) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  },
  noise(x, z, seed) {
    const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
    const s = t => t * t * (3 - 2 * t);
    const u = s(xf), v = s(zf);
    const a = this.hash(xi, zi, seed), b = this.hash(xi + 1, zi, seed);
    const c = this.hash(xi, zi + 1, seed), d = this.hash(xi + 1, zi + 1, seed);
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  },
  fbm(x, z, seed) {
    return this.noise(x * 0.04, z * 0.04, seed) * 0.55
      + this.noise(x * 0.09, z * 0.09, seed + 71) * 0.3
      + this.noise(x * 0.2, z * 0.2, seed + 131) * 0.15;
  },
  heightAt(x, z) { return Math.floor(3 + this.fbm(x, z, this.seed) * 26); },

  hash3(x, y, z, seed) {
    let h = (x * 374761393 + y * 842502087 + z * 668265263 + seed * 1446549) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  },
  noise3(x, y, z, seed) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const s = t => t * t * (3 - 2 * t);
    const u = s(x - xi), v = s(y - yi), w = s(z - zi);
    const lerp = (a, b, t) => a + (b - a) * t;
    const c000 = this.hash3(xi, yi, zi, seed), c100 = this.hash3(xi + 1, yi, zi, seed);
    const c010 = this.hash3(xi, yi + 1, zi, seed), c110 = this.hash3(xi + 1, yi + 1, zi, seed);
    const c001 = this.hash3(xi, yi, zi + 1, seed), c101 = this.hash3(xi + 1, yi, zi + 1, seed);
    const c011 = this.hash3(xi, yi + 1, zi + 1, seed), c111 = this.hash3(xi + 1, yi + 1, zi + 1, seed);
    return lerp(
      lerp(lerp(c000, c100, u), lerp(c010, c110, u), v),
      lerp(lerp(c001, c101, u), lerp(c011, c111, u), v), w);
  },
  // spaghetti tunnels + deep caverns (allow deeper underground);
  // prevent only breaking the top surface layers
  caveAt(x, y, z, h) {
    if (y <= 1 || y >= h - 5) return false;
    const n = this.noise3(x * 0.08, y * 0.11, z * 0.08, this.seed + 424);
    if (Math.abs(n - 0.5) < 0.05) return true;
    if (y < h - 8 && this.noise3(x * 0.05, y * 0.07, z * 0.05, this.seed + 767) > 0.78) return true;
    return false;
  },

  ensureChunk(cx, cz) {
    const ck = this.chunkKey(cx, cz);
    let c = this.chunks.get(ck);
    if (c && c.generated) return c;
    if (!c) { c = { generated: false, built: false, meshes: [] }; this.chunks.set(ck, c); }
    this.generating = true;
    const x0 = cx * this.CHUNK, z0 = cz * this.CHUNK;
    for (let lx = 0; lx < this.CHUNK; lx++) for (let lz = 0; lz < this.CHUNK; lz++) {
      const x = x0 + lx, z = z0 + lz;
      const h = this.heightAt(x, z);
      for (let y = 0; y <= h; y++) {
        let t;
        if (y === 0) t = 14;
        else if (y < h - 3) {
          if (this.caveAt(x, y, z, h)) continue;
          const r = this.hash(x * 7 + y, z * 13 + y, this.seed + 999);
          if (r < 0.009 && y < 10) t = 12;       // diamond: sirf gehrai mein
          else if (r < 0.02 && y < 16) t = 16;   // gold
          else if (r < 0.055) t = 11;            // iron
          else if (r < 0.105) t = 15;            // coal
          else t = 3;
        } else if (y < h) t = 2;
        else t = (h <= this.WATER + 1) ? 4 : 1;
        this.set(x, y, z, t);
      }
      for (let y = h + 1; y <= this.WATER; y++) this.set(x, y, z, 9);
      if (h > this.WATER + 1 && lx >= 2 && lx <= 13 && lz >= 2 && lz <= 13
        && this.hash(x, z, this.seed + 555) < 0.018) this.tree(x, h + 1, z);
    }
    this.structure(cx, cz);
    this.generating = false;
    // re-apply player edits inside this chunk
    for (const [k, t] of this.edits) {
      const p = k.split('|');
      if (Math.floor(+p[0] / this.CHUNK) === cx && Math.floor(+p[2] / this.CHUNK) === cz) {
        t ? this.blocks.set(k, t) : this.blocks.delete(k);
        if (t === 19) this.torches.add(k); else this.torches.delete(k);
      }
    }
    c.generated = true;
    return c;
  },

  tree(x, y, z) {
    const h = 4 + Math.floor(this.hash(x, z, this.seed + 777) * 2);
    for (let i = 0; i < h; i++) this.set(x, y + i, z, 5);
    for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++)
      for (let dy = h - 2; dy <= h - 1; dy++) {
        if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
        if (!this.get(x + dx, y + dy, z + dz)) this.set(x + dx, y + dy, z + dz, 6);
      }
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      if (Math.abs(dx) === 1 && Math.abs(dz) === 1) continue;
      if (!this.get(x + dx, y + h, z + dz)) this.set(x + dx, y + h, z + dz, 6);
    }
  },

  structure(cx, cz) {
    // villages: clusters of buildings in 4x4-chunk regions
    const vx = Math.floor(cx / 4), vz = Math.floor(cz / 4);
    const inVillage = this.hash(vx * 13 + 5, vz * 29 + 11, this.seed + 888) < 0.28;
    const lx = ((cx % 4) + 4) % 4, lz = ((cz % 4) + 4) % 4;
    if (inVillage && lx >= 1 && lx <= 2 && lz >= 1 && lz <= 2) {
      const r = this.hash(cx, cz, this.seed + 3333);
      const x0 = cx * this.CHUNK + 4, z0 = cz * this.CHUNK + 4;
      const gy = this.heightAt(x0 + 3, z0 + 3);
      if (gy <= this.WATER + 1) return;
      if (r < 0.4) this.house(x0, gy + 1, z0);
      else if (r < 0.6) this.tower(x0, gy + 1, z0);
      else if (r < 0.8) this.well(x0 + 2, gy + 1, z0 + 2);
      else this.farm(x0, gy + 1, z0);
      return;
    }
    // rare scattered buildings outside villages
    const r2 = this.hash(cx * 31 + 7, cz * 17 + 3, this.seed + 2222);
    if (r2 > 0.035) return;
    const x0 = cx * this.CHUNK + 5, z0 = cz * this.CHUNK + 5;
    const gy = this.heightAt(x0 + 3, z0 + 3);
    if (gy <= this.WATER + 1) return;
    if (r2 < 0.025) this.house(x0, gy + 1, z0);
    else this.tower(x0, gy + 1, z0);
  },
  well(x0, y, z0) {
    for (let dx = 0; dx < 3; dx++) for (let dz = 0; dz < 3; dz++) {
      for (let dy = 0; dy < 4; dy++) this.set(x0 + dx, y + dy, z0 + dz, 0);
      const edge = dx === 0 || dx === 2 || dz === 0 || dz === 2;
      if (edge) this.set(x0 + dx, y, z0 + dz, 8);
      else { this.set(x0 + dx, y - 1, z0 + dz, 9); this.set(x0 + dx, y, z0 + dz, 9); }
      this.set(x0 + dx, y + 3, z0 + dz, 7);
    }
    [[0, 0], [0, 2], [2, 0], [2, 2]].forEach(p => {
      this.set(x0 + p[0], y + 1, z0 + p[1], 5);
      this.set(x0 + p[0], y + 2, z0 + p[1], 5);
    });
  },
  farm(x0, y, z0) {
    for (let dx = 0; dx < 7; dx++) for (let dz = 0; dz < 7; dz++) {
      for (let dy = 0; dy < 3; dy++) this.set(x0 + dx, y + dy, z0 + dz, 0);
      const edge = dx === 0 || dx === 6 || dz === 0 || dz === 6;
      if (edge) this.set(x0 + dx, y, z0 + dz, 5);
      else {
        this.set(x0 + dx, y - 1, z0 + dz, 2);
        if (dx === 3 && dz === 3) this.set(x0 + dx, y - 1, z0 + dz, 9);
        else if ((dx + dz) % 2 === 0) this.set(x0 + dx, y, z0 + dz, 6); // crops
      }
    }
  },
  house(x0, y, z0) {
    for (let dx = 0; dx < 7; dx++) for (let dz = 0; dz < 7; dz++) {
      // foundation and floor
      this.set(x0 + dx, y - 2, z0 + dz, 8);
      this.set(x0 + dx, y - 1, z0 + dz, 8);
      // clear interior space
      for (let dy = 0; dy < 4; dy++) this.set(x0 + dx, y + dy, z0 + dz, 0);
      // walls
      const edge = dx === 0 || dx === 6 || dz === 0 || dz === 6;
      const corner = (dx === 0 || dx === 6) && (dz === 0 || dz === 6);
      if (edge) {
        for (let dy = 0; dy < 3; dy++) {
          let t = corner ? 5 : 7;
          if (dz === 0 && dx === 3 && dy < 2) t = 0;                       // door
          if (!corner && dy === 1 && ((dz === 6 && dx === 3) || (dx === 0 && dz === 3) || (dx === 6 && dz === 3))) t = 0; // windows
          if (t) this.set(x0 + dx, y + dy, z0 + dz, t);
        }
      }
      // roof
      this.set(x0 + dx, y + 3, z0 + dz, 7);
    }
    this.set(x0 + 1, y, z0 + 5, 13); // loot chest
  },
  tower(x0, y, z0) {
    for (let dx = 0; dx < 5; dx++) for (let dz = 0; dz < 5; dz++) {
      this.set(x0 + dx, y - 1, z0 + dz, 8);
      for (let dy = 0; dy < 6; dy++) this.set(x0 + dx, y + dy, z0 + dz, 0);
      const edge = dx === 0 || dx === 4 || dz === 0 || dz === 4;
      if (edge) {
        for (let dy = 0; dy < 6; dy++) {
          let t = 8;
          if (dz === 0 && dx === 2 && dy < 2) t = 0; // door
          if (dy === 5 && (dx + dz) % 2 === 1) t = 0; // crenellations
          if (t) this.set(x0 + dx, y + dy, z0 + dz, t);
        }
      } else if (dx === 2 && dz === 2) {
        for (let dy = 0; dy < 5; dy++) this.set(x0 + dx, y + dy, z0 + dz, 7); // ladder pillar
      }
    }
    this.set(x0 + 1, y, z0 + 3, 13); // loot chest
  },

  exposed(x, y, z, t) {
    const N = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    for (const n of N) {
      const nt = this.get(x + n[0], y + n[1], z + n[2]);
      if (nt === 0) return true;
      if (BLOCKS[nt] && BLOCKS[nt].seeThru && nt !== t) return true;
    }
    return false;
  },

  buildChunk(scene, cx, cz) {
    const c = this.ensureChunk(cx, cz);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++)
      this.ensureChunk(cx + dx, cz + dz);
    for (const m of c.meshes) { scene.remove(m); m.dispose(); }
    c.meshes = [];
    const byType = {};
    const x0 = cx * this.CHUNK, z0 = cz * this.CHUNK;
    for (let lx = 0; lx < this.CHUNK; lx++) for (let lz = 0; lz < this.CHUNK; lz++) {
      const x = x0 + lx, z = z0 + lz;
      for (let y = 0; y < this.MAXY; y++) {
        const t = this.get(x, y, z);
        if (!t) continue;
        if (this.exposed(x, y, z, t)) (byType[t] = byType[t] || []).push([x, y, z]);
      }
    }
    const M = new THREE.Matrix4();
    for (const t in byType) {
      const list = byType[t];
      const mesh = new THREE.InstancedMesh(BLOCKS[t].geo || this.boxGeo, BLOCKS[t].mats, list.length);
      for (let i = 0; i < list.length; i++) {
        M.makeTranslation(list[i][0] + 0.5, list[i][1] + 0.5, list[i][2] + 0.5);
        mesh.setMatrixAt(i, M);
      }
      mesh.userData = { type: +t };
      scene.add(mesh); c.meshes.push(mesh);
    }
    c.built = true;
  },

  rebuildAt(scene, x, z) {
    const cx = Math.floor(x / this.CHUNK), cz = Math.floor(z / this.CHUNK);
    const lx = x - cx * this.CHUNK, lz = z - cz * this.CHUNK;
    const todo = [[cx, cz]];
    if (lx === 0) todo.push([cx - 1, cz]);
    if (lx === this.CHUNK - 1) todo.push([cx + 1, cz]);
    if (lz === 0) todo.push([cx, cz - 1]);
    if (lz === this.CHUNK - 1) todo.push([cx, cz + 1]);
    for (const [a, b] of todo) {
      const c = this.chunks.get(this.chunkKey(a, b));
      if (c && c.built) this.buildChunk(scene, a, b);
    }
  },

  updateLoaded(scene, px, pz) {
    const R = 3;
    const pcx = Math.floor(px / this.CHUNK), pcz = Math.floor(pz / this.CHUNK);
    let built = 0;
    for (let d = 0; d <= R && built < 2; d++) {
      for (let dx = -d; dx <= d && built < 2; dx++) for (let dz = -d; dz <= d && built < 2; dz++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== d) continue;
        const c = this.chunks.get(this.chunkKey(pcx + dx, pcz + dz));
        if (!c || !c.built) { this.buildChunk(scene, pcx + dx, pcz + dz); built++; }
      }
    }
    for (const [k, c] of this.chunks) {
      if (!c.built) continue;
      const p = k.split('|');
      if (Math.abs(+p[0] - pcx) > R + 2 || Math.abs(+p[1] - pcz) > R + 2) {
        for (const m of c.meshes) { scene.remove(m); m.dispose(); }
        c.meshes = []; c.built = false;
      }
    }
  }
};
