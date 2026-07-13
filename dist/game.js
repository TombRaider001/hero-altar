// Auto-generated bundle. Do not edit directly.
"use strict";
(function() {

// ===== src/utils.js =====
/** Utility helpers. */

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chance(percent) {
    return Math.random() < percent;
}

function loadJSON(path) {
    return fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${path}: ${response.status}`);
            }
            return response.json();
        });
}

function formatNumber(n) {
    return String(n);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// ===== src/storage.js =====
/** Save/load game state using localStorage. */

const SAVE_KEY = 'hero_altar_save';

const Storage = {
    save(player) {
        try {
            const data = JSON.stringify(player.toJSON());
            localStorage.setItem(SAVE_KEY, data);
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            return false;
        }
    },

    load() {
        try {
            const data = localStorage.getItem(SAVE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Load failed:', e);
            return null;
        }
    },

    exists() {
        return localStorage.getItem(SAVE_KEY) !== null;
    },

    delete() {
        localStorage.removeItem(SAVE_KEY);
    }
};


// ===== src/input.js =====
/** Keyboard and touch input handling. */

const KEYS = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
    A: 'a',      // confirm / interact
    B: 'b',      // cancel / menu
};

class Input {
    constructor() {
        this.keys = new Set();
        this.pressedThisFrame = new Set();
        this.releasedThisFrame = new Set();

        this._keydown = this._keydown.bind(this);
        this._keyup = this._keyup.bind(this);

        window.addEventListener('keydown', this._keydown);
        window.addEventListener('keyup', this._keyup);

        this._setupTouch();
    }

    _keydown(e) {
        const key = this._mapKey(e.code);
        if (!key) return;
        e.preventDefault();
        if (!this.keys.has(key)) {
            this.keys.add(key);
            this.pressedThisFrame.add(key);
        }
    }

    _keyup(e) {
        const key = this._mapKey(e.code);
        if (!key) return;
        e.preventDefault();
        this.keys.delete(key);
        this.releasedThisFrame.add(key);
    }

    _mapKey(code) {
        switch (code) {
            case 'ArrowUp':
            case 'KeyW':
                return KEYS.UP;
            case 'ArrowDown':
            case 'KeyS':
                return KEYS.DOWN;
            case 'ArrowLeft':
            case 'KeyA':
                return KEYS.LEFT;
            case 'ArrowRight':
            case 'KeyD':
                return KEYS.RIGHT;
            case 'Enter':
            case 'Space':
            case 'KeyZ':
                return KEYS.A;
            case 'Escape':
            case 'Backspace':
            case 'KeyX':
                return KEYS.B;
            default:
                return null;
        }
    }

    _setupTouch() {
        const map = {
            'btn-up': KEYS.UP,
            'btn-down': KEYS.DOWN,
            'btn-left': KEYS.LEFT,
            'btn-right': KEYS.RIGHT,
            'btn-a': KEYS.A,
            'btn-b': KEYS.B,
        };

        for (const [id, key] of Object.entries(map)) {
            const btn = document.getElementById(id);
            if (!btn) continue;

            const press = (e) => {
                e.preventDefault();
                if (!this.keys.has(key)) {
                    this.keys.add(key);
                    this.pressedThisFrame.add(key);
                }
            };

            const release = (e) => {
                e.preventDefault();
                this.keys.delete(key);
                this.releasedThisFrame.add(key);
            };

            btn.addEventListener('touchstart', press, { passive: false });
            btn.addEventListener('touchend', release, { passive: false });
            btn.addEventListener('mousedown', press);
            btn.addEventListener('mouseup', release);
            btn.addEventListener('mouseleave', release);
        }
    }

    update() {
        this.pressedThisFrame.clear();
        this.releasedThisFrame.clear();
    }

    isDown(key) {
        return this.keys.has(key);
    }

    isPressed(key) {
        return this.pressedThisFrame.has(key);
    }

    isReleased(key) {
        return this.releasedThisFrame.has(key);
    }
}


// ===== src/player.js =====
/** Player character data. */

class Player {
    constructor(name, gender) {
        this.name = name;
        this.gender = gender;

        this.baseStrength = 15;
        this.baseAgility = 15;
        this.baseIntelligence = 15;
        this.baseConstitution = 15;

        this.level = 1;
        this.exp = 0;
        this.expToNext = 100;
        this.potential = 0;
        this.gold = 100;

        this.hp = 0;
        this.maxHp = 0;
        this.mp = 0;
        this.maxMp = 0;

        this.locationId = 'taiping_town_center';
        this.x = 8;
        this.y = 8;
        this.facing = 'down';

        this.morality = 0;
        this.skills = {};
        this.inventory = {};
        this.equippedWeapon = null;
        this.equippedArmor = { body: null, feet: null };
        this.questsCompleted = [];
        this.deadNpcs = [];

        this._recalculateStats();
        this.hp = this.maxHp;
        this.mp = this.maxMp;
    }

    _recalculateStats() {
        this.maxHp = 50 + this.baseConstitution * 5 + this.level * 10;
        this.maxMp = 20 + this.baseIntelligence * 3 + this.level * 5;

        this.attack = this.baseStrength * 1 + this.level * 1;
        this.defense = this.baseConstitution * 0.5 + this.level * 0.5;
        this.speed = this.baseAgility * 1 + this.level * 0.5;
    }

    totalAttack(items) {
        let attack = this.attack;
        if (this.equippedWeapon && items[this.equippedWeapon]?.effect) {
            attack += items[this.equippedWeapon].effect.attack || 0;
        }
        for (const [skillId, level] of Object.entries(this.skills)) {
            // Skill bonuses simplified
        }
        return Math.floor(attack);
    }

    totalDefense(items) {
        let defense = this.defense;
        for (const slot of Object.values(this.equippedArmor)) {
            if (slot && items[slot]?.effect) {
                defense += items[slot].effect.defense || 0;
                defense += items[slot].effect.speed || 0;
            }
        }
        return Math.floor(defense);
    }

    heal(hp = 0, mp = 0) {
        this.hp = Math.min(this.maxHp, this.hp + hp);
        this.mp = Math.min(this.maxMp, this.mp + mp);
    }

    isAlive() {
        return this.hp > 0;
    }

    gainExp(amount) {
        this.exp += amount;
        while (this.exp >= this.expToNext) {
            this.exp -= this.expToNext;
            this.level += 1;
            this.expToNext = Math.floor(this.expToNext * 1.2);
            this._recalculateStats();
            this.hp = this.maxHp;
            this.mp = this.maxMp;
        }
    }

    addItem(itemId, quantity = 1) {
        if (quantity <= 0) return;
        this.inventory[itemId] = (this.inventory[itemId] || 0) + quantity;
    }

    removeItem(itemId, quantity = 1) {
        if ((this.inventory[itemId] || 0) < quantity) return false;
        this.inventory[itemId] -= quantity;
        if (this.inventory[itemId] === 0) delete this.inventory[itemId];
        return true;
    }

    hasItem(itemId, quantity = 1) {
        return (this.inventory[itemId] || 0) >= quantity;
    }

    addSkill(skillId, level = 1) {
        const current = this.skills[skillId] || 0;
        this.skills[skillId] = Math.max(current, level);
    }

    toJSON() {
        return {
            name: this.name,
            gender: this.gender,
            baseStrength: this.baseStrength,
            baseAgility: this.baseAgility,
            baseIntelligence: this.baseIntelligence,
            baseConstitution: this.baseConstitution,
            level: this.level,
            exp: this.exp,
            expToNext: this.expToNext,
            potential: this.potential,
            gold: this.gold,
            hp: this.hp,
            maxHp: this.maxHp,
            mp: this.mp,
            maxMp: this.maxMp,
            locationId: this.locationId,
            x: this.x,
            y: this.y,
            facing: this.facing,
            morality: this.morality,
            skills: this.skills,
            inventory: this.inventory,
            equippedWeapon: this.equippedWeapon,
            equippedArmor: this.equippedArmor,
            questsCompleted: this.questsCompleted,
            deadNpcs: this.deadNpcs,
        };
    }

    static fromJSON(data) {
        const player = new Player(data.name, data.gender);
        player.baseStrength = data.baseStrength;
        player.baseAgility = data.baseAgility;
        player.baseIntelligence = data.baseIntelligence;
        player.baseConstitution = data.baseConstitution;
        player.level = data.level;
        player.exp = data.exp;
        player.expToNext = data.expToNext;
        player.potential = data.potential;
        player.gold = data.gold;
        player.hp = data.hp;
        player.maxHp = data.maxHp;
        player.mp = data.mp;
        player.maxMp = data.maxMp;
        player.locationId = data.locationId;
        player.x = data.x;
        player.y = data.y;
        player.facing = data.facing;
        player.morality = data.morality;
        player.skills = data.skills || {};
        player.inventory = data.inventory || {};
        player.equippedWeapon = data.equippedWeapon;
        player.equippedArmor = data.equippedArmor || { body: null, feet: null };
        player.questsCompleted = data.questsCompleted || [];
        player.deadNpcs = data.deadNpcs || [];
        player._recalculateStats();
        return player;
    }
}


// ===== src/data_embedded.js =====
/** Embedded game data (auto-generated from JSON files). */

const maps = {
  "taiping_town_center": {
    "id": "taiping_town_center",
    "name": "太平镇",
    "description": "一座宁静的小镇，青石板路两旁是低矮的民居。",
    "connections": {
      "east": "taiping_east_suburb",
      "west": "taiping_west_suburb",
      "north": "taiping_inn",
      "south": "taiping_dojo"
    },
    "npcs": [
      "old_lady",
      "village_chief",
      "thug_a"
    ]
  },
  "taiping_inn": {
    "id": "taiping_inn",
    "name": "悦来客栈",
    "description": "镇上唯一的客栈，门口挂着褪色的酒旗。",
    "connections": {
      "south": "taiping_town_center"
    },
    "npcs": [
      "waiter"
    ]
  },
  "taiping_dojo": {
    "id": "taiping_dojo",
    "name": "振威武馆",
    "description": "武馆里传来呼喝声，几个弟子正在练功。",
    "connections": {
      "north": "taiping_town_center"
    },
    "npcs": [
      "master_li"
    ]
  },
  "taiping_east_suburb": {
    "id": "taiping_east_suburb",
    "name": "镇东郊",
    "description": "一片荒地，偶有野狗出没。",
    "connections": {
      "west": "taiping_town_center"
    },
    "npcs": [
      "thug_b"
    ]
  },
  "taiping_west_suburb": {
    "id": "taiping_west_suburb",
    "name": "镇西郊",
    "description": "西边是一片小树林，听说有强盗出没。",
    "connections": {
      "east": "taiping_town_center"
    },
    "npcs": [
      "bandit"
    ]
  }
};

const npcs = {
  "old_lady": {
    "id": "old_lady",
    "name": "王婆婆",
    "title": "孤寡老人",
    "location": "taiping_town_center",
    "dialog_default": "年轻人，老婆子我腿脚不便，你能帮我找根拐杖吗？镇西郊的树林里应该有。",
    "dialog_quest_done": "好孩子，这是给你的谢礼。",
    "hostile": false,
    "combat": null,
    "shop": null,
    "services": [
      "quest"
    ],
    "quest": {
      "id": "find_walking_stick",
      "name": "寻找拐杖",
      "required_item": "walking_stick",
      "reward_exp": 50,
      "reward_item": "gold_coin",
      "reward_gold": 100
    }
  },
  "village_chief": {
    "id": "village_chief",
    "name": "老村长",
    "title": "太平村村长",
    "location": "taiping_town_center",
    "dialog_default": "年轻人，想学武可以去北边的武馆看看。想出人头地，还得靠真本事啊。",
    "hostile": false,
    "combat": null,
    "shop": null,
    "services": []
  },
  "waiter": {
    "id": "waiter",
    "name": "店小二",
    "title": "客栈伙计",
    "location": "taiping_inn",
    "dialog_default": "客官，打尖还是住店？住店一晚五十文，能恢复体力。",
    "hostile": false,
    "combat": null,
    "shop": [
      {
        "item_id": "steamed_bun",
        "price": 10,
        "quantity": 999
      },
      {
        "item_id": "wine",
        "price": 50,
        "quantity": 20
      }
    ],
    "services": [
      "inn"
    ],
    "inn_price": 50
  },
  "master_li": {
    "id": "master_li",
    "name": "李教头",
    "title": "武馆教头",
    "location": "taiping_dojo",
    "dialog_default": "想学武？先把基本功练扎实！给我一百文，我教你基本拳脚。",
    "hostile": false,
    "combat": null,
    "shop": [
      {
        "item_id": "wooden_stick",
        "price": 80,
        "quantity": 5
      }
    ],
    "services": [
      "teach"
    ],
    "teachable_skills": [
      {
        "skill_id": "basic_fist",
        "cost_gold": 100,
        "cost_potential": 50
      }
    ]
  },
  "thug_a": {
    "id": "thug_a",
    "name": "赵二",
    "title": "街头地痞",
    "location": "taiping_town_center",
    "dialog_default": "小子，看什么呢？想找茬？",
    "hostile": true,
    "combat": {
      "level": 1,
      "hp": 80,
      "mp": 0,
      "strength": 12,
      "agility": 10,
      "intelligence": 5,
      "constitution": 10,
      "attack": 15,
      "defense": 5,
      "speed": 10,
      "skills": [
        "basic_fist"
      ],
      "loot": [
        {
          "item_id": "cloth_shoes",
          "chance": 0.3
        },
        {
          "item_id": "copper_coin",
          "chance": 1.0,
          "quantity": 20
        }
      ]
    },
    "shop": null,
    "services": []
  },
  "thug_b": {
    "id": "thug_b",
    "name": "钱三",
    "title": "东郊恶霸",
    "location": "taiping_east_suburb",
    "dialog_default": "此路是我开，留下买路财！",
    "hostile": true,
    "combat": {
      "level": 2,
      "hp": 100,
      "mp": 0,
      "strength": 14,
      "agility": 8,
      "intelligence": 4,
      "constitution": 12,
      "attack": 18,
      "defense": 6,
      "speed": 9,
      "skills": [
        "basic_fist"
      ],
      "loot": [
        {
          "item_id": "healing_pill",
          "chance": 0.5
        },
        {
          "item_id": "copper_coin",
          "chance": 1.0,
          "quantity": 35
        }
      ]
    },
    "shop": null,
    "services": []
  },
  "bandit": {
    "id": "bandit",
    "name": "李逵",
    "title": "落草强盗",
    "location": "taiping_west_suburb",
    "dialog_default": "嘿嘿，又一个送上门的。",
    "hostile": true,
    "combat": {
      "level": 3,
      "hp": 150,
      "mp": 0,
      "strength": 18,
      "agility": 10,
      "intelligence": 3,
      "constitution": 15,
      "attack": 25,
      "defense": 8,
      "speed": 11,
      "skills": [
        "basic_fist",
        "basic_sword"
      ],
      "loot": [
        {
          "item_id": "walking_stick",
          "chance": 1.0
        },
        {
          "item_id": "iron_sword",
          "chance": 0.3
        },
        {
          "item_id": "copper_coin",
          "chance": 1.0,
          "quantity": 80
        }
      ]
    },
    "shop": null,
    "services": []
  }
};

const skills = {
  "basic_fist": {
    "id": "basic_fist",
    "name": "基本拳脚",
    "type": "unarmed",
    "description": "最基本的拳脚功夫，是练习高级武功的基础。",
    "max_level": 100,
    "power_per_level": 1.0,
    "cost_mp": 0,
    "special_effect": null
  },
  "basic_sword": {
    "id": "basic_sword",
    "name": "基本剑法",
    "type": "sword",
    "description": "剑法入门，招式简单实用。",
    "max_level": 100,
    "power_per_level": 1.2,
    "cost_mp": 0,
    "special_effect": null
  },
  "basic_blade": {
    "id": "basic_blade",
    "name": "基本刀法",
    "type": "blade",
    "description": "刀法入门，重在劈砍。",
    "max_level": 100,
    "power_per_level": 1.2,
    "cost_mp": 0,
    "special_effect": null
  },
  "basic_internal": {
    "id": "basic_internal",
    "name": "基本内功",
    "type": "internal",
    "description": "内功基础，能增加内力上限和恢复速度。",
    "max_level": 100,
    "power_per_level": 0.5,
    "cost_mp": 0,
    "special_effect": "increase_mp"
  },
  "basic_dodge": {
    "id": "basic_dodge",
    "name": "基本轻功",
    "type": "dodge",
    "description": "提升闪避能力的轻功基础。",
    "max_level": 100,
    "power_per_level": 0.8,
    "cost_mp": 0,
    "special_effect": "increase_dodge"
  },
  "basic_parry": {
    "id": "basic_parry",
    "name": "基本招架",
    "type": "parry",
    "description": "提升防御能力的招架基础。",
    "max_level": 100,
    "power_per_level": 0.8,
    "cost_mp": 0,
    "special_effect": "increase_defense"
  }
};

const items = {
  "walking_stick": {
    "id": "walking_stick",
    "name": "拐杖",
    "type": "quest",
    "description": "一根结实的木拐杖，适合老人使用。",
    "effect": null,
    "value": 0,
    "stackable": false
  },
  "gold_coin": {
    "id": "gold_coin",
    "name": "碎银子",
    "type": "material",
    "description": "一小块银子，可以当钱用。",
    "effect": null,
    "value": 100,
    "stackable": true
  },
  "copper_coin": {
    "id": "copper_coin",
    "name": "铜钱",
    "type": "currency",
    "description": "通用的铜钱。",
    "effect": null,
    "value": 1,
    "stackable": true
  },
  "healing_pill": {
    "id": "healing_pill",
    "name": "金创药",
    "type": "consumable",
    "description": "常见的伤药，能恢复一些气血。",
    "effect": {
      "type": "heal_hp",
      "value": 50
    },
    "value": 30,
    "stackable": true
  },
  "steamed_bun": {
    "id": "steamed_bun",
    "name": "肉包子",
    "type": "consumable",
    "description": "热腾腾的肉包子，能恢复少量气血。",
    "effect": {
      "type": "heal_hp",
      "value": 20
    },
    "value": 10,
    "stackable": true
  },
  "wine": {
    "id": "wine",
    "name": "烧刀子",
    "type": "consumable",
    "description": "烈酒，能恢复少量内力。",
    "effect": {
      "type": "heal_mp",
      "value": 20
    },
    "value": 50,
    "stackable": true
  },
  "wooden_stick": {
    "id": "wooden_stick",
    "name": "木棍",
    "type": "weapon",
    "description": "一根结实的木棍。",
    "effect": {
      "attack": 5
    },
    "value": 40,
    "stackable": false
  },
  "iron_sword": {
    "id": "iron_sword",
    "name": "铁剑",
    "type": "weapon",
    "description": "普通的铁剑，比木棍锋利多了。",
    "effect": {
      "attack": 12
    },
    "value": 150,
    "stackable": false
  },
  "cloth_shoes": {
    "id": "cloth_shoes",
    "name": "布鞋",
    "type": "armor",
    "slot": "feet",
    "description": "一双普通的布鞋，穿着轻便。",
    "effect": {
      "speed": 2
    },
    "value": 30,
    "stackable": false
  },
  "cloth_clothes": {
    "id": "cloth_clothes",
    "name": "布衣",
    "type": "armor",
    "slot": "body",
    "description": "一件粗布衣裳，能提供一点防护。",
    "effect": {
      "defense": 3
    },
    "value": 50,
    "stackable": false
  }
};


// ===== src/world.js =====
/** World, maps, and NPC management. */


class World {
    constructor() {
        this.maps = {};
        this.npcs = {};
        this.skills = {};
        this.items = {};
    }

    async load() {
        // Data is embedded so the game works from file:// and GitHub Pages
        this.maps = maps;
        this.npcs = npcs;
        this.skills = skills;
        this.items = items;
    }

    getMap(id) {
        return this.maps[id] || null;
    }

    getNpc(id) {
        return this.npcs[id] || null;
    }

    getItem(id) {
        return this.items[id] || null;
    }

    getSkill(id) {
        return this.skills[id] || null;
    }

    getNpcsAtLocation(locationId, player) {
        const map = this.getMap(locationId);
        if (!map) return [];
        return (map.npcs || [])
            .filter(id => !player.deadNpcs.includes(id))
            .map(id => this.getNpc(id))
            .filter(Boolean);
    }

    getConnection(locationId, direction) {
        const map = this.getMap(locationId);
        if (!map) return null;
        return map.connections?.[direction] || null;
    }

    getConnections(locationId) {
        const map = this.getMap(locationId);
        if (!map) return {};
        return map.connections || {};
    }
}


// ===== src/combat.js =====
/** Turn-based combat system. */


class Combat {
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


// ===== src/ui.js =====
/** HTML overlay UI helpers. */

const uiLayer = document.getElementById('ui-layer');

const UI = {
    clear() {
        uiLayer.innerHTML = '';
        uiLayer.classList.remove('active');
    },

    showNameInput(callback) {
        uiLayer.classList.add('active');
        uiLayer.innerHTML = `
            <div class="overlay">
                <label>请输入你的名字：</label>
                <input type="text" id="name-input" maxlength="8" value="无名侠客">
                <button id="name-confirm">确定</button>
            </div>
        `;

        const input = document.getElementById('name-input');
        const btn = document.getElementById('name-confirm');
        input.focus();
        input.select();

        const submit = () => {
            const name = input.value.trim() || '无名侠客';
            this.clear();
            callback(name);
        };

        btn.addEventListener('click', submit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submit();
        });
    },

    showMessage(title, message, callback) {
        uiLayer.classList.add('active');
        uiLayer.innerHTML = `
            <div class="overlay">
                <h3>${title}</h3>
                <p>${message}</p>
                <button id="msg-confirm">确定</button>
            </div>
        `;
        document.getElementById('msg-confirm').addEventListener('click', () => {
            this.clear();
            if (callback) callback();
        });
    }
};


// ===== src/renderer.js =====
/** Canvas rendering using original extracted assets. */

const COLORS = {
    bg: '#9ea792',
    dark: '#1a1c18',
    mid: '#4a4a3a',
    light: '#e8e8c8',
    highlight: '#c4ceb0',
    shadow: '#6b7561',
    text: '#1a1c18',
};

const TILE_SIZE = 16;  // We render 32x32 original assets at half size
const VIEW_W = 20;
const VIEW_H = 15;

// Logical canvas size
const SCREEN_W = 320;
const SCREEN_H = 240;

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

class Renderer {
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


// ===== src/game.js =====
/** Main game controller and state machine. */









const STATE = {
    LOADING: 'loading',
    TITLE: 'title',
    CREATE_CHAR: 'create_char',
    EXPLORE: 'explore',
    DIALOG: 'dialog',
    MENU: 'menu',
    COMBAT: 'combat',
};

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.assets = new Assets();
        this.renderer = new Renderer(canvas, this.assets);
        this.input = new Input();
        this.world = new World();

        this.state = STATE.TITLE;
        this.player = null;
        this.combat = null;
        this.loadError = null;

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

    init() {
        // Start the loop immediately so the screen is never blank
        this.state = STATE.LOADING;
        this.loop();

        // Load assets and data in the background
        this._loadResources().catch(err => {
            console.error('Failed to load resources:', err);
            this.loadError = err.message || '资源加载失败';
        });
    }

    async _loadResources() {
        await this.assets.load();
        await this.world.load();
        this.state = STATE.TITLE;
    }

    loop() {
        try {
            this.update();
            this.draw();
        } catch (err) {
            console.error('Game loop error:', err);
            this.loadError = err.message || '运行错误';
        }
        this.input.update();
        requestAnimationFrame(() => this.loop());
    }

    update() {
        if (this.moveCooldown > 0) this.moveCooldown--;

        switch (this.state) {
            case STATE.LOADING:
                // Wait for resources; any key press shows error if failed
                if (this.loadError) {
                    this.state = STATE.TITLE; // will draw error on title screen
                }
                break;
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
            case STATE.LOADING:
                this._drawLoading();
                break;
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

    _drawLoading() {
        this.renderer.ctx.fillStyle = '#1a1a1a';
        this.renderer.ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
        this.renderer.ctx.fillStyle = '#c8d0a0';
        this.renderer.ctx.font = '14px "Microsoft YaHei", monospace';
        if (this.loadError) {
            this.renderer.ctx.fillText('加载失败', 120, 90);
            this.renderer.ctx.font = '9px "Microsoft YaHei", monospace';
            this.renderer.ctx.fillText(this.loadError, 20, 120);
            this.renderer.ctx.fillText('请用本地服务器打开，或刷新重试', 50, 150);
        } else {
            this.renderer.ctx.fillText('正在加载...', 110, 110);
            this.renderer.ctx.font = '9px "Microsoft YaHei", monospace';
            this.renderer.ctx.fillText('首次加载可能需要几秒', 90, 140);
        }
    }

    _drawTitle() {
        this.renderer.ctx.fillStyle = '#1a1a1a';
        this.renderer.ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
        this.renderer.ctx.fillStyle = '#c8d0a0';
        this.renderer.ctx.font = '20px "Microsoft YaHei", monospace';
        this.renderer.ctx.fillText('英雄坛说', 110, 80);
        this.renderer.ctx.font = '10px "Microsoft YaHei", monospace';
        this.renderer.ctx.fillText('Hero Altar', 128, 100);

        if (this.loadError) {
            this.renderer.ctx.fillStyle = '#c8d0a0';
            this.renderer.ctx.font = '10px "Microsoft YaHei", monospace';
            this.renderer.ctx.fillText('资源加载失败，部分功能不可用', 60, 140);
            this.renderer.ctx.fillText(this.loadError, 20, 160);
            this.renderer.ctx.fillText('建议用 python -m http.server 启动后访问', 30, 180);
        } else {
            this.renderer.ctx.fillText('按 A / 空格 开始游戏', 90, 160);
            this.renderer.ctx.fillText('按 B / Esc 创建新角色', 86, 180);
        }
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


// ===== src/main.js =====
/** Entry point for Hero Altar web version. */


function main() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas not found');
        return;
    }

    // Scale canvas for high-DPI displays; CSS handles display size
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 320 * dpr;
    canvas.height = 240 * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const game = new Game(canvas);
    game.init();
}

main();

})();
