/** Utility helpers. */

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function chance(percent) {
    return Math.random() < percent;
}

export function loadJSON(path) {
    return fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${path}: ${response.status}`);
            }
            return response.json();
        });
}

export function formatNumber(n) {
    return String(n);
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
