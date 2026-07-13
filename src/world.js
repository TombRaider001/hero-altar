/** World, maps, and NPC management. */

import { loadJSON } from './utils.js';

export class World {
    constructor() {
        this.maps = {};
        this.npcs = {};
        this.skills = {};
        this.items = {};
    }

    async load() {
        const [maps, npcs, skills, items] = await Promise.all([
            loadJSON('src/data/maps.json'),
            loadJSON('src/data/npcs.json'),
            loadJSON('src/data/skills.json'),
            loadJSON('src/data/items.json'),
        ]);
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
