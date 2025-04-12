export const createCard = ({ scene, x, y, frontTexture, cardName }) => {
    if (!scene.textures.exists(frontTexture)) {
        console.error(`Texture "${frontTexture}" manquante !`);
        return null;
    }

    const backTexture = "card-back";
    const card = scene.add.sprite(x, y, backTexture)
        .setName(cardName)
        .setInteractive({ useHandCursor: true })
        .setScale(0.70)
        .setData({
            isFlipping: false,
            isFront: false,
            isActive: true
        });
    

    const flipCard = (callback) => {
        if (!card.getData('isActive') || card.getData('isFlipping')) return;
        
        card.setData('isFlipping', true);
        scene.tweens.add({
            targets: card,
            scaleX: 0,
            duration: 150,
            onComplete: () => {
                card.setTexture(card.getData('isFront') ? backTexture : frontTexture);
                card.setData('isFront', !card.getData('isFront'));
                
                scene.tweens.add({
                    targets: card,
                    scaleX: 0.7,
                    duration: 150,
                    onComplete: () => {
                        card.setData('isFlipping', false);
                        callback?.();
                    }
                });
            }
        });
    };

    const destroy = () => {
        if (card.getData('isActive')) {
            card.setData('isActive', false);
            scene.tweens.add({
                targets: card,
                alpha: 0,
                duration: 200,
                onComplete: () => card.destroy()
            });
        }
    };

    return {
        gameObject: card,
        flip: flipCard,
        destroy,
        cardName,
        get isFlipping() { return card.getData('isFlipping'); }
    };
};