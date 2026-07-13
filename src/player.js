/** Player character data. */

export class Player {
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
