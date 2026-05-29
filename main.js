const config = {

    type: Phaser.AUTO,

    parent: 'game-container',

    width: window.innerWidth,
    height: window.innerHeight,

    backgroundColor: '#87CEEB',

    scale: {

        mode: Phaser.Scale.RESIZE,

        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: [
        BootScene,
        GameScene
    ]
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => {

    game.scale.resize(
        window.innerWidth,
        window.innerHeight
    );
});