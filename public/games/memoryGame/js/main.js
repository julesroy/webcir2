import { Preloader } from './Preloader.js';
import { Play } from './Play.js';
const config = {
    title: 'Clothes Matching Game',
    type: Phaser.AUTO,
    backgroundColor: '#2c3e50',
    width: 450,
    height: 430,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false },
    },
    render: {
        pixelArt: true,
    },
    scene: [Preloader, Play],
};

new Phaser.Game(config);
