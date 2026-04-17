export default class TechHubScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TechHubScene' });
  }

  init(data) {
    this.incomingJourney = data?.journey || null;
    this.fromMission = data?.fromMission || false;
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
    // Scene state
    this.roomCode = null;
    this.isInRoom = false;
    this.soloMode = false;
    this.yourRole = null;
    this.friendSprites = {};
    this.missionBtn = null;
    this.roomPanelEl = null;

    const socket = window.socket;

    // Clean up HTML on scene shutdown/destroy
    this.events.on('shutdown', this.shutdown, this);
    this.events.on('destroy', this.shutdown, this);

    // -------------------------------------------------------------------------
    // 1. Background
    // -------------------------------------------------------------------------
    this.add.rectangle(400, 250, 800, 500, 0x0d1a1a).setOrigin(0.5);

    // -------------------------------------------------------------------------
    // 2. Title
    // -------------------------------------------------------------------------
    this.add.text(400, 40, 'Tech Hub', {
      fontSize: '22px',
      color: '#1abc9c',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    // -------------------------------------------------------------------------
    // 3. Player character
    // -------------------------------------------------------------------------
    const playerNameLabel = window.playerData?.name || '';
    this.add.text(340, 310, playerNameLabel, {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    if (window.playerData?.characterKey) {
      this.add.image(340, 370, 'player_char')
        .setScale(0.18)
        .setOrigin(0.5);
    } else {
      this.add.text(340, 370, 'Your character', {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Courier New',
      }).setOrigin(0.5);
    }

    // Player name
    const name = window.playerData?.name || '';
    this.add.text(340, 415, name + "'s Space", {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    // -------------------------------------------------------------------------
    // 4. HTML room panel overlay
    // -------------------------------------------------------------------------
    const roomPanel = document.createElement('div');
    roomPanel.id = 'room-panel';
    roomPanel.style.cssText = `
      position: absolute;
      top: 155px;
      left: 78px;
      width: 220px;
      background: #0f1923;
      border: 1.5px solid #1abc9c;
      border-radius: 10px;
      padding: 16px;
      font-family: Courier New, monospace;
      z-index: 50;
    `;
    roomPanel.innerHTML = `
      <div style="color:#1abc9c;font-size:13px;
        text-align:center;margin-bottom:12px;
        font-weight:bold;">
        Play with Friends
      </div>
      <hr style="border-color:#1e3a2e;margin-bottom:12px;">

      <button id="create-room-btn" style="
        width:100%;padding:10px;
        background:#9b59b6;color:white;
        border:none;border-radius:6px;
        font-family:Courier New;font-size:12px;
        cursor:pointer;margin-bottom:10px;">
        Create Room
      </button>

      <div style="color:#555;font-size:10px;
        text-align:center;margin-bottom:8px;">
        — or enter a code to join —
      </div>

      <input id="room-code-input" type="text"
        maxlength="4"
        placeholder="e.g. 7829"
        style="
          width:100%;padding:8px;
          background:#0d0d1a;color:#4a90d9;
          border:1.5px solid #4a90d9;
          border-radius:6px;
          font-family:Courier New;font-size:18px;
          text-align:center;letter-spacing:6px;
          box-sizing:border-box;margin-bottom:8px;
          outline:none;">

      <button id="join-room-btn" style="
        width:100%;padding:10px;
        background:#4a90d9;color:white;
        border:none;border-radius:6px;
        font-family:Courier New;font-size:12px;
        cursor:pointer;margin-bottom:10px;">
        Join Room
      </button>

      <div id="room-status" style="
        color:#555555;font-size:10px;
        text-align:center;min-height:16px;">
      </div>

      <div id="room-code-display" style="
        color:#f5a623;font-size:28px;
        text-align:center;font-weight:bold;
        display:none;margin:8px 0;
        letter-spacing:4px;">
      </div>

      <div id="room-info" style="
        color:#aaaaaa;font-size:10px;
        text-align:center;display:none;">
      </div>

      <hr style="border-color:#1e2a3a;margin:10px 0;">
      <button id="solo-play-btn" style="
        width:100%;padding:8px;
        background:#2d1b4e;color:#9b59b6;
        border:1.5px solid #9b59b6;border-radius:6px;
        font-family:Courier New;font-size:11px;
        cursor:pointer;">
        Play Solo (no friends)
      </button>
    `;
    document.body.appendChild(roomPanel);
    this.roomPanelEl = roomPanel;

    // -------------------------------------------------------------------------
    // 5. HTML button listeners
    // -------------------------------------------------------------------------
    document.getElementById('create-room-btn')
      .addEventListener('click', () => {
        console.log('Creating room...');
        socket.emit('createRoom', window.playerData);
      });

    document.getElementById('join-room-btn')
      .addEventListener('click', () => {
        const code = document.getElementById('room-code-input').value.trim();
        console.log('Joining room with code:', code);
        if (!code || code.length < 4) {
          document.getElementById('room-status').style.color = '#e94560';
          document.getElementById('room-status').textContent = 'Please enter a 4-digit code!';
          return;
        }
        socket.emit('joinRoom', {
          code: code,
          playerData: window.playerData,
        });
      });

    document.getElementById('solo-play-btn')
      .addEventListener('click', () => {
        console.log('Solo play clicked');
        this.soloMode = true;
        document.getElementById('room-status').style.color = '#f5a623';
        document.getElementById('room-status').textContent = 'Solo mode activated!';
        if (this.missionBtn) this.missionBtn.setVisible(true);
      });

    // -------------------------------------------------------------------------
    // 6. Mission button (Phaser — shown when room is ready)
    // -------------------------------------------------------------------------
    const missionBg = this.add.graphics();
    missionBg.fillStyle(0xf5a623, 1);
    missionBg.fillRoundedRect(180 - 90, 410, 180, 36, 8);

    this.missionBtn = this.add.text(180, 428, '▶  Start Mission!', {
      fontSize: '13px',
      color: '#1a1a2e',
      fontFamily: 'Courier New',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const missionZone = this.add.zone(180, 428, 180, 36)
      .setInteractive({ useHandCursor: true });

    missionZone.on('pointerdown', () => {
      if (this.roomCode) {
        socket.emit('startMission', {
          code: this.roomCode,
          soloMode: this.soloMode,
        });
      } else {
        this.scene.start('MissionBriefScene', {
          mission: 'code_caverns',
          roomCode: null,
          soloMode: true,
          playerCount: 1,
          yourRole: 'player1',
        });
      }
    });

    // Override setVisible to keep bg in sync
    const origSetVisible = this.missionBtn.setVisible.bind(this.missionBtn);
    this.missionBtn.setVisible = (v) => {
      origSetVisible(v);
      missionBg.setVisible(v);
      return this.missionBtn;
    };

    this.missionBtn.setVisible(false);

    // -------------------------------------------------------------------------
    // 7. Socket event handlers
    // -------------------------------------------------------------------------
    socket.on('roomCreated', ({ code }) => {
      console.log('roomCreated received:', code);
      this.roomCode = code;

      document.getElementById('room-code-display').style.display = 'block';
      document.getElementById('room-code-display').textContent = code;
      document.getElementById('room-info').style.display = 'block';
      document.getElementById('room-info').textContent = 'Share this code with friends!';
      document.getElementById('room-status').style.color = '#555555';
      document.getElementById('room-status').textContent = 'Waiting... (1/3)';
      document.getElementById('create-room-btn').style.display = 'none';
      document.getElementById('join-room-btn').style.display = 'none';
      document.getElementById('room-code-input').style.display = 'none';

      if (this.missionBtn) this.missionBtn.setVisible(false);

      const soloLink = document.createElement('div');
      soloLink.id = 'solo-link';
      soloLink.style.cssText = `
        color:#9b59b6;font-size:10px;
        text-align:center;cursor:pointer;
        text-decoration:underline;margin-top:8px;`;
      soloLink.textContent = 'No friends? Play Solo';
      soloLink.addEventListener('click', () => {
        console.log('Solo mode clicked, roomCode:', this.roomCode);

        if (this.roomCode) {
          socket.emit('activateSoloMode', { code: this.roomCode });
        } else {
          this.soloMode = true;
          document.getElementById('room-status').style.color = '#f5a623';
          document.getElementById('room-status').textContent = 'Solo mode! Ada is your co-pilot!';
          soloLink.style.display = 'none';
          if (this.missionBtn) this.missionBtn.setVisible(true);
        }
      });
      document.getElementById('room-panel').appendChild(soloLink);
    });

    socket.on('roomJoined', ({ code, players, yourRole, playerCount }) => {
      console.log('roomJoined received:', code, yourRole);
      this.roomCode = code;
      this.yourRole = yourRole;

      document.getElementById('room-status').style.color = '#1abc9c';
      document.getElementById('room-status').textContent =
        'Joined! You are ' + (yourRole || 'player').toUpperCase();
      document.getElementById('room-code-display').style.display = 'block';
      document.getElementById('room-code-display').textContent = code;
      document.getElementById('room-info').style.display = 'block';
      document.getElementById('room-info').textContent =
        (playerCount || Object.keys(players).length + 1) + ' players in room';
      document.getElementById('create-room-btn').style.display = 'none';
      document.getElementById('join-room-btn').style.display = 'none';
      document.getElementById('room-code-input').style.display = 'none';

      Object.entries(players).forEach(([id, data]) => {
        this.addFriendSprite(id, data);
      });

      if (this.missionBtn) this.missionBtn.setVisible(true);
    });

    socket.on('friendJoined', (data) => {
      console.log('friendJoined received:', data);
      this.addFriendSprite(data.id, data);

      const count = Object.keys(this.friendSprites).length;
      document.getElementById('room-status').style.color = '#00ff88';
      document.getElementById('room-status').textContent =
        count + ' friend' + (count > 1 ? 's' : '') +
        ' joined! (' + (count + 1) + '/3)';

      if (this.missionBtn) this.missionBtn.setVisible(true);
      this.showFriendJoinedBanner(data.name || 'A friend');
    });

    socket.on('friendLeft', ({ id }) => {
      console.log('friendLeft:', id);
      if (this.friendSprites[id]) {
        this.friendSprites[id].chip?.destroy();
        this.friendSprites[id].label?.destroy();
        delete this.friendSprites[id];
      }
      document.getElementById('room-status').style.color = '#e94560';
      document.getElementById('room-status').textContent = 'A friend disconnected...';
    });

    socket.on('soloModeActivated', () => {
      console.log('soloModeActivated received');
      this.soloMode = true;
      document.getElementById('room-status').style.color = '#f5a623';
      document.getElementById('room-status').textContent = 'Solo mode! Ada is your co-pilot!';
      const soloLink = document.getElementById('solo-link');
      if (soloLink) soloLink.style.display = 'none';
      if (this.missionBtn) this.missionBtn.setVisible(true);
    });

    socket.on('roomError', (msg) => {
      console.log('roomError received:', msg);
      document.getElementById('room-status').style.color = '#e94560';
      document.getElementById('room-status').textContent = msg;
    });

    socket.on('missionStarting', ({ mission, playerCount, soloMode }) => {
      console.log('missionStarting received');
      if (this.roomPanelEl) this.roomPanelEl.remove();
      this.scene.start('MissionBriefScene', {
        mission,
        roomCode: this.roomCode,
        soloMode: soloMode || this.soloMode,
        playerCount: playerCount || 1,
        yourRole: this.yourRole || 'player1',
      });
    });

    // -------------------------------------------------------------------------
    // 8. Journey button + data loading
    // -------------------------------------------------------------------------
    try {
      const saved = JSON.parse(localStorage.getItem('codebuilder_journey') || '{}');
      this.journeyData = { ...saved, ...(this.incomingJourney || {}) };
      if (this.incomingJourney) {
        localStorage.setItem('codebuilder_journey', JSON.stringify(this.journeyData));
      }
    } catch (e) {
      this.journeyData = this.incomingJourney || {};
    }

    const hasJourney = Object.keys(this.journeyData).length > 0;

    const jBg = this.add.graphics();
    jBg.fillStyle(0x1e1035, 1);
    jBg.fillRoundedRect(620, 455, 160, 32, 6);
    jBg.lineStyle(1, 0x9b59b6, 1);
    jBg.strokeRoundedRect(620, 455, 160, 32, 6);
    jBg.setVisible(hasJourney);

    const jBtn = this.add.text(700, 471, '📊 My Journey', {
      fontSize: '11px',
      color: '#9b59b6',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);
    jBtn.setVisible(hasJourney);

    if (hasJourney) {
      const jZone = this.add.zone(700, 471, 160, 32).setInteractive({ useHandCursor: true });
      jZone.on('pointerdown', () => this.showJourneyPopup(this.journeyData));
    }

    if (this.fromMission && hasJourney) {
      this.time.delayedCall(900, () => this.showJourneyPopup(this.journeyData));
    }

    // -------------------------------------------------------------------------
    // 9. Back button
    // -------------------------------------------------------------------------
    const backBg = this.add.graphics();
    backBg.fillStyle(0x0f2d2d, 1);
    backBg.fillRoundedRect(10, 455, 100, 32, 6);
    backBg.lineStyle(1, 0x1abc9c, 1);
    backBg.strokeRoundedRect(10, 455, 100, 32, 6);

    this.add.text(60, 471, '← Back', {
      fontSize: '12px',
      color: '#1abc9c',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    const backZone = this.add.zone(60, 471, 100, 32)
      .setInteractive({ useHandCursor: true });
    backZone.on('pointerdown', () => {
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('friendJoined');
      socket.off('friendLeft');
      socket.off('roomError');
      socket.off('soloModeActivated');
      socket.off('missionStarting');
      this.scene.start('MapScene');
    });
  }

  // ---------------------------------------------------------------------------
  // Helper: add a small friend avatar chip
  // ---------------------------------------------------------------------------
  addFriendSprite(id, data) {
    if (this.friendSprites[id]) {
      this.friendSprites[id].destroy();
    }

    const x = 460;
    const y = 370;

    const characterKey = data.characterKey;
    const complexion = data.complexion;

    // Add team label and divider once, the first time a friend is shown
    if (!this.teamLabelAdded) {
      this.teamLabelAdded = true;

      this.add.text(400, 330, 'Your Team', {
        fontSize: '12px',
        color: '#aaaaaa',
        fontFamily: 'Courier New',
      }).setOrigin(0.5);

      this.add.text(400, 370, '+', {
        fontSize: '28px',
        color: '#f5a623',
        fontFamily: 'Courier New',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }

    if (characterKey && complexion) {
      const imgKey = 'friend_' + id;

      if (!this.textures.exists(imgKey)) {
        this.load.image(
          imgKey,
          'assets/characters/' + complexion +
          '/' + characterKey + '.png'
        );
        this.load.once('complete', () => {
          const sprite = this.add.image(x, y, imgKey)
            .setScale(0.18)
            .setOrigin(0.5);

          const nameTag = this.add.text(x, y + 45,
            data.name || 'Friend', {
            fontSize: '10px',
            color: '#1abc9c',
            fontFamily: 'Courier New',
          }).setOrigin(0.5);

          const container = this.add.container(0, 0, [sprite, nameTag]);
          this.friendSprites[id] = container;
        });
        this.load.start();
      } else {
        const sprite = this.add.image(x, y, imgKey)
          .setScale(0.18)
          .setOrigin(0.5);

        const nameTag = this.add.text(x, y + 45,
          data.name || 'Friend', {
          fontSize: '10px',
          color: '#1abc9c',
          fontFamily: 'Courier New',
        }).setOrigin(0.5);

        const container = this.add.container(0, 0, [sprite, nameTag]);
        this.friendSprites[id] = container;
      }
    } else {
      const circle = this.add.circle(x, y, 28, 0x9b59b6);
      const initial = this.add.text(x, y,
        (data.name || 'F')[0].toUpperCase(), {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Courier New',
      }).setOrigin(0.5);

      const nameTag = this.add.text(x, y + 40,
        data.name || 'Friend', {
        fontSize: '10px',
        color: '#9b59b6',
        fontFamily: 'Courier New',
      }).setOrigin(0.5);

      const container = this.add.container(0, 0, [circle, initial, nameTag]);
      this.friendSprites[id] = container;
    }
  }

  // ---------------------------------------------------------------------------
  // Helper: brief banner when a friend joins
  // ---------------------------------------------------------------------------
  showFriendJoinedBanner(friendName) {
    const banner = this.add.text(400, 80,
      friendName + ' joined the room!', {
      fontSize: '13px',
      color: '#00ff88',
      fontFamily: 'Courier New',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: banner,
      alpha: { from: 0, to: 1 },
      duration: 300,
      yoyo: true,
      hold: 1500,
      onComplete: () => banner.destroy(),
    });
  }

  // ---------------------------------------------------------------------------
  // Journey popup
  // ---------------------------------------------------------------------------
  showJourneyPopup(journey) {
    const els = [];

    const ov = this.add.graphics().setDepth(40);
    ov.fillStyle(0x000000, 0.75);
    ov.fillRect(0, 0, 800, 500);
    els.push(ov);

    const panel = this.add.graphics().setDepth(41);
    panel.fillStyle(0x0a0a1a, 0.98);
    panel.fillRoundedRect(160, 60, 480, 380, 14);
    panel.lineStyle(2, 0x9b59b6, 1);
    panel.strokeRoundedRect(160, 60, 480, 380, 14);
    els.push(panel);

    els.push(this.add.text(400, 90, '📊 Your Learning Journey', {
      fontSize: '17px', color: '#9b59b6',
      fontFamily: 'Courier New', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(42));

    els.push(this.add.text(400, 118, 'Code Caverns — For Loops', {
      fontSize: '11px', color: '#555555', fontFamily: 'Courier New',
    }).setOrigin(0.5).setDepth(42));

    const levels = [
      { key: 1, label: 'Level 1 — range(n)' },
      { key: 2, label: 'Level 2 — range(start, stop)' },
      { key: 3, label: 'Level 3 — range(start, stop, step)' },
    ];

    const badgeFor = (mastery) => {
      if (mastery >= 80) return { text: 'Mastered! 🌟', color: '#00ff88' };
      if (mastery >= 50) return { text: 'Good progress! 💪', color: '#f5a623' };
      if (mastery > 0)  return { text: 'Keep practicing! 🔁', color: '#e94560' };
      return { text: 'Not yet attempted', color: '#444444' };
    };

    const barColor = (mastery) => {
      if (mastery >= 80) return 0x00ff88;
      if (mastery >= 50) return 0xf5a623;
      return 0xe94560;
    };

    let totalMastery = 0;
    let completedCount = 0;

    levels.forEach((lvl, i) => {
      const data = journey[lvl.key];
      const mastery = data?.mastery || 0;
      const completed = data?.completed || false;
      if (completed) { totalMastery += mastery; completedCount++; }

      const rowY = 155 + i * 80;
      const barX = 180;
      const barW = 370;
      const barH = 18;

      els.push(this.add.text(barX, rowY, lvl.label, {
        fontSize: '12px', color: '#ffffff', fontFamily: 'Courier New',
      }).setDepth(42));

      // bar track
      const track = this.add.graphics().setDepth(42);
      track.fillStyle(0x1a1a2e, 1);
      track.fillRoundedRect(barX, rowY + 18, barW, barH, 4);
      els.push(track);

      // bar fill (animated)
      const fill = this.add.graphics().setDepth(43);
      els.push(fill);
      const targetW = Math.round((mastery / 100) * barW);

      if (completed && targetW > 0) {
        let drawn = 0;
        const step = Math.ceil(targetW / 30);
        const fillTimer = this.time.addEvent({
          delay: 16 + i * 120,
          repeat: Math.ceil(targetW / step),
          callback: () => {
            drawn = Math.min(drawn + step, targetW);
            fill.clear();
            fill.fillStyle(barColor(mastery), 1);
            fill.fillRoundedRect(barX, rowY + 18, drawn, barH, 4);
          }
        });
        els.push({ destroy: () => fillTimer.remove() });
      }

      const badge = badgeFor(completed ? mastery : -1);
      els.push(this.add.text(barX + barW + 10, rowY + 27,
        completed ? badge.text : 'Not yet attempted', {
        fontSize: '10px', color: completed ? badge.color : '#444444',
        fontFamily: 'Courier New',
      }).setOrigin(0, 0.5).setDepth(42));
    });

    // Overall bar
    const overallMastery = completedCount > 0
      ? Math.round(totalMastery / completedCount)
      : 0;

    const ovY = 400;
    els.push(this.add.graphics().setDepth(41).fillStyle(0x0f0f2a, 1)
      .fillRoundedRect(170, ovY - 10, 460, 36, 8));

    els.push(this.add.text(180, ovY + 8, 'Overall Mastery', {
      fontSize: '11px', color: '#aaaaaa', fontFamily: 'Courier New',
    }).setOrigin(0, 0.5).setDepth(42));

    const ovTrack = this.add.graphics().setDepth(42);
    ovTrack.fillStyle(0x1a1a2e, 1);
    ovTrack.fillRoundedRect(310, ovY, 240, 14, 4);
    els.push(ovTrack);

    const ovFill = this.add.graphics().setDepth(43);
    els.push(ovFill);
    if (overallMastery > 0) {
      let drawn = 0;
      const targetW = Math.round((overallMastery / 100) * 240);
      const step = Math.ceil(targetW / 30);
      const ovTimer = this.time.addEvent({
        delay: 400,
        repeat: Math.ceil(targetW / step),
        callback: () => {
          drawn = Math.min(drawn + step, targetW);
          ovFill.clear();
          ovFill.fillStyle(barColor(overallMastery), 1);
          ovFill.fillRoundedRect(310, ovY, drawn, 14, 4);
        }
      });
      els.push({ destroy: () => ovTimer.remove() });
    }

    // Close button
    const closeBg = this.add.graphics().setDepth(42);
    closeBg.fillStyle(0x1e1035, 1);
    closeBg.fillRoundedRect(560, 62, 68, 28, 6);
    closeBg.lineStyle(1, 0x9b59b6, 1);
    closeBg.strokeRoundedRect(560, 62, 68, 28, 6);
    els.push(closeBg);

    const closeBtn = this.add.text(594, 76, '✕ Close', {
      fontSize: '11px', color: '#9b59b6', fontFamily: 'Courier New',
    }).setOrigin(0.5).setDepth(43);
    els.push(closeBtn);

    const closeZone = this.add.zone(594, 76, 68, 28).setInteractive({ useHandCursor: true }).setDepth(43);
    closeZone.on('pointerdown', () => els.forEach(e => e?.destroy()));
    els.push(closeZone);
  }

  // ---------------------------------------------------------------------------
  // Cleanup: remove HTML panel when scene stops
  // ---------------------------------------------------------------------------
  shutdown() {
    const panel = document.getElementById('room-panel');
    if (panel) panel.remove();
  }
}
