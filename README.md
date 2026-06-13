# ⛏️ MineKing - Browser Minecraft Game

Ek Minecraft-style voxel game jo seedha browser mein chalta hai. Three.js se bana hai, koi build step nahi chahiye.

A Minecraft-style voxel game that runs directly in the browser. Built with Three.js, no build step required.

## ✨ Features

- 🌍 **Infinite world** - chunks dynamically load hote hain jaise aap chalte ho (asli Minecraft jaisa!)
- 🕳️ **Caves** - zameen ke neeche tunnels aur caverns, bedrock tak khodo
- ⛏️ **Ores** - coal, iron, gold (y<16) aur diamond (y<10) - jitna gehra, utna keemti
- 🏘️ **Structures** - village houses aur cobblestone towers world mein milte hain
- 🌙 **Day/Night cycle** - suraj ugta aur dhalta hai, raat ko andhera
- 🐑 **Mobs** - sheep, cows aur pigs din mein; raat ko **zombies**, **skeletons** (teer maarte hain 🏹), **spiders** aur **creepers** (creeper phat'ta hai 💥)
- 🔥 **Furnace + smelting** - 8 cobble se furnace banao; raw iron/gold smelt karo, sand se glass, raw khana pakao (fuel: coal/log/planks)
- 🔦 **Torch** - coal + stick se banao, raat ko asli roshni deti hai
- 🚪 **Door** - 6 planks se banao, Right Click se kholo/band karo
- 🍗 **Hunger bar** - bhookh lagti hai, khana khao (Right Click) warna health girti hai
- ❤️ **Health system** - mobs se damage, armor se bachav, khana poora ho to regen
- 🧱 **Item counts** - blocks mine karke collect karo, place karne par kharch hote hain
- 🛠️ **Crafting (C)** - planks, sticks, torch, door, furnace, tools aur armor banao
- ⛏️ **Tools** - pickaxe, axe, sword - wood se stone, gold, iron aur diamond tak upgrade
- 🛡️ **Armor** - leather free, gold/iron/diamond crafting se unlock (press `E` to equip)
- 🖼️ **Online textures** - real Minecraft textures download hoti hain, offline ho to procedural fallback
- 🧍 **Steve character** - press `V` for third-person view
- 🔊 **Sounds** - WebAudio se procedural sounds (press `M` to mute)
- 💾 **Auto-save** - world, inventory aur position browser mein save hote hain

## 🎮 Controls

| Key | Action |
|-----|--------|
| `W A S D` | Move |
| `Mouse` | Look around |
| `Space` | Jump / Swim up |
| `Shift` | Sprint (bhookh jaldi lagti hai!) |
| `Left Click` (hold) | Break block / Attack mob |
| `Right Click` | Place block / Eat food |
| `1-9` / `Scroll` | Select hotbar item |
| `E` | Armor inventory |
| `C` | Crafting menu |
| `V` | First/third person view |
| `M` | Mute/unmute sound |
| `Esc` | Pause menu |

## 🚀 How to Run / Kaise Chalayein

### Option 1: GitLab Pages (online)
Pipeline game ko GitLab Pages par deploy karti hai:

```
https://game-king-group.gitlab.io/game-king-project
```

### Option 2: Locally
1. Repository clone ya download karo
2. `index.html` ko browser mein open karo (double click) - bas itna hi!

## 💡 Game Tips

- Stone/ores todne ke liye **pickaxe** use karo, lakdi ke liye **axe**
- **Caves** mein ores jaldi milte hain - coal upar, diamond sabse neeche (y<10)
- Raw iron/gold ko **furnace** mein smelt karna padta hai (8 cobble ring se furnace banao)
- **Torch** lagao caves aur ghar mein - raat ko roshni milegi
- Raat ko creeper paas aaye to **bhaago** - wo phat'ta hai aur blocks tod deta hai
- **Skeleton** door se teer maarta hai - blocks ke peeche chhupo!
- Khana: janwar maaro (cow/pig +2, sheep +1 raw) - furnace mein pakao to zyada bhook bhare
- Sand ko furnace mein smelt karke **glass** banta hai - ghar ki khidkiyon ke liye

## 📁 Project Structure

```
index.html        # Game page, HUD, menus and panels
src/sounds.js     # Procedural WebAudio sounds
src/textures.js   # Block textures (online + procedural fallback)
src/world.js      # Infinite chunked world generation and structures
src/mobs.js       # Sheep, cows, zombies and creepers
src/inventory.js  # Hotbar, item counts, tools, armor and crafting
src/player.js     # Player physics, health, hunger and Steve model
src/main.js       # Game loop, day/night, combat, save/load
```
