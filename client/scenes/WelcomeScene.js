import { AVATAR_OPTIONS, loadPlayer, savePlayer } from '../data/gameData.js';

export default class WelcomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WelcomeScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // 1. Load existing player data
    this.playerData = loadPlayer();
    this.playerName = this.playerData.name || '';
    this.selectedAvatar = null;
    this.warningText = null;

    // 2. Background
    this.add.rectangle(W / 2, H / 2, W, H, 0x1a1a2e);

    // 3. Animated stars
    const starColors = [0xf5a623, 0xff6b9d, 0x9b59b6, 0x1abc9c];
    for (let i = 0; i < 20; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        2,
        Phaser.Utils.Array.GetRandom(starColors),
      );
      this.tweens.add({
        targets: star,
        alpha: { from: 0.3, to: 1.0 },
        duration: Phaser.Math.Between(1000, 3000),
        repeat: -1,
        yoyo: true,
      });
    }

    // 4. Title
    this.add.text(W / 2, 60, 'Codebuilder Quest', {
      fontSize: '36px',
      color: '#f5a623',
      fontStyle: 'bold',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // 5. Subtitle
    this.add.text(W / 2, 105, 'A glitched world needs you. Are you ready to code it back?', {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // 6. Section label
    this.add.text(W / 2, 145, 'Choose your Codebuilder', {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // 7. Avatar cards
    this._buildAvatarCards(W);

    // 10. Pre-select avatar1 by default
    this.selectedAvatar = 'avatar1';
    this._selectCard(0);

    // 8. Name entry
    this._buildNameEntry(W);

    // 9. Enter the World button
    this._buildEnterButton(W);
  }

  // -------------------------------------------------------------------------
  // Avatar cards
  // -------------------------------------------------------------------------

  _buildAvatarCards(W) {
    const cardW = 140;
    const cardH = 160;
    const gap = 20;
    const totalW = AVATAR_OPTIONS.length * cardW + (AVATAR_OPTIONS.length - 1) * gap;
    const startX = (W - totalW) / 2;
    const cardTopY = 220;

    this._cardW = cardW;
    this._cardH = cardH;
    this._cardData = [];

    AVATAR_OPTIONS.forEach((avatar, index) => {
      const cx = startX + index * (cardW + gap) + cardW / 2;
      const cy = cardTopY + cardH / 2;

      // Container groups all card elements so the scale tween affects them together
      const container = this.add.container(cx, cy);
      container.setSize(cardW, cardH);
      container.setInteractive();

      // Card background / border graphics (drawn relative to container center)
      const gfx = this.add.graphics();
      this._drawCard(gfx, cardW, cardH, avatar, false);

      // Emoji at top of card
      const emojiText = this.add.text(0, -cardH / 2 + 38, avatar.emoji, {
        fontSize: '36px',
      }).setOrigin(0.5);

      // Avatar label
      const labelText = this.add.text(0, -cardH / 2 + 88, avatar.label, {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'monospace',
      }).setOrigin(0.5);

      // Body color swatch at bottom
      const bodyColor = Phaser.Display.Color.HexStringToColor(avatar.bodyColor).color;
      const swatch = this.add.circle(0, cardH / 2 - 22, 8, bodyColor);

      container.add([gfx, emojiText, labelText, swatch]);

      container.on('pointerdown', () => {
        this.selectedAvatar = avatar.id;
        // Clear selection on all cards, then highlight this one
        this._cardData.forEach((_, i) => this._selectCard(i, false));
        this._selectCard(index, true);
        // Bounce tween
        this.tweens.add({
          targets: container,
          scaleX: 1.08,
          scaleY: 1.08,
          duration: 100,
          yoyo: true,
          ease: 'Power1',
          onComplete: () => container.setScale(1),
        });
      });

      this._cardData.push({ container, gfx, avatar });
    });
  }

  // Draw (or redraw) a single card's graphics. Coords are relative to container center.
  _drawCard(gfx, w, h, avatar, selected) {
    gfx.clear();
    const fillColor = Phaser.Display.Color.HexStringToColor(avatar.color).color;
    gfx.fillStyle(fillColor, 0.4);
    gfx.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    gfx.lineStyle(selected ? 3 : 2, selected ? 0xffffff : fillColor, 1);
    gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
  }

  // Select (or deselect) a card by index
  _selectCard(index, selected = true) {
    const { gfx, avatar } = this._cardData[index];
    this._drawCard(gfx, this._cardW, this._cardH, avatar, selected);
  }

  // -------------------------------------------------------------------------
  // Name entry
  // -------------------------------------------------------------------------

  _buildNameEntry(W) {
    this.add.text(W / 2, 385, 'Your Codebuilder name:', {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    const inputW = 280;
    const inputH = 40;
    const inputLeft = W / 2 - inputW / 2;
    const inputTop = 405 - inputH / 2;    // centered at y=405

    const inputGfx = this.add.graphics();
    inputGfx.fillStyle(0x0f3460, 1);
    inputGfx.fillRoundedRect(inputLeft, inputTop, inputW, inputH, 8);
    inputGfx.lineStyle(2, 0x4a4a8a, 1);
    inputGfx.strokeRoundedRect(inputLeft, inputTop, inputW, inputH, 8);

    this.nameText = this.add.text(
      W / 2, 405,
      this.playerName || 'Click to type your name...',
      {
        fontSize: '13px',
        color: this.playerName ? '#ffffff' : '#aaaaaa',
        fontFamily: 'monospace',
      },
    ).setOrigin(0.5);

    inputGfx.setInteractive(
      new Phaser.Geom.Rectangle(inputLeft, inputTop, inputW, inputH),
      Phaser.Geom.Rectangle.Contains,
    );

    inputGfx.on('pointerdown', () => {
      const name = window.prompt('What is your Codebuilder name?');
      if (name && name.trim() !== '') {
        this.playerName = name.trim();
        this.nameText.setText(this.playerName);
        this.nameText.setColor('#ffffff');
      }
    });
  }

  // -------------------------------------------------------------------------
  // Enter the World button
  // -------------------------------------------------------------------------

  _buildEnterButton(W) {
    const btnW = 220;
    const btnH = 44;
    const btnLeft = W / 2 - btnW / 2;
    const btnTop = 450 - btnH / 2;       // centered at y=450

    const btnGfx = this.add.graphics();
    this._drawButton(btnGfx, btnLeft, btnTop, btnW, btnH, 0xf5a623);

    // Button label sits on top in the scene's display list
    this.add.text(W / 2, 450, 'Enter the World ✨', {
      fontSize: '15px',
      color: '#1a1a2e',
      fontStyle: 'bold',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    btnGfx.setInteractive(
      new Phaser.Geom.Rectangle(btnLeft, btnTop, btnW, btnH),
      Phaser.Geom.Rectangle.Contains,
    );

    btnGfx.on('pointerover', () => {
      this._drawButton(btnGfx, btnLeft, btnTop, btnW, btnH, 0xffd700);
    });

    btnGfx.on('pointerout', () => {
      this._drawButton(btnGfx, btnLeft, btnTop, btnW, btnH, 0xf5a623);
    });

    btnGfx.on('pointerdown', () => {
      if (!this.playerName || !this.selectedAvatar) {
        // Show warning, auto-destroy after 2 s
        if (this.warningText) this.warningText.destroy();
        this.warningText = this.add.text(
          W / 2, 430,
          'Please choose an avatar and enter your name!',
          { fontSize: '13px', color: '#e94560', fontFamily: 'monospace' },
        ).setOrigin(0.5);
        this.time.delayedCall(2000, () => {
          if (this.warningText) {
            this.warningText.destroy();
            this.warningText = null;
          }
        });
        return;
      }

      window.playerData = {
        name: this.playerName,
        avatar: this.selectedAvatar,
      };
      savePlayer(window.playerData);
      this.scene.start('MapScene');
    });
  }

  _drawButton(gfx, x, y, w, h, color) {
    gfx.clear();
    gfx.fillStyle(color, 1);
    gfx.fillRoundedRect(x, y, w, h, 10);
  }
}
