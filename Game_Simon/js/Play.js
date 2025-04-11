import { createCard } from "./createCard.js";

export class Play extends Phaser.Scene {
    cardNames = ["card-1", "card-2", "card-3", "card-4", "card-5", "card-6"];
    cards = [];
    cardOpened = null;
    canMove = true;
    lives = 8;
    hearts = [];
    score = 0;
    level = 1;

    // Configuration de la grille qui s'adapte au niveau
    get gridConfig() {
        const baseCols = 4 + Math.floor(this.level / 3); // Augmente les colonnes tous les 3 niveaux
        return {
            x: 60,
            y: 90,
            paddingX: 10,
            paddingY: 10,
            cols: Math.min(baseCols, 6), // Maximum 6 colonnes
            cardWidth: 110,
            cardHeight: 135
        };
    }

    constructor() {
        super({ key: 'Play' });
    }

    create() {
        this.add.image(0, 0, "background").setOrigin(0);
        this.setupTitleScreen();
        
        // Initialisation du score dans le DOM
        document.getElementById('score-container').textContent = `Score: ${this.score} | Level: ${this.level}`;
    }

    setupTitleScreen() {
        const titleText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            "Cloth Memory Game\nClick to Play",
            { 
                fontSize: 32,
                color: "#fff",
                stroke: "#000",
                strokeThickness: 3,
                align: "center"
            }
        ).setOrigin(0.5).setInteractive();

        titleText.on('pointerdown', () => {
            titleText.destroy();
            this.startGame();
        });
    }

    startGame() {
        // Réinitialisation des variables
        this.score = 0;
        this.level = 1;
        document.getElementById('score-container').textContent = `Score: ${this.score} | Level: ${this.level}`;

        // Création des cœurs
        this.createHearts();
        this.createCards();
    }

    createHearts() {
        this.hearts.forEach(heart => heart.destroy());
        this.hearts = [];

        for (let i = 0; i < this.lives; i++) {
            this.hearts.push(this.add.image(35 + 30 * i, 27, "heart").setScale(2));
        }
    }

    createCards() {
        // Destruction des cartes existantes
        this.cards.forEach(card => card.destroy());
        this.cards = [];
        this.cardOpened = null;

        // Calcul du nombre de paires nécessaires (minimum 4 paires, maximum 6)
        const pairsNeeded = Math.min(4 + Math.floor(this.level / 2), 6);
        const selectedCards = Phaser.Utils.Array.Shuffle([...this.cardNames]).slice(0, pairsNeeded);
        
        // Création des paires de cartes
        const cardPairs = [...selectedCards, ...selectedCards];
        const shuffledCards = Phaser.Utils.Array.Shuffle(cardPairs);
        
        this.cards = shuffledCards.map((cardName, index) => {
            const col = index % this.gridConfig.cols;
            const row = Math.floor(index / this.gridConfig.cols);
            
            const x = this.gridConfig.x + (this.gridConfig.cardWidth * col);
            const y = this.gridConfig.y + (this.gridConfig.cardHeight * row);
            
            const card = createCard({
                scene: this,
                x,
                y,
                frontTexture: cardName,
                cardName
            });

            if (!card) {
                console.error(`Erreur création carte ${cardName}`);
                return null;
            }

            return card;
        }).filter(card => card !== null);

        this.setupCardInteractions();
    }

    setupCardInteractions() {
        this.input.on('pointerdown', (pointer) => {
            if (!this.canMove) return;

            const clickedCard = this.cards.find(card => 
                card.gameObject.getBounds().contains(pointer.x, pointer.y) && 
                !card.isFlipping
            );

            if (clickedCard) {
                this.handleCardClick(clickedCard);
            }
        });
    }

    handleCardClick(clickedCard) {
        this.canMove = false;
        clickedCard.flip(() => {
            if (!this.cardOpened) {
                this.cardOpened = clickedCard;
                this.canMove = true;
            } else {
                this.checkCardMatch(clickedCard);
            }
        });
    }

    checkCardMatch(clickedCard) {
        if (this.cardOpened.cardName === clickedCard.cardName) {
            // Bonne paire - ajout du score
            this.score += 100;
            document.getElementById('score-container').textContent = `Score: ${this.score} | Level: ${this.level}`;

            this.time.delayedCall(500, () => {
                clickedCard.destroy();
                this.cardOpened.destroy();
                this.cards = this.cards.filter(c => c !== clickedCard && c !== this.cardOpened);
                this.cardOpened = null;
                this.canMove = true;

                if (this.cards.length === 0) {
                    this.levelComplete();
                }
            });
        } else {
            // Mauvaise paire
            this.handleMismatch(clickedCard);
        }
    }

    levelComplete() {
        this.level++;
        this.lives = Math.min(this.lives + 3, 6); // Gain de vie à chaque niveau (max 6)

        // Animation de victoire
        const winText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            `Level ${this.level-1} Complete!`,
            { 
                fontSize: 36, 
                color: "#00ff00",
                stroke: "#000",
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        document.getElementById('score-container').textContent = `Score: ${this.score} | Level: ${this.level}`;

        this.time.delayedCall(1500, () => {
            winText.destroy();
            this.createHearts();
            this.createCards();
        });
    }

    handleMismatch(clickedCard) {
        this.lives--;
        
        if (this.lives >= 0 && this.hearts[this.lives]) {
            this.hearts[this.lives].destroy();
        }

        this.time.delayedCall(1000, () => {
            clickedCard.flip(() => {
                this.cardOpened.flip(() => {
                    this.cardOpened = null;
                    this.canMove = true;

                    if (this.lives <= 0) {
                        this.showGameResult(false);
                    }
                });
            });
        });
    }

    showGameResult(isWin) {
        const text = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            isWin ? "You Win!" : `Game Over\nScore: ${this.score}`,
            { 
                fontSize: 48, 
                color: isWin ? "#00ff00" : "#ff0000",
                stroke: "#000",
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        this.time.delayedCall(3000, () => {
            this.scene.restart();
        });
    }
}