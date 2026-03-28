import { savePlayer, loadPlayer } from '../data/gameData.js';

export default class TowerScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TowerScene' });
    this.minionsDefeated = 0;
    this.puzzlesSolved = 0;
    this.gadgetCooldown = false;
    this.puzzle1Solved = false;
    this.puzzle2Solved = false;
    this.missionComplete = false;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.playerState = loadPlayer();

    // Visuals: Background and Tower
    this.add.rectangle(W / 2, H / 2, W, H, 0x2c3e50);
    this.add.rectangle(W / 2, H / 2, W - 200, H, 0x7f8c8d);

    // Floors/Platforms
    const floors = [
      { y: 500, label: 'Floor 1 — Variables' },
      { y: 380, label: 'Floor 2 — Loops' },
      { y: 260, label: 'Floor 3 — Functions' },
      { y: 140, label: 'Floor 4 — The Summit' },
    ];

    this.platforms = this.physics.add.staticGroup();
    floors.forEach(f => {
      const plat = this.add.rectangle(W / 2, f.y + 10, W - 200, 20, 0xbdc3c7);
      this.platforms.add(plat);
      this.add.text(110, f.y - 6, f.label, { fontSize: '12px', fontFamily: 'monospace', color: '#ecf0f1' });
    });

    // Player — simple colored rectangle with arcade physics
    this.player = this.add.rectangle(100, 420, 36, 48, 0xff6b9d);
    this.physics.add.existing(this.player);
    this.player.body.setBounce(0.1);
    this.player.body.setCollideWorldBounds(true);
    this.physics.world.gravity.y = 500;

    // Collider so player lands on platforms
    this.physics.add.collider(this.player, this.platforms);

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({ left: 'A', right: 'D', up: 'W' });

    // Minions and Gadgets (Existing Logic)
    this._setupMinions();
    this._setupGadgetButton();

    // HUD and Exit
    this.minionText = this.add.text(680, 20, `Minions: 0`, { fontSize: '14px', color: '#fff' });
    this.puzzleText = this.add.text(680, 40, `Puzzles: 0/2`, { fontSize: '14px', color: '#fff' });
    this.add.text(W / 2, 30, '== The Code Tower ==', { fontSize: '22px', fontStyle: 'bold', color: '#ecf0f1' }).setOrigin(0.5);

    this.setupCodePanel();

    // --- 1. Puzzle Zones ---
    // PUZZLE 1: Broken Bridge (x: 430, y: 250)
    this.bridgeParts = [
      this.add.rectangle(370, 250, 40, 10, 0x8b4513),
      this.add.rectangle(490, 250, 40, 10, 0x8b4513)
    ];
    this.p1ZoneGfx = this.add.circle(430, 250, 20, 0xe94560, 0.3);
    this.tweens.add({ targets: this.p1ZoneGfx, alpha: 0.1, duration: 800, yoyo: true, repeat: -1 });
    this.p1Label = this.add.text(430, 220, "! FIX ME", { fontSize: '11px', color: '#e94560', fontFamily: 'monospace' }).setOrigin(0.5);

    // PUZZLE 2: Locked Door (x: 700, y: 105)
    this.doorGfx = this.add.container(700, 105);
    const doorRect = this.add.rectangle(0, 0, 30, 50, 0x8b0000);
    const lockShape = this.add.rectangle(0, 0, 10, 10, 0xe74c3c); // Simple lock rep
    this.doorGfx.add([doorRect, lockShape]);
    this.p2ZoneGfx = this.add.circle(700, 105, 20, 0xe94560, 0.3);
    this.tweens.add({ targets: this.p2ZoneGfx, alpha: 0.1, duration: 800, yoyo: true, repeat: -1 });
    this.p2Label = this.add.text(700, 75, "! LOCKED", { fontSize: '11px', color: '#e94560', fontFamily: 'monospace' }).setOrigin(0.5);

    // --- 4. Socket Listeners ---
    if (window.socket) {
      window.socket.on('puzzleEffect', (data) => {
        if (data.puzzle === 'bridge' && !this.puzzle1Solved) {
          this.puzzle1Solved = true;
          this.fixBridge();
          this.puzzlesSolved++;
          this.puzzleText.setText(`Puzzles: ${this.puzzlesSolved}/2`);
          this.showCelebration('Partner fixed the bridge! 🌉');
        }
        if (data.puzzle === 'door' && !this.puzzle2Solved) {
          this.puzzle2Solved = true;
          this.openDoor();
          this.puzzlesSolved++;
          this.puzzleText.setText(`Puzzles: ${this.puzzlesSolved}/2`);
          this.showCelebration('Partner unlocked the door! 🚪');
        }
      });

      window.socket.on('missionComplete', (data) => {
        if (data.player !== window.playerData?.name) {
          this.showCelebration(`🎉 ${data.player} completed the mission!`);
        }
      });
    }
  }

  // --- 2. Movement + Proximity Detection ---
  update() {
    // Left / right movement
    this.player.body.setVelocityX(0);
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.body.setVelocityX(-200);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.body.setVelocityX(200);
    }
    // Jump
    if ((this.cursors.up.isDown || this.wasd.up.isDown) && this.player.body.blocked.down) {
      this.player.body.setVelocityY(-400);
    }

    const p1Dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, 430, 250);
    const p2Dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, 700, 105);

    const panel = document.getElementById('code-panel');
    const editor = document.getElementById('code-editor');

    if (p1Dist < 45 && !this.puzzle1Solved && panel?.classList.contains('hidden')) {
      panel.classList.remove('hidden');
      editor.value = "// Fix the loop - bridge needs 3 repairs!\nfor (let i = 0; i < ???; i++) {\n  repairBridge();\n}";
      this.activePuzzle = 'bridge';
    }

    if (p2Dist < 45 && !this.puzzle2Solved && panel?.classList.contains('hidden')) {
      panel.classList.remove('hidden');
      editor.value = "// Fix the condition - power is 80, threshold is 50\nlet power = 80;\nif (power ??? 50) {\n  openDoor();\n}";
      this.activePuzzle = 'door';
    }
  }

  // --- 3. Methods ---
  fixBridge() {
    this.bridgeParts.forEach(part => part.setFillStyle(0x2ecc71));
    this.p1ZoneGfx.destroy();
    this.p1Label.destroy();
    
    const floatText = this.add.text(430, 230, "Bridge Fixed! 🌉", { fontSize: '14px', color: '#00ff88', fontStyle: 'bold' }).setOrigin(0.5);
    this.tweens.add({ targets: floatText, y: 200, alpha: 0, duration: 2000, onComplete: () => floatText.destroy() });
    this.showCelebration("Bridge Repaired! 🌉");
  }

  openDoor() {
    this.tweens.add({ targets: this.doorGfx, scaleX: 0, duration: 500 });
    this.p2ZoneGfx.destroy();
    this.p2Label.destroy();

    const floatText = this.add.text(700, 90, "Door Unlocked! 🚪", { fontSize: '14px', color: '#00ff88', fontStyle: 'bold' }).setOrigin(0.5);
    this.tweens.add({ targets: floatText, y: 60, alpha: 0, duration: 2000, onComplete: () => floatText.destroy() });
    this.showCelebration("Door Unlocked! 🚪");
  }

  showCelebration(message) {
    const banner = this.add.container(400, 200).setScale(0.5);
    const bg = this.add.graphics();
    bg.fillStyle(0x0f3460, 1);
    bg.lineStyle(2, 0xf5a623, 1);
    bg.fillRoundedRect(-200, -35, 400, 70, 12);
    bg.strokeRoundedRect(-200, -35, 400, 70, 12);

    const title = this.add.text(0, -10, message, { fontSize: '20px', color: '#f5a623', fontStyle: 'bold' }).setOrigin(0.5);
    const sub = this.add.text(0, 15, "Team Codebuilders! 🎉", { fontSize: '13px', color: '#ffffff' }).setOrigin(0.5);
    
    banner.add([bg, title, sub]);
    this.tweens.add({ targets: banner, scale: 1.0, duration: 400, ease: 'Back.easeOut' });
    this.time.delayedCall(3000, () => banner.destroy());
  }

  checkMissionComplete() {
    if (this.minionsDefeated >= 3 && this.puzzlesSolved >= 2 && !this.missionComplete) {
      this.missionComplete = true;

      // Update Player State
      this.playerState.gadgets.push('robot');
      this.playerState.roomItems.push('trophy_shelf');
      this.playerState.completedMissions.push('tech_tower_1');
      savePlayer(this.playerState);

      this.time.delayedCall(1000, () => {
        const overlay = this.add.container(0, 0).setDepth(100);
        overlay.add(this.add.rectangle(400, 300, 800, 600, 0x0a0a1a, 0.9));
        
        overlay.add(this.add.text(400, 160, "🎉 Mission Complete!", { fontSize: '28px', color: '#f5a623', fontStyle: 'bold' }).setOrigin(0.5));
        overlay.add(this.add.text(400, 210, "Tech Tower Glitch... FIXED!", { fontSize: '16px', color: '#fff' }).setOrigin(0.5));
        overlay.add(this.add.text(400, 260, "You earned:", { fontSize: '13px', color: '#aaaaaa' }).setOrigin(0.5));
        overlay.add(this.add.text(400, 285, "✨ Debug Bot unlocked!", { fontSize: '13px', color: '#2ecc71' }).setOrigin(0.5));
        overlay.add(this.add.text(400, 308, "🏆 Trophy added to your room!", { fontSize: '13px', color: '#2ecc71' }).setOrigin(0.5));

        // Return Button
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0xf5a623, 1);
        btnBg.fillRoundedRect(300, 336, 200, 48, 10);
        const btnTxt = this.add.text(400, 360, "Return to City", { fontSize: '15px', color: '#1a1a2e', fontStyle: 'bold' }).setOrigin(0.5);
        
        btnBg.setInteractive(new Phaser.Geom.Rectangle(300, 336, 200, 48), Phaser.Geom.Rectangle.Contains);
        btnBg.on('pointerdown', () => this.scene.start('MapScene'));
        overlay.add([btnBg, btnTxt]);
      });

      if (window.socket) {
        window.socket.emit('missionComplete', { player: window.playerData?.name });
      }
    }
  }

  // Helper placeholders for existing logic
  _setupMinions() { /* ... implementation from previous prompt ... */ }
  _setupGadgetButton() { /* ... implementation from previous prompt ... */ }
  setupCodePanel() { /* ... implementation from previous prompt ... */ }
}