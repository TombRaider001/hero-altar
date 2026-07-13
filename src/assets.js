/** Asset loading utilities. */

export function loadImage(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
        img.src = path;
    });
}

export class Assets {
    constructor() {
        this.tileset = null;
        this.heroBoy = null;
        this.heroGirl = null;
        this.badMan = null;
        this.badWoman = null;
        this.battleback = null;
    }

    async load() {
        [
            this.tileset,
            this.heroBoy,
            this.heroGirl,
            this.badMan,
            this.badWoman,
            this.battleback,
        ] = await Promise.all([
            loadImage('assets/tileset.png'),
            loadImage('assets/hero_boy.png'),
            loadImage('assets/hero_girl.png'),
            loadImage('assets/bad_man.png'),
            loadImage('assets/bad_woman.png'),
            loadImage('assets/battleback.png'),
        ]);
    }
}
