/** Entry point for Hero Altar web version. */

import { Game } from './game.js';

function main() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas not found');
        return;
    }

    // Scale canvas for high-DPI displays
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 320 * dpr;
    canvas.height = 240 * dpr;
    canvas.style.width = '320px';
    canvas.style.height = '240px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const game = new Game(canvas);
    game.init();
}

main();
