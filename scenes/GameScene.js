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
// BACKGROUND MUSIC
// =====================================================

if (!this.sound.get('bgm')) {

    this.bgm = this.sound.add('bgm', {
        loop: true,
        volume: 0.2
    });

    this.bgm.play();
}

        // =====================================================
        // LEVEL SETUP
        // =====================================================

        this.levelIndex = this.registry.get('levelIndex') || 0;
        this.levels = LEVELS;

        this.currentLevel = this.levels[this.levelIndex];
        this.roundIndex = 0;

        // =====================================================
        // SYMBOLS
        // =====================================================

        this.symbols = SYMBOLS;

        // =====================================================
        // AUDIO STATE
        // =====================================================

        this.currentSound = null;

        this.input.once('pointerdown', () => {
            this.sound.context.resume();
        });

        // =====================================================
        // UI
        // =====================================================

        this.levelText = this.add.text(
            this.scale.width / 2,
            40,
            '',
            { fontSize: '32px', color: '#000' }
        ).setOrigin(0.5);

        this.targetText = this.add.text(
            this.scale.width / 2,
            90,
            '',
            { fontSize: '42px', color: '#000' }
        ).setOrigin(0.5);

        this.startRound();
    }

    // =====================================================
    // ROUND
    // =====================================================

    startRound() {

        if (this.cards) {
            this.cards.forEach(c => c.destroy());
        }

        this.cards = [];

        this.levelText.setText(
            `Level ${this.levelIndex + 1}`
        );

        // pick target
        this.target = Phaser.Utils.Array.GetRandom(this.symbols);

        this.targetText.setText(
            `Find: ${this.target.text}`
        );

        const items = [];

        const correctAmount = Phaser.Math.Between(2, 3);

        for (let i = 0; i < correctAmount; i++) {
            items.push(this.target);
        }

        while (items.length < 12) {

            const r = Phaser.Utils.Array.GetRandom(this.symbols);

            if (r.key !== this.target.key) {
                items.push(r);
            }
        }

        Phaser.Utils.Array.Shuffle(items);

        this.remaining = correctAmount;

        items.forEach(symbol => {

            const txt = this.add.text(
                Phaser.Math.Between(80, this.scale.width - 80),
                Phaser.Math.Between(150, this.scale.height - 80),
                symbol.text,
                {
                    fontSize: '42px',
                    backgroundColor: '#fff',
                    color: '#000',
                    padding: { x: 10, y: 6 }
                }
            )
            .setOrigin(0.5)
            .setInteractive();

            txt.key = symbol.key;
            txt.collected = false;

            txt.vx = Phaser.Math.FloatBetween(
                -this.currentLevel.speed,
                this.currentLevel.speed
            );

            txt.vy = Phaser.Math.FloatBetween(
                -this.currentLevel.speed,
                this.currentLevel.speed
            );

            txt.on('pointerdown', () => {

                if (txt.collected) return;

                // wrong answer
                if (txt.key !== this.target.key) {
                    this.cameras.main.shake(80, 0.01);
                    return;
                }

                // correct
                txt.collected = true;

                this.tweens.add({
                    targets: txt,
                    scale: 0,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => txt.destroy()
                });

                this.remaining--;

                if (this.remaining <= 0) {
                    this.time.delayedCall(300, () => {
                        this.nextRound();
                    });
                }
            });

            this.cards.push(txt);
        });

        this.time.delayedCall(300, () => {
            this.playTargetAudio();
        });
    }

    // =====================================================
    // AUDIO (FIXED + SAFE WAV FALLBACK)
    // =====================================================

    playTargetAudio() {

        if (this.currentSound) {
            this.currentSound.stop();
            this.currentSound.destroy();
            this.currentSound = null;
        }

        const key = this.target.key;

        let soundKey = key;

        // if mp3 missing, try wav fallback
        if (!this.cache.audio.exists(key)) {

            const wavKey = `${key}_wav`;

            if (this.cache.audio.exists(wavKey)) {
                soundKey = wavKey;
            } else {
                console.warn("Missing audio:", key);
                return;
            }
        }

        this.currentSound = this.sound.add(soundKey);
        this.currentSound.play();
    }

    // =====================================================
    // PROGRESSION
    // =====================================================

    nextRound() {

        this.roundIndex++;

        if (this.roundIndex >= this.currentLevel.rounds) {
            this.nextLevel();
        } else {
            this.startRound();
        }
    }

    nextLevel() {

        this.levelIndex++;

        if (this.currentSound) {
            this.currentSound.stop();
        }

        if (this.levelIndex >= this.levels.length) {

            this.add.text(
                this.scale.width / 2,
                this.scale.height / 2,
                'YOU WIN 🎉',
                { fontSize: '64px', color: '#000' }
            ).setOrigin(0.5);

            return;
        }

        this.currentLevel = this.levels[this.levelIndex];
        this.roundIndex = 0;

        this.startRound();
    }

    // =====================================================
    // UPDATE LOOP
    // =====================================================

    update() {

        if (!this.cards) return;

        this.cards.forEach(card => {

            card.x += card.vx;
            card.y += card.vy;

            if (card.x < 40 || card.x > this.scale.width - 40) {
                card.vx *= -1;
            }

            if (card.y < 120 || card.y > this.scale.height - 40) {
                card.vy *= -1;
            }
        });
    }
}