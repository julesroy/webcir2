export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: 'Preloader' });
    }

    preload() {
        // UI
        this.load.image("heart", "games/cardGame/assets/ui/life.png");
        
        // Background et cartes cachées
        this.load.image("background", "games/cardGame/assets/background.png");
        this.load.image("card-back", "games/cardGame/assets/cards/card-back.png");
        
        // Faces des cartes
        for (let i = 1; i < 7; i++) {
            this.load.image(`card-${i}`, `games/cardGame/assets/cards/card-${i}.png`);
        }
    }

    create() {
        console.log("Textures chargées:", Object.keys(this.textures.list));
        this.scene.start("Play");
    }
}