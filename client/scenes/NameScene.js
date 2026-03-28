export default class NameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'NameScene' });
  }

  preload() {
    this.load.image('ada', 'assets/npc/ada.png');
  }

  create() {
    this.playerName = '';
    this.hasShownResponse = false;

    // -------------------------------------------------------------------------
    // Background
    // -------------------------------------------------------------------------
    this.add.rectangle(400, 300, 800, 600, 0x0d0d1a);

    // Glitch rectangles
    const glitchColors = [0xe94560, 0x00ff88];
    for (let i = 0; i < 6; i++) {
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
    // Ada image panel
    // -------------------------------------------------------------------------
    const ada = this.add.image(100, 380, 'ada')
      .setScale(0.28)
      .setOrigin(0.5, 1);

    this.tweens.add({
      targets: ada,
      y: ada.y - 6,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Nameplate
    const nameplateGfx = this.add.graphics();
    nameplateGfx.fillStyle(0x1e1035, 1);
    nameplateGfx.fillRoundedRect(45, 378, 110, 24, 6);
    nameplateGfx.lineStyle(1, 0x9b59b6, 1);
    nameplateGfx.strokeRoundedRect(45, 378, 110, 24, 6);

    this.add.text(100, 390, 'Ada', {
      fontSize: '11px',
      color: '#9b59b6',
      fontStyle: 'bold',
      fontFamily: 'Courier New',
    }).setOrigin(0.5, 0.5);

    // -------------------------------------------------------------------------
    // Speech bubble
    // -------------------------------------------------------------------------
    const bubbleGfx = this.add.graphics();

    bubbleGfx.fillStyle(0x0f1923, 1);
    bubbleGfx.fillRoundedRect(175, 50, 595, 200, 12);
    bubbleGfx.lineStyle(1.5, 0x4a90d9, 1);
    bubbleGfx.strokeRoundedRect(175, 50, 595, 200, 12);

    // Triangle pointer
    bubbleGfx.fillStyle(0x0f1923, 1);
    bubbleGfx.fillTriangle(175, 150, 155, 165, 175, 180);
    bubbleGfx.lineStyle(1, 0x4a90d9, 1);
    bubbleGfx.strokeTriangle(175, 150, 155, 165, 175, 180);

    this.dialogText = this.add.text(192, 70, '', {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: 'Courier New',
      wordWrap: { width: 560 },
      lineSpacing: 8,
    });

    // -------------------------------------------------------------------------
    // Name input area
    // -------------------------------------------------------------------------
    this.inputLabel = this.add.text(400, 275, 'Your Codebuilder name:', {
      fontSize: '13px',
      color: '#aaaaaa',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    // Input box background
    this.inputBoxGfx = this.add.graphics();
    this.inputBoxGfx.fillStyle(0x0f3460, 1);
    this.inputBoxGfx.fillRoundedRect(400 - 140, 315 - 22, 280, 44, 8);
    this.inputBoxGfx.lineStyle(1.5, 0x4a90d9, 1);
    this.inputBoxGfx.strokeRoundedRect(400 - 140, 315 - 22, 280, 44, 8);

    this.nameDisplay = this.add.text(400, 315, 'Click here to type...', {
      fontSize: '15px',
      color: '#555555',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    // Interactive zone over the input box
    this.inputZone = this.add.zone(400, 315, 280, 44)
      .setInteractive({ useHandCursor: true });

    this.inputZone.on('pointerdown', () => {
      const name = window.prompt('What is your Codebuilder name?');
      if (name && name.trim() !== '') {
        this.playerName = name.trim();
        this.nameDisplay.setText(this.playerName);
        this.nameDisplay.setColor('#ffffff');
      }
    });

    // -------------------------------------------------------------------------
    // Continue button
    // -------------------------------------------------------------------------
    this._contBtnColor = 0xf5a623;
    this.contBtnBg = this.add.graphics();
    this._drawContBtn(0xf5a623);

    this.contBtnText = this.add.text(400, 385, "Let's go! \u2192", {
      fontSize: '14px',
      color: '#1a1a2e',
      fontStyle: 'bold',
      fontFamily: 'Courier New',
    }).setOrigin(0.5, 0.5);

    this.contBtnZone = this.add.zone(400, 385, 200, 44)
      .setInteractive({ useHandCursor: true });

    this.contBtnZone.on('pointerover', () => {
      this._drawContBtn(0xffd700);
    });
    this.contBtnZone.on('pointerout', () => {
      this._drawContBtn(0xf5a623);
    });
    this.contBtnZone.on('pointerdown', () => {
      if (this.playerName === '') {
        const warn = this.add.text(400, 358, 'Please enter your name first!', {
          fontSize: '12px',
          color: '#e94560',
          fontFamily: 'Courier New',
        }).setOrigin(0.5);
        this.time.delayedCall(2000, () => warn.destroy());
        return;
      }

      if (this.hasShownResponse) return;
      this.hasShownResponse = true;

      // Hide name input area and continue button
      this.inputLabel.setAlpha(0);
      this.inputBoxGfx.setAlpha(0);
      this.nameDisplay.setAlpha(0);
      this.inputZone.setAlpha(0);
      this.contBtnBg.setAlpha(0);
      this.contBtnText.setAlpha(0);
      this.contBtnZone.setAlpha(0);

      // Ada's response
      this.typeLine(
        'Awesome ' + this.playerName + '! Now let\'s set up your ' +
        'Codebuilder character — make it your own! ' +
        'Choose your look and let\'s get started!'
      );

      this.time.delayedCall(3000, () => {
        window.playerData = { name: this.playerName, avatar: 'avatar1' };
        this.scene.start('CustomizeScene');
      });
    });

    // -------------------------------------------------------------------------
    // Initial dialog
    // -------------------------------------------------------------------------
    this.typeLine(
      'Alright future Codebuilder! Before we begin, ' +
      'I need to know your name. What should I call you?'
    );
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  _drawContBtn(color) {
    this.contBtnBg.clear();
    this.contBtnBg.fillStyle(color, 1);
    this.contBtnBg.fillRoundedRect(400 - 100, 385 - 22, 200, 44, 8);
  }

  typeLine(fullText) {
    this.isTyping = true;
    this.dialogText.setText('');
    let i = 0;
    if (this.typeTimer) {
      this.typeTimer.remove();
      this.typeTimer = null;
    }
    this.typeTimer = this.time.addEvent({
      delay: 25,
      repeat: fullText.length - 1,
      callback: () => {
        this.dialogText.text += fullText[i];
        i++;
        if (i >= fullText.length) {
          this.isTyping = false;
        }
      },
    });
  }
}
