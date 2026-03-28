import { ROOM_ITEMS, AVATAR_OPTIONS, loadPlayer, savePlayer } from '../data/gameData.js';

export default class RoomScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RoomScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // 1. Load player state and resolve avatar
    this.playerState = loadPlayer();
    this.avatar = AVATAR_OPTIONS.find(
      a => a.id === (window.playerData?.avatar || this.playerState.avatar)
    ) || AVATAR_OPTIONS[0];

    // 2. Background
    this.add.rectangle(W / 2, H / 2, W, H, 0x1a1a2e);

    // 3. Room interior (walls, floor, window)
    this._drawRoom(W, H);

    // Room items drawn before the rewards panel so they sit behind it
    this._drawRoomItems();

    // 4. Room name banner
    this._drawBanner(W);

    // 5. Player avatar chibi
    this._drawAvatar();

    // 6. Earned rewards panel
    this._drawRewardsPanel();

    // 8. Back button
    this._drawBackButton();

    // 9. Customize button
    this._drawCustomizeButton(W);

    // 10. Mentor hint bubble
    this._drawMentorHint(W);
  }

  // ---------------------------------------------------------------------------
  // 3 — Room interior
  // ---------------------------------------------------------------------------

  _drawRoom(W, H) {
    const gfx = this.add.graphics();

    // Back wall
    gfx.fillStyle(0x1e1035, 1);
    gfx.fillRect(0, 0, W, 340);

    // Floor
    gfx.fillStyle(0x2d1b4e, 1);
    gfx.fillRect(0, 340, W, 160);

    // Floor / wall divider
    gfx.lineStyle(2, 0x9b59b6, 1);
    gfx.beginPath();
    gfx.moveTo(0, 340);
    gfx.lineTo(W, 340);
    gfx.strokePath();

    // Left wall accent
    gfx.fillStyle(0x9b59b6, 0.4);
    gfx.fillRect(0, 0, 8, H);

    // Right wall accent
    gfx.fillStyle(0x9b59b6, 0.4);
    gfx.fillRect(W - 8, 0, 8, H);

    // Window centered on back wall
    this._drawWindow(gfx, 400, 80);
  }

  _drawWindow(gfx, cx, cy) {
    const ww = 120, wh = 90;
    const wx = cx - ww / 2, wy = cy - wh / 2;

    // Frame fill + border
    gfx.fillStyle(0x1e3a5f, 1);
    gfx.fillRect(wx, wy, ww, wh);
    gfx.lineStyle(2, 0x4a90d9, 1);
    gfx.strokeRect(wx, wy, ww, wh);

    // 4 panes (2×2 grid)
    const pw = ww / 2 - 3, ph = wh / 2 - 3;
    gfx.fillStyle(0x87ceeb, 0.2);
    gfx.fillRect(wx + 2,       wy + 2,       pw, ph);
    gfx.fillRect(wx + pw + 5,  wy + 2,       pw, ph);
    gfx.fillRect(wx + 2,       wy + ph + 5,  pw, ph);
    gfx.fillRect(wx + pw + 5,  wy + ph + 5,  pw, ph);

    // Curtains (thin strips either side)
    gfx.fillStyle(0x9b59b6, 0.6);
    gfx.fillRect(wx - 14, wy - 6, 16, wh + 12);
    gfx.fillRect(wx + ww - 2, wy - 6, 16, wh + 12);

    // Night-sky stars through the glass
    gfx.fillStyle(0xffffff, 0.4);
    for (const [sx, sy] of [
      [cx - 32, cy - 22], [cx + 26, cy - 28],
      [cx - 8,  cy - 10], [cx + 12, cy - 20], [cx + 36, cy - 8],
    ]) {
      gfx.fillRect(sx, sy, 2, 2);
    }
  }

  // ---------------------------------------------------------------------------
  // 4 — Room name banner
  // ---------------------------------------------------------------------------

  _drawBanner(W) {
    const bw = 300, bh = 36;
    const bx = W / 2 - bw / 2, by = 18 - bh / 2;

    const gfx = this.add.graphics();
    gfx.fillStyle(0x2d1b4e, 1);
    gfx.fillRoundedRect(bx, by, bw, bh, 8);
    gfx.lineStyle(1.5, 0x9b59b6, 1);
    gfx.strokeRoundedRect(bx, by, bw, bh, 8);

    const name = window.playerData?.name || this.playerState.name || 'Codebuilder';
    this.add.text(W / 2, 18, `${name}'s Lab`, {
      fontSize: '14px',
      color: '#f5a623',
      fontStyle: 'bold',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
  }

  // ---------------------------------------------------------------------------
  // 5 — Player avatar (chibi character)
  // ---------------------------------------------------------------------------

  _drawAvatar() {
    const charX = 120;
    const feetY = 335;          // just above floor line at 340
    const bodyH = 54, bodyW = 44;
    const bodyTop = feetY - bodyH;
    const headR = 26;
    const headCY = bodyTop - headR;  // head center sits on top of body

    const bodyColor = Phaser.Display.Color.HexStringToColor(this.avatar.bodyColor).color;
    const headColor = Phaser.Display.Color.HexStringToColor(this.avatar.color).color;

    // Compute a darker shade for the hair
    const hc = Phaser.Display.Color.HexStringToColor(this.avatar.color);
    const hairColor = Phaser.Display.Color.GetColor(
      Math.floor(hc.r * 0.55),
      Math.floor(hc.g * 0.55),
      Math.floor(hc.b * 0.55),
    );

    const gfx = this.add.graphics();

    // Body
    gfx.fillStyle(bodyColor, 1);
    gfx.fillRoundedRect(charX - bodyW / 2, bodyTop, bodyW, bodyH, 8);

    // Head
    gfx.fillStyle(headColor, 1);
    gfx.fillCircle(charX, headCY, headR);

    // Hair accent (sits on top of head)
    gfx.fillStyle(hairColor, 1);
    gfx.fillRect(charX - 15, headCY - headR, 30, 10);

    // Eyes — white circles
    gfx.fillStyle(0xffffff, 1);
    gfx.fillCircle(charX - 9, headCY - 2, 4);
    gfx.fillCircle(charX + 9, headCY - 2, 4);

    // Pupils — black dots
    gfx.fillStyle(0x111111, 1);
    gfx.fillCircle(charX - 8, headCY - 1, 2);
    gfx.fillCircle(charX + 10, headCY - 1, 2);

    // Smile — arc from 0 to π (clockwise = U-shape)
    gfx.lineStyle(2, 0x444444, 1);
    gfx.strokeArc(charX, headCY + 9, 8, 0, Math.PI, false);

    // Floating emoji above head with bobbing tween
    const emojiStartY = headCY - 44;
    const emojiText = this.add.text(charX, emojiStartY, this.avatar.emoji, {
      fontSize: '20px',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: emojiText,
      y: emojiStartY + 6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Name label beneath the character
    this.add.text(charX, feetY + 16, this.avatar.label, {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
  }

  // ---------------------------------------------------------------------------
  // 6 — Earned rewards panel
  // ---------------------------------------------------------------------------

  _drawRewardsPanel() {
    this.add.text(520, 80, 'Your Rewards', {
      fontSize: '13px',
      color: '#f5a623',
      fontStyle: 'bold',
      fontFamily: 'monospace',
    });

    const px = 510, py = 95, pw = 180, ph = 280;

    const gfx = this.add.graphics();
    gfx.fillStyle(0x0f1923, 1);
    gfx.fillRoundedRect(px, py, pw, ph, 8);
    gfx.lineStyle(1, 0x1e3a5f, 1);
    gfx.strokeRoundedRect(px, py, pw, ph, 8);

    const unlocked = ROOM_ITEMS.filter(item => item.unlocked);

    if (unlocked.length === 0) {
      this.add.text(px + pw / 2, py + ph / 2, 'Complete missions to\nearn room items!', {
        fontSize: '11px',
        color: '#555555',
        fontFamily: 'monospace',
        align: 'center',
      }).setOrigin(0.5);
    } else {
      unlocked.forEach((item, i) => {
        const rowY = py + 18 + i * 22;
        const dotColor = Phaser.Display.Color.HexStringToColor(item.color).color;
        this.add.circle(px + 14, rowY + 6, 5, dotColor);
        this.add.text(px + 26, rowY, item.name, {
          fontSize: '11px',
          color: '#ffffff',
          fontFamily: 'monospace',
        });
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 7 — Room items (physical objects placed in the room)
  // ---------------------------------------------------------------------------

  _drawRoomItems() {
    const gfx = this.add.graphics();
    const equippedIds = this.playerState.roomItems || [];

    for (const id of equippedIds) {
      const itemData = ROOM_ITEMS.find(r => r.id === id);
      if (!itemData) continue;

      switch (id) {
        case 'desk':         this._drawDesk(gfx);        break;
        case 'plant':        this._drawPlant(gfx);       break;
        case 'trophy_shelf': this._drawTrophy(gfx, 320, 318); break;
        default:             this._drawGenericItem(gfx, itemData); break;
      }
    }
  }

  _drawDesk(gfx) {
    const dx = 240, dy = 290;   // top-left; bottom aligns with floor at 340

    // Desk surface
    gfx.fillStyle(0x8b4513, 1);
    gfx.fillRect(dx, dy, 100, 50);

    // Legs
    gfx.fillStyle(0x6b3208, 1);
    gfx.fillRect(dx + 4,  dy + 44, 8, 8);
    gfx.fillRect(dx + 88, dy + 44, 8, 8);

    // Monitor body
    gfx.fillStyle(0x1a1a2e, 1);
    gfx.fillRect(dx + 26, dy - 36, 48, 36);

    // Screen surface (#4a90d9)
    gfx.fillStyle(0x4a90d9, 1);
    gfx.fillRect(dx + 28, dy - 34, 44, 32);

    // Code lines on screen
    gfx.fillStyle(0xffffff, 0.3);
    for (let i = 0; i < 4; i++) {
      gfx.fillRect(dx + 30, dy - 30 + i * 7, 16 + (i % 2) * 14, 3);
    }

    // Monitor stand
    gfx.fillStyle(0x555555, 1);
    gfx.fillRect(dx + 46, dy - 1, 8, 4);
  }

  _drawPlant(gfx) {
    const px = 470, py = 315;  // x shifted left so it's clear of the rewards panel

    // Pot rim + body
    gfx.fillStyle(0x6b3208, 1);
    gfx.fillRect(px - 18, py,     36, 5);   // rim
    gfx.fillStyle(0x8b4513, 1);
    gfx.fillRect(px - 15, py + 5, 30, 20);  // pot body

    // Leafy bush (radius 20 circle above pot)
    gfx.fillStyle(0x27ae60, 1);
    gfx.fillCircle(px, py - 8, 20);

    // Highlight dot
    gfx.fillStyle(0x2ecc71, 0.55);
    gfx.fillCircle(px - 7, py - 15, 10);
  }

  _drawTrophy(gfx, tx, ty) {
    gfx.fillStyle(0xf39c12, 1);
    gfx.fillTriangle(tx - 14, ty, tx + 14, ty, tx, ty - 24);
    gfx.fillRect(tx - 8, ty, 16, 7);
    gfx.fillRect(tx - 12, ty + 7, 24, 5);
  }

  _drawGenericItem(gfx, item) {
    const color = Phaser.Display.Color.HexStringToColor(item.color).color;
    gfx.fillStyle(color, 0.75);
    gfx.fillRoundedRect(380, 295, 40, 40, 6);
    this.add.text(400, 315, item.name.slice(0, 8), {
      fontSize: '8px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
  }

  // ---------------------------------------------------------------------------
  // 8 — Back button
  // ---------------------------------------------------------------------------

  _drawBackButton() {
    const bx = 65, by = 465, bw = 110, bh = 34;

    const gfx = this.add.graphics();
    gfx.fillStyle(0x2d1b4e, 1);
    gfx.fillRoundedRect(bx, by, bw, bh, 8);
    gfx.lineStyle(1.5, 0x9b59b6, 1);
    gfx.strokeRoundedRect(bx, by, bw, bh, 8);

    this.add.text(bx + bw / 2, by + bh / 2, '← Back to Map', {
      fontSize: '12px',
      color: '#9b59b6',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    gfx.setInteractive(
      new Phaser.Geom.Rectangle(bx, by, bw, bh),
      Phaser.Geom.Rectangle.Contains,
    );
    gfx.on('pointerdown', () => this.scene.start('MapScene'));
  }

  // ---------------------------------------------------------------------------
  // 9 — Customize button + overlay
  // ---------------------------------------------------------------------------

  _drawCustomizeButton(W) {
    const bw = 110, bh = 34;
    // Mirror of back button: right edge at W-65, so left = W-65-bw
    const bx = W - bw - 65, by = 465;

    const gfx = this.add.graphics();
    gfx.fillStyle(0xf5a623, 1);
    gfx.fillRoundedRect(bx, by, bw, bh, 8);

    this.add.text(bx + bw / 2, by + bh / 2, 'Customize 🎨', {
      fontSize: '12px',
      color: '#1a1a2e',
      fontStyle: 'bold',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    gfx.setInteractive(
      new Phaser.Geom.Rectangle(bx, by, bw, bh),
      Phaser.Geom.Rectangle.Contains,
    );
    gfx.on('pointerdown', () => this._showCustomizeOverlay(W));
  }

  _showCustomizeOverlay(W) {
    const H = this.scale.height;
    const overlay = [];

    // Semi-transparent backdrop (full screen)
    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.85);
    backdrop.fillRect(0, 0, W, H);
    overlay.push(backdrop);

    // "Coming Soon!" title
    overlay.push(
      this.add.text(W / 2, H / 2 - 60, 'Coming Soon!', {
        fontSize: '22px',
        color: '#f5a623',
        fontStyle: 'bold',
        fontFamily: 'monospace',
      }).setOrigin(0.5),
    );

    // Subtitle
    overlay.push(
      this.add.text(
        W / 2, H / 2 - 10,
        'Full customization unlocks after your\nfirst Tech Tower mission!',
        {
          fontSize: '13px',
          color: '#ffffff',
          fontFamily: 'monospace',
          align: 'center',
        },
      ).setOrigin(0.5),
    );

    // "Got it!" close button
    const btnW = 120, btnH = 40;
    const btnX = W / 2 - btnW / 2, btnY = H / 2 + 50;

    const closeGfx = this.add.graphics();
    closeGfx.fillStyle(0xf5a623, 1);
    closeGfx.fillRoundedRect(btnX, btnY, btnW, btnH, 8);
    overlay.push(closeGfx);

    overlay.push(
      this.add.text(W / 2, btnY + btnH / 2, 'Got it!', {
        fontSize: '14px',
        color: '#1a1a2e',
        fontStyle: 'bold',
        fontFamily: 'monospace',
      }).setOrigin(0.5),
    );

    closeGfx.setInteractive(
      new Phaser.Geom.Rectangle(btnX, btnY, btnW, btnH),
      Phaser.Geom.Rectangle.Contains,
    );
    closeGfx.on('pointerdown', () => overlay.forEach(obj => obj.destroy()));
  }

  // ---------------------------------------------------------------------------
  // 10 — Mentor hint bubble
  // ---------------------------------------------------------------------------

  _drawMentorHint(W) {
    const bw = 260, bh = 34;
    const bx = W / 2 - bw / 2, by = 462 - bh / 2;

    const gfx = this.add.graphics();
    gfx.fillStyle(0x1e3a5f, 1);
    gfx.fillRoundedRect(bx, by, bw, bh, 8);
    gfx.lineStyle(1.5, 0x4a90d9, 1);
    gfx.strokeRoundedRect(bx, by, bw, bh, 8);

    this.add.text(W / 2, 462, '🧑‍🏫 Head to Tech Tower to earn more rewards!', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
  }
}
