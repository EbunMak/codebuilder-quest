export default class CustomizeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CustomizeScene' });
  }

  preload() {
    this.load.image('ada', 'assets/npc/ada.png');

    this.load.image('base_pale', 'assets/characters/pale/pale.png');
    this.load.image('base_tan', 'assets/characters/tan/tan.png');
    this.load.image('base_brown', 'assets/characters/brown/brown.png');

    ['pale', 'tan', 'brown'].forEach(c => {
      ['bob', 'braids', 'long'].forEach(h => {
        this.load.image(
          c + '_' + h,
          'assets/characters/' + c + '/' + c + '_' + h + '.png'
        );
        ['hoodie', 'coder', 'school'].forEach(o => {
          this.load.image(
            c + '_' + h + '_' + o,
            'assets/characters/' + c + '/' + c + '_' + h + '_' + o + '.png'
          );
        });
      });
    });
  }

  create() {
    this.step = 1;
    this.selectedComplexion = null;
    this.selectedHair = null;
    this.selectedOutfit = null;
    this.cards = [];

    // -------------------------------------------------------------------------
    // 1. Background
    // -------------------------------------------------------------------------
    this.add.rectangle(400, 250, 800, 500, 0x0d0d1a);

    // -------------------------------------------------------------------------
    // 2. Glitch lines
    // -------------------------------------------------------------------------
    const glitchColors = [0xe94560, 0x00ff88];
    for (let i = 0; i < 5; i++) {
      const gfx = this.add.graphics();
      const color = glitchColors[i % 2];
      const w = Phaser.Math.Between(40, 180);
      const x = Phaser.Math.Between(0, 800 - w);
      const y = Phaser.Math.Between(0, 500);
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
    // 3. Ada image
    // -------------------------------------------------------------------------
    const ada = this.add.image(70, 490, 'ada').setScale(0.14).setOrigin(0.5, 1);
    this.tweens.add({
      targets: ada,
      y: ada.y - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // -------------------------------------------------------------------------
    // 4. Speech bubble
    // -------------------------------------------------------------------------
    const bubbleGfx = this.add.graphics();
    bubbleGfx.fillStyle(0x0f1923, 1);
    bubbleGfx.fillRoundedRect(130, 430, 530, 58, 8);
    bubbleGfx.lineStyle(1.5, 0x4a90d9, 1);
    bubbleGfx.strokeRoundedRect(130, 430, 530, 58, 8);

    this.adaText = this.add.text(148, 443, '', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'Courier New',
      wordWrap: { width: 505 },
    });

    // -------------------------------------------------------------------------
    // 5. Step dots
    // -------------------------------------------------------------------------
    // Connecting lines drawn behind dots
    const lineGfx = this.add.graphics();
    lineGfx.lineStyle(2, 0x2a2a4a, 1);
    lineGfx.beginPath();
    lineGfx.moveTo(310, 22);
    lineGfx.lineTo(390, 22);
    lineGfx.moveTo(410, 22);
    lineGfx.lineTo(490, 22);
    lineGfx.strokePath();

    const dotXPositions = [300, 400, 500];
    const dotLabelNames = ['Look', 'Hair', 'Outfit'];
    this.stepDots = [];
    this.stepLabels = [];

    dotXPositions.forEach((x, i) => {
      const dot = this.add.circle(x, 22, 10, 0x2a2a4a);
      this.stepDots.push(dot);

      const label = this.add.text(x, 40, dotLabelNames[i], {
        fontSize: '10px',
        color: '#666666',
        fontFamily: 'Courier New',
      }).setOrigin(0.5, 0);
      this.stepLabels.push(label);
    });

    // -------------------------------------------------------------------------
    // 6. Title text
    // -------------------------------------------------------------------------
    this.titleText = this.add.text(400, 55, '', {
      fontSize: '17px',
      color: '#ffffff',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    // -------------------------------------------------------------------------
    // 7. Character display
    // -------------------------------------------------------------------------
    this.characterDisplay = this.add.image(400, 155, 'base_tan')
      .setScale(0.12)
      .setOrigin(0.5);

    // -------------------------------------------------------------------------
    // 8. Show first step
    // -------------------------------------------------------------------------
    this.showStep(1);
  }

  // ---------------------------------------------------------------------------
  // updateStepDots
  // ---------------------------------------------------------------------------
  updateStepDots(activeStep) {
    if (this.stepDotGraphics) this.stepDotGraphics.destroy();
    this.stepDotGraphics = this.add.graphics();

    const positions = [300, 400, 500];
    const labels = ['Look', 'Hair', 'Outfit'];

    // Connecting lines first (drawn behind dots)
    this.stepDotGraphics.lineStyle(2, 0x2a2a4a, 1);
    this.stepDotGraphics.lineBetween(310, 22, 390, 22);
    this.stepDotGraphics.lineBetween(410, 22, 490, 22);

    for (let i = 0; i < 3; i++) {
      if (i + 1 <= activeStep) {
        this.stepDotGraphics.fillStyle(0xf5a623, 1);
      } else {
        this.stepDotGraphics.fillStyle(0x2a2a4a, 1);
      }
      this.stepDotGraphics.fillCircle(positions[i], 22, 10);

      this.stepLabels[i].setColor(i + 1 === activeStep ? '#f5a623' : '#555555');
    }
  }

  // ---------------------------------------------------------------------------
  // clearCards
  // ---------------------------------------------------------------------------
  clearCards() {
    this.cards.forEach(c => { if (c && c.destroy) c.destroy(); });
    this.cards = [];
    if (this.backBtn) { this.backBtn.destroy(); this.backBtn = null; }
  }

  // ---------------------------------------------------------------------------
  // makeCard
  // ---------------------------------------------------------------------------
  makeCard(x, y, imageKey, labelText, onClickFn) {
    const bg = this.add.graphics();

    const drawBg = (highlighted) => {
      bg.clear();
      bg.fillStyle(0x0f1923, 1);
      bg.fillRoundedRect(x - 70, y - 105, 140, 170, 8);
      bg.lineStyle(highlighted ? 2 : 1.5, highlighted ? 0x4a90d9 : 0x2a2a4a, 1);
      bg.strokeRoundedRect(x - 70, y - 105, 140, 170, 8);
    };
    drawBg(false);

    const img = this.add.image(x, y - 20, imageKey).setScale(0.12);

    const lbl = this.add.text(x, y + 82, labelText, {
      fontSize: '11px',
      color: '#aaaaaa',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    const hit = this.add.rectangle(x, y - 8, 140, 170, 0xffffff, 0);
    hit.setInteractive({ useHandCursor: true });

    hit.on('pointerover', () => {
      drawBg(true);
      this.characterDisplay.setTexture(imageKey);
      lbl.setColor('#ffffff');
    });

    hit.on('pointerout', () => {
      drawBg(false);
      lbl.setColor('#aaaaaa');
    });

    hit.on('pointerdown', () => {
      this.tweens.add({
        targets: img,
        scaleX: 0.26,
        scaleY: 0.26,
        duration: 80,
        yoyo: true,
        onComplete: () => onClickFn(),
      });
    });

    this.cards.push(bg, img, lbl, hit);
  }

  // ---------------------------------------------------------------------------
  // showStep
  // ---------------------------------------------------------------------------
  showStep(step) {
    this.step = step;
    this.clearCards();
    this.updateStepDots(step);

    const cx = [160, 390, 620];
    const cy = 290;

    if (step === 1) {
      this.titleText.setText('Choose your look');
      this.adaText.setText('Hi! First, choose your complexion!');
      this.characterDisplay.setTexture('base_tan');

      this.makeCard(cx[0], cy, 'base_pale', 'Pale', () => {
        this.selectedComplexion = 'pale';
        this.characterDisplay.setTexture('base_pale');
        this.time.delayedCall(350, () => this.showStep(2));
      });
      this.makeCard(cx[1], cy, 'base_tan', 'Tan', () => {
        this.selectedComplexion = 'tan';
        this.characterDisplay.setTexture('base_tan');
        this.time.delayedCall(350, () => this.showStep(2));
      });
      this.makeCard(cx[2], cy, 'base_brown', 'Brown', () => {
        this.selectedComplexion = 'brown';
        this.characterDisplay.setTexture('base_brown');
        this.time.delayedCall(350, () => this.showStep(2));
      });
    }

    if (step === 2) {
      this.titleText.setText('Choose your hairstyle');
      this.adaText.setText('Love it! Now pick your hairstyle!');
      const c = this.selectedComplexion;
      this.characterDisplay.setTexture(c + '_bob');

      this.makeCard(cx[0], cy, c + '_bob', 'Bob', () => {
        this.selectedHair = 'bob';
        this.time.delayedCall(350, () => this.showStep(3));
      });
      this.makeCard(cx[1], cy, c + '_braids', 'Braids', () => {
        this.selectedHair = 'braids';
        this.time.delayedCall(350, () => this.showStep(3));
      });
      this.makeCard(cx[2], cy, c + '_long', 'Long', () => {
        this.selectedHair = 'long';
        this.time.delayedCall(350, () => this.showStep(3));
      });

      this.backBtn = this.add.text(30, 465, '<< Back', {
        fontSize: '12px',
        color: '#9b59b6',
        fontFamily: 'Courier New',
      }).setInteractive({ useHandCursor: true });
      this.backBtn.on('pointerdown', () => this.showStep(1));
    }

    if (step === 3) {
      this.titleText.setText('Choose your outfit');
      this.adaText.setText('Looking great! Now choose your outfit!');
      const c = this.selectedComplexion;
      const h = this.selectedHair;
      this.characterDisplay.setTexture(c + '_' + h + '_hoodie');

      this.makeCard(cx[0], cy, c + '_' + h + '_school', 'Casual School', () => {
        this.selectedOutfit = 'school';
        this.finishCustomization();
      });
      this.makeCard(cx[1], cy, c + '_' + h + '_coder', 'Coder Gear', () => {
        this.selectedOutfit = 'coder';
        this.finishCustomization();
      });
      this.makeCard(cx[2], cy, c + '_' + h + '_hoodie', 'Hoodie', () => {
        this.selectedOutfit = 'hoodie';
        this.finishCustomization();
      });

      this.backBtn = this.add.text(30, 465, '<< Back', {
        fontSize: '12px',
        color: '#9b59b6',
        fontFamily: 'Courier New',
      }).setInteractive({ useHandCursor: true });
      this.backBtn.on('pointerdown', () => this.showStep(2));
    }
  }

  // ---------------------------------------------------------------------------
  // finishCustomization
  // ---------------------------------------------------------------------------
  finishCustomization() {
    const key = this.selectedComplexion + '_' +
                this.selectedHair + '_' +
                this.selectedOutfit;

    window.playerData = {
      ...window.playerData,
      complexion: this.selectedComplexion,
      hair: this.selectedHair,
      outfit: this.selectedOutfit,
      characterKey: key,
    };

    this.characterDisplay.setTexture(key);
    this.clearCards();
    this.titleText.setText('You look amazing!');
    this.adaText.setText(
      'Perfect! Welcome to Codebuilder Quest, ' +
      (window.playerData?.name || 'Codebuilder') + '!'
    );

    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xf5a623, 1);
    btnBg.fillRoundedRect(300, 390, 200, 48, 8);

    const btnText = this.add.text(400, 414, "Let's go! ->", {
      fontSize: '15px',
      color: '#1a1a2e',
      fontFamily: 'Courier New',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const btnHit = this.add.rectangle(400, 414, 200, 48, 0xffffff, 0);
    btnHit.setInteractive({ useHandCursor: true });

    btnHit.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0xffd700, 1);
      btnBg.fillRoundedRect(300, 390, 200, 48, 8);
    });
    btnHit.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0xf5a623, 1);
      btnBg.fillRoundedRect(300, 390, 200, 48, 8);
    });
    btnHit.on('pointerdown', () => {
      this.scene.start('MapScene');
    });
  }
}
