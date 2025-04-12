export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: 'Preloader' });
    }

    preload() {
        // UI
        this.load.image("volume-icon", "assets/ui/volon.png");
        this.load.image("volume-icon_off", "assets/ui/voloff.png");
        this.load.image("heart", "assets/ui/life.png");
        
        // Background et cartes
        this.load.image("background", "assets/background.png");
        this.load.image("card-back", "assets/cards/card-back.png");
        
        // Faces des cartes
        for (let i = 1; i < 7; i++) {
            this.load.image(`card-${i}`, `assets/cards/card-${i}.png`);
        }
    }

    create() {
        console.log("Textures chargées:", Object.keys(this.textures.list));
        this.scene.start("Play");
    }
}