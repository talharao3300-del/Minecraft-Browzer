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
const ARMOR_ICON = { helmet: '🪖', chestplate: '👕', leggings: '👖', boots: '🥾' };
const ARMOR_PREFIX = { Leather: 'leather', Gold: 'golden', Iron: 'iron', Diamond: 'diamond' };
const ARMOR_SETS = {
  Leather:  { helmet: 1, chestplate: 3, leggings: 2, boots: 1 },
  Gold:     { helmet: 2, chestplate: 5, leggings: 3, boots: 1 },
  Iron:     { helmet: 2, chestplate: 6, leggings: 5, boots: 2 },
  Diamond:  { helmet: 3, chestplate: 8, leggings: 6, boots: 3 },
};
const TIER_RANK = { wood: 0, stone: 1, gold: 2, iron: 3, diamond: 4 };
const TIER_SPEED = { wood: 2, stone: 4, gold: 8, iron: 6, diamond: 9 };
const TIER_LABEL = { wood: 'Wooden', stone: 'Stone', gold: '✨ Golden', iron: 'Iron', diamond: '💎 Diamond' };
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
  { from: 'rawiron', to: 'iron',  label: 'Raw Iron → Iron' },
  { from: 'rawgold', to: 'gold',  label: 'Raw Gold → Gold' },
  { from: 'sand',    to: 'glass', label: 'Sand → Glass' },
  { from: 'rawfood', to: 'food',  label: 'Raw Khana → Khana' },
];

const INV_ITEMS = [
  { item: 'grass', name: 'Grass', css: BLOCK_CSS[1] },
  { item: 'dirt', name: 'Dirt', css: BLOCK_CSS[2] },
  { item: 'sand', name: 'Sand', css: BLOCK_CSS[4] },
  { item: 'cobble', name: 'Cobble', css: '#7e7e7e' },
  { item: 'planks', name: 'Planks', css: BLOCK_CSS[7] },
  { item: 'log', name: 'Log', css: BLOCK_CSS[5] },
  { item: 'glass', name: 'Glass', css: BLOCK_CSS[18] },
  { item: 'torch', name: 'Torch', css: BLOCK_CSS[19] },
  { item: 'door', name: 'Door', css: BLOCK_CSS[20] },
  
  { item: 'stick', name: 'Stick', css: '#8a6a3e' },
  { item: 'coal', name: 'Coal', css: '#262626' },
  { item: 'rawiron', name: 'Raw Iron', css: '#b08868' },
  { item: 'iron', name: 'Iron', css: '#d8d8d8' },
  { item: 'rawgold', name: 'Raw Gold', css: '#c9a83a' },
  { item: 'gold', name: 'Gold', css: '#f4cf3a' },
  { item: 'diamond', name: 'Diamond', css: '#4aedd9' },
  { item: 'furnace', name: 'Furnace', css: BLOCK_CSS[17] },
  
  { item: 'rawfood', name: 'Raw Food', css: '#c87a6a' },
  { item: 'food', name: 'Food', css: '#a05a2a' }
];

