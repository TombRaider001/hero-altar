/** Canvas rendering using original extracted assets. */

export const COLORS = {
    bg: '#9ea792',
    dark: '#1a1c18',
    mid: '#4a4a3a',
    light: '#e8e8c8',
    highlight: '#c4ceb0',
    shadow: '#6b7561',
    text: '#1a1c18',
};

export const TILE_SIZE = 16;  // We render 32x32 original assets at half size
export const VIEW_W = 20;
export const VIEW_H = 15;

// Logical canvas size
export const SCREEN_W = 320;
export const SCREEN_H = 240;

// Original assets are 32x32 per tile; we draw them scaled to 16x16.
const SRC_TILE = 32;
const SCALE = TILE_SIZE / SRC_TILE;

// Tile coordinates in assets/tileset.png (256x2048, 32x32 source tiles)
const TILES = {
    floorTown: { x: 64, y: 0, w: 32, h: 32 },
    floorRoad: { x: 160, y: 0, w: 32, h: 32 },
    floorWild: { x: 0, y: 32, w: 32, h: 32 },
    floorIndoor: { x: 192, y: 0, w: 32, h: 32 },

    tree1: { x: 0, y: 736, w: 32, h: 48 },
    tree2: { x: 32, y: 736, w: 32, h: 48 },
    tree3: { x: 0, y: 784, w: 32, h: 48 },

    house1: { x: 0, y: 848, w: 64, h: 64 },
    house2: { x: 64, y: 848, w: 64, h: 64 },
    house3: { x: 128, y: 848, w: 64, h: 64 },
    tower: { x: 192, y: 848, w: 64, h: 80 },

    innSign: { x: 224, y: 800, w: 32, h: 32 },
    dojoSign: { x: 160, y: 800, w: 32, h: 32 },

    well: { x: 64, y: 912, w: 32, h: 32 },
    rock: { x: 96, y: 912, w: 32, h: 32 },
};

