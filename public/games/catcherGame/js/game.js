let player;
let cursors;
let speed = 12;
let fallingObjects;
let scaleFactor = 1;
let walls;
let lives = 3;
let score = 0;
let livesText;
let scoreText;

let difficultyLevel = 1;
let spawnDelay = 3000;

function preload() {
    this.load.image('background', 'games/catcherGame/assets/background.png');
    this.load.image('player', 'games/catcherGame/assets/player.png');
    this.load.image('wall', 'games/catcherGame/assets/wall.png');

    // Charger les 5 vêtements différents
    for (let i = 1; i <= 5; i++) {
        this.load.image('vetement' + i, 'games/catcherGame/assets/vetement' + i + '.png');
    }
}

function create() {
    const existingUI = document.getElementById('game-over-ui');
    if (existingUI) existingUI.remove();

    lives = 3;
    score = 0;
    difficultyLevel = 1;
    spawnDelay = 5000;

    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

    walls = this.physics.add.staticGroup();
    walls
        .create(0, height / 2, 'wall')
        .setOrigin(0, 0.5)
        .setDisplaySize(20, height);
    walls
        .create(width, height / 2, 'wall')
        .setOrigin(1, 0.5)
        .setDisplaySize(20, height);

    const startY = height * 0.9;
    player = this.physics.add.sprite(width / 2, startY, 'player');
    player.setScale(0.4);
    player.setCollideWorldBounds(true);
    player.setBounce(0);

    cursors = this.input.keyboard.createCursorKeys();
    this.physics.add.collider(player, walls);

    fallingObjects = this.physics.add.group({
        key: 'vetement1', // valeur par défaut, mais remplacée à chaque spawn
        setXY: { x: 0, y: 0 },
    });

    scheduleNextObject.call(this);

    livesText = this.add.text(10, 10, 'Vies: ' + lives, {
        fontFamily: 'upheavtt',
        fontSize: 48,
    });

    scoreText = this.add.text(width - 200, 10, 'Score: ' + score, {
        fontFamily: 'upheavtt',
        fontSize: 48,
    });
}

function scheduleNextObject() {
    createFallingObject.call(this);

    difficultyLevel = Math.floor(score / 5) + 1;
    spawnDelay = Math.max(300, 1000 - difficultyLevel * 100);

    setTimeout(() => {
        if (lives > 0) {
            scheduleNextObject.call(this);
        }
    }, spawnDelay);
}

function createFallingObject() {
    const width = this.sys.game.config.width;
    const randomX = Phaser.Math.Between(30, width - 30);

    // Choisir un vêtement aléatoire
    const randomIndex = Phaser.Math.Between(1, 5);
    const textureKey = 'vetement' + randomIndex;

    const fallingObject = fallingObjects.create(randomX, -50, textureKey);
    fallingObject.setScale(scaleFactor);

    const gravityY = Math.min(400, 80 + difficultyLevel * 10);
    fallingObject.setGravityY(gravityY);
}

function update() {
    player.setVelocityX(0);

    if (cursors.left.isDown) {
        player.x -= speed;
        player.setFlipX(true);
    } else if (cursors.right.isDown) {
        player.x += speed;
        player.setFlipX(false);
    }

    player.y = this.sys.game.config.height * 0.9;

    this.physics.overlap(
        player,
        fallingObjects,
        function (player, fallingObject) {
            score++;
            scoreText.setText('Score: ' + score);
            fallingObject.destroy();
        },
        null,
        this,
    );

    fallingObjects.getChildren().forEach((obj) => {
        if (obj.y > this.sys.game.config.height + 50) {
            obj.destroy();
            lives--;
            livesText.setText('Lives: ' + lives);
            if (lives <= 0) {
                fetch(`/add-score?score=${score}&idJeu=2`).finally(() => {
                    showGameOverUI.call(this);
                    this.scene.pause();
                });
            }
        }
    });
}

function showGameOverUI() {
    const container = document.createElement('div');
    container.id = 'game-over-ui';
    container.style.position = 'absolute';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.backgroundColor = 'rgba(0,0,0,0.8)';
    container.style.padding = '30px';
    container.style.borderRadius = '12px';
    container.style.textAlign = 'center';
    container.style.color = '#fff';
    container.style.fontFamily = 'upheavtt';
    container.style.zIndex = '999';

    container.innerHTML = `
    <h2>Game Over</h2>
    <p>Score final : ${score}</p>
    <button id="replay-btn" style="margin:10px; padding:10px 20px; font-size:16px;">Rejouer</button>
    <a id="menu-btn" href="/accueil" style="margin:10px; padding:10px 20px; font-size:16px;">Menu</a>
  `;

    document.body.appendChild(container);

    document.getElementById('replay-btn').onclick = () => {
        container.remove();
        score = 0;
        lives = 3;
        difficultyLevel = 1;
        spawnDelay = 1000;
        fallingObjects.clear(true, true);
        this.scene.restart();
    };
}

// Phaser config
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000',
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
};

const game = new Phaser.Game(config);
