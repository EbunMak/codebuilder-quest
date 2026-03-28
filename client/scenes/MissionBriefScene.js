export default class MissionBriefScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MissionBriefScene' });
  }

  create() {
    this.pageIndex = 0;

    const pages = [
      // PAGE 0
      "Attention Codebuilder! King Glitchy and his \n" +
      "Malware Minions have invaded the Code Caverns — \n" +
      "the underground heart of Codebuilder-verse where \n" +
      "all its core systems live! They are planting \n" +
      "B.U.G.s in the data streams and corrupting \n" +
      "everything. Only YOU can stop them!",

      // PAGE 1
      "Your mission:\n\n" +
      "Navigate the Code Caverns, solve coding puzzles,\n" +
      "and shut down the B.U.G. generators before\n" +
      "they corrupt the entire system!",

      // PAGE 2
      "Tips for success:\n\n" +
      "• Read each puzzle carefully before coding\n" +
      "• Work with your team — two brains beat one!\n" +
      "• Every puzzle has a hint if you get stuck",

      // PAGE 3
      "Are you ready? Descend into the Code Caverns, \n" +
      "fix the glitches, defeat the Malware Minions \n" +
      "and save Codebuilder-verse! Remember — \n" +
      "work together and think before you code!",
    ];

    // -------------------------------------------------------------------------
    // Background
    // -------------------------------------------------------------------------
    this.add.rectangle(400, 250, 800, 500, 0x0a0a1a).setOrigin(0.5);

    // -------------------------------------------------------------------------
    // Header
    // -------------------------------------------------------------------------
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x0d1a2e, 1);
    headerBg.fillRect(0, 0, 800, 70);
    headerBg.lineStyle(1, 0x4a90d9, 0.5);
    headerBg.lineBetween(0, 70, 800, 70);

    this.add.text(400, 35, 'Mission Brief', {
      fontSize: '22px',
      color: '#4a90d9',
      fontFamily: 'Courier New',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // -------------------------------------------------------------------------
    // Page content card
    // -------------------------------------------------------------------------
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x0f1f3a, 1);
    cardBg.fillRoundedRect(80, 90, 640, 270, 12);
    cardBg.lineStyle(1, 0x4a90d9, 0.3);
    cardBg.strokeRoundedRect(80, 90, 640, 270, 12);

    this.pageText = this.add.text(400, 225, pages[0], {
      fontSize: '13px',
      color: '#e0e0e0',
      fontFamily: 'Courier New',
      align: 'center',
      wordWrap: { width: 580 },
      lineSpacing: 6,
    }).setOrigin(0.5);

    // -------------------------------------------------------------------------
    // Page dots
    // -------------------------------------------------------------------------
    this.dots = [];
    for (let i = 0; i < pages.length; i++) {
      const dot = this.add.graphics();
      dot.fillStyle(i === 0 ? 0x4a90d9 : 0x333355, 1);
      dot.fillCircle(370 + i * 20, 378, 5);
      this.dots.push(dot);
    }

    // -------------------------------------------------------------------------
    // Navigation: Prev / Next
    // -------------------------------------------------------------------------
    const prevBg = this.add.graphics();
    prevBg.fillStyle(0x1a2a4a, 1);
    prevBg.fillRoundedRect(80, 400, 100, 34, 7);
    prevBg.lineStyle(1, 0x4a90d9, 0.6);
    prevBg.strokeRoundedRect(80, 400, 100, 34, 7);

    const prevText = this.add.text(130, 417, '← Prev', {
      fontSize: '12px',
      color: '#4a90d9',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    const prevZone = this.add.zone(130, 417, 100, 34)
      .setInteractive({ useHandCursor: true });

    const nextBg = this.add.graphics();
    nextBg.fillStyle(0x1a2a4a, 1);
    nextBg.fillRoundedRect(620, 400, 100, 34, 7);
    nextBg.lineStyle(1, 0x4a90d9, 0.6);
    nextBg.strokeRoundedRect(620, 400, 100, 34, 7);

    const nextText = this.add.text(670, 417, 'Next →', {
      fontSize: '12px',
      color: '#4a90d9',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    const nextZone = this.add.zone(670, 417, 100, 34)
      .setInteractive({ useHandCursor: true });

    const updatePage = (index) => {
      this.pageIndex = index;
      this.pageText.setText(pages[index]);

      this.dots.forEach((d, i) => {
        d.clear();
        d.fillStyle(i === index ? 0x4a90d9 : 0x333355, 1);
        d.fillCircle(370 + i * 20, 378, 5);
      });

      prevText.setColor(index > 0 ? '#4a90d9' : '#333355');
      nextText.setColor(index < pages.length - 1 ? '#4a90d9' : '#333355');
      this.beginBtn.setVisible(index === pages.length - 1);
      beginBtnBg.setVisible(index === pages.length - 1);
    };

    prevZone.on('pointerdown', () => {
      if (this.pageIndex > 0) updatePage(this.pageIndex - 1);
    });
    nextZone.on('pointerdown', () => {
      if (this.pageIndex < pages.length - 1) updatePage(this.pageIndex + 1);
    });

    // -------------------------------------------------------------------------
    // Begin Mission button (visible on last page only)
    // -------------------------------------------------------------------------
    const beginBtnBg = this.add.graphics();
    beginBtnBg.fillStyle(0xf5a623, 1);
    beginBtnBg.fillRoundedRect(310, 450, 180, 36, 8);

    this.beginBtn = this.add.text(400, 468, '▶  Begin Mission!', {
      fontSize: '13px',
      color: '#1a1a2e',
      fontFamily: 'Courier New',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const beginZone = this.add.zone(400, 468, 180, 36)
      .setInteractive({ useHandCursor: true });

    beginZone.on('pointerdown', () => {
      this.scene.start('CavernsScene', {
        roomCode: this.scene.settings.data?.roomCode,
        soloMode: this.scene.settings.data?.soloMode,
        playerCount: this.scene.settings.data?.playerCount,
        yourRole: this.scene.settings.data?.yourRole,
      });
    });

    this.beginBtn.setVisible(false);
    beginBtnBg.setVisible(false);

    // -------------------------------------------------------------------------
    // Back button
    // -------------------------------------------------------------------------
    const backBg = this.add.graphics();
    backBg.fillStyle(0x1a1a2e, 1);
    backBg.fillRoundedRect(10, 450, 100, 32, 6);
    backBg.lineStyle(1, 0x4a90d9, 0.6);
    backBg.strokeRoundedRect(10, 450, 100, 32, 6);

    this.add.text(60, 466, '← Back', {
      fontSize: '12px',
      color: '#4a90d9',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    const backZone = this.add.zone(60, 466, 100, 32)
      .setInteractive({ useHandCursor: true });
    backZone.on('pointerdown', () => this.scene.start('TechHubScene'));

    // Initialise nav state
    updatePage(0);
  }
}
