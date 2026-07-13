/** Save/load game state using localStorage. */

const SAVE_KEY = 'hero_altar_save';

export const Storage = {
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
