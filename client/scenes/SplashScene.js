export default class SplashScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SplashScene' });
  }

  preload() {
    this.load.image('splash_bg', 'assets/world/splash_bg.png');
  }

  create() {
    const W = 800, H = 600;

    // -------------------------------------------------------------------------
    // 1. Background image
    // -------------------------------------------------------------------------
    this.add.image(W / 2, H / 2, 'splash_bg').setDisplaySize(W, H);

    // -------------------------------------------------------------------------
    // 2. Glitch effect lines
    // -------------------------------------------------------------------------
    const glitchColors = [0xe94560, 0x00ff88];
    for (let i = 0; i < 5; i++) {
      const gfx = this.add.graphics();
      const color = glitchColors[i % 2];
      const w = Phaser.Math.Between(40, 180);
      const x = Phaser.Math.Between(0, 800 - w);
      const y = Phaser.Math.Between(0, 600);
      gfx.fillStyle(color, 0.15);
      gfx.fillRect(x, y, w, 2);
      this.tweens.add({
        targets: gfx,
        alpha: { from: 0, to: 0.15 },
        duration: Phaser.Math.Between(800, 2000),
        yoyo: true,
        repeat: -1,
      });
    }

    // -------------------------------------------------------------------------
    // 3. "Dev On" button
    // -------------------------------------------------------------------------
    this._devBtnY = 395;
    this.devBtnBg = this.add.graphics();
    this._drawDevBtn(0xf5a623);

    this.devBtnText = this.add.text(400, 395, 'Dev On >', {
      fontSize: '16px',
      color: '#1a1a2e',
      fontStyle: 'bold',
      fontFamily: 'Courier New',
      resolution: 2,
    }).setOrigin(0.5);

    const devBtnZone = this.add.zone(400, 395, 200, 34)
      .setInteractive({ useHandCursor: true });

    devBtnZone.on('pointerover', () => {
      this._drawDevBtn(0xffd700);
    });
    devBtnZone.on('pointerout', () => {
      this._drawDevBtn(0xf5a623);
    });
    devBtnZone.on('pointerdown', () => {
      this.scene.start('StoryScene');
    });

    // -------------------------------------------------------------------------
    // 5. Dev skip button
    // -------------------------------------------------------------------------
    const devBg = this.add.graphics();
    devBg.fillStyle(0xe94560, 1);
    devBg.fillRoundedRect(290, 435, 220, 28, 6);

    this.add.text(400, 449, 'DEV SKIP (Testing Only)', {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'Courier New',
      fontStyle: 'bold',
      resolution: 2,
    }).setOrigin(0.5);

    devBg.setInteractive(
      new Phaser.Geom.Rectangle(290, 435, 220, 28),
      Phaser.Geom.Rectangle.Contains
    );

    devBg.on('pointerover', () => {
      devBg.clear();
      devBg.fillStyle(0xff0000, 1);
      devBg.fillRoundedRect(290, 435, 220, 28, 6);
    });

    devBg.on('pointerout', () => {
      devBg.clear();
      devBg.fillStyle(0xe94560, 1);
      devBg.fillRoundedRect(290, 435, 220, 28, 6);
    });

    devBg.on('pointerdown', () => {
      window.playerData = {
        name: 'TestPlayer',
        avatar: 'avatar1',
        complexion: 'brown',
        hair: 'braids',
        outfit: 'coder',
        characterKey: 'brown_braids_coder',
      };
      this.scene.start('MapScene');
    });

    devBg.setInteractive({ useHandCursor: true });

    // -------------------------------------------------------------------------
    // 6. Version text
    // -------------------------------------------------------------------------
    this.add.text(400, 488, 'v0.1 prototype \u2014 Codebuilder Quest', {
      fontSize: '9px',
      color: '#333333',
      fontFamily: 'Courier New',
      resolution: 2,
    }).setOrigin(0.5);
  }

  // ---------------------------------------------------------------------------
  // Helper
  // ---------------------------------------------------------------------------
  _drawDevBtn(color) {
    this.devBtnBg.clear();
    this.devBtnBg.fillStyle(color, 1);
    this.devBtnBg.fillRoundedRect(400 - 100, this._devBtnY - 17, 200, 34, 8);
  }
}
