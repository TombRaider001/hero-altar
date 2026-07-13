/** Keyboard and touch input handling. */

export const KEYS = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
    A: 'a',      // confirm / interact
    B: 'b',      // cancel / menu
};

export class Input {
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
