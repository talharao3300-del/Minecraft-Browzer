// Block textures: online Minecraft textures with procedural canvas fallback
function makeTex(draw){
  const c = document.createElement('canvas'); c.width = 16; c.height = 16;
  draw(c.getContext('2d'));
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;
  return t;
}
function px(ctx, colors, seed){
  let s = seed * 99991 + 7;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++){
    ctx.fillStyle = colors[(rnd() * colors.length) | 0];
    ctx.fillRect(x, y, 1, 1);
  }
}
const DIRT_C = ['#79553a','#6f4d34','#835d40','#75523a'];
const STONE_C = ['#8f8f8f','#828282','#9a9a9a','#888888'];
const TEX_DRAW = {
  grass_top: c => px(c, ['#5fbf4a','#55b243','#67c653','#4ea83e'], 3),
  grass_side: c => {
    px(c, DIRT_C, 5);
    const g = ['#5fbf4a','#55b243','#67c653'];
    for (let x = 0; x < 16; x++){
      const h = 2 + ((x * 31 + 7) % 3);
      for (let y = 0; y < h; y++){ c.fillStyle = g[(x + y) % 3]; c.fillRect(x, y, 1, 1); }
    }
  },
  dirt: c => px(c, DIRT_C, 9),
  stone: c => px(c, STONE_C, 11),
  sand: c => px(c, ['#e7dca8','#ddd29e','#efe5b3'], 13),
  log_side: c => { px(c, ['#6b4a2b','#62442a','#714f30'], 15); c.fillStyle = '#4e361f'; for (let x = 1; x < 16; x += 4) c.fillRect(x, 0, 1, 16); },
  log_top: c => { px(c, ['#6b4a2b','#62442a'], 17); c.fillStyle = '#b8945f'; c.fillRect(3,3,10,10); c.fillStyle = '#9a7a4d'; c.fillRect(5,5,6,6); c.fillStyle = '#b8945f'; c.fillRect(7,7,2,2); },
  leaves: c => px(c, ['#3e8f2e','#357f27','#46a035','#2f7322'], 19),
  planks: c => { px(c, ['#b8945f','#b08c57','#c09b64'], 21); c.fillStyle = '#8a6a3e'; c.fillRect(0,3,16,1); c.fillRect(0,7,16,1); c.fillRect(0,11,16,1); c.fillRect(0,15,16,1); },
  cobble: c => { px(c, STONE_C, 23); c.fillStyle = '#6e6e6e'; for (let i = 0; i < 6; i++) c.fillRect((i*5)%14, (i*7)%14, 3, 3); },
  water: c => px(c, ['#3b6fd4','#3568c9','#4276da'], 25),
  iron_ore: c => { px(c, STONE_C, 27); c.fillStyle = '#d8af93'; [[3,3],[10,5],[5,10],[12,12]].forEach(p => c.fillRect(p[0], p[1], 2, 2)); },
  diamond_ore: c => { px(c, STONE_C, 29); c.fillStyle = '#4aedd9'; [[3,4],[11,3],[6,11],[12,12]].forEach(p => c.fillRect(p[0], p[1], 2, 2)); },
  chest: c => {
    px(c, ['#9a6b35','#8f6230','#a4733a'], 31);
    c.fillStyle = '#5a3a1a';
    c.fillRect(0,0,16,1); c.fillRect(0,15,16,1); c.fillRect(0,0,1,16); c.fillRect(15,0,1,16); c.fillRect(0,7,16,2);
    c.fillStyle = '#c8c8c8'; c.fillRect(7,6,2,4);
  },
  bedrock: c => px(c, ['#3a3a3a','#2a2a2a','#4d4d4d','#1f1f1f'], 33),
  coal_ore: c => { px(c, STONE_C, 35); c.fillStyle = '#262626'; [[3,3],[10,4],[5,10],[12,11],[8,7]].forEach(p => c.fillRect(p[0], p[1], 2, 2)); },
  gold_ore: c => { px(c, STONE_C, 37); c.fillStyle = '#f4cf3a'; [[3,4],[11,3],[6,11],[12,12]].forEach(p => c.fillRect(p[0], p[1], 2, 2)); },
  glass: c => {
    c.clearRect(0,0,16,16);
    c.fillStyle = 'rgba(210,235,245,0.35)'; c.fillRect(0,0,16,16);
    c.fillStyle = '#cfe9f2';
    c.fillRect(0,0,16,1); c.fillRect(0,15,16,1); c.fillRect(0,0,1,16); c.fillRect(15,0,1,16);
    c.fillRect(2,2,2,1); c.fillRect(3,3,2,1); c.fillRect(4,4,2,1);
  },
  furnace_side: c => { px(c, STONE_C, 39); c.fillStyle = '#6e6e6e'; for (let i = 0; i < 6; i++) c.fillRect((i*5)%14, (i*7)%14, 3, 3); },
  furnace_front: c => {
    px(c, STONE_C, 41);
    c.fillStyle = '#1a1a1a'; c.fillRect(4,8,8,6);
    c.fillStyle = '#ff8c1a'; c.fillRect(5,11,2,3); c.fillRect(8,10,2,4); c.fillRect(11,12,1,2);
  },
  furnace_top: c => px(c, STONE_C, 43),
  torch: c => {
    c.clearRect(0,0,16,16);
    c.fillStyle = '#6a4a2a'; c.fillRect(7,6,2,10);
    c.fillStyle = '#ffd83a'; c.fillRect(6,3,4,4);
    c.fillStyle = '#ff9d1a'; c.fillRect(7,2,2,2);
  },
  door: c => {
    px(c, ['#b8945f','#b08c57','#c09b64'], 45);
    c.fillStyle = '#8a6a3e';
    c.fillRect(0,0,16,1); c.fillRect(0,15,16,1); c.fillRect(0,0,1,16); c.fillRect(15,0,1,16); c.fillRect(7,0,2,16); c.fillRect(0,7,16,2);
    c.fillStyle = '#3a2a18'; c.fillRect(12,8,2,2);
  },
};
// Online vanilla Minecraft textures (downloaded at runtime, canvas fallback if offline)
const TEX_BASE = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.4/assets/minecraft/textures/block/';
const TEX_ONLINE = {
  grass_top: ['grass_block_top.png', '#7cbd6b'],
  grass_side: ['grass_block_side.png'],
  dirt: ['dirt.png'],
  stone: ['stone.png'],
  sand: ['sand.png'],
  log_side: ['oak_log.png'],
  log_top: ['oak_log_top.png'],
  leaves: ['oak_leaves.png', '#48b518'],
  planks: ['oak_planks.png'],
  cobble: ['cobblestone.png'],
  iron_ore: ['iron_ore.png'],
  diamond_ore: ['diamond_ore.png'],
  bedrock: ['bedrock.png'],
  coal_ore: ['coal_ore.png'],
  gold_ore: ['gold_ore.png'],
  glass: ['glass.png'],
  furnace_side: ['furnace_side.png'],
  furnace_front: ['furnace_front_on.png'],
  furnace_top: ['furnace_top.png'],
  torch: ['torch.png'],
  door: ['oak_door_bottom.png'],
};
const texLoader = new THREE.TextureLoader();
texLoader.setCrossOrigin('anonymous');
function blockMat(name, opts){
  const m = new THREE.MeshLambertMaterial(Object.assign({ map: makeTex(TEX_DRAW[name]) }, opts || {}));
  const e = TEX_ONLINE[name];
  if (e) texLoader.load(TEX_BASE + e[0], t => {
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;
    m.map = t;
    if (e[1]) m.color.set(e[1]);
    m.needsUpdate = true;
  }, undefined, () => { /* offline: keep canvas texture */ });
  return m;
}
const mGrassTop = blockMat('grass_top'), mGrassSide = blockMat('grass_side'), mDirt = blockMat('dirt');
const mStone = blockMat('stone'), mSand = blockMat('sand');
const mLogS = blockMat('log_side'), mLogT = blockMat('log_top');
const mLeaves = blockMat('leaves', { alphaTest: 0.5 });
const mPlanks = blockMat('planks'), mCobble = blockMat('cobble');
const mWater = blockMat('water', { transparent: true, opacity: 0.65 });
const mIron = blockMat('iron_ore'), mDiamond = blockMat('diamond_ore');
const mChest = blockMat('chest');
const mBedrock = blockMat('bedrock');
const mCoal = blockMat('coal_ore'), mGold = blockMat('gold_ore');
const mGlass = blockMat('glass', { transparent: true });
const mFurnS = blockMat('furnace_side'), mFurnF = blockMat('furnace_front'), mFurnT = blockMat('furnace_top');
const mTorch = blockMat('torch');
const mDoor = blockMat('door');
// Special (non-cube) geometries
const torchGeo = new THREE.BoxGeometry(0.14, 0.62, 0.14); torchGeo.translate(0, -0.19, 0);
const doorGeo = new THREE.BoxGeometry(1, 1, 0.14); doorGeo.translate(0, 0, -0.42);
const doorOpenGeo = new THREE.BoxGeometry(0.14, 1, 1); doorOpenGeo.translate(-0.42, 0, 0);
// Box material order: +x, -x, +y, -y, +z, -z
const BLOCKS = {
  1:  { name: 'Grass',       mats: [mGrassSide, mGrassSide, mGrassTop, mDirt, mGrassSide, mGrassSide], hard: 0.7, tool: 'shovel' },
  2:  { name: 'Dirt',        mats: mDirt,    hard: 0.6, tool: 'shovel' },
  3:  { name: 'Stone',       mats: mStone,   hard: 3.5, tool: 'pickaxe' },
  4:  { name: 'Sand',        mats: mSand,    hard: 0.6, tool: 'shovel' },
  5:  { name: 'Oak Log',     mats: [mLogS, mLogS, mLogT, mLogT, mLogS, mLogS], hard: 2.2, tool: 'axe' },
  6:  { name: 'Leaves',      mats: mLeaves,  hard: 0.3, tool: 'sword', seeThru: true },
  7:  { name: 'Planks',      mats: mPlanks,  hard: 2.2, tool: 'axe' },
  8:  { name: 'Cobblestone', mats: mCobble,  hard: 3.5, tool: 'pickaxe' },
  9:  { name: 'Water',       mats: mWater,   hard: Infinity, liquid: true, seeThru: true, noSolid: true },
  11: { name: 'Iron Ore',    mats: mIron,    hard: 4.5, tool: 'pickaxe' },
  12: { name: 'Diamond Ore', mats: mDiamond, hard: 5.5, tool: 'pickaxe' },
  13: { name: 'Chest',       mats: mChest,   hard: 2.2, tool: 'axe' },
  14: { name: 'Bedrock',     mats: mBedrock, hard: Infinity },
  15: { name: 'Coal Ore',    mats: mCoal,    hard: 3.5, tool: 'pickaxe' },
  16: { name: 'Gold Ore',    mats: mGold,    hard: 4.5, tool: 'pickaxe' },
  17: { name: 'Furnace',     mats: [mFurnS, mFurnS, mFurnT, mFurnT, mFurnF, mFurnS], hard: 4, tool: 'pickaxe' },
  18: { name: 'Glass',       mats: mGlass,   hard: 0.4, seeThru: true },
  19: { name: 'Torch',       mats: mTorch,   hard: 0.05, seeThru: true, noSolid: true, geo: torchGeo },
  20: { name: 'Door',        mats: mDoor,    hard: 2.2, tool: 'axe', seeThru: true, geo: doorGeo },
  21: { name: 'Door (khula)',mats: mDoor,    hard: 2.2, tool: 'axe', seeThru: true, noSolid: true, geo: doorOpenGeo },
};
