/** Canvas rendering for the game. */

export const COLORS = {
    bg: '#c8d0a0',
    dark: '#1a1a1a',
    mid: '#4a4a3a',
    light: '#e8e8c8',
    accent: '#5a7a4a',
    danger: '#8a4a4a',
    water: '#6a8a9a',
};

export const TILE_SIZE = 16;
export const VIEW_W = 20;
export const VIEW_H = 15;

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
    }

    clear() {
        this.ctx.fillStyle = COLORS.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawMap(map, player) {
        if (!map) return;

        // Draw floor
        for (let y = 0; y < VIEW_H; y++) {
            for (let x = 0; x < VIEW_W; x++) {
                const px = x * TILE_SIZE;
                const py = y * TILE_SIZE;
                this.ctx.fillStyle = ((x + y) % 2 === 0) ? COLORS.bg : '#b8c090';
                this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            }
        }

        // Draw some decorative buildings based on location
        this._drawLocationFeatures(map);

        // Draw exits
        const exits = map.connections || {};
        this.ctx.fillStyle = COLORS.mid;
        this.ctx.font = '8px monospace';
        if (exits.north) this.ctx.fillText('北', 152, 12);
        if (exits.south) this.ctx.fillText('南', 152, 236);
        if (exits.east) this.ctx.fillText('东', 304, 124);
        if (exits.west) this.ctx.fillText('西', 4, 124);
    }

    _drawLocationFeatures(map) {
        const name = map.name || '';
        this.ctx.fillStyle = COLORS.mid;

        if (name.includes('客栈')) {
            this._drawBuilding(6, 4, 8, 5, '客栈');
        } else if (name.includes('武馆')) {
            this._drawBuilding(5, 3, 10, 7, '武');
        } else if (name.includes('镇东郊') || name.includes('镇西郊')) {
            // Trees
            this._drawTree(2, 3);
            this._drawTree(16, 4);
            this._drawTree(4, 11);
            this._drawTree(15, 10);
        } else {
            // Town center - some houses
            this._drawBuilding(2, 2, 4, 3, '');
            this._drawBuilding(14, 2, 4, 3, '');
            this._drawBuilding(2, 10, 4, 3, '');
        }
    }

    _drawBuilding(x, y, w, h, label) {
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        const pw = w * TILE_SIZE;
        const ph = h * TILE_SIZE;

        this.ctx.fillStyle = COLORS.light;
        this.ctx.fillRect(px, py, pw, ph);
        this.ctx.strokeStyle = COLORS.dark;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(px, py, pw, ph);

        // Roof
        this.ctx.fillStyle = COLORS.danger;
        this.ctx.beginPath();
        this.ctx.moveTo(px - 4, py);
        this.ctx.lineTo(px + pw / 2, py - 10);
        this.ctx.lineTo(px + pw + 4, py);
        this.ctx.closePath();
        this.ctx.fill();

        if (label) {
            this.ctx.fillStyle = COLORS.dark;
            this.ctx.font = '10px "Microsoft YaHei", sans-serif';
            this.ctx.fillText(label, px + 4, py + ph / 2 + 4);
        }
    }

    _drawTree(x, y) {
        const px = x * TILE_SIZE + 4;
        const py = y * TILE_SIZE + 4;
        this.ctx.fillStyle = COLORS.accent;
        this.ctx.fillRect(px, py, 8, 8);
        this.ctx.fillStyle = COLORS.dark;
        this.ctx.fillRect(px + 3, py + 8, 2, 4);
    }

    drawPlayer(player) {
        const px = player.x * TILE_SIZE;
        const py = player.y * TILE_SIZE;

        // Body
        this.ctx.fillStyle = COLORS.dark;
        this.ctx.fillRect(px + 4, py + 4, 8, 8);

        // Head
        this.ctx.fillStyle = COLORS.light;
        this.ctx.fillRect(px + 5, py + 2, 6, 4);

        // Direction indicator
        this.ctx.fillStyle = COLORS.danger;
        const facing = player.facing;
        if (facing === 'up') this.ctx.fillRect(px + 6, py + 1, 4, 1);
        else if (facing === 'down') this.ctx.fillRect(px + 6, py + 12, 4, 1);
        else if (facing === 'left') this.ctx.fillRect(px + 1, py + 6, 1, 4);
        else if (facing === 'right') this.ctx.fillRect(px + 14, py + 6, 1, 4);
    }

    drawNpcs(npcs, world) {
        for (const npc of npcs) {
            // Position NPCs at fixed spots based on their id hash for stability
            const seed = npc.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            const x = 4 + (seed % 12);
            const y = 4 + ((seed >> 4) % 8);

            const px = x * TILE_SIZE;
            const py = y * TILE_SIZE;

            if (npc.hostile) {
                this.ctx.fillStyle = COLORS.danger;
            } else {
                this.ctx.fillStyle = COLORS.accent;
            }
            this.ctx.fillRect(px + 4, py + 4, 8, 8);
            this.ctx.fillStyle = COLORS.light;
            this.ctx.fillRect(px + 5, py + 2, 6, 4);

            // Name tag
            this.ctx.fillStyle = COLORS.dark;
            this.ctx.font = '8px "Microsoft YaHei", sans-serif';
            this.ctx.fillText(npc.name, px - 4, py - 2);
        }
    }

    drawStatusBar(player, mapName) {
        const y = this.canvas.height - 24;
        this.ctx.fillStyle = COLORS.dark;
        this.ctx.fillRect(0, y, this.canvas.width, 24);
        this.ctx.fillStyle = COLORS.light;
        this.ctx.font = '10px "Microsoft YaHei", monospace';
        this.ctx.fillText(
            `${player.name} Lv.${player.level}  ${mapName}`,
            4, y + 10
        );
        this.ctx.fillText(
            `HP:${player.hp}/${player.maxHp} MP:${player.mp}/${player.maxMp} 钱:${player.gold}`,
            4, y + 20
        );
    }

    drawTextBox(lines, options = []) {
        const boxH = 80;
        const boxY = this.canvas.height - boxH;
        this.ctx.fillStyle = 'rgba(26, 26, 26, 0.95)';
        this.ctx.fillRect(4, boxY, this.canvas.width - 8, boxH - 4);
        this.ctx.strokeStyle = COLORS.light;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(4, boxY, this.canvas.width - 8, boxH - 4);

        this.ctx.fillStyle = COLORS.light;
        this.ctx.font = '12px "Microsoft YaHei", monospace';
        lines.forEach((line, i) => {
            this.ctx.fillText(line, 12, boxY + 18 + i * 16);
        });

        if (options.length > 0) {
            let x = 12;
            const y = boxY + boxH - 18;
            options.forEach((opt, i) => {
                this.ctx.fillStyle = opt.selected ? COLORS.accent : COLORS.light;
                this.ctx.fillText(`${i + 1}.${opt.label}`, x, y);
                x += opt.label.length * 12 + 20;
            });
        }
    }

    drawCombat(player, enemy, world, options, selectedIndex) {
        this.clear();

        // Title
        this.ctx.fillStyle = COLORS.dark;
        this.ctx.font = '14px "Microsoft YaHei", monospace';
        this.ctx.fillText('战斗！', 140, 20);

        // Player
        this.ctx.fillStyle = COLORS.accent;
        this.ctx.fillRect(48, 80, 32, 32);
        this.ctx.fillStyle = COLORS.light;
        this.ctx.fillRect(56, 72, 16, 12);
        this.ctx.fillStyle = COLORS.dark;
        this.ctx.font = '10px monospace';
        this.ctx.fillText(player.name, 40, 130);
        this.ctx.fillText(`HP:${player.hp}/${player.maxHp}`, 40, 142);

        // Enemy
        this.ctx.fillStyle = COLORS.danger;
        this.ctx.fillRect(240, 80, 32, 32);
        this.ctx.fillStyle = COLORS.light;
        this.ctx.fillRect(248, 72, 16, 12);
        this.ctx.fillStyle = COLORS.dark;
        this.ctx.fillText(enemy.name, 230, 130);
        this.ctx.fillText(`HP:${enemy.hp}/${enemy.maxHp}`, 230, 142);

        // Menu
        const menuY = 170;
        this.ctx.fillStyle = COLORS.dark;
        this.ctx.fillRect(60, menuY, 200, 60);
        this.ctx.strokeStyle = COLORS.light;
        this.ctx.strokeRect(60, menuY, 200, 60);

        this.ctx.font = '12px "Microsoft YaHei", monospace';
        options.forEach((opt, i) => {
            this.ctx.fillStyle = i === selectedIndex ? COLORS.accent : COLORS.light;
            this.ctx.fillText((i === selectedIndex ? '> ' : '  ') + opt, 80, menuY + 20 + i * 18);
        });
    }
}
