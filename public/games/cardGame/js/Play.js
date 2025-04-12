import { createCard } from "./createCard.js";

export class Play extends Phaser.Scene {
    cardNames = ["card-1", "card-2", "card-3", "card-4", "card-5", "card-6"];
    cards = [];
    cardOpened = null;
    canMove = true;
    lives = 10;
    hearts = [];
    score = 0;
    level = 1;

    get rowLayout() {
        const layouts = {
            1: [4, 4],
            2: [4, 4, 2],
            3: [4, 4, 4],
            4: [5, 5, 4],
            5: [5, 5, 5],
            6: [6, 6, 6]
        };
        return layouts[this.level] || [6, 6, 6]; // Tous les nv après 6 
    }

    constructor() {
        super({ key: 'Play' });
    }

    create() {
        this.add.image(0, 0, "background").setOrigin(0);
        if (this.game.isBooted) {
            this.setupTitleScreen();
        } else {
            this.startGame();
        }
        document.getElementById('score-container').textContent = `${this.score}`;
        document.getElementById('level-container').textContent = `${this.level}`;
    }
     // Affiche l'écran titre 
    setupTitleScreen() {
        const titleText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            "Memory\nAppuyez pour jouer",
            { 
                fontFamily: "upheavtt",
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
    // Démarre le jeu
    startGame() {
        this.score = 0;
        this.level = 1;
        this.lives = 10;
        document.getElementById('score-container').textContent = `${this.score}`;
        document.getElementById('level-container').textContent = `${this.level}`;
        this.createHearts();
        this.createCards();
    }
    // Crée les coeurs de vie
    createHearts() {
        this.hearts.forEach(heart => heart.destroy());
        this.hearts = [];

        for (let i = 0; i < this.lives; i++) {
            this.hearts.push(this.add.image(35 + 30 * i, 27, "heart").setScale(2));
        }
    }
    // Crée les cartes avec une logique de sélection cyclique (quand on a plus de cartes)
    createCards() {
        this.cards.forEach(card => card.destroy());
        this.cards = [];
        this.cardOpened = null;
    
        const paddingX = 14;
        const paddingY = 14;
        const cardWidth = 99 * 0.7; // Prendre en compte le scale
        const cardHeight = 128 * 0.7; // Prendre en compte le scale
    
        const layout = this.rowLayout;
        const totalCards = layout.reduce((a, b) => a + b, 0);
        const totalPairs = totalCards / 2;
    
        // Nouvelle logique de sélection des cartes avec réutilisation cyclique
        const selectedCards = [];
        const shuffledNames = Phaser.Utils.Array.Shuffle([...this.cardNames]);
        
        for (let i = 0; i < totalPairs; i++) {
            selectedCards.push(shuffledNames[i % shuffledNames.length]);
        }
    
        const cardPairs = [...selectedCards, ...selectedCards];
        const shuffledCards = Phaser.Utils.Array.Shuffle(cardPairs);
    
        let index = 0;
        let startY = 90;
    
        layout.forEach((cardsInRow, rowIndex) => {
            const totalRowWidth = (cardsInRow * cardWidth) + ((cardsInRow - 1) * paddingX);
            const startX = (this.game.config.width - totalRowWidth) / 2;
    
            for (let col = 0; col < cardsInRow; col++) {
                const x = startX + col * (cardWidth + paddingX) + (cardWidth * 0.7 / 2);
                const y = startY + rowIndex * (cardHeight + paddingY);
                const cardName = shuffledCards[index];
    
                const card = createCard({
                    scene: this,
                    x,
                    y,
                    frontTexture: cardName,
                    cardName
                });
    
                if (!card) {
                    console.error(`Erreur création carte ${cardName}`);
                    continue;
                }
    
                this.cards.push(card);
                index++;
            }
        });
    
        this.setupCardInteractions();
    }
    // Gère les interactions avec les cartes (clic quoi)
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
    // Vérifie si les cartes ouvertes correspondent
    // Si oui, on les détruit et on ajoute des points
    checkCardMatch(clickedCard) {
        if (this.cardOpened.cardName === clickedCard.cardName) {
            this.score += 100;
            document.getElementById('score-container').textContent = `${this.score}`;
            document.getElementById('level-container').textContent = `${this.level}`;

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
            this.handleMismatch(clickedCard);
        }
    }
    // Gère la fin de niveau (si toutes les cartes sont détruites)
    levelComplete() {
        this.level++;
        this.lives = Math.min(this.lives + 3, 8);

        const winText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            `Niveau ${this.level - 1} réussi!`,
            { 
                fontFamily: "upheavtt",
                fontSize: 36,
                color: "#00ff00",
                stroke: "#000",
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        if (this.level > 20) {
            this.showGameResult(true);
            return;
        }
        document.getElementById('score-container').textContent = `${this.score}`;
        document.getElementById('level-container').textContent = `${this.level}`;

        this.time.delayedCall(1500, () => {
            winText.destroy();
            this.createHearts();
            this.createCards();
        });
    }
    // Gère le cas où les cartes ne correspondent pas
    //on enlève une vie et on retourne les cartes
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
    // Affiche le résultat du jeu 
    showGameResult(isWin) {
        const text = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            isWin ? "End Game GG !" : `Game Over\nScore: ${this.score}`,
            {
                fontFamily: "upheavtt",
                fontSize: 48,
                color: isWin ? "#00ff00" : "#ff0000",
                stroke: "#000",
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        fetch(`/add-score?score=${this.score}&idJeu=1`)
        .finally(() => {
            this.time.delayedCall(3000, () => {
                this.scene.restart();
            });
        });
    }
}
