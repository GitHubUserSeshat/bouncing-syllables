class BootScene extends Phaser.Scene {

    constructor() {
        super('BootScene');
    }

    preload() {

        // =====================================================
        // AUDIO LOADING (mp3 primary + wav fallback)
        // =====================================================

        SYMBOLS.forEach(item => {

            const key = item.key;

            // Primary format (recommended)
            this.load.audio(
                key,
                `assets/audio/${key}.mp3`
            );

            // Optional fallback format
            this.load.audio(
                `${key}_wav`,
                `assets/audio/${key}.wav`
            );
        });

            // BACKGROUND (NEW)
           this.load.image('bg', 'assets/images/clouds_stars.jpg');

           // music
            this.load.audio('bgm', 'assets/audio/mozart_vous-diraii-je.mp3');
    }

    create() {

        // Start game
        this.registry.set('levelIndex', 0);
        this.scene.start('GameScene');
    }
}
