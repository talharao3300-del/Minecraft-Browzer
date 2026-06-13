// Hotbar with item counts, tiered tools, armor, food and Minecraft-style grid crafting
// pehle 9 slots = keys 1-9 (tools/food wahi purani jagah); baaki scroll/click se
const SLOTS = [
  { kind: 'block', id: 1, item: 'grass',  name: 'Grass' },
  { kind: 'block', id: 2, item: 'dirt',   name: 'Dirt' },
  { kind: 'block', id: 8, item: 'cobble', name: 'Cobble' },
  { kind: 'block', id: 7, item: 'planks', name: 'Planks' },
  { kind: 'block', id: 19, item: 'torch', name: 'Torch' },
  { kind: 'tool', tool: 'pickaxe', icon: '\u26cf\ufe0f' },
  { kind: 'tool', tool: 'axe',     icon: '\ud83e\ude93' },
  { kind: 'tool', tool: 'sword',   icon: '\ud83d\udde1\ufe0f' },
  { kind: 'food', icon: '\ud83c\udf56', name: 'Khana' },
  { kind: 'block', id: 5, item: 'log',    name: 'Oak Log' },
  { kind: 'block', id: 4, item: 'sand',   name: 'Sand' },
  { kind: 'block', id: 18, item: 'glass',   name: 'Glass' },
  { kind: 'block', id: 20, item: 'door',    name: 'Door' },
  { kind: 'block', id: 17, item: 'furnace', name: 'Furnace' },
];
const BLOCK_CSS = {
  1: 'linear-gradient(#5fbf4a 35%, #79553a 35%)',
  2: '#79553a',
  4: '#e7dca8',
  8: '#7e7e7e',
  7: 'repeating-linear-gradient(#b8945f, #b8945f 6px, #8a6a3e 6px, #8a6a3e 7px)',
  5: 'repeating-linear-gradient(90deg, #6b4a2b, #6b4a2b 5px, #4e361f 5px, #4e361f 6px)',
  17: 'linear-gradient(#8f8f8f 55%, #1a1a1a 55%, #1a1a1a 75%, #ff8c1a 75%)',
  18: 'linear-gradient(135deg, rgba(210,235,245,.85) 20%, rgba(160,200,220,.45) 20%)',
  19: 'linear-gradient(#ffd83a 30%, #6a4a2a 30%)',
  20: 'repeating-linear-gradient(#b8945f, #b8945f 5px, #8a6a3e 5px, #8a6a3e 6px)',
};
const ARMOR_TYPES = ['helmet', 'chestplate', 'leggings', 'boots'];
const ARMOR_ICON = { helmet: '\ud83e\ude96', chestplate: '\ud83d\udc55', leggings: '\ud83d\udc56', boots: '\ud83e\udd7e' };
const ARMOR_SETS = {
  Leather:  { helmet: 1, chestplate: 3, leggings: 2, boots: 1 },
  Gold:     { helmet: 2, chestplate: 5, leggings: 3, boots: 1 },
  Iron:     { helmet: 2, chestplate: 6, leggings: 5, boots: 2 },
  Diamond:  { helmet: 3, chestplate: 8, leggings: 6, boots: 3 },
};
const TIER_RANK = { wood: 0, stone: 1, gold: 2, iron: 3, diamond: 4 };
const TIER_SPEED = { wood: 2, stone: 4, gold: 8, iron: 6, diamond: 9 };
const TIER_LABEL = { wood: 'Wooden', stone: 'Stone', gold: '\u2728 Golden', iron: 'Iron', diamond: '\ud83d\udc8e Diamond' };
const SWORD_DMG = { wood: 4, stone: 5, gold: 5, iron: 6, diamond: 8 };
// Real Minecraft item textures (downloaded at runtime)
const ITEM_TEX_BASE = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.4/assets/minecraft/textures/item/';
const TIER_PREFIX = { wood: 'wooden', stone: 'stone', gold: 'golden', iron: 'iron', diamond: 'diamond' };
// Crafting grid items
const ITEM_CHAR = { log: 'L', planks: 'W', stick: 'S', cobble: 'C', coal: 'O', gold: 'G', iron: 'I', diamond: 'D' };
const CHAR_TIER = { W: 'wood', C: 'stone', G: 'gold', I: 'iron', D: 'diamond' };
const PALETTE = [
  { item: 'log',     label: 'Log',     css: BLOCK_CSS[5] },
  { item: 'planks',  label: 'Planks',  css: BLOCK_CSS[7] },
  { item: 'stick',   label: 'Stick',   css: '#8a6a3e' },
  { item: 'cobble',  label: 'Cobble',  css: '#7e7e7e' },
  { item: 'coal',    label: 'Coal',    css: '#262626' },
  { item: 'gold',    label: 'Gold',    css: '#f4cf3a' },
  { item: 'iron',    label: 'Iron',    css: '#d8d8d8' },
  { item: 'diamond', label: 'Diamond', css: '#4aedd9' },
];
// Furnace smelting: 1 coal = 4 items, 1 log = 2, 1 plank = 1
const SMELT = [
  { from: 'rawiron', to: 'iron',  label: 'Raw Iron \u2192 Iron' },
  { from: 'rawgold', to: 'gold',  label: 'Raw Gold \u2192 Gold' },
  { from: 'sand',    to: 'glass', label: 'Sand \u2192 Glass' },
  { from: 'rawfood', to: 'food',  label: 'Raw Khana \u2192 Khana' },
];
const Inventory = {
  sel: 0,
  counts: { grass: 10, dirt: 10, sand: 0, cobble: 0, planks: 0, log: 0, stick: 0,
            coal: 0, rawiron: 0, iron: 0, rawgold: 0, gold: 0, diamond: 0,
            glass: 0, torch: 0, door: 0, furnace: 0, food: 5, rawfood: 0 },
  tools: { pickaxe: 'wood', axe: 'wood', sword: 'wood' },
  armorUnlocked: { Leather: true, Gold: false, Iron: false, Diamond: false },
  equipped: { helmet: null, chestplate: null, leggings: null, boots: null },
  hasTable: false,
  grid: Array(9).fill(null),
  paletteSel: 'log',
  slot(){ return SLOTS[this.sel]; },
  select(i){ this.sel = (i + SLOTS.length) % SLOTS.length; this.renderHotbar(); },
  armorPoints(){
    let p = 0;
    for (const t of ARMOR_TYPES){ const s = this.equipped[t]; if (s) p += ARMOR_SETS[s][t]; }
    return p;
  },
  toolName(tool){ return TIER_LABEL[this.tools[tool]] + ' ' + tool[0].toUpperCase() + tool.slice(1); },
  toolSpeed(tool){ return TIER_SPEED[this.tools[tool]] || 2; },
  swordDamage(){ return SWORD_DMG[this.tools.sword] || 4; },
  toolImg(tool){ return ITEM_TEX_BASE + TIER_PREFIX[this.tools[tool]] + '_' + tool + '.png'; },
  addDrop(t){
    const map = { 1: 'grass', 2: 'dirt', 3: 'cobble', 8: 'cobble', 4: 'sand', 5: 'log', 7: 'planks', 13: 'planks',
                  17: 'furnace', 18: 'glass', 19: 'torch', 20: 'door', 21: 'door' };
    if (t === 6){ if (Math.random() < 0.15){ this.counts.food++; showMsg('\ud83c\udf4e +1 Khana'); } }
    else if (t === 11){ this.counts.rawiron++; showMsg('\u2699\ufe0f +1 Raw Iron (furnace mein smelt karo)'); }
    else if (t === 12){ this.counts.diamond++; showMsg('\ud83d\udc8e +1 Diamond!'); }
    else if (t === 15){ this.counts.coal++; showMsg('\u2b1b +1 Coal'); }
    else if (t === 16){ this.counts.rawgold++; showMsg('\u2728 +1 Raw Gold (furnace mein smelt karo)'); }
    else if (map[t]) this.counts[map[t]]++;
    this.renderHotbar();
  },
  // ---- Furnace smelting ----
  fuelUse(){
    if (this.counts.coal > 0) return { item: 'coal', batch: 4 };
    if (this.counts.log > 0) return { item: 'log', batch: 2 };
    if (this.counts.planks > 0) return { item: 'planks', batch: 1 };
    return null;
  },
  smelt(rec){
    if ((this.counts[rec.from] || 0) <= 0){ Sound.deny(); showMsg(rec.from === 'sand' ? 'Sand nahi hai!' : 'Smelt karne ko kuch nahi'); return; }
    const fuel = this.fuelUse();
    if (!fuel){ Sound.deny(); showMsg('\ud83d\udd25 Fuel chahiye: coal, log ya planks!'); return; }
    const n = Math.min(fuel.batch, this.counts[rec.from]);
    this.counts[fuel.item]--;
    this.counts[rec.from] -= n;
    this.counts[rec.to] += n;
    Sound.craft();
    showMsg('\ud83d\udd25 +' + n + ' ' + rec.label.split('\u2192')[1].trim() + ' (fuel: 1 ' + fuel.item + ')');
    this.renderFurnace(); this.renderHotbar(); this.renderPanel();
  },
  renderFurnace(){
    const fl = document.getElementById('furnace-fuel');
    fl.textContent = 'Fuel: Coal ' + this.counts.coal + ' (4 item/coal) \u00b7 Log ' + this.counts.log + ' (2/log) \u00b7 Planks ' + this.counts.planks + ' (1/plank)';
    const el = document.getElementById('furnace-list'); el.innerHTML = '';
    SMELT.forEach(rec => {
      const row = document.createElement('div'); row.className = 'craft-row';
      const nm = document.createElement('span'); nm.textContent = rec.label; row.appendChild(nm);
      const cs = document.createElement('span'); cs.className = 'cost';
      cs.textContent = 'paas hai: ' + (this.counts[rec.from] || 0); row.appendChild(cs);
      const b = document.createElement('button');
      b.textContent = 'Smelt';
      b.disabled = (this.counts[rec.from] || 0) <= 0 || !this.fuelUse();
      b.onclick = () => this.smelt(rec);
      row.appendChild(b);
      el.appendChild(row);
    });
  },
  renderHotbar(){
    const el = document.getElementById('hotbar'); el.innerHTML = '';
    SLOTS.forEach((it, i) => {
      const d = document.createElement('div');
      d.className = 'slot' + (i === this.sel ? ' sel' : '');
      let inner = '<span class="num">' + (i + 1) + '</span>';
      let cnt = '';
      if (it.kind === 'block'){
        inner += '<div class="blk" style="background:' + BLOCK_CSS[it.id] + '"></div>';
        inner += '<span class="lbl">' + it.name + '</span>';
        cnt = this.counts[it.item];
      } else if (it.kind === 'tool'){
        inner += '<span class="emo">' + it.icon + '</span><img class="itm" src="' + this.toolImg(it.tool) + '" onload="this.previousElementSibling.style.display=&quot;none&quot;" onerror="this.remove()"/><span class="lbl">' + this.toolName(it.tool) + '</span>';
      } else {
        inner += '<span class="emo">' + it.icon + '</span><img class="itm" src="' + ITEM_TEX_BASE + 'cooked_beef.png" onload="this.previousElementSibling.style.display=&quot;none&quot;" onerror="this.remove()"/><span class="lbl">' + it.name + '</span>';
        cnt = this.counts.food + this.counts.rawfood;
      }
      if (cnt !== '') inner += '<span class="cnt">' + cnt + '</span>';
      d.innerHTML = inner;
      d.onclick = () => this.select(i);
      el.appendChild(d);
    });
  },
  renderPanel(){
    const inv = document.getElementById('inv-list');
    if (inv){
      inv.innerHTML = '';
      const items = [
        ['grass', BLOCK_CSS[1], 'Grass'], ['dirt', BLOCK_CSS[2], 'Dirt'], ['sand', BLOCK_CSS[4], 'Sand'],
        ['cobble', BLOCK_CSS[8], 'Cobble'], ['planks', BLOCK_CSS[7], 'Planks'], ['log', BLOCK_CSS[5], 'Log'],
        ['stick', '#8a6a3e', 'Stick'], ['coal', '#262626', 'Coal'],
        ['rawiron', '#b08868', 'Raw Iron'], ['iron', '#d8d8d8', 'Iron'],
        ['rawgold', '#c9a83a', 'Raw Gold'], ['gold', '#f4cf3a', 'Gold'], ['diamond', '#4aedd9', 'Diamond'],
        ['glass', BLOCK_CSS[18], 'Glass'], ['torch', BLOCK_CSS[19], 'Torch'], ['door', BLOCK_CSS[20], 'Door'],
        ['furnace', BLOCK_CSS[17], 'Furnace'], ['food', '#a05a2a', 'Khana'], ['rawfood', '#c87a6a', 'Raw Khana'],
      ];
      items.forEach(it => {
        const d = document.createElement('div');
        d.className = 'pal';
        d.innerHTML = '<span class="sw" style="background:' + it[1] + '"></span>' + it[2] + ': ' + (this.counts[it[0]] || 0);
        inv.appendChild(d);
      });
    }
    const el = document.getElementById('armor-list'); el.innerHTML = '';
    for (const set in ARMOR_SETS){
      const row = document.createElement('div'); row.className = 'arm-row';
      const b = document.createElement('b'); b.textContent = set; row.appendChild(b);
      if (!this.armorUnlocked[set]){
        const lk = document.createElement('span');
        lk.style.cssText = 'color:#888;font-size:12px;';
        lk.textContent = '\ud83d\udd12 Crafting se unlock karo (C)';
        row.appendChild(lk);
      } else {
        for (const t of ARMOR_TYPES){
          const a = document.createElement('div');
          a.className = 'arm' + (this.equipped[t] === set ? ' on' : '');
          a.textContent = ARMOR_ICON[t];
          a.title = set + ' ' + t;
          a.onclick = () => {
            this.equipped[t] = this.equipped[t] === set ? null : set;
            this.renderPanel(); this.renderHUD();
          };
          row.appendChild(a);
        }
      }
      el.appendChild(row);
    }
  },
  // ---- Minecraft-style grid crafting ----
  matchGrid(){
    const g = [];
    for (let r = 0; r < 3; r++){
      let s = '';
      for (let c = 0; c < 3; c++){ const it = this.grid[r * 3 + c]; s += it ? ITEM_CHAR[it] : ' '; }
      g.push(s);
    }
    let r0 = 0, r1 = 2, c0 = 0, c1 = 2;
    while (r0 <= r1 && g[r0].trim() === '') r0++;
    while (r1 >= r0 && g[r1].trim() === '') r1--;
    if (r0 > r1) return null;
    const colEmpty = c => { for (let r = r0; r <= r1; r++) if (g[r][c] !== ' ') return false; return true; };
    while (c0 <= c1 && colEmpty(c0)) c0++;
    while (c1 >= c0 && colEmpty(c1)) c1--;
    const t = [];
    for (let r = r0; r <= r1; r++) t.push(g[r].slice(c0, c1 + 1));
    const key = t.join('/');
    if (key === 'L') return { name: 'Planks \u00d74', give: { planks: 4 } };
    if (key === 'W/W') return { name: 'Stick \u00d74', give: { stick: 4 } };
    if (key === 'WW/WW') return this.hasTable ? { name: 'Crafting Table (pehle se hai)', none: true } : { name: '\ud83d\udee0\ufe0f Crafting Table', table: true };
    if (key === 'O/S') return { name: '\ud83d\udd26 Torch \u00d74', give: { torch: 4 } };
    if (key === 'WW/WW/WW') return { name: '\ud83d\udeaa Door \u00d73', give: { door: 3 } };
    if (key === 'CCC/C C/CCC') return { name: '\ud83d\udd25 Furnace', give: { furnace: 1 } };
    return this.toolMatch(t);
  },
  toolMatch(t){
    const mats = 'WCGID';
    const tryPat = (pat, type) => {
      if (pat.length !== t.length) return null;
      let mat = null;
      for (let r = 0; r < pat.length; r++){
        if (pat[r].length !== t[r].length) return null;
        for (let c = 0; c < pat[r].length; c++){
          const p = pat[r][c], gc = t[r][c];
          if (p === ' '){ if (gc !== ' ') return null; }
          else if (p === 'S'){ if (gc !== 'S') return null; }
          else {
            if (!mats.includes(gc)) return null;
            if (mat && mat !== gc) return null;
            mat = gc;
          }
        }
      }
      if (!mat) return null;
      const tier = CHAR_TIER[mat];
      return { name: TIER_LABEL[tier] + ' ' + type[0].toUpperCase() + type.slice(1), tool: type, tier };
    };
    return tryPat(['XXX', ' S ', ' S '], 'pickaxe')
        || tryPat(['XX', 'XS', ' S'], 'axe') || tryPat(['XX', 'SX', 'S '], 'axe')
        || tryPat(['X', 'X', 'S'], 'sword');
  },
  gridCost(){
    const cost = {};
    this.grid.forEach(it => { if (it) cost[it] = (cost[it] || 0) + 1; });
    return cost;
  },
  canAfford(cost){
    for (const k in cost) if ((this.counts[k] || 0) < cost[k]) return false;
    return true;
  },
  craftGrid(){
    const res = this.matchGrid();
    if (!res || res.none){ Sound.deny(); return; }
    const cost = this.gridCost();
    if (!this.canAfford(cost)){ Sound.deny(); showMsg('Materials kam hain!'); return; }
    if (res.tool){
      if (TIER_RANK[this.tools[res.tool]] >= TIER_RANK[res.tier]){ Sound.deny(); showMsg('Isse behtar ' + res.tool + ' pehle se hai'); return; }
      for (const k in cost) this.counts[k] -= cost[k];
      this.tools[res.tool] = res.tier;
      showMsg('\u2728 ' + res.name + ' ban gaya!');
    } else if (res.table){
      for (const k in cost) this.counts[k] -= cost[k];
      this.hasTable = true;
      showMsg('\ud83d\udee0\ufe0f Crafting Table ban gaya! Ab 3x3 grid khul gaya');
    } else if (res.give){
      for (const k in cost) this.counts[k] -= cost[k];
      for (const k in res.give) this.counts[k] += res.give[k];
      showMsg('\u2728 ' + res.name);
    }
    this.grid = Array(9).fill(null);
    Sound.craft();
    this.renderCraft(); this.renderHotbar(); this.renderPanel();
  },
  renderCraft(){
    document.getElementById('craft-res').textContent =
      'Log: ' + this.counts.log + ' | Planks: ' + this.counts.planks +
      ' | Stick: ' + this.counts.stick + ' | Cobble: ' + this.counts.cobble +
      ' | Coal: ' + this.counts.coal + ' | Gold: ' + this.counts.gold +
      ' | Iron: ' + this.counts.iron + ' | Diamond: ' + this.counts.diamond;
    // palette
    const pal = document.getElementById('craft-palette'); pal.innerHTML = '';
    PALETTE.forEach(p => {
      const d = document.createElement('div');
      d.className = 'pal' + (this.paletteSel === p.item ? ' sel' : '');
      d.innerHTML = '<span class="sw" style="background:' + p.css + '"></span>' + p.label + ' (' + (this.counts[p.item] || 0) + ')';
      d.onclick = () => { this.paletteSel = p.item; this.renderCraft(); };
      pal.appendChild(d);
    });
    // 3x3 grid (only 2x2 usable until crafting table is made)
    const gr = document.getElementById('craft-grid'); gr.innerHTML = '';
    const open2x2 = [0, 1, 3, 4];
    for (let i = 0; i < 9; i++){
      const cell = document.createElement('div');
      const lockedCell = !this.hasTable && !open2x2.includes(i);
      cell.className = 'cg' + (lockedCell ? ' lock' : '');
      if (this.grid[i]){
        const p = PALETTE.find(q => q.item === this.grid[i]);
        cell.innerHTML = '<span class="sw" style="background:' + (p ? p.css : '#fff') + '"></span>';
      }
      if (!lockedCell) cell.onclick = () => {
        this.grid[i] = this.grid[i] ? null : this.paletteSel;
        this.renderCraft();
      };
      gr.appendChild(cell);
    }
    // result
    const res = this.matchGrid();
    const cost = this.gridCost();
    const out = document.getElementById('craft-result');
    const btn = document.getElementById('craft-btn');
    out.textContent = res ? res.name : '\u2014';
    btn.disabled = !res || res.none || !this.canAfford(cost)
      || (res.tool && TIER_RANK[this.tools[res.tool]] >= TIER_RANK[res.tier]);
    btn.onclick = () => this.craftGrid();
    // hint + quick armor crafting
    document.getElementById('craft-hint').textContent = this.hasTable
      ? 'Recipe: Pickaxe = 3 material + 2 stick \u00b7 Sword = 2 material + 1 stick \u00b7 Axe = 2x2 corner + 2 stick \u00b7 Torch = coal + stick \u00b7 Door = 6 planks (2x3) \u00b7 Furnace = 8 cobble (ring)'
      : '\ud83d\udd12 Abhi sirf 2x2 hai \u00b7 4 Planks (2x2) se Crafting Table banao to 3x3 grid khulega!';
    const quick = document.getElementById('craft-quick'); quick.innerHTML = '';
    const qt = document.createElement('b'); qt.style.fontSize = '13px'; qt.textContent = '\ud83d\udee1\ufe0f Armor (quick craft)'; quick.appendChild(qt);
    [['Gold', 'gold', 20], ['Iron', 'iron', 24], ['Diamond', 'diamond', 24]].forEach(([set, mat, n]) => {
      const row = document.createElement('div'); row.className = 'craft-row';
      const nm = document.createElement('span'); nm.textContent = set + ' Armor Set'; row.appendChild(nm);
      const cs = document.createElement('span'); cs.className = 'cost'; cs.textContent = n + '\u00d7' + mat; row.appendChild(cs);
      const b = document.createElement('button');
      const done = this.armorUnlocked[set];
      b.textContent = done ? '\u2705' : 'Craft';
      b.disabled = done || (this.counts[mat] || 0) < n;
      b.onclick = () => {
        if (done || (this.counts[mat] || 0) < n){ Sound.deny(); return; }
        this.counts[mat] -= n;
        this.armorUnlocked[set] = true;
        Sound.craft();
        showMsg('\ud83d\udee1\ufe0f ' + set + ' Armor unlock! E dabake pehno');
        this.renderCraft(); this.renderPanel(); this.renderHotbar();
      };
      row.appendChild(b);
      quick.appendChild(row);
    });
  },
  renderHUD(){
    const pts = this.armorPoints();
    document.getElementById('armorbar').textContent = pts > 0 ? '\ud83d\udee1\ufe0f'.repeat(Math.ceil(pts / 4)) + ' ' + pts + '/20' : '';
    const hp = (typeof Player !== 'undefined') ? Math.max(0, Math.ceil(Player.health / 2)) : 10;
    const hu = (typeof Player !== 'undefined') ? Math.max(0, Math.ceil(Player.hunger / 2)) : 10;
    document.getElementById('hearts').textContent = '\u2764\ufe0f'.repeat(hp) + '\ud83d\udda4'.repeat(10 - hp);
    document.getElementById('hungerbar').textContent = '\ud83c\udf57'.repeat(hu);
  },
};