export class Renderer {
    constructor(canvas, assets) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.assets = assets;
    }

    clear() {
        this.ctx.fillStyle = COLORS.bg;
        this.ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    }

    drawMap(map, player) {
        if (!map) return;

        const mapType = this._getMapType(map);
        const floorTile = this._getFloorTile(mapType);

        // Draw floor
        for (let y = 0; y < VIEW_H; y++) {
            for (let x = 0; x < VIEW_W; x++) {
                const px = x * TILE_SIZE;
                const py = y * TILE_SIZE;
                this._drawTile(floorTile, px, py);
            }
        }

        // Draw location features
        this._drawLocationFeatures(map, mapType);

        // Draw exit markers
        const exits = map.connections || {};
        this.ctx.fillStyle = COLORS.text;
        this.ctx.font = '10px monospace';
        if (exits.north) this.ctx.fillText('北', 152, 12);
        if (exits.south) this.ctx.fillText('南', 232, 12);
        if (exits.east) this.ctx.fillText('东', 300, 120);
        if (exits.west) this.ctx.fillText('西', 4, 120);
    }

    _getMapType(map) {
        const name = map.name || '';
        if (name.includes('客栈') || name.includes('武馆')) return 'indoor';
        if (name.includes('郊') || name.includes('林')) return 'wild';
        if (name.includes('路')) return 'road';
        return 'town';
    }

    _getFloorTile(mapType) {
        switch (mapType) {
            case 'indoor': return TILES.floorIndoor;
            case 'wild': return TILES.floorWild;
            case 'road': return TILES.floorRoad;
            default: return TILES.floorTown;
        }
    }

    _drawTile(tile, px, py) {
        if (!this.assets.tileset) return;
        this.ctx.drawImage(
            this.assets.tileset,
            tile.x, tile.y, tile.w, tile.h,
            px, py, TILE_SIZE, TILE_SIZE
        );
    }

    _drawTileRegion(tile, tx, ty) {
        if (!this.assets.tileset) return;
        const px = tx * TILE_SIZE;
        const py = ty * TILE_SIZE;
        const dw = tile.w * SCALE;
        const dh = tile.h * SCALE;
        this.ctx.drawImage(
            this.assets.tileset,
            tile.x, tile.y, tile.w, tile.h,
            px, py, dw, dh
        );
    }

    _drawLocationFeatures(map, mapType) {
        const name = map.name || '';

        if (name.includes('客栈')) {
            this._drawTileRegion(TILES.house2, 6, 3);
            this._drawTileRegion(TILES.innSign, 7, 5);
        } else if (name.includes('武馆')) {
            this._drawTileRegion(TILES.house1, 6, 3);
            this._drawTileRegion(TILES.dojoSign, 7, 5);
        } else if (name.includes('镇东郊') || name.includes('镇西郊')) {
            this._drawTileRegion(TILES.tree1, 2, 3);
            this._drawTileRegion(TILES.tree2, 14, 4);
            this._drawTileRegion(TILES.tree3, 4, 10);
            this._drawTileRegion(TILES.tree1, 12, 11);
            this._drawTileRegion(TILES.rock, 8, 7);
        } else {
            // Town center
            this._drawTileRegion(TILES.house1, 1, 1);
            this._drawTileRegion(TILES.house3, 14, 1);
            this._drawTileRegion(TILES.house2, 1, 10);
            this._drawTileRegion(TILES.well, 9, 7);
        }
    }

    drawPlayer(player) {
        const img = player.gender === '女' ? this.assets.heroGirl : this.assets.heroBoy;
        if (!img) return;

        // Sprite sheet: 4 columns x 6 rows, each 32x32 source
        // Rows: 0=up, 1=right, 2=down, 3=left, 4-5=extra
        const dirMap = { up: 0, right: 1, down: 2, left: 3 };
        const row = dirMap[player.facing] ?? 2;
        const sx = 0; // frame 0
        const sy = row * 32;

        const px = player.x * TILE_SIZE;
        const py = player.y * TILE_SIZE;

        this.ctx.drawImage(img, sx, sy, 32, 32, px, py, TILE_SIZE, TILE_SIZE);
    }

    drawNpcs(npcs, world) {
        for (const npc of npcs) {
            const seed = npc.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            const x = 3 + (seed % 6);
            const y = 3 + ((seed >> 4) % 4);
            const px = x * TILE_SIZE;
            const py = y * TILE_SIZE;

            const img = npc.hostile ? this.assets.badMan : this.assets.badWoman;
            if (!img) continue;

            // Use down-facing frame
            const sx = 0;
            const sy = 2 * 32;
            this.ctx.drawImage(img, sx, sy, 32, 32, px, py, TILE_SIZE, TILE_SIZE);

            // Name tag
            this.ctx.fillStyle = COLORS.text;
            this.ctx.font = '8px "Microsoft YaHei", sans-serif';
            const tw = this.ctx.measureText(npc.name).width;
            this.ctx.fillText(npc.name, px + 8 - tw / 2, py - 2);
        }
    }

    drawStatusBar(player, mapName) {
        const h = 24;
        const y = SCREEN_H - h;

        this.ctx.fillStyle = COLORS.dark;
        this.ctx.fillRect(0, y, SCREEN_W, h);
        this.ctx.fillStyle = COLORS.highlight;
        this.ctx.fillRect(0, y, SCREEN_W, 1);

        this.ctx.fillStyle = COLORS.highlight;
        this.ctx.font = '9px "Microsoft YaHei", monospace';
        this.ctx.fillText(`${player.name} Lv.${player.level}  ${mapName}`, 4, y + 10);
        this.ctx.fillText(`气血 ${player.hp}/${player.maxHp}  内力 ${player.mp}/${player.maxMp}  钱 ${player.gold}`, 4, y + 20);
    }

    drawTextBox(lines, options = []) {
        const boxH = 84;
        const boxY = SCREEN_H - 24 - boxH;
        const pad = 4;

        this.ctx.fillStyle = COLORS.dark;
        this.ctx.fillRect(pad, boxY, SCREEN_W - pad * 2, boxH);
        this.ctx.fillStyle = COLORS.bg;
        this.ctx.fillRect(pad + 2, boxY + 2, SCREEN_W - pad * 2 - 4, boxH - 4);
        this.ctx.strokeStyle = COLORS.highlight;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(pad, boxY, SCREEN_W - pad * 2, boxH);

        this.ctx.fillStyle = COLORS.text;
        this.ctx.font = '11px "Microsoft YaHei", monospace';
        lines.forEach((line, i) => {
            this.ctx.fillText(line, pad + 8, boxY + 18 + i * 14);
        });

        if (options.length > 0) {
            let x = pad + 8;
            const optY = boxY + boxH - 18;
            options.forEach((opt, i) => {
                this.ctx.fillStyle = opt.selected ? '#8a4a4a' : COLORS.text;
                const label = `${i + 1}.${opt.label}`;
                this.ctx.fillText(label, x, optY);
                x += this.ctx.measureText(label).width + 16;
            });
        }
    }

    drawCombat(player, enemy, world, options, selectedIndex) {
        // Draw battle background
        if (this.assets.battleback) {
            this.ctx.drawImage(this.assets.battleback, 0, 0, SCREEN_W, SCREEN_H);
        } else {
            this.clear();
        }

        // Title
        this.ctx.fillStyle = COLORS.text;
        this.ctx.font = '14px "Microsoft YaHei", monospace';
        this.ctx.fillText('战斗！', 140, 20);

        // Player sprite (drawn larger in combat: 32x32)
        const heroImg = player.gender === '女' ? this.assets.heroGirl : this.assets.heroBoy;
        if (heroImg) {
            this.ctx.drawImage(heroImg, 0, 2 * 32, 32, 32, 48, 64, 32, 32);
        }
        this.ctx.fillStyle = COLORS.text;
        this.ctx.font = '10px "Microsoft YaHei", monospace';
        this.ctx.fillText(player.name, 44, 108);
        this._drawBar(32, 114, 64, 6, player.hp, player.maxHp, '#8a4a4a');

        // VS
        this.ctx.font = '12px monospace';
        this.ctx.fillText('VS', 152, 84);

        // Enemy sprite
        if (this.assets.badMan) {
            this.ctx.drawImage(this.assets.badMan, 0, 2 * 32, 32, 32, 240, 64, 32, 32);
        }
        this.ctx.fillText(enemy.name, 228, 108);
        this._drawBar(224, 114, 64, 6, enemy.hp, enemy.maxHp, '#8a4a4a');

        // Menu
        const menuX = 220;
        const menuY = 44;
        const menuW = 90;
        const menuH = 78;

        this.ctx.fillStyle = COLORS.dark;
        this.ctx.fillRect(menuX, menuY, menuW, menuH);
        this.ctx.fillStyle = COLORS.bg;
        this.ctx.fillRect(menuX + 2, menuY + 2, menuW - 4, menuH - 4);
        this.ctx.strokeStyle = COLORS.highlight;
        this.ctx.strokeRect(menuX, menuY, menuW, menuH);

        this.ctx.font = '12px "Microsoft YaHei", monospace';
        options.forEach((opt, i) => {
            this.ctx.fillStyle = i === selectedIndex ? '#8a4a4a' : COLORS.text;
            const marker = i === selectedIndex ? '▶ ' : '  ';
            this.ctx.fillText(marker + opt, menuX + 12, menuY + 20 + i * 16);
        });
    }

    _drawBar(x, y, w, h, current, max, color) {
        this.ctx.fillStyle = COLORS.dark;
        this.ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
        this.ctx.fillStyle = COLORS.bg;
        this.ctx.fillRect(x, y, w, h);
        const ratio = Math.max(0, current / max);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w * ratio, h);
    }
}
