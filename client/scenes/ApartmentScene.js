export default class ApartmentScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ApartmentScene' });
  }

  preload() {
    if (window.playerData?.characterKey) {
      this.load.image(
        'player_char',
        'assets/characters/' +
          window.playerData.complexion + '/' +
          window.playerData.characterKey + '.png'
      );
    }
  }

  create() {
    // 1. Background
    this.add.rectangle(400, 250, 800, 500, 0x1a1a2e).setOrigin(0.5);

    // 2. Title
    this.add.text(400, 40, 'My Apartment', {
      fontSize: '22px',
      color: '#ff6b9d',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    // 3. Player character
    if (window.playerData?.characterKey) {
      this.add.image(400, 260, 'player_char')
        .setScale(0.45)
        .setOrigin(0.5);
    } else {
      this.add.text(400, 260, 'Your character', {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Courier New',
      }).setOrigin(0.5);
    }

    // 4. Player name
    const name = window.playerData?.name || '';
    this.add.text(400, 420, name + "'s Space", {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    // 5. Coming soon label
    const comingBg = this.add.graphics();
    comingBg.fillStyle(0x2d1b4e, 1);
    comingBg.fillRoundedRect(400 - 100, 460 - 16, 200, 32, 6);
    comingBg.lineStyle(1, 0x9b59b6, 1);
    comingBg.strokeRoundedRect(400 - 100, 460 - 16, 200, 32, 6);

    this.add.text(400, 460, 'Room customization coming soon!', {
      fontSize: '10px',
      color: '#9b59b6',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    // 6. Back button
    const backBg = this.add.graphics();
    backBg.fillStyle(0x2d1b4e, 1);
    backBg.fillRoundedRect(60 - 50, 465 - 16, 100, 32, 6);
    backBg.lineStyle(1, 0xff6b9d, 1);
    backBg.strokeRoundedRect(60 - 50, 465 - 16, 100, 32, 6);

    const backText = this.add.text(60, 465, '← Back', {
      fontSize: '12px',
      color: '#ff6b9d',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    const backZone = this.add.zone(60, 465, 100, 32)
      .setInteractive({ useHandCursor: true });
    backZone.on('pointerdown', () => this.scene.start('MapScene'));
  }
}
