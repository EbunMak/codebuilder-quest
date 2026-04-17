export default class StoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StoryScene' });
  }

  preload() {
    this.load.image('ada', 'assets/npc/ada.png');
    this.load.image('landmark_stack',    'assets/world/landmark_stack.png');
    this.load.image('landmark_pyramids', 'assets/world/landmark_pyramids.png');
    this.load.image('landmark_firewall', 'assets/world/landmark_firewall.png');
    this.load.image('landmark_statue',   'assets/world/landmark_statue.png');
  }

  create() {
    this.currentPage = 0;
    this.isTyping = false;
    this.typeTimer = null;

    // Nearest-neighbour filtering on landmark textures to prevent blurring
    this.textures.get('landmark_stack').setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get('landmark_pyramids').setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get('landmark_firewall').setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get('landmark_statue').setFilter(Phaser.Textures.FilterMode.NEAREST);

    this.pages = [
      {
        text: "Hi! I'm Ada, named after Ada Lovelace. She was the world's first computer programmer. She lived in the 1800s and wrote the very first computer program. Pretty cool right? Enough about me. Welcome to Codebuilders Quest! It's an adventure where you and your friends work together to save the world using code!",
        button: 'Next',
        landmarks: false,
      },
      {
        text: "Codebuilder-verse was once home to the greatest builders in history! They used imagination and coding skills to create legendary structures such as The Leaning Tower of Stack, The Binary Pyramids, The Great Firewall, and The Statue of Debugging. This world was full of creativity, logic, and wonder.",
        button: 'Next \u2192',
        landmarks: true,
      },
    ];

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
    // Ada image panel — left side
    // -------------------------------------------------------------------------
    const ada = this.add.image(75, 380, 'ada')
      .setScale(0.22)
      .setOrigin(0.5, 1);

    this.tweens.add({
      targets: ada,
      y: ada.y - 6,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Nameplate — centered at x=100 y=390, size 110x24
    const nameplateGfx = this.add.graphics();
    nameplateGfx.fillStyle(0x1e1035, 1);
    nameplateGfx.fillRoundedRect(20, 378, 110, 24, 6);
    nameplateGfx.lineStyle(1, 0x9b59b6, 1);
    nameplateGfx.strokeRoundedRect(20, 378, 110, 24, 6);

    this.add.text(75, 390, 'Ada', {
      fontSize: '11px',
      color: '#9b59b6',
      fontStyle: 'bold',
      fontFamily: 'Courier New',
      resolution: 2,
    }).setOrigin(0.5, 0.5);

    // -------------------------------------------------------------------------
    // Speech bubble — right side
    // -------------------------------------------------------------------------
    const bubbleGfx = this.add.graphics();

    // Bubble body
    bubbleGfx.fillStyle(0x0f1923, 1);
    bubbleGfx.fillRoundedRect(175, 40, 595, 220, 12);
    bubbleGfx.lineStyle(1.5, 0x4a90d9, 1);
    bubbleGfx.strokeRoundedRect(175, 40, 595, 220, 12);

    // Triangle pointer toward Ada (left-pointing)
    bubbleGfx.fillStyle(0x0f1923, 1);
    bubbleGfx.fillTriangle(175, 150, 155, 165, 175, 180);
    bubbleGfx.lineStyle(1, 0x4a90d9, 1);
    bubbleGfx.strokeTriangle(175, 150, 155, 165, 175, 180);

    // Page dots
    this.dot0 = this.add.circle(730, 70, 5, 0x4a90d9);
    this.dot1 = this.add.circle(748, 70, 5, 0x2a2a4a);

    // Dialog text
    this.dialogText = this.add.text(192, 58, '', {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: 'Courier New',
      wordWrap: { width: 548, useAdvancedWrap: true },
      lineSpacing: 8,
      resolution: 2,
    });

    // -------------------------------------------------------------------------
    // Landmark elements container
    // -------------------------------------------------------------------------
    this.landmarkElements = [];

    // -------------------------------------------------------------------------
    // Next button
    // -------------------------------------------------------------------------
    this._btnY = 390;
    this.nextBtnBg = this.add.graphics();
    this._drawNextBtn(0xf5a623);

    this.nextBtnText = this.add.text(680, 390, 'Next', {
      fontSize: '14px',
      color: '#1a1a2e',
      fontStyle: 'bold',
      fontFamily: 'Courier New',
      resolution: 2,
    }).setOrigin(0.5, 0.5);

    this.nextBtnZone = this.add.zone(680, 390, 110, 38)
      .setInteractive({ useHandCursor: true });

    this.nextBtnZone.on('pointerover', () => {
      this._drawNextBtn(0xffd700);
    });
    this.nextBtnZone.on('pointerout', () => {
      this._drawNextBtn(0xf5a623);
    });
    this.nextBtnZone.on('pointerdown', () => {
      if (this.isTyping) {
        if (this.typeTimer) this.typeTimer.remove();
        this.dialogText.setText(this.pages[this.currentPage].text);
        this.isTyping = false;
        return;
      }
      if (this.currentPage === 0) {
        this.currentPage = 1;
        this.showPage(1);
      } else if (this.currentPage === 1) {
        this.scene.start('NameScene');
      }
    });

    // -------------------------------------------------------------------------
    // Skip button
    // -------------------------------------------------------------------------
    this.add.text(755, 18, 'Skip intro >>', {
      fontSize: '11px',
      color: '#444444',
      fontFamily: 'Courier New',
      resolution: 2,
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('NameScene');
      });

    this.showPage(0);
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  _drawNextBtn(color) {
    this.nextBtnBg.clear();
    this.nextBtnBg.fillStyle(color, 1);
    this.nextBtnBg.fillRoundedRect(680 - 55, this._btnY - 19, 110, 38, 8);
  }

  // ---------------------------------------------------------------------------
  // typeLine — typewriter effect
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // showLandmarks / hideLandmarks
  // ---------------------------------------------------------------------------
  showLandmarks() {
    if (this.landmarkElements) {
      this.landmarkElements.forEach(e => e && e.destroy());
    }
    this.landmarkElements = [];

    const landmarks = [
      { key: 'landmark_stack',    label: 'Leaning Tower\nof Stack',  border: 0x1abc9c },
      { key: 'landmark_pyramids', label: 'Binary\nPyramids',         border: 0x9b59b6 },
      { key: 'landmark_firewall', label: 'Great\nFirewall',          border: 0xe74c3c },
      { key: 'landmark_statue',   label: 'Statue of\nDebugging',     border: 0xf5a623 },
    ];

    const cardW = 170;
    const cardH = 170;
    const gap = 12;
    const totalW = cardW * 4 + gap * 3;
    const startX = (800 - totalW) / 2 + cardW / 2;
    const cardY = 370;

    landmarks.forEach((lm, i) => {
      const x = startX + i * (cardW + gap);

      const bg = this.add.graphics();
      bg.fillStyle(0x0d1520, 1);
      bg.fillRoundedRect(x - cardW / 2, cardY - cardH / 2, cardW, cardH, 10);
      bg.lineStyle(2, lm.border, 0.8);
      bg.strokeRoundedRect(x - cardW / 2, cardY - cardH / 2, cardW, cardH, 10);

      const img = this.add.image(x, cardY - 14, lm.key);
      img.setDisplaySize(Math.min(130, img.width), Math.min(120, img.height));
      img.setOrigin(0.5);

      const lbl = this.add.text(x, cardY + cardH / 2 - 18, lm.label, {
        fontSize: '10px',
        color: '#cccccc',
        fontFamily: 'Courier New',
        align: 'center',
        resolution: 2,
      }).setOrigin(0.5);

      this.landmarkElements.push(bg, img, lbl);
    });
  }

  hideLandmarks() {
    if (this.landmarkElements) {
      this.landmarkElements.forEach(e => e && e.destroy());
      this.landmarkElements = [];
    }
  }

  // ---------------------------------------------------------------------------
  // showPage
  // ---------------------------------------------------------------------------
  showPage(index) {
    const page = this.pages[index];

    // Update page dots
    this.dot0.setFillStyle(index === 0 ? 0x4a90d9 : 0x2a2a4a);
    this.dot1.setFillStyle(index === 1 ? 0x4a90d9 : 0x2a2a4a);

    // Landmarks
    if (index === 1) {
      this.showLandmarks();
    } else {
      this.hideLandmarks();
    }

    // Reposition button
    const btnY = index === 1 ? 480 : 390;
    this._btnY = btnY;
    this._drawNextBtn(0xf5a623);
    this.nextBtnText.setText(page.button).setPosition(680, btnY);
    this.nextBtnZone.setPosition(680, btnY);

    // Start typewriter
    this.typeLine(page.text);
  }
}
