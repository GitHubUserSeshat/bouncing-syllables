class GameScene extends Phaser.Scene {

    constructor() {
        super('GameScene');
    }

    create() {

       // =====================================================
       // BACKGROUND (GLOBAL FOR ALL LEVELS)
       // =====================================================

        this.bg = this.add.image(0, 0, 'bg')
            .setOrigin(0, 0)
            .setDepth(-10);

        this.bg.setDisplaySize(this.scale.width, this.scale.height);

        this.scale.on('resize', (gameSize) => {

        this.bg.setDisplaySize(
            gameSize.width,
            gameSize.height
        );
});

        // =====================================================
        // GAME DATA
        // =====================================================

        this.levelIndex = 0;

        this.levels = [
            {
                speed: 0.5,
                rounds: 5
            },
            {
                speed: 1.0,
                rounds: 5
            },
            {
                speed: 1.5,
                rounds: 5
            }
        ];

        this.currentLevel = this.levels[this.levelIndex];

        this.roundIndex = 0;

        // =====================================================
        // LETTER POOL
        // =====================================================

        this.letters = [];

        const alphabet = "abcdefghijklmnopqrstuvwxyz";

        for (let char of alphabet) {

            // lowercase
            this.letters.push(char);

            // uppercase
            this.letters.push(char.toUpperCase());
        }

        // =====================================================
        // AUDIO
        // =====================================================

        this.currentSound = null;

        // =====================================================
        // BACKGROUND
        // =====================================================

        this.cameras.main.setBackgroundColor('#87CEEB');

        // =====================================================
        // UI
        // =====================================================

        this.levelText = this.add.text(
            this.scale.width / 2,
            40,
            '',
            {
                fontSize: '32px',
                color: '#000'
            }
        ).setOrigin(0.5);

        this.targetText = this.add.text(
            this.scale.width / 2,
            90,
            '',
            {
                fontSize: '42px',
                color: '#000'
            }
        ).setOrigin(0.5);

        // =====================================================
        // START FIRST ROUND
        // =====================================================

        this.startRound();
    }

    // =====================================================
    // START ROUND
    // =====================================================

    startRound() {

        // remove old cards
        if (this.cards) {

            this.cards.forEach(card => card.destroy());
        }

        this.cards = [];

        // =====================================================
        // UPDATE UI
        // =====================================================

        this.levelText.setText(
            `Level ${this.levelIndex + 1}`
        );

        // =====================================================
        // RANDOM TARGET
        // =====================================================

        const lowercaseAlphabet =
            "abcdefghijklmnopqrstuvwxyz".split("");

        this.target = Phaser.Utils.Array.GetRandom(
            lowercaseAlphabet
        );

        this.targetText.setText(
            `Finde: ${this.target.toUpperCase()}`
        );

        // =====================================================
        // CREATE CARD CONTENT
        // =====================================================

        const items = [];

        // matching cards
        const amount =
            Phaser.Math.Between(2, 3);

        for (let i = 0; i < amount; i++) {

            const visualTarget =
                Math.random() > 0.5
                    ? this.target.toUpperCase()
                    : this.target;

            items.push(visualTarget);
        }

        // distractors
        while (items.length < 12) {

            const randomLetter =
                Phaser.Utils.Array.GetRandom(this.letters);

            if (
                randomLetter.toLowerCase() !== this.target
            ) {
                items.push(randomLetter);
            }
        }

        Phaser.Utils.Array.Shuffle(items);

        // =====================================================
        // CREATE CARDS
        // =====================================================

        this.remaining = amount;

        items.forEach(letter => {

            const size =
                letter === letter.toUpperCase()
                    ? Phaser.Math.Between(38, 54)
                    : Phaser.Math.Between(28, 46);

            const txt = this.add.text(

                Phaser.Math.Between(
                    80,
                    this.scale.width - 80
                ),

                Phaser.Math.Between(
                    150,
                    this.scale.height - 80
                ),

                letter,

                {
                    fontSize: `${size}px`,
                    backgroundColor: '#ffffff',
                    color: '#000',
                    padding: {
                        x: 14,
                        y: 10
                    }
                }

            ).setOrigin(0.5)
             .setInteractive();

            // movement
            txt.vx =
                Phaser.Math.FloatBetween(
                    -this.currentLevel.speed,
                    this.currentLevel.speed
                );

            txt.vy =
                Phaser.Math.FloatBetween(
                    -this.currentLevel.speed,
                    this.currentLevel.speed
                );

            txt.letter = letter;
            txt.collected = false;

            // =================================================
            // CLICK
            // =================================================

            txt.on('pointerdown', () => {

                if (txt.collected) return;

                // CORRECT
                if (
                    txt.letter.toLowerCase()
                    === this.target
                ) {

                    txt.collected = true;

                    // disappear animation
                    this.tweens.add({

                        targets: txt,

                        scale: 0,
                        alpha: 0,

                        duration: 200,

                        onComplete: () => {
                            txt.destroy();
                        }
                    });

                    this.remaining--;

                    // next round
                    if (this.remaining <= 0) {

                        this.time.delayedCall(300, () => {

                            this.nextRound();
                        });
                    }

                } else {

                    // wrong click
                    this.cameras.main.shake(
                        80,
                        0.01
                    );
                }
            });

            this.cards.push(txt);
        });

        // =====================================================
        // PLAY AUDIO
        // =====================================================

        this.time.delayedCall(400, () => {

            this.playTargetAudio();
        });
    }

    // =====================================================
    // AUDIO
    // =====================================================

    playTargetAudio() {

        // stop previous sound
        if (this.currentSound) {

            this.currentSound.stop();
            this.currentSound.destroy();
        }

        // create new sound
        this.currentSound =
            this.sound.add(this.target);

        this.currentSound.play();
    }

    // =====================================================
    // NEXT ROUND
    // =====================================================

    nextRound() {

        this.roundIndex++;

        if (
            this.roundIndex
            >= this.currentLevel.rounds
        ) {

            this.nextLevel();

        } else {

            this.startRound();
        }
    }

    // =====================================================
    // NEXT LEVEL
    // =====================================================

    nextLevel() {

        this.levelIndex++;

        // stop sound safely
        if (this.currentSound) {

            this.currentSound.stop();
        }

        // finished game
        if (
            this.levelIndex
            >= this.levels.length
        ) {

            this.add.text(

                this.scale.width / 2,
                this.scale.height / 2,

                'GEWONNEN! 🎉',

                {
                    fontSize: '64px',
                    color: '#000'
                }

            ).setOrigin(0.5);

            return;
        }

        // new level
        this.currentLevel =
            this.levels[this.levelIndex];

        this.roundIndex = 0;

        this.startRound();
    }

    // =====================================================
    // UPDATE
    // =====================================================

    update() {

        if (!this.cards) return;

        this.cards.forEach(card => {

            if (!card.active) return;

            card.x += card.vx;
            card.y += card.vy;

            // horizontal bounce
            if (
                card.x < 40 ||
                card.x > this.scale.width - 40
            ) {
                card.vx *= -1;
            }

            // vertical bounce
            if (
                card.y < 120 ||
                card.y > this.scale.height - 40
            ) {
                card.vy *= -1;
            }
        });
    }
}
