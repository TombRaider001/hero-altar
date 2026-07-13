/** Turn-based combat system. */

import { randomInt, chance } from './utils.js';

export class Combat {
    constructor(player, npc, world) {
        this.player = player;
        this.world = world;
        this.npc = { ...npc };
        const combat = npc.combat || {};
        this.enemy = {
            id: npc.id,
            name: npc.name,
            hp: combat.hp || 50,
            maxHp: combat.hp || 50,
            mp: combat.mp || 0,
            maxMp: combat.mp || 0,
            attack: combat.attack || 10,
            defense: combat.defense || 5,
            speed: combat.speed || 10,
            level: combat.level || 1,
            loot: combat.loot || [],
        };
        this.options = ['攻击', '武功', '物品', '逃跑'];
        this.selectedIndex = 0;
        this.finished = false;
        this.won = false;
        this.log = [`${this.enemy.name} 拦住了你的去路！`];
    }

    handleInput(input) {
        if (this.finished) return;

        if (input.isPressed('up')) {
            this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
        } else if (input.isPressed('down')) {
            this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
        } else if (input.isPressed('a')) {
            this._executeAction();
        } else if (input.isPressed('b')) {
            this._tryFlee();
        }
    }

    _executeAction() {
        const action = this.options[this.selectedIndex];

        if (action === '攻击') {
            this._playerAttack(false);
        } else if (action === '武功') {
            this._playerAttack(true);
        } else if (action === '物品') {
            this._useItem();
            return;
        } else if (action === '逃跑') {
            this._tryFlee();
            return;
        }

        if (!this.finished && this.enemy.hp > 0) {
            this._enemyTurn();
        }
    }

    _playerAttack(useSkill) {
        let attack = this.player.totalAttack(this.world.items);
        if (useSkill) {
            // Simplified: add skill levels to attack
            let skillBonus = 0;
            for (const [skillId, level] of Object.entries(this.player.skills)) {
                const skill = this.world.getSkill(skillId);
                if (skill && ['unarmed', 'sword', 'blade'].includes(skill.type)) {
                    skillBonus += level * 2;
                }
            }
            if (skillBonus === 0) {
                this.log.push('你还没有学会攻击类武功。');
                return;
            }
            attack += skillBonus;
        }

        const damage = this._calculateDamage(attack, this.enemy.defense, this.player.speed);
        this.enemy.hp -= damage;
        this.log.push(`你攻击 ${this.enemy.name}，造成 ${damage} 点伤害。`);

        if (this.enemy.hp <= 0) {
            this._win();
        }
    }

    _useItem() {
        const consumables = Object.entries(this.player.inventory)
            .filter(([id, qty]) => qty > 0 && this.world.items[id]?.type === 'consumable');

        if (consumables.length === 0) {
            this.log.push('没有可使用的物品。');
            return;
        }

        // Auto-use first healing item for simplicity in this version
        const [itemId, qty] = consumables[0];
        const item = this.world.items[itemId];
        const effect = item.effect || {};

        if (effect.type === 'heal_hp') {
            this.player.heal(effect.value || 0, 0);
            this.log.push(`使用 ${item.name}，恢复 ${effect.value} 点气血。`);
        } else if (effect.type === 'heal_mp') {
            this.player.heal(0, effect.value || 0);
            this.log.push(`使用 ${item.name}，恢复 ${effect.value} 点内力。`);
        }
        this.player.removeItem(itemId, 1);
        this._enemyTurn();
    }

    _tryFlee() {
        const fleeChance = 0.3 + (this.player.speed - this.enemy.speed) * 0.02;
        if (chance(fleeChance)) {
            this.log.push('你趁机逃走了！');
            this.finished = true;
            this.won = false;
        } else {
            this.log.push('逃跑失败！');
            this._enemyTurn();
        }
    }

    _enemyTurn() {
        const damage = this._calculateDamage(this.enemy.attack, this.player.totalDefense(this.world.items), this.enemy.speed);
        this.player.hp -= damage;
        this.log.push(`${this.enemy.name} 攻击你，造成 ${damage} 点伤害。`);

        if (this.player.hp <= 0) {
            this.player.hp = 1;
            this.log.push('你重伤倒地，被抬回了镇上。');
            this.player.locationId = 'taiping_town_center';
            this.player.x = 8;
            this.player.y = 8;
            this.finished = true;
            this.won = false;
        }
    }

    _calculateDamage(attack, defense, speed) {
        const base = Math.max(1, attack - defense * 0.5);
        const variance = 0.9 + Math.random() * 0.2;
        const critChance = speed * 0.005;
        const crit = Math.random() < critChance ? 2 : 1;
        return Math.max(1, Math.floor(base * variance * crit));
    }

    _win() {
        this.finished = true;
        this.won = true;
        const expGain = this.enemy.level * 20 + 10;
        this.player.gainExp(expGain);
        this.player.potential += this.enemy.level * 5;
        this.log.push(`击败 ${this.enemy.name}，获得 ${expGain} 经验。`);

        // Loot
        for (const loot of this.enemy.loot) {
            if (chance(loot.chance)) {
                const qty = loot.quantity || 1;
                this.player.addItem(loot.item_id, qty);
                const itemName = this.world.items[loot.item_id]?.name || loot.item_id;
                this.log.push(`获得：${itemName} x${qty}`);
            }
        }
    }

    chooseKillOrSpare(callback) {
        // Simplified: auto-spare for now; can be extended with UI choice
        this.player.morality += 1;
        this.log.push(`你放过了 ${this.enemy.name}。`);
        callback();
    }
}
