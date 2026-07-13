/** Main game controller and state machine. */

import { Input } from './input.js';
import { Renderer, VIEW_W, VIEW_H } from './renderer.js';
import { World } from './world.js';
import { Player } from './player.js';
import { Combat } from './combat.js';
import { Storage } from './storage.js';
import { UI } from './ui.js';

const STATE = {
    TITLE: 'title',
    CREATE_CHAR: 'create_char',
    EXPLORE: 'explore',
    DIALOG: 'dialog',
    MENU: 'menu',
    COMBAT: 'combat',
};

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.input = new Input();
        this.world = new World();

        this.state = STATE.TITLE;
        this.player = null;
        this.combat = null;

        this.menuOptions = [];
        this.menuIndex = 0;
        this.dialogLines = [];
        this.dialogCallback = null;
        this.moveCooldown = 0;
        this.messageQueue = [];

        this.createStep = 0; // 0=name, 1=gender, 2=stats
        this.tempName = '';
        this.tempGender = '男';
        this.statPoints = 80;
        this.statSelection = 0;
        this.statsOrder = ['baseStrength', 'baseAgility', 'baseIntelligence', 'baseConstitution'];
        this.statNames = {
            baseStrength: '膂力',
            baseAgility: '敏捷',
            baseIntelligence: '悟性',
            baseConstitution: '根骨',
        };
    }

    async init() {
        await this.world.load();
        this.loop();
    }

    loop() {
        this.update();
        this.draw();
        this.input.update();
        requestAnimationFrame(() => this.loop());
    }

    update() {
        if (this.moveCooldown > 0) this.moveCooldown--;

        switch (this.state) {
            case STATE.TITLE:
                this._updateTitle();
                break;
            case STATE.CREATE_CHAR:
                this._updateCreateChar();
                break;
            case STATE.EXPLORE:
                this._updateExplore();
                break;
            case STATE.DIALOG:
                this._updateDialog();
                break;
            case STATE.MENU:
                this._updateMenu();
                break;
            case STATE.COMBAT:
                this._updateCombat();
                break;
        }
    }

    draw() {
        this.renderer.clear();

        switch (this.state) {
            case STATE.TITLE:
                this._drawTitle();
                break;
            case STATE.CREATE_CHAR:
                this._drawCreateChar();
                break;
            case STATE.EXPLORE:
            case STATE.DIALOG:
            case STATE.MENU:
                this._drawExplore();
                break;
            case STATE.COMBAT:
                this._drawCombat();
                break;
        }
    }

    // =================== TITLE ===================
    _updateTitle() {
        if (this.input.isPressed('a')) {
            if (Storage.exists()) {
                const data = Storage.load();
                this.player = Player.fromJSON(data);
                this.state = STATE.EXPLORE;
            } else {
                this.state = STATE.CREATE_CHAR;
                this.createStep = 0;
                UI.showNameInput((name) => {
                    this.tempName = name;
                    this.createStep = 1;
                });
            }
        } else if (this.input.isPressed('b')) {
            this.state = STATE.CREATE_CHAR;
            this.createStep = 0;
            UI.showNameInput((name) => {
                this.tempName = name;
                this.createStep = 1;
            });
        }
    }

    _drawTitle() {
        this.renderer.ctx.fillStyle = '#1a1a1a';
        this.renderer.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.renderer.ctx.fillStyle = '#c8d0a0';
        this.renderer.ctx.font = '20px "Microsoft YaHei", monospace';
        this.renderer.ctx.fillText('英雄坛说', 110, 80);
        this.renderer.ctx.font = '10px "Microsoft YaHei", monospace';
        this.renderer.ctx.fillText('Hero Altar', 128, 100);
        this.renderer.ctx.fillText('按 A / 空格 开始游戏', 90, 160);
        this.renderer.ctx.fillText('按 B / Esc 创建新角色', 86, 180);
    }

    // =================== CREATE CHAR ===================
    _updateCreateChar() {
        if (this.createStep === 1) {
            if (this.input.isPressed('left') || this.input.isPressed('right')) {
                this.tempGender = this.tempGender === '男' ? '女' : '男';
            } else if (this.input.isPressed('a')) {
                this.player = new Player(this.tempName, this.tempGender);
                this.statPoints = 80;
                for (const stat of this.statsOrder) {
                    this.player[stat] = 15;
                }
                this.createStep = 2;
            }
        } else if (this.createStep === 2) {
            if (this.input.isPressed('up')) {
                this.statSelection = (this.statSelection - 1 + this.statsOrder.length) % this.statsOrder.length;
            } else if (this.input.isPressed('down')) {
                this.statSelection = (this.statSelection + 1) % this.statsOrder.length;
            } else if (this.input.isPressed('left')) {
                const stat = this.statsOrder[this.statSelection];
                if (this.player[stat] > 10) {
                    this.player[stat]--;
                    this.statPoints++;
                }
            } else if (this.input.isPressed('right')) {
                const stat = this.statsOrder[this.statSelection];
                if (this.statPoints > 0 && this.player[stat] < 30) {
                    this.player[stat]++;
                    this.statPoints--;
                }
            } else if (this.input.isPressed('a')) {
                this.player._recalculateStats();
                this.player.hp = this.player.maxHp;
                this.player.mp = this.player.maxMp;
                this.player.addItem('cloth_clothes', 1);
                this.player.addItem('steamed_bun', 3);
                this.state = STATE.EXPLORE;
            }
        }
    }

    _drawCreateChar() {
        this.renderer.ctx.fillStyle = '#1a1a1a';
        this.renderer.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.renderer.ctx.fillStyle = '#c8d0a0';
        this.renderer.ctx.font = '14px "Microsoft YaHei", monospace';
        this.renderer.ctx.fillText('创建角色', 120, 20);

        if (this.createStep === 1) {
            this.renderer.ctx.font = '12px "Microsoft YaHei", monospace';
            this.renderer.ctx.fillText(`姓名：${this.tempName}`, 80, 80);
            this.renderer.ctx.fillText(`性别：${this.tempGender}`, 80, 110);
            this.renderer.ctx.fillText('按左右切换，按 A 确认', 70, 180);
        } else if (this.createStep === 2) {
            this.renderer.ctx.font = '12px "Microsoft YaHei", monospace';
            this.renderer.ctx.fillText(`剩余点数：${this.statPoints}`, 80, 50);
            let y = 80;
            this.statsOrder.forEach((stat, i) => {
                const prefix = i === this.statSelection ? '> ' : '  ';
                this.renderer.ctx.fillText(
                    `${prefix}${this.statNames[stat]}: ${this.player[stat]}`,
                    80, y
                );
                y += 24;
            });
            this.renderer.ctx.fillText('上下选择，左右调整', 80, 190);
            this.renderer.ctx.fillText('按 A 完成创建', 100, 210);
        }
    }

    // =================== EXPLORE ===================
    _updateExplore() {
        if (this.input.isPressed('b')) {
            this._openMenu();
            return;
        }

        if (this.input.isPressed('a')) {
            this._interact();
            return;
        }

        if (this.moveCooldown === 0) {
            let dx = 0, dy = 0;
            if (this.input.isDown('up')) { dy = -1; this.player.facing = 'up'; }
            else if (this.input.isDown('down')) { dy = 1; this.player.facing = 'down'; }
            else if (this.input.isDown('left')) { dx = -1; this.player.facing = 'left'; }
            else if (this.input.isDown('right')) { dx = 1; this.player.facing = 'right'; }

            if (dx !== 0 || dy !== 0) {
                const newX = this.player.x + dx;
                const newY = this.player.y + dy;
                if (newX >= 0 && newX < VIEW_W && newY >= 0 && newY < VIEW_H) {
                    this.player.x = newX;
                    this.player.y = newY;
                }
                this.moveCooldown = 8;
            }
        }
    }

    _interact() {
        const npcs = this.world.getNpcsAtLocation(this.player.locationId, this.player);
        // Find NPC near player
        const nearby = npcs.find(npc => {
            const seed = npc.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            const nx = 4 + (seed % 12);
            const ny = 4 + ((seed >> 4) % 8);
            return Math.abs(nx - this.player.x) <= 1 && Math.abs(ny - this.player.y) <= 1;
        });

        if (nearby) {
            this._startNpcInteraction(nearby);
        } else {
            // Try to move to connected location if at edge
            this._tryChangeMap();
        }
    }

    _tryChangeMap() {
        const directionMap = {
            up: 'north', down: 'south', left: 'west', right: 'east'
        };
        const direction = directionMap[this.player.facing];
        if (!direction) return;

        const target = this.world.getConnection(this.player.locationId, direction);
        if (target) {
            this.player.locationId = target;
            // Place player at opposite edge
            if (direction === 'north') this.player.y = VIEW_H - 2;
            else if (direction === 'south') this.player.y = 1;
            else if (direction === 'west') this.player.x = VIEW_W - 2;
            else if (direction === 'east') this.player.x = 1;
        }
    }

    _startNpcInteraction(npc) {
        const quest = npc.quest;
        const completed = quest && this.player.questsCompleted.includes(quest.id);
        const hasItem = quest && this.player.hasItem(quest.required_item);

        if (quest && !completed && hasItem) {
            this._showDialog(
                [`${npc.name}：${npc.dialog_quest_done || '谢谢你！'}`],
                [
                    { label: '交出物品', action: () => this._completeQuest(npc, quest) },
                    { label: '离开', action: () => { this.state = STATE.EXPLORE; } }
                ]
            );
        } else {
            const options = [{ label: '离开', action: () => { this.state = STATE.EXPLORE; } }];
            if (npc.hostile) {
                options.unshift({
                    label: '攻击',
                    action: () => {
                        this.combat = new Combat(this.player, npc, this.world);
                        this.state = STATE.COMBAT;
                    }
                });
            }
            if (npc.shop && npc.shop.length > 0) {
                options.unshift({
                    label: '交易',
                    action: () => this._openShop(npc)
                });
            }
            if (npc.services?.includes('inn')) {
                options.unshift({
                    label: '住店',
                    action: () => this._restAtInn(npc)
                });
            }
            if (npc.services?.includes('teach')) {
                options.unshift({
                    label: '学武',
                    action: () => this._learnSkill(npc)
                });
            }

            this._showDialog([`${npc.name}：${npc.dialog_default || '……'}`], options);
        }
    }

    _showDialog(lines, options) {
        this.state = STATE.DIALOG;
        this.dialogLines = lines;
        this.menuOptions = options;
        this.menuIndex = 0;
    }

    _completeQuest(npc, quest) {
        this.player.removeItem(quest.required_item, 1);
        this.player.questsCompleted.push(quest.id);
        this.player.gainExp(quest.reward_exp || 0);
        this.player.gold += quest.reward_gold || 0;
        if (quest.reward_item) {
            this.player.addItem(quest.reward_item, 1);
        }
        this.state = STATE.EXPLORE;
    }

    _openShop(npc) {
        const items = npc.shop
            .filter(entry => entry.quantity > 0)
            .map(entry => {
                const item = this.world.getItem(entry.item_id);
                return {
                    label: `${item.name} ${entry.price}文`,
                    action: () => {
                        if (this.player.gold >= entry.price) {
                            this.player.gold -= entry.price;
                            this.player.addItem(entry.item_id, 1);
                            entry.quantity--;
                        }
                        this.state = STATE.EXPLORE;
                    }
                };
            });
        items.push({ label: '离开', action: () => { this.state = STATE.EXPLORE; } });
        this._showDialog([`${npc.name}：要点什么？`], items);
    }

    _restAtInn(npc) {
        const price = npc.inn_price || 50;
        if (this.player.gold >= price) {
            this.player.gold -= price;
            this.player.heal(this.player.maxHp, this.player.maxMp);
            this._showDialog(['你睡了个好觉，精神焕发。'], [
                { label: '离开', action: () => { this.state = STATE.EXPLORE; } }
            ]);
        } else {
            this._showDialog(['你的钱不够住店。'], [
                { label: '离开', action: () => { this.state = STATE.EXPLORE; } }
            ]);
        }
    }

    _learnSkill(npc) {
        const skills = (npc.teachable_skills || []).map(entry => {
            const skill = this.world.getSkill(entry.skill_id);
            return {
                label: `${skill.name} ${entry.cost_gold}文/${entry.cost_potential}潜`,
                action: () => {
                    if (this.player.gold >= entry.cost_gold && this.player.potential >= entry.cost_potential) {
                        this.player.gold -= entry.cost_gold;
                        this.player.potential -= entry.cost_potential;
                        this.player.addSkill(entry.skill_id, 1);
                        this._showDialog([`你学会了 ${skill.name}！`], [
                            { label: '离开', action: () => { this.state = STATE.EXPLORE; } }
                        ]);
                    } else {
                        this._showDialog(['钱或潜能不足。'], [
                            { label: '离开', action: () => { this.state = STATE.EXPLORE; } }
                        ]);
                    }
                }
            };
        });
        skills.push({ label: '离开', action: () => { this.state = STATE.EXPLORE; } });
        this._showDialog([`${npc.name}：想学哪门功夫？`], skills);
    }

    _drawExplore() {
        const map = this.world.getMap(this.player.locationId);
        this.renderer.drawMap(map, this.player);

        const npcs = this.world.getNpcsAtLocation(this.player.locationId, this.player);
        this.renderer.drawNpcs(npcs, this.world);
        this.renderer.drawPlayer(this.player);

        if (map) {
            this.renderer.drawStatusBar(this.player, map.name);
        }

        if (this.state === STATE.DIALOG || this.state === STATE.MENU) {
            const options = this.menuOptions.map((opt, i) => ({
                label: opt.label,
                selected: i === this.menuIndex
            }));
            this.renderer.drawTextBox(this.dialogLines, options);
        }
    }

    // =================== DIALOG / MENU ===================
    _updateDialog() {
        if (this.input.isPressed('up')) {
            this.menuIndex = (this.menuIndex - 1 + this.menuOptions.length) % this.menuOptions.length;
        } else if (this.input.isPressed('down')) {
            this.menuIndex = (this.menuIndex + 1) % this.menuOptions.length;
        } else if (this.input.isPressed('a')) {
            const action = this.menuOptions[this.menuIndex].action;
            if (action) action();
        } else if (this.input.isPressed('b')) {
            this.state = STATE.EXPLORE;
        }
    }

    _openMenu() {
        this.state = STATE.MENU;
        this.dialogLines = ['主菜单'];
        this.menuOptions = [
            { label: '状态', action: () => this._showStatus() },
            { label: '背包', action: () => this._showInventory() },
            { label: '武功', action: () => this._showSkills() },
            { label: '存档', action: () => { Storage.save(this.player); this.state = STATE.EXPLORE; } },
            { label: '返回', action: () => { this.state = STATE.EXPLORE; } },
        ];
        this.menuIndex = 0;
    }

    _updateMenu() {
        this._updateDialog();
    }

    _showStatus() {
        this.dialogLines = [
            `${this.player.name}  ${this.player.gender}  Lv.${this.player.level}`,
            `膂力${this.player.baseStrength} 敏捷${this.player.baseAgility} 悟性${this.player.baseIntelligence} 根骨${this.player.baseConstitution}`,
            `HP ${this.player.hp}/${this.player.maxHp}  MP ${this.player.mp}/${this.player.maxMp}`,
            `攻击${this.player.totalAttack(this.world.items)} 防御${this.player.totalDefense(this.world.items)} 速度${Math.floor(this.player.speed)}`,
            `金钱${this.player.gold} 潜能${this.player.potential} 善恶${this.player.morality}`
        ];
        this.menuOptions = [{ label: '返回', action: () => this._openMenu() }];
        this.menuIndex = 0;
    }

    _showInventory() {
        const items = Object.entries(this.player.inventory);
        if (items.length === 0) {
            this.dialogLines = ['背包空空如也。'];
            this.menuOptions = [{ label: '返回', action: () => this._openMenu() }];
        } else {
            this.menuOptions = items.map(([id, qty]) => {
                const item = this.world.getItem(id);
                return {
                    label: `${item?.name || id} x${qty}`,
                    action: () => this._useItem(id)
                };
            });
            this.menuOptions.push({ label: '返回', action: () => this._openMenu() });
            this.dialogLines = ['背包'];
        }
        this.menuIndex = 0;
    }

    _useItem(itemId) {
        const item = this.world.getItem(itemId);
        if (!item) return;
        const effect = item.effect || {};
        if (effect.type === 'heal_hp') {
            this.player.heal(effect.value || 0, 0);
        } else if (effect.type === 'heal_mp') {
            this.player.heal(0, effect.value || 0);
        } else if (item.type === 'weapon') {
            this.player.equippedWeapon = itemId;
            this.player._recalculateStats();
        } else if (item.type === 'armor') {
            this.player.equippedArmor[item.slot || 'body'] = itemId;
            this.player._recalculateStats();
        }
        this.player.removeItem(itemId, 1);
        this._openMenu();
    }

    _showSkills() {
        const skills = Object.entries(this.player.skills);
        if (skills.length === 0) {
            this.dialogLines = ['尚未学会任何武功。'];
        } else {
            this.dialogLines = skills.map(([id, level]) => {
                const skill = this.world.getSkill(id);
                return `${skill?.name || id} Lv.${level}`;
            });
        }
        this.menuOptions = [{ label: '返回', action: () => this._openMenu() }];
        this.menuIndex = 0;
    }

    // =================== COMBAT ===================
    _updateCombat() {
        if (!this.combat) return;
        this.combat.handleInput(this.input);

        if (this.combat.finished) {
            if (this.combat.won) {
                this.combat.chooseKillOrSpare(() => {
                    this.combat = null;
                    this.state = STATE.EXPLORE;
                });
            } else {
                this.combat = null;
                this.state = STATE.EXPLORE;
            }
        }
    }

    _drawCombat() {
        if (!this.combat) return;
        this.renderer.drawCombat(
            this.player,
            this.combat.enemy,
            this.world,
            this.combat.options,
            this.combat.selectedIndex
        );

        // Combat log
        const lines = this.combat.log.slice(-3);
        this.renderer.drawTextBox(lines, []);
    }
}