const RECIPES = [
  { key: 'planks', name: 'Planks', img: 'block/oak_planks.png' },
  { key: 'stick', name: 'Stick', img: 'item/stick.png' },
  { key: 'table', name: 'Craft Table', img: 'block/crafting_table_top.png' },
  { key: 'torch', name: 'Torch', img: 'block/torch.png' },
  { key: 'door', name: 'Door', img: 'item/oak_door.png' },
  { key: 'furnace', name: 'Furnace', img: 'block/furnace_front_on.png' },
  { key: 'pickaxe', name: 'Pickaxe', img: 'item/wooden_pickaxe.png' },
  { key: 'axe', name: 'Axe', img: 'item/wooden_axe.png' },
  { key: 'sword', name: 'Sword', img: 'item/wooden_sword.png' },
  { key: 'armor-Gold', name: 'Gold Armor Set (20 Gold)', img: 'item/golden_chestplate.png', isArmor: true, set: 'Gold', mat: 'gold', cost: 20 },
  { key: 'armor-Iron', name: 'Iron Armor Set (24 Iron)', img: 'item/iron_chestplate.png', isArmor: true, set: 'Iron', mat: 'iron', cost: 24 },
  { key: 'armor-Diamond', name: 'Diamond Armor Set (24 Diamond)', img: 'item/diamond_chestplate.png', isArmor: true, set: 'Diamond', mat: 'diamond', cost: 24 },
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
  itemImg(it){
    const itemMap = {
      log: 'block/oak_log.png',
      planks: 'block/oak_planks.png',
      stick: 'item/stick.png',
      cobble: 'block/cobblestone.png',
      coal: 'item/coal.png',
      iron: 'item/iron_ingot.png',
      gold: 'item/gold_ingot.png',
      diamond: 'item/diamond.png',
      grass: 'block/grass_block_side.png',
      dirt: 'block/dirt.png',
      sand: 'block/sand.png',
      glass: 'block/glass.png',
      torch: 'block/torch.png',
      door: 'item/oak_door.png',
      furnace: 'block/furnace_front_on.png',
      food: 'item/cooked_beef.png',
      rawfood: 'item/raw_beef.png',
      rawiron: 'item/raw_iron.png',
      rawgold: 'item/raw_gold.png'
    };
    const path = itemMap[it];
    if (!path) return '';
    return 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.4/assets/minecraft/textures/' + path;
  },
  addDrop(t){
    const map = { 1: 'grass', 2: 'dirt', 3: 'cobble', 8: 'cobble', 4: 'sand', 5: 'log', 7: 'planks', 13: 'planks',
                  17: 'furnace', 18: 'glass', 19: 'torch', 20: 'door', 21: 'door' };
    if (t === 6){ if (Math.random() < 0.15){ this.counts.food++; showMsg('🍎 +1 Khana'); } }
    else if (t === 11){ this.counts.rawiron++; showMsg('⚙️ +1 Raw Iron (furnace mein smelt karo)'); }
    else if (t === 12){ this.counts.diamond++; showMsg('💎 +1 Diamond!'); }
    else if (t === 15){ this.counts.coal++; showMsg('⬛ +1 Coal'); }
    else if (t === 16){ this.counts.rawgold++; showMsg('✨ +1 Raw Gold (furnace mein smelt karo)'); }
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
    if (!fuel){ Sound.deny(); showMsg('🔥 Fuel chahiye: coal, log ya planks!'); return; }
    const n = Math.min(fuel.batch, this.counts[rec.from]);
    this.counts[fuel.item]--;
    this.counts[rec.from] -= n;
    this.counts[rec.to] += n;
    Sound.craft();
    showMsg('🔥 +' + n + ' ' + rec.label.split('→')[1].trim() + ' (fuel: 1 ' + fuel.item + ')');
    this.renderFurnace(); this.renderHotbar(); this.renderPanel();
  },
  renderFurnace(){
    const fl = document.getElementById('furnace-fuel');
    fl.textContent = 'Fuel: Coal ' + this.counts.coal + ' (4 item/coal) · Log ' + this.counts.log + ' (2/log) · Planks ' + this.counts.planks + ' (1/plank)';
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
  
  cycleArmor(type) {
    const sets = ['Leather', 'Gold', 'Iron', 'Diamond'];
    const current = this.equipped[type];
    let next = null;
    if (current === null) {
      for (const set of sets) {
        if (this.armorUnlocked[set]) {
          next = set;
          break;
        }
      }
    } else {
      const idx = sets.indexOf(current);
      let found = false;
      for (let i = idx + 1; i < sets.length; i++) {
        if (this.armorUnlocked[sets[i]]) {
          next = sets[i];
          found = true;
          break;
        }
      }
      if (!found) {
        next = null;
      }
    }
    this.equipped[type] = next;
    Sound.place();
    this.renderPanel();
    this.renderHUD();
  },

  renderPanel(){
    // Armor columns
    const armList = document.getElementById('mc-armor-slots');
    if (armList) {
      armList.innerHTML = '';
      ARMOR_TYPES.forEach(type => {
        const slot = document.createElement('div');
        const equippedSet = this.equipped[type];
        slot.className = 'mc-slot';
        if (equippedSet) {
          const img = document.createElement('img');
          img.src = ITEM_TEX_BASE + ARMOR_PREFIX[equippedSet] + '_' + type + '.png';
          slot.appendChild(img);
        } else {
          slot.classList.add('empty-armor');
          slot.setAttribute('data-icon', ARMOR_ICON[type]);
        }
        slot.onclick = () => this.cycleArmor(type);
        armList.appendChild(slot);
      });
    }

    // Dynamic Steve Previews
    ARMOR_TYPES.forEach(type => {
      const equippedSet = this.equipped[type];
      if (type === 'helmet') {
        const el = document.getElementById('overlay-helmet');
        if (el) {
          el.className = 'helmet-overlay' + (equippedSet ? ' armor-color-' + equippedSet : '');
          el.style.display = equippedSet ? 'block' : 'none';
        }
      } else if (type === 'chestplate') {
        const torso = document.getElementById('overlay-chestplate-torso');
        const armL = document.getElementById('overlay-chestplate-arm-l');
        const armR = document.getElementById('overlay-chestplate-arm-r');
        [torso, armL, armR].forEach(el => {
          if (el) {
            el.className = 'chestplate-torso-overlay' + (el.id.includes('arm') ? ' chestplate-arm-overlay' : '') + (equippedSet ? ' armor-color-' + equippedSet : '');
            el.style.display = equippedSet ? 'block' : 'none';
          }
        });
      } else if (type === 'leggings') {
        const legL = document.getElementById('overlay-leggings-l');
        const legR = document.getElementById('overlay-leggings-r');
        [legL, legR].forEach(el => {
          if (el) {
            el.className = 'leggings-overlay' + (equippedSet ? ' armor-color-' + equippedSet : '');
            el.style.display = equippedSet ? 'block' : 'none';
          }
        });
      } else if (type === 'boots') {
        const bootL = document.getElementById('overlay-boots-l');
        const bootR = document.getElementById('overlay-boots-r');
        [bootL, bootR].forEach(el => {
          if (el) {
            el.className = 'boots-overlay' + (equippedSet ? ' armor-color-' + equippedSet : '');
            el.style.display = equippedSet ? 'block' : 'none';
          }
        });
      }
    });

    // 3x9 Inventory
    const invGrid = document.getElementById('mc-inventory-slots');
    if (invGrid) {
      invGrid.innerHTML = '';
      for (let i = 0; i < 27; i++) {
        const slot = document.createElement('div');
        slot.className = 'mc-slot';
        if (i < INV_ITEMS.length) {
          const it = INV_ITEMS[i];
          const count = this.counts[it.item] || 0;
          if (count > 0 || this.paletteSel === it.item) {
            const img = document.createElement('img');
            img.src = this.itemImg(it.item);
            img.style.background = it.css;
            slot.appendChild(img);
            if (count > 0) {
              const cntSpan = document.createElement('span');
              cntSpan.className = 'cnt';
              cntSpan.textContent = count;
              slot.appendChild(cntSpan);
            }
          } else {
            const img = document.createElement('img');
            img.src = this.itemImg(it.item);
            img.style.background = it.css;
            img.style.opacity = '0.18';
            slot.appendChild(img);
          }
          if (this.paletteSel === it.item) {
            slot.classList.add('selected-material');
          }
          slot.onclick = () => {
            if (this.counts[it.item] > 0) {
              this.paletteSel = it.item;
              this.renderPanel();
              this.renderCraft();
            } else {
              showMsg(it.name + ' nahi hai!');
            }
          };
        }
        invGrid.appendChild(slot);
      }
    }

    // 2x2 Crafting Grid
    const craftGrid = document.getElementById('mc-crafting-grid-inv');
    if (craftGrid) {
      craftGrid.innerHTML = '';
      const indices2x2 = [0, 1, 3, 4];
      indices2x2.forEach(idx => {
        const slot = document.createElement('div');
        slot.className = 'mc-slot';
        const gridItem = this.grid[idx];
        if (gridItem) {
          const p = INV_ITEMS.find(q => q.item === gridItem);
          const img = document.createElement('img');
          img.src = this.itemImg(gridItem);
          if (p) img.style.background = p.css;
          slot.appendChild(img);
        }
        slot.onclick = () => {
          this.grid[idx] = this.grid[idx] ? null : this.paletteSel;
          this.renderPanel();
          this.renderCraft();
        };
        craftGrid.appendChild(slot);
      });
    }

    // 2x2 Output
    const res = this.matchGrid();
    const cost = this.gridCost();
    const out = document.getElementById('mc-craft-out-inv');
    const btn = document.getElementById('mc-craft-btn-inv');
    if (out && btn) {
      out.innerHTML = '';
      if (res) {
        const resItem = res.give ? Object.keys(res.give)[0] : (res.tool ? res.tool : 'table');
        const img = document.createElement('img');
        if (res.tool) {
          img.src = this.toolImg(res.tool);
        } else if (res.table) {
          img.src = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.4/assets/minecraft/textures/block/crafting_table_top.png';
        } else {
          img.src = this.itemImg(resItem);
        }
        out.appendChild(img);
        if (res.give && res.give[resItem] > 1) {
          const cnt = document.createElement('span');
          cnt.className = 'cnt';
          cnt.textContent = res.give[resItem];
          out.appendChild(cnt);
        }
        out.title = res.name;
      }
      btn.disabled = !res || res.none || !this.canAfford(cost)
        || (res.tool && TIER_RANK[this.tools[res.tool]] >= TIER_RANK[res.tier]);
      btn.onclick = () => this.craftGrid();
    }

    // Hotbar (under panel)
    const hotbarGrid = document.getElementById('mc-hotbar-slots-inv');
    if (hotbarGrid) {
      this.populateHotbarUI(hotbarGrid);
    }

    // Recipe Book lists
    const recipeList = document.getElementById('recipe-list-inv');
    if (recipeList) {
      this.populateRecipesUI(recipeList, false);
    }
  },

  populateHotbarUI(container) {
    container.innerHTML = '';
    SLOTS.forEach((it, i) => {
      const slot = document.createElement('div');
      slot.className = 'mc-slot' + (i === this.sel ? ' selected-material' : '');
      if (it.kind === 'block') {
        const img = document.createElement('img');
        img.src = this.itemImg(it.item);
        img.style.background = BLOCK_CSS[it.id];
        slot.appendChild(img);
        const count = this.counts[it.item];
        if (count > 0) {
          const cntSpan = document.createElement('span');
          cntSpan.className = 'cnt';
          cntSpan.textContent = count;
          slot.appendChild(cntSpan);
        }
      } else if (it.kind === 'tool') {
        const img = document.createElement('img');
        img.src = this.toolImg(it.tool);
        slot.appendChild(img);
      } else {
        const img = document.createElement('img');
        img.src = ITEM_TEX_BASE + 'cooked_beef.png';
        slot.appendChild(img);
        const count = this.counts.food + this.counts.rawfood;
        if (count > 0) {
          const cntSpan = document.createElement('span');
          cntSpan.className = 'cnt';
          cntSpan.textContent = count;
          slot.appendChild(cntSpan);
        }
      }
      slot.onclick = () => {
        this.select(i);
        this.renderPanel();
        this.renderCraft();
      };
      container.appendChild(slot);
    });
  },

  populateRecipesUI(container, include3x3) {
    container.innerHTML = '';
    RECIPES.forEach(recipe => {
      const is3x3 = recipe.key === 'door' || recipe.key === 'furnace' || recipe.key === 'pickaxe' || recipe.key === 'axe' || recipe.key === 'sword';
      if (is3x3 && !include3x3 && !this.hasTable) return;
      const item = document.createElement('div');
      item.className = 'recipe-item';
      const img = document.createElement('img');
      if (recipe.key === 'pickaxe' || recipe.key === 'axe' || recipe.key === 'sword') {
        img.src = this.toolImg(recipe.key);
      } else if (recipe.isArmor) {
        img.src = ITEM_TEX_BASE + ARMOR_PREFIX[recipe.set] + '_chestplate.png';
      } else {
        img.src = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.4/assets/minecraft/textures/' + recipe.img;
      }
      item.appendChild(img);
      const nameSpan = document.createElement('span');
      nameSpan.textContent = recipe.name;
      item.appendChild(nameSpan);
      item.onclick = () => this.autofillRecipe(recipe.key);
      container.appendChild(item);
    });
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
    if (key === 'L') return { name: 'Planks ×4', give: { planks: 4 } };
    if (key === 'W/W') return { name: 'Stick ×4', give: { stick: 4 } };
    if (key === 'WW/WW') return this.hasTable ? { name: 'Crafting Table (pehle se hai)', none: true } : { name: '🛠️ Crafting Table', table: true };
    if (key === 'O/S') return { name: '🔦 Torch ×4', give: { torch: 4 } };
    if (key === 'WW/WW/WW') return { name: '🚪 Door ×3', give: { door: 3 } };
    if (key === 'CCC/C C/CCC') return { name: '🔥 Furnace', give: { furnace: 1 } };
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
      showMsg('✨ ' + res.name + ' ban gaya!');
    } else if (res.table){
      for (const k in cost) this.counts[k] -= cost[k];
      this.hasTable = true;
      showMsg('🛠️ Crafting Table ban gaya! Ab 3x3 grid khul gaya (C dabaye)');
    } else if (res.give){
      for (const k in cost) this.counts[k] -= cost[k];
      for (const k in res.give) this.counts[k] += res.give[k];
      showMsg('✨ ' + res.name);
    }
    this.grid = Array(9).fill(null);
    Sound.craft();
    this.renderPanel(); this.renderCraft(); this.renderHotbar();
  },

  getBestToolMaterial() {
    const mats = ['diamond', 'iron', 'gold', 'cobble', 'planks'];
    for (const m of mats) {
      if ((this.counts[m] || 0) > 0) return m;
    }
    return 'planks';
  },

  autofillRecipe(key) {
    const recipe = RECIPES.find(r => r.key === key);
    if (!recipe) return;
    if (recipe.isArmor) {
      const done = this.armorUnlocked[recipe.set];
      if (done) {
        showMsg(recipe.set + ' Armor pehle se unlocked hai!');
        return;
      }
      if ((this.counts[recipe.mat] || 0) < recipe.cost) {
        Sound.deny();
        showMsg('Materials kam hain! ' + recipe.cost + 'x ' + recipe.mat + ' chahiye');
        return;
      }
      this.counts[recipe.mat] -= recipe.cost;
      this.armorUnlocked[recipe.set] = true;
      Sound.craft();
      showMsg('🛡️ ' + recipe.set + ' Armor unlock! E dabake pehno');
      this.renderPanel();
      this.renderCraft();
      return;
    }
    const validMats = ['planks', 'cobble', 'gold', 'iron', 'diamond'];
    let toolMat = this.paletteSel;
    if (!validMats.includes(toolMat)) {
      toolMat = this.getBestToolMaterial();
    }
    const layouts = {
      planks: [ 'log', null, null, null, null, null, null, null, null ],
      stick: [ 'planks', null, null, 'planks', null, null, null, null, null ],
      table: [ 'planks', 'planks', null, 'planks', 'planks', null, null, null, null ],
      torch: [ 'coal', null, null, 'stick', null, null, null, null, null ],
      door: [ 'planks', 'planks', null, 'planks', 'planks', null, 'planks', 'planks', null ],
      furnace: [ 'cobble', 'cobble', 'cobble', 'cobble', null, 'cobble', 'cobble', 'cobble', 'cobble' ],
      pickaxe: [ toolMat, toolMat, toolMat, null, 'stick', null, null, 'stick', null ],
      axe: [ toolMat, toolMat, null, toolMat, 'stick', null, null, 'stick', null ],
      sword: [ toolMat, null, null, toolMat, null, null, null, 'stick', null ]
    };
    const layout = layouts[key];
    if (!layout) return;
    const is3x3 = key === 'door' || key === 'furnace' || key === 'pickaxe' || key === 'axe' || key === 'sword';
    if (is3x3 && !this.hasTable) {
      Sound.deny();
      showMsg('Pehle Crafting Table banao!');
      return;
    }
    const countsNeeded = {};
    layout.forEach(item => { if (item) countsNeeded[item] = (countsNeeded[item] || 0) + 1; });
    let canAfford = true;
    for (const item in countsNeeded) {
      if ((this.counts[item] || 0) < countsNeeded[item]) { canAfford = false; break; }
    }
    if (!canAfford) {
      Sound.deny();
      showMsg('Materials kam hain is recipe ke liye!');
      return;
    }
    this.grid = [...layout];
    Sound.craft();
    this.renderPanel();
    this.renderCraft();
  },

  renderCraft(){
    // 3x3 Grid
    const gr = document.getElementById('mc-crafting-grid-table');
    if (gr) {
      gr.innerHTML = '';
      for (let i = 0; i < 9; i++){
        const cell = document.createElement('div');
        cell.className = 'mc-slot';
        if (this.grid[i]){
          const p = INV_ITEMS.find(q => q.item === this.grid[i]);
          const img = document.createElement('img');
          img.src = this.itemImg(this.grid[i]);
          if (p) img.style.background = p.css;
          cell.appendChild(img);
        }
        cell.onclick = () => {
          this.grid[i] = this.grid[i] ? null : this.paletteSel;
          this.renderPanel();
          this.renderCraft();
        };
        gr.appendChild(cell);
      }
    }

    // 3x3 Output Result
    const res = this.matchGrid();
    const cost = this.gridCost();
    const out = document.getElementById('mc-craft-out-table');
    const btn = document.getElementById('mc-craft-btn-table');
    if (out && btn) {
      out.innerHTML = '';
      if (res) {
        const resItem = res.give ? Object.keys(res.give)[0] : (res.tool ? res.tool : 'table');
        const img = document.createElement('img');
        if (res.tool) {
          img.src = this.toolImg(res.tool);
        } else if (res.table) {
          img.src = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.4/assets/minecraft/textures/block/crafting_table_top.png';
        } else {
          img.src = this.itemImg(resItem);
        }
        out.appendChild(img);
        if (res.give && res.give[resItem] > 1) {
          const cnt = document.createElement('span');
          cnt.className = 'cnt';
          cnt.textContent = res.give[resItem];
          out.appendChild(cnt);
        }
        out.title = res.name;
      }
      btn.disabled = !res || res.none || !this.canAfford(cost)
        || (res.tool && TIER_RANK[this.tools[res.tool]] >= TIER_RANK[res.tier]);
      btn.onclick = () => this.craftGrid();
    }

    // 3x9 Inventory Table
    const invGridTable = document.getElementById('mc-inventory-slots-table');
    if (invGridTable) {
      invGridTable.innerHTML = '';
      for (let i = 0; i < 27; i++) {
        const slot = document.createElement('div');
        slot.className = 'mc-slot';
        if (i < INV_ITEMS.length) {
          const it = INV_ITEMS[i];
          const count = this.counts[it.item] || 0;
          if (count > 0 || this.paletteSel === it.item) {
            const img = document.createElement('img');
            img.src = this.itemImg(it.item);
            img.style.background = it.css;
            slot.appendChild(img);
            if (count > 0) {
              const cntSpan = document.createElement('span');
              cntSpan.className = 'cnt';
              cntSpan.textContent = count;
              slot.appendChild(cntSpan);
            }
          } else {
            const img = document.createElement('img');
            img.src = this.itemImg(it.item);
            img.style.background = it.css;
            img.style.opacity = '0.18';
            slot.appendChild(img);
          }
          if (this.paletteSel === it.item) {
            slot.classList.add('selected-material');
          }
          slot.onclick = () => {
            if (this.counts[it.item] > 0) {
              this.paletteSel = it.item;
              this.renderPanel();
              this.renderCraft();
            } else {
              showMsg(it.name + ' nahi hai!');
            }
          };
        }
        invGridTable.appendChild(slot);
      }
    }

    // Hotbar Table
    const hotbarGridTable = document.getElementById('mc-hotbar-slots-table');
    if (hotbarGridTable) {
      this.populateHotbarUI(hotbarGridTable);
    }

    // Recipe Book Table
    const recipeListCraft = document.getElementById('recipe-list-craft');
    if (recipeListCraft) {
      this.populateRecipesUI(recipeListCraft, true);
    }
  },

  renderHUD(){
    const pts = this.armorPoints();
    document.getElementById('armorbar').textContent = pts > 0 ? '🛡️'.repeat(Math.ceil(pts / 4)) + ' ' + pts + '/20' : '';
    const hp = (typeof Player !== 'undefined') ? Math.max(0, Math.ceil(Player.health / 2)) : 10;
    const hu = (typeof Player !== 'undefined') ? Math.max(0, Math.ceil(Player.hunger / 2)) : 10;
    document.getElementById('hearts').textContent = '❤️'.repeat(hp) + '🖤'.repeat(10 - hp);
    document.getElementById('hungerbar').textContent = '🍗'.repeat(hu);
  },
};
