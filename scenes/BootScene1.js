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

        this.load.audio('bgm', 'assets/mozart_vous-diraii-je.wav');
    }

    create() {
        this.scene.start('GameScene');
    }
}