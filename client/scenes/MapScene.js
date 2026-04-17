export default class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MapScene' });
  }

  preload() {
    this.load.image('map_bg',    'assets/world/map_background.png');
    this.load.image('apartment', 'assets/world/building_apartment.png');
    this.load.image('techhub',   'assets/world/building_techhub.png');
    this.load.image('ada',       'assets/npc/ada.png');
  }

  create() {
    // -------------------------------------------------------------------------
    // 1. Background image
    // -------------------------------------------------------------------------
    this.add.image(400, 250, 'map_bg')
      .setDisplaySize(800, 500)
      .setOrigin(0.5);

    // -------------------------------------------------------------------------
    // 2. Title with dark backing rect
    // -------------------------------------------------------------------------
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0x0d0d1a, 0.6);
    titleBg.fillRoundedRect(400 - 140, 22 - 16, 280, 32, 6);

    this.add.text(400, 22, 'Codebuilder City', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    // -------------------------------------------------------------------------
    // 3. Player name tag top right
    // -------------------------------------------------------------------------
    const playerName = window.playerData?.name || '';
    const nameBadgeBg = this.add.graphics();
    nameBadgeBg.fillStyle(0x0d0d1a, 0.8);
    nameBadgeBg.lineStyle(1, 0x4a90d9, 0.5);
    nameBadgeBg.fillRoundedRect(672, 10, 118, 24, 5);
    nameBadgeBg.strokeRoundedRect(672, 10, 118, 24, 5);

    this.add.text(783, 22, playerName, {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: 'Courier New',
    }).setOrigin(1, 0.5);

    // -------------------------------------------------------------------------
    // 4. Apartment building
    // -------------------------------------------------------------------------
    const apartment = this.add.image(680, 330, 'apartment')
      .setDisplaySize(180, 220)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Apartment label backing + text
    const aptLabelBg = this.add.graphics();
    aptLabelBg.fillStyle(0x0d0d1a, 0.75);
    aptLabelBg.fillRoundedRect(680 - 65, 330 - 12, 130, 24, 5);

    this.add.text(680, 330, 'My Apartment', {
      fontSize: '12px',
      color: '#ff6b9d',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    apartment.on('pointerdown', () => {
      this.scene.start('ApartmentScene');
    });

    // -------------------------------------------------------------------------
    // 5. Tech Hub building
    // -------------------------------------------------------------------------
    const techhub = this.add.image(580, 180, 'techhub')
      .setDisplaySize(200, 210)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Tech Hub label backing + text (below the building)
    const hubLabelBg = this.add.graphics();
    hubLabelBg.fillStyle(0x0d0d1a, 0.75);
    hubLabelBg.fillRoundedRect(580 - 55, 180 - 12, 110, 24, 5);

    this.add.text(580, 180, 'Tech Hub', {
      fontSize: '12px',
      color: '#1abc9c',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    // Pulsing glow circle behind Tech Hub
    const hubGlow = this.add.graphics();
    hubGlow.fillStyle(0x1abc9c, 0.08);
    hubGlow.fillCircle(520, 240, 90);

    this.tweens.add({
      targets: hubGlow,
      alpha: { from: 0.04, to: 0.14 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });

    techhub.on('pointerdown', () => this.scene.start('TechHubScene'));

    // -------------------------------------------------------------------------
    // 6. Ada hint bubble bottom left
    // -------------------------------------------------------------------------
    this.add.image(28, 462, 'ada').setScale(0.09).setOrigin(0.5);

    const hintBg = this.add.graphics();
    hintBg.fillStyle(0x0d0d1a, 0.85);
    hintBg.fillRoundedRect(62, 438, 240, 52, 8);
    hintBg.lineStyle(1, 0x4a90d9, 1);
    hintBg.strokeRoundedRect(62, 438, 240, 52, 8);

    this.add.text(76, 450, 'Click a building\nto explore!', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'Courier New',
      lineSpacing: 4,
    });

    // -------------------------------------------------------------------------
    // 7. "Play with Friends" button
    // -------------------------------------------------------------------------
    const friendsBtnBg = this.add.graphics();
    friendsBtnBg.fillStyle(0x9b59b6, 1);
    friendsBtnBg.fillRoundedRect(665, 442, 130, 36, 7);

    const friendsBtnText = this.add.text(730, 460, 'Play with Friends', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    const friendsBtnZone = this.add.zone(730, 460, 130, 36)
      .setInteractive({ useHandCursor: true });

    friendsBtnZone.on('pointerover', () => {
      friendsBtnBg.clear();
      friendsBtnBg.fillStyle(0xad6dd4, 1);
      friendsBtnBg.fillRoundedRect(665, 442, 130, 36, 7);
    });
    friendsBtnZone.on('pointerout', () => {
      friendsBtnBg.clear();
      friendsBtnBg.fillStyle(0x9b59b6, 1);
      friendsBtnBg.fillRoundedRect(665, 442, 130, 36, 7);
    });
    friendsBtnZone.on('pointerdown', () => this._showFriendsOverlay());
  }

  // ---------------------------------------------------------------------------
  // "Play with Friends" overlay
  // ---------------------------------------------------------------------------
  _showFriendsOverlay() {
    const overlay = [];

    const bg = this.add.rectangle(400, 250, 800, 500, 0x000000, 0.85);
    overlay.push(bg);

    const title = this.add.text(400, 160, 'Play with Friends!', {
      fontSize: '20px',
      color: '#f5a623',
      fontStyle: 'bold',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);
    overlay.push(title);

    const body = this.add.text(400, 230,
      'Coming soon! You will be able to join\nyour friends using a server code.',
      {
        fontSize: '13px',
        color: '#ffffff',
        fontFamily: 'Courier New',
        align: 'center',
        wordWrap: { width: 400 },
      }
    ).setOrigin(0.5);
    overlay.push(body);

    // "Got it!" close button
    const closeBg = this.add.graphics();
    closeBg.fillStyle(0xf5a623, 1);
    closeBg.fillRoundedRect(400 - 60, 305, 120, 38, 8);
    overlay.push(closeBg);

    const closeText = this.add.text(400, 324, 'Got it!', {
      fontSize: '14px',
      color: '#1a1a2e',
      fontStyle: 'bold',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);
    overlay.push(closeText);

    const closeZone = this.add.zone(400, 324, 120, 38)
      .setInteractive({ useHandCursor: true });
    overlay.push(closeZone);

    const destroy = () => overlay.forEach(o => o.destroy());

    closeZone.on('pointerdown', destroy);
  }
}
