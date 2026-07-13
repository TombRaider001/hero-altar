/** Canvas rendering for the game with retro LCD aesthetic. */

export const COLORS = {
    bg: '#9ea792',        // LCD background green
    bgDark: '#8b977d',    // Slightly darker green for pattern
    fg: '#1a1c18',        // Dark pixels
    fgLight: '#2f332a',   // Slightly lighter dark
    highlight: '#c4ceb0', // Light green highlight
    shadow: '#6b7561',    // Shadow green
    accent: '#5a6b4a',    // For trees/positive
    danger: '#7a4a4a',    // For enemies
    water: '#5a7a8a',
};

export const TILE_SIZE = 16;
export const VIEW_W = 20;
export const VIEW_H = 15;

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        // Pre-render tile patterns to offscreen canvas for performance
        this.patternCanvas = document.createElement('canvas');
        this.patternCanvas.width = TILE_SIZE * 4;
        this.patternCanvas.height = TILE_SIZE * 4;
        this.pctx = this.patternCanvas.getContext('2d');
        this._initPatterns();
    }

    _initPatterns() {
        // Floor dot pattern
        this.pctx.fillStyle = COLORS.bg;
        this.pctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        this.pctx.fillStyle = COLORS.bgDark;
        this.pctx.fillRect(6, 6, 2, 2);
        this.pctx.fillRect(14, 2, 2, 2);
        this.pctx.fillRect(2, 14, 2, 2);

        // Diamond pattern
        this.pctx.fillStyle = COLORS.bg;
        this.pctx.fillRect(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
        this.pctx.strokeStyle = COLORS.bgDark;
        this.pctx.lineWidth = 1;
        this.pctx.beginPath();
        this.pctx.moveTo(TILE_SIZE + 8, 2);
        this.pctx.lineTo(TILE_SIZE + 14, 8);
        this.pctx.lineTo(TILE_SIZE + 8, 14);
        this.pctx.lineTo(TILE_SIZE + 2, 8);
        this.pctx.closePath();
        this.pctx.stroke();

        // Brick wall pattern
        this.pctx.fillStyle = COLORS.highlight;
        this.pctx.fillRect(0, TILE_SIZE, TILE_SIZE, TILE_SIZE);
        this.pctx.fillStyle = COLORS.fg;
        this.pctx.fillRect(0, TILE_SIZE, TILE_SIZE, 1);
        this.pctx.fillRect(0, TILE_SIZE + 7, TILE_SIZE, 1);
        this.pctx.fillRect(0, TILE_SIZE + 15, TILE_SIZE, 1);
        this.pctx.fillRect(7, TILE_SIZE, 1, 7);
        this.pctx.fillRect(15, TILE_SIZE + 8, 1, 7);
        this.pctx.fillRect(0, TILE_SIZE + 8, 1, 7);

        // Road/cobblestone
        this.pctx.fillStyle = COLORS.shadow;
        this.pctx.fillRect(TILE_SIZE, TILE_SIZE, TILE_SIZE, TILE_SIZE);
        this.pctx.fillStyle = COLORS.bgDark;
        this.pctx.fillRect(TILE_SIZE + 3, TILE_SIZE + 3, 4, 3);
        this.pctx.fillRect(TILE_SIZE + 10, TILE_SIZE + 8, 5, 4);
        this.pctx.fillRect(TILE_SIZE + 6, TILE_SIZE + 12, 3, 3);

        // Grass/wilderness
        this.pctx.fillStyle = COLORS.bg;
        this.pctx.fillRect(0, TILE_SIZE * 2, TILE_SIZE, TILE_SIZE);
        this.pctx.fillStyle = COLORS.accent;
        this.pctx.fillRect(4, TILE_SIZE * 2 + 4, 2, 4);
        this.pctx.fillRect(12, TILE_SIZE * 2 + 8, 2, 3);
        this.pctx.fillRect(8, TILE_SIZE * 2 + 2, 1, 3);

        // Wood floor (interior)
        this.pctx.fillStyle = COLORS.highlight;
        this.pctx.fillRect(TILE_SIZE, TILE_SIZE * 2, TILE_SIZE, TILE_SIZE);
        this.pctx.fillStyle = COLORS.shadow;
        this.pctx.fillRect(TILE_SIZE, TILE_SIZE * 2 + 3, TILE_SIZE, 1);
        this.pctx.fillRect(TILE_SIZE, TILE_SIZE * 2 + 10, TILE_SIZE, 1);
    }

    clear() {
        this.ctx.fillStyle = COLORS.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawMap(map, player) {
        if (!map) return;

        const mapType = this._getMapType(map);

        // Draw floor
        for (let y = 0; y < VIEW_H; y++) {
            for (let x = 0; x < VIEW_W; x++) {
                const px = x * TILE_SIZE;
                const py = y * TILE_SIZE;
                this._drawFloorTile(px, py, mapType, x, y);
            }
        }

        // Draw location-specific features
        this._drawLocationFeatures(map, mapType);

        // Draw exit markers
        const exits = map.connections || {};
        this.ctx.fillStyle = COLORS.fg;
        this.ctx.font = '10px monospace';
        if (exits.north) this.ctx.fillText('北', 152, 12);
        if (exits.south) this.ctx.fillText('南', 152, 236);
        if (exits.east) this.ctx.fillText('东', 308, 124);
        if (exits.west) this.ctx.fillText('西', 4, 124);
    }

    _getMapType(map) {
        const name = map.name || '';
        if (name.includes('客栈') || name.includes('武馆')) return 'indoor';
        if (name.includes('郊') || name.includes('林')) return 'wild';
        if (name.includes('路')) return 'road';
        return 'town';
    }

    _drawFloorTile(px, py, mapType, x, y) {
        let sx, sy;
        if (mapType === 'town') {
            // Checkerboard of dot and diamond
            sx = ((x + y) % 2 === 0) ? 0 : TILE_SIZE;
            sy = 0;
        } else if (mapType === 'indoor') {
            sx = TILE_SIZE;
            sy = TILE_SIZE * 2;
        } else if (mapType === 'wild') {
            sx = 0;
            sy = TILE_SIZE * 2;
        } else if (mapType === 'road') {
            sx = TILE_SIZE;
            sy = TILE_SIZE;
        } else {
            sx = 0;
            sy = 0;
        }
        this.ctx.drawImage(this.patternCanvas, sx, sy, TILE_SIZE, TILE_SIZE, px, py, TILE_SIZE, TILE_SIZE);
    }

    _drawLocationFeatures(map, mapType) {
        const name = map.name || '';

        if (name.includes('客栈')) {
            this._drawBuilding(5, 3, 10, 7, '客栈', true);
            this._drawTable(8, 7);
            this._drawTable(11, 7);
        } else if (name.includes('武馆')) {
            this._drawBuilding(4, 2, 12, 9, '武馆', true);
            this._drawTrainingDummy(7, 6);
            this._drawTrainingDummy(12, 6);
        } else if (name.includes('镇东郊') || name.includes('镇西郊')) {
            // Trees and rocks
            this._drawTree(2, 3);
            this._drawTree(16, 4);
            this._drawTree(4, 11);
            this._drawTree(15, 10);
            this._drawRock(9, 6);
            this._drawRock(13, 8);
        } else {
            // Town center - houses, well, etc.
            this._drawBuilding(1, 1, 5, 4, '');
            this._drawBuilding(14, 1, 5, 4, '');
            this._drawBuilding(1, 10, 5, 4, '');
            this._drawWell(9, 7);
        }
    }

    _drawBuilding(x, y, w, h, label, hasDoor = false) {
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        const pw = w * TILE_SIZE;
        const ph = h * TILE_SIZE;

        // Walls with brick pattern
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                this.ctx.drawImage(
                    this.patternCanvas,
                    0, TILE_SIZE, TILE_SIZE, TILE_SIZE,
                    px + dx * TILE_SIZE, py + dy * TILE_SIZE, TILE_SIZE, TILE_SIZE
                );
            }
        }

        // Roof
        this.ctx.fillStyle = COLORS.fg;
        this.ctx.beginPath();
        this.ctx.moveTo(px - 6, py);
        this.ctx.lineTo(px + pw / 2, py - 12);
        this.ctx.lineTo(px + pw + 6, py);
        this.ctx.closePath();
        this.ctx.fill();

        // Roof detail lines
        this.ctx.strokeStyle = COLORS.highlight;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(px, py);
        this.ctx.lineTo(px + pw / 2, py - 10);
        this.ctx.lineTo(px + pw, py);
        this.ctx.stroke();

        // Door
        if (hasDoor) {
            const doorW = 16;
            const doorH = 22;
            const doorX = px + (pw - doorW) / 2;
            const doorY = py + ph - doorH;
            this.ctx.fillStyle = COLORS.shadow;
            this.ctx.fillRect(doorX, doorY, doorW, doorH);
            this.ctx.strokeStyle = COLORS.fg;
            this.ctx.strokeRect(doorX, doorY, doorW, doorH);
        }

        if (label) {
            this.ctx.fillStyle = COLORS.fg;
            this.ctx.font = '10px "Microsoft YaHei", sans-serif';
            const textWidth = this.ctx.measureText(label).width;
            this.ctx.fillText(label, px + (pw - textWidth) / 2, py + 18);
        }
    }

    _drawTree(x, y) {
        const px = x * TILE_SIZE + 4;
        const py = y * TILE_SIZE + 2;

        // Trunk
        this.ctx.fillStyle = COLORS.fg;
        this.ctx.fillRect(px + 4, py + 8, 4, 8);

        // Leaves - layered circles
        this.ctx.fillStyle = COLORS.accent;
        this.ctx.fillRect(px, py + 4, 12, 8);
        this.ctx.fillRect(px + 2, py, 8, 12);
        this.ctx.fillStyle = COLORS.highlight;
        this.ctx.fillRect(px + 2, py + 2, 4, 3);
    }

    _drawRock(x, y) {
        const px = x * TILE_SIZE + 3;
        const py = y * TILE_SIZE + 6;
        this.ctx.fillStyle = COLORS.shadow;
        this.ctx.fillRect(px, py, 10, 6);
        this.ctx.fillStyle = COLORS.highlight;
        this.ctx.fillRect(px + 1, py + 1, 3, 2);
    }

    _drawWell(x, y) {
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        this.ctx.fillStyle = COLORS.shadow;
        this.ctx.fillRect(px + 2, py + 4, 12, 10);
        this.ctx.fillStyle = COLORS.fg;
        this.ctx.fillRect(px, py + 2, 16, 3);
        this.ctx.fillStyle = COLORS.highlight;
        this.ctx.fillRect(px + 4, py + 6, 8, 4);
    }

    _drawTable(x, y) {
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        this.ctx.fillStyle = COLORS.shadow;
        this.ctx.fillRect(px + 2, py + 4, 12, 8);
        this.ctx.fillStyle = COLORS.highlight;
        this.ctx.fillRect(px + 4, py + 2, 8, 2);
    }

    _drawTrainingDummy(x, y) {
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        // Stand
        this.ctx.fillStyle = COLORS.fg;
        this.ctx.fillRect(px + 6, py + 4, 2, 10);
        this.ctx.fillRect(px + 2, py + 12, 12, 2);
        // Dummy body
        this.ctx.fillStyle = COLORS.danger;
        this.ctx.fillRect(px + 3, py + 2, 10, 8);
    }

    drawPlayer(player) {
        const px = player.x * TILE_SIZE;
        const py = player.y * TILE_SIZE;
        this._drawHuman(px, py, 'player', player.facing);
    }

    drawNpcs(npcs, world) {
        for (const npc of npcs) {
            const seed = npc.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            const x = 4 + (seed % 12);
            const y = 4 + ((seed >> 4) % 8);
            const px = x * TILE_SIZE;
            const py = y * TILE_SIZE;

            const type = npc.hostile ? 'enemy' : (npc.title?.includes('老人') ? 'elder' : 'npc');
            this._drawHuman(px, py, type, 'down', npc.name);
        }
    }

    _drawHuman(px, py, type, facing, name = null) {
        const colors = {
            player: { body: '#4a5a8a', head: COLORS.highlight, hair: COLORS.fg },
            npc: { body: '#6a5a4a', head: COLORS.highlight, hair: COLORS.fg },
            elder: { body: '#5a5a5a', head: '#b8b8a0', hair: '#e8e8d0' },
            enemy: { body: COLORS.danger, head: COLORS.highlight, hair: COLORS.fg },
        }[type] || colors.npc;

        const bodyW = 8;
        const bodyH = 7;
        const headW = 8;
        const headH = 6;

        const cx = px + 8; // center x
        const bodyY = py + 8;
        const headY = py + 2;

        // Body
        this.ctx.fillStyle = colors.body;
        this.ctx.fillRect(cx - bodyW / 2, bodyY, bodyW, bodyH);

        // Arms
        this.ctx.fillStyle = colors.head;
        this.ctx.fillRect(cx - bodyW / 2 - 2, bodyY + 2, 2, 4);
        this.ctx.fillRect(cx + bodyW / 2, bodyY + 2, 2, 4);

        // Legs
        this.ctx.fillStyle = COLORS.fg;
        this.ctx.fillRect(cx - 3, bodyY + bodyH, 2, 4);
        this.ctx.fillRect(cx + 1, bodyY + bodyH, 2, 4);

        // Head
        this.ctx.fillStyle = colors.head;
        this.ctx.fillRect(cx - headW / 2, headY, headW, headH);

        // Hair
        this.ctx.fillStyle = colors.hair;
        this.ctx.fillRect(cx - headW / 2, headY, headW, 2);
        if (type === 'elder') {
            this.ctx.fillRect(cx - headW / 2, headY + headH - 1, headW, 1);
        }

        // Eyes
        this.ctx.fillStyle = COLORS.fg;
        if (facing === 'down' || facing === 'left' || facing === 'right') {
            this.ctx.fillRect(cx - 2, headY + 3, 1, 1);
            this.ctx.fillRect(cx + 1, headY + 3, 1, 1);
        }

        // Direction indicator (small hair/accessory offset)
        this.ctx.fillStyle = COLORS.fg;
        if (facing === 'up') this.ctx.fillRect(cx - 1, headY - 1, 2, 1);
        else if (facing === 'down') this.ctx.fillRect(cx - 1, headY + headH, 2, 1);

        // Name tag
        if (name) {
            this.ctx.fillStyle = COLORS.fg;
            this.ctx.font = '8px "Microsoft YaHei", sans-serif';
            const tw = this.ctx.measureText(name).width;
            this.ctx.fillText(name, cx - tw / 2, py - 2);
        }
    }

    drawStatusBar(player, mapName) {
        const h = 24;
        const y = this.canvas.height / (window.devicePixelRatio || 1) - h;

        // Background
        this.ctx.fillStyle = COLORS.fg;
        this.ctx.fillRect(0, y, 320, h);

        // Border top
        this.ctx.fillStyle = COLORS.highlight;
        this.ctx.fillRect(0, y, 320, 1);

        this.ctx.fillStyle = COLORS.highlight;
        this.ctx.font = '9px "Microsoft YaHei", monospace';
        this.ctx.fillText(
            `${player.name} Lv.${player.level}  ${mapName}`,
            4, y + 10
        );
        this.ctx.fillText(
            `气血 ${player.hp}/${player.maxHp}  内力 ${player.mp}/${player.maxMp}  钱 ${player.gold}`,
            4, y + 20
        );
    }

    drawTextBox(lines, options = []) {
        const boxH = 84;
        const boxY = 240 - 24 - boxH; // Above status bar (logical coords)
        const pad = 4;

        // Panel background
        this.ctx.fillStyle = COLORS.fg;
        this.ctx.fillRect(pad, boxY, 320 - pad * 2, boxH);

        // Inner background
        this.ctx.fillStyle = COLORS.bg;
        this.ctx.fillRect(pad + 2, boxY + 2, 320 - pad * 2 - 4, boxH - 4);

        // Border
        this.ctx.strokeStyle = COLORS.highlight;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(pad, boxY, 320 - pad * 2, boxH);

        // Text
        this.ctx.fillStyle = COLORS.fg;
        this.ctx.font = '11px "Microsoft YaHei", monospace';
        lines.forEach((line, i) => {
            this.ctx.fillText(line, pad + 8, boxY + 18 + i * 14);
        });

        // Options
        if (options.length > 0) {
            let x = pad + 8;
            const optY = boxY + boxH - 18;
            options.forEach((opt, i) => {
                const label = `${i + 1}.${opt.label}`;
                this.ctx.fillStyle = opt.selected ? COLORS.danger : COLORS.fg;
                this.ctx.fillText(label, x, optY);
                x += this.ctx.measureText(label).width + 16;
            });
        }
    }

    drawCombat(player, enemy, world, options, selectedIndex) {
        this.clear();

        // Background pattern
        for (let y = 0; y < VIEW_H; y++) {
            for (let x = 0; x < VIEW_W; x++) {
                this._drawFloorTile(x * TILE_SIZE, y * TILE_SIZE, 'road', x, y);
            }
        }

        // Title
        this.ctx.fillStyle = COLORS.fg;
        this.ctx.font = '14px "Microsoft YaHei", monospace';
        this.ctx.fillText('战斗！', 140, 20);

        // Player
        this._drawHuman(40, 80, 'player', 'right');
        this.ctx.fillStyle = COLORS.fg;
        this.ctx.font = '10px "Microsoft YaHei", monospace';
        this.ctx.fillText(player.name, 36, 130);
        this._drawBar(32, 136, 48, 6, player.hp, player.maxHp, COLORS.danger);

        // VS
        this.ctx.font = '12px monospace';
        this.ctx.fillText('VS', 152, 110);

        // Enemy
        this._drawHuman(240, 80, 'enemy', 'left');
        this.ctx.fillText(enemy.name, 236, 130);
        this._drawBar(232, 136, 48, 6, enemy.hp, enemy.maxHp, COLORS.danger);

        // Menu on right side so combat log at bottom has space
        const menuX = 220;
        const menuY = 44;
        const menuW = 90;
        const menuH = 78;

        this.ctx.fillStyle = COLORS.fg;
        this.ctx.fillRect(menuX, menuY, menuW, menuH);
        this.ctx.fillStyle = COLORS.bg;
        this.ctx.fillRect(menuX + 2, menuY + 2, menuW - 4, menuH - 4);
        this.ctx.strokeStyle = COLORS.highlight;
        this.ctx.strokeRect(menuX, menuY, menuW, menuH);

        this.ctx.font = '12px "Microsoft YaHei", monospace';
        options.forEach((opt, i) => {
            this.ctx.fillStyle = i === selectedIndex ? COLORS.danger : COLORS.fg;
            const marker = i === selectedIndex ? '▶ ' : '  ';
            this.ctx.fillText(marker + opt, menuX + 12, menuY + 20 + i * 16);
        });
    }

    _drawBar(x, y, w, h, current, max, color) {
        this.ctx.fillStyle = COLORS.fg;
        this.ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
        this.ctx.fillStyle = COLORS.bg;
        this.ctx.fillRect(x, y, w, h);
        const ratio = Math.max(0, current / max);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w * ratio, h);
    }
}
