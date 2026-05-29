class BootScene extends Phaser.Scene {

    constructor() {
        super('BootScene');
    }

    preload() {

        const letters = "abcdefghijklmnopqrstuvwxyz";

        for (let char of letters) {
            this.load.audio(char, `assets/audio/${char}.mp3`);
        }

        // BACKGROUND (NEW)
        this.load.image('bg', 'assets/images/clouds_stars.jpg');

        this.load.audio('bgm', 'assets/audio/mozart_vous-diraii-je.mp3');
    }

    create() {
        this.scene.start('GameScene');
    }
}
