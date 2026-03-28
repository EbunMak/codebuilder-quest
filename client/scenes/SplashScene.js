export default class SplashScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SplashScene' });
  }

  preload() {
    this.load.image('ada', 'assets/npc/ada.png');
  }

  create() {
    // -------------------------------------------------------------------------
    // 1. Background
    // -------------------------------------------------------------------------
    this.add.rectangle(400, 300, 800, 600, 0x0d0d1a);

    // -------------------------------------------------------------------------
    // 2. Animated stars
    // -------------------------------------------------------------------------
    const starColors = [0xf5a623, 0xff6b9d, 0x9b59b6, 0x1abc9c, 0xffffff];
    for (let i = 0; i < 25; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(0, 600);
      const r = Phaser.Math.FloatBetween(1.5, 3);
      const color = Phaser.Utils.Array.GetRandom(starColors);
      const star = this.add.circle(x, y, r, color);
      this.tweens.add({
        targets: star,
        alpha: { from: 0.2, to: 1.0 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
      });
    }

    // -------------------------------------------------------------------------
    // 3. Glitch effect lines
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
    // 4. Main title
    // -------------------------------------------------------------------------
    const title = this.add.text(400, 140, 'Codebuilder Quest', {
      fontSize: '42px',
      color: '#f5a623',
      fontStyle: 'bold',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: { from: 1.0, to: 1.03 },
      scaleY: { from: 1.0, to: 1.03 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });

    // -------------------------------------------------------------------------
    // 5. Subtitle line 1
    // -------------------------------------------------------------------------
    this.add.text(400, 200, 'A glitched world needs you.', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    // -------------------------------------------------------------------------
    // 6. Subtitle line 2
    // -------------------------------------------------------------------------
    this.add.text(400, 225, 'Are you ready to code it back?', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    // -------------------------------------------------------------------------
    // 7. Decorative divider
    // -------------------------------------------------------------------------
    const divider = this.add.graphics();
    divider.lineStyle(1, 0xf5a623, 0.4);
    divider.beginPath();
    divider.moveTo(280, 255);
    divider.lineTo(520, 255);
    divider.strokePath();

    // -------------------------------------------------------------------------
    // 8. "Join the Force" badge
    // -------------------------------------------------------------------------
    const badgeGfx = this.add.graphics();
    badgeGfx.fillStyle(0x1e1035, 1);
    badgeGfx.fillRoundedRect(400 - 140, 300 - 25, 280, 50, 10);
    badgeGfx.lineStyle(1.5, 0x9b59b6, 1);
    badgeGfx.strokeRoundedRect(400 - 140, 300 - 25, 280, 50, 10);

    this.add.text(400, 300, '\u26a1 Join the Codebuilder Force \u26a1', {
      fontSize: '14px',
      color: '#9b59b6',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: badgeGfx,
      alpha: { from: 0.5, to: 1.0 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
    });

    // -------------------------------------------------------------------------
    // 9. Ada small preview — bottom right
    // -------------------------------------------------------------------------
    const ada = this.add.image(680, 500, 'ada')
      .setScale(0.18)
      .setOrigin(1, 1);

    this.tweens.add({
      targets: ada,
      y: ada.y - 5,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // -------------------------------------------------------------------------
    // 10. "Dev On" button
    // -------------------------------------------------------------------------
    this._devBtnY = 390;
    this.devBtnBg = this.add.graphics();
    this._drawDevBtn(0xf5a623);

    this.devBtnText = this.add.text(400, 390, 'Dev On >', {
      fontSize: '16px',
      color: '#1a1a2e',
      fontStyle: 'bold',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    const devBtnZone = this.add.zone(400, 390, 200, 50)
      .setInteractive({ useHandCursor: true });

    devBtnZone.on('pointerover', () => {
      this._drawDevBtn(0xffd700);
    });
    devBtnZone.on('pointerout', () => {
      this._drawDevBtn(0xf5a623);
    });
    devBtnZone.on('pointerdown', () => {
      this.tweens.add({
        targets: [this.devBtnBg, this.devBtnText],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 75,
        yoyo: true,
        onComplete: () => {
          this.time.delayedCall(150, () => {
            this.scene.start('StoryScene');
          });
        },
      });
    });

    // -------------------------------------------------------------------------
    // 11. Dev skip button
    // -------------------------------------------------------------------------
    const devBg = this.add.graphics();
    devBg.fillStyle(0xe94560, 1);
    devBg.fillRoundedRect(250, 440, 300, 40, 8);

    const devBtn = this.add.text(400, 460,
      '⚡ DEV SKIP (Testing Only) ⚡', {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: 'Courier New',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    devBg.setInteractive(
      new Phaser.Geom.Rectangle(250, 440, 300, 40),
      Phaser.Geom.Rectangle.Contains
    );

    devBg.on('pointerover', () => {
      devBg.clear();
      devBg.fillStyle(0xff0000, 1);
      devBg.fillRoundedRect(250, 440, 300, 40, 8);
    });

    devBg.on('pointerout', () => {
      devBg.clear();
      devBg.fillStyle(0xe94560, 1);
      devBg.fillRoundedRect(250, 440, 300, 40, 8);
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
    // 12. Version text
    // -------------------------------------------------------------------------
    this.add.text(400, 488, 'v0.1 prototype \u2014 Codebuilder Quest', {
      fontSize: '9px',
      color: '#333333',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);
  }

  // ---------------------------------------------------------------------------
  // Helper
  // ---------------------------------------------------------------------------
  _drawDevBtn(color) {
    this.devBtnBg.clear();
    this.devBtnBg.fillStyle(color, 1);
    this.devBtnBg.fillRoundedRect(400 - 100, this._devBtnY - 25, 200, 50, 8);
  }
}
