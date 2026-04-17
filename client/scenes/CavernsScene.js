export default class CavernsScene extends Phaser.Scene {
  constructor() { super('CavernsScene') }

  init(data) {
    this.roomCode = data?.roomCode || null
    this.soloMode = data?.soloMode || true
    this.yourRole = data?.yourRole || 'player1'
  }

  preload() {
    this.load.image('ada', 'assets/npc/ada.png')
    this.load.image('caverns_bg', 'assets/world/caverns_bg.png')
    this.load.image('minion', 'assets/characters/minion.png')
    if (window.playerData?.characterKey) {
      this.load.image('player_char',
        'assets/characters/' +
        window.playerData.complexion + '/' +
        window.playerData.characterKey + '.png')
    }
  }

  create() {
    this.currentLevel = 1
    this.score = 0
    this.lives = 3
    this.playerAlive = true
    this.gameActive = false
    this.isPuzzleOpen = false
    this.minionSprites = []
    this.minionData = []
    this.teachElements = []
    this.puzzleElements = []
    this.journey = {}

    this.add.image(400, 250, 'caverns_bg')
      .setDisplaySize(800, 500)

    const overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.35)
    overlay.fillRect(0, 0, 800, 500)

    this.createHUD()
    this.showLevelTeaching(1)
  }

  createHUD() {
    const hud = this.add.graphics().setDepth(30)
    hud.fillStyle(0x0a0a1a, 0.92)
    hud.fillRect(0, 0, 800, 40)
    hud.lineStyle(1, 0x4a90d9, 0.5)
    hud.strokeRect(0, 0, 800, 40)

    this.levelText = this.add.text(12, 20, 'Level 1: range(n)', {
      fontSize: '13px',
      color: '#4a90d9',
      fontFamily: 'Courier New',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(31)

    this.scoreText = this.add.text(400, 20, 'Score: 0', {
      fontSize: '12px',
      color: '#f5a623',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setDepth(31)

    this.livesText = this.add.text(650, 20, 'Lives: 3', {
      fontSize: '12px',
      color: '#e94560',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setDepth(31)

    const exit = this.add.text(760, 20, '← Exit', {
      fontSize: '11px',
      color: '#9b59b6',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setDepth(31)
    exit.setInteractive({ useHandCursor: true })
    exit.on('pointerdown', () => {
      this.cleanupLevel()
      this.scene.start('MapScene')
    })
  }

  showLevelTeaching(level) {
    this.gameActive = false
    this.puzzleElements?.forEach(e => e?.destroy())
    this.puzzleElements = []
    this.teachElements?.forEach(e => e?.destroy())
    this.teachElements = []
    this.playerSprite?.destroy()
    this.playerSprite = null
    this.playerLabel?.destroy()
    this.playerLabel = null
    this.cannonGraphic?.destroy()
    this.cannonGraphic = null
    this.cleanupMinions()
    this.teachElements = []

    const lessons = {
      1: {
        title: 'Level 1 — range(n)',
        subtitle: 'One parameter: how many times',
        syntax: 'for i in range(n):',
        explanation:
          'range(3) counts: 0, 1, 2\n' +
          'That is 3 repetitions!\n\n' +
          'for i in range(3):\n' +
          '    fire_cannonball()\n\n' +
          '→ fires exactly 3 times',
        mission:
          'Minions are chasing you!\n' +
          'Complete the loop to fire\n' +
          'the right number of shots!\n' +
          'Wrong answer loses a life!',
        ada:
          'Hi Codebuilder! A for loop repeats ' +
          'code. range(n) tells Python how many ' +
          'times. range(3) runs 3 times — ' +
          'i becomes 0, 1, then 2. ' +
          'Too few shots and minions escape. ' +
          'Choose wisely — you only have 3 lives!'
      },
      2: {
        title: 'Level 2 — range(start, stop)',
        subtitle: 'Two parameters: start and stop',
        syntax: 'for i in range(start, stop):',
        explanation:
          'range(1, 4) counts: 1, 2, 3\n' +
          'Stops BEFORE 4!\n\n' +
          'for i in range(2, 6):\n' +
          '    fire_cannonball()\n\n' +
          '→ i is 2,3,4,5 — fires 4 times',
        mission:
          'More minions, more speed!\n' +
          'Now TWO numbers in range.\n' +
          'Remember: stops BEFORE\n' +
          'the second number!',
        ada:
          'Great work! Now range takes two ' +
          'numbers. range(1, 4) starts at 1 ' +
          'and stops BEFORE 4, giving 1,2,3. ' +
          'Always subtract start from stop ' +
          'to count the shots. ' +
          'Minions are faster now — stay sharp!'
      },
      3: {
        title: 'Level 3 — range(start, stop, step)',
        subtitle: 'Three parameters: start, stop, step',
        syntax: 'for i in range(start, stop, step):',
        explanation:
          'range(0, 9, 3) counts: 0, 3, 6\n' +
          'Jumps by 3 each time!\n\n' +
          'for i in range(0, 8, 2):\n' +
          '    fire_cannonball()\n\n' +
          '→ i is 0,2,4,6 — fires 4 times',
        mission:
          'FINAL LEVEL! Elite minions!\n' +
          'Three numbers now.\n' +
          'The STEP controls the jump.\n' +
          'Think before you fire!',
        ada:
          'Final level! Three numbers now. ' +
          'The third is the STEP — how much ' +
          'i jumps each time. range(0,9,3) ' +
          'gives 0,3,6 — only 3 shots even ' +
          'though 9 is the stop! ' +
          'Count carefully. You can do this!'
      }
    }

    const L = lessons[level]
    this.levelText.setText(L.title)

    const bg = this.add.graphics().setDepth(15)
    bg.fillStyle(0x0a0a1a, 0.96)
    bg.fillRoundedRect(40, 48, 720, 420, 14)
    bg.lineStyle(2.5, 0xf5a623, 1)
    bg.strokeRoundedRect(40, 48, 720, 420, 14)
    this.teachElements.push(bg)

    const ada = this.add.image(110, 420, 'ada')
      .setScale(0.22).setOrigin(0.5, 1).setDepth(16)
    this.tweens.add({
      targets: ada, y: 415, duration: 1800,
      yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut'
    })
    this.teachElements.push(ada)

    const title = this.add.text(420, 72, L.title, {
      fontSize: '19px', color: '#f5a623',
      fontFamily: 'Courier New', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(16)
    this.teachElements.push(title)

    const sub = this.add.text(420, 97, L.subtitle, {
      fontSize: '12px', color: '#aaaaaa',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setDepth(16)
    this.teachElements.push(sub)

    const bubbleBg = this.add.graphics().setDepth(16)
    bubbleBg.fillStyle(0x0f1923, 1)
    bubbleBg.fillRoundedRect(155, 112, 570, 78, 8)
    bubbleBg.lineStyle(1.5, 0xf5a623, 0.5)
    bubbleBg.strokeRoundedRect(155, 112, 570, 78, 8)
    this.teachElements.push(bubbleBg)

    const adaLbl = this.add.text(168, 120, 'Ada says:', {
      fontSize: '10px', color: '#aaaaaa',
      fontFamily: 'Courier New'
    }).setDepth(17)
    this.teachElements.push(adaLbl)

    this.adaDialogText = this.add.text(168, 134, '', {
      fontSize: '11px', color: '#ffffff',
      fontFamily: 'Courier New',
      wordWrap: { width: 545 }, lineSpacing: 3
    }).setDepth(17)
    this.teachElements.push(this.adaDialogText)
    this.typeText(L.ada)

    const synBg = this.add.graphics().setDepth(16)
    synBg.fillStyle(0x050a0f, 1)
    synBg.fillRoundedRect(155, 200, 370, 34, 6)
    synBg.lineStyle(1.5, 0x00ff88, 1)
    synBg.strokeRoundedRect(155, 200, 370, 34, 6)
    this.teachElements.push(synBg)

    const synTxt = this.add.text(168, 217, L.syntax, {
      fontSize: '14px', color: '#00ff88',
      fontFamily: 'Courier New', fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(17)
    this.teachElements.push(synTxt)

    const explBg = this.add.graphics().setDepth(16)
    explBg.fillStyle(0x050a0f, 0.9)
    explBg.fillRoundedRect(155, 244, 340, 185, 8)
    explBg.lineStyle(1, 0x4a90d9, 0.4)
    explBg.strokeRoundedRect(155, 244, 340, 185, 8)
    this.teachElements.push(explBg)

    const explTxt = this.add.text(168, 256, L.explanation, {
      fontSize: '12px', color: '#ffffff',
      fontFamily: 'Courier New', lineSpacing: 5
    }).setDepth(17)
    this.teachElements.push(explTxt)

    const misBg = this.add.graphics().setDepth(16)
    misBg.fillStyle(0x1a0a0a, 0.95)
    misBg.fillRoundedRect(510, 244, 220, 130, 8)
    misBg.lineStyle(1.5, 0xe94560, 0.8)
    misBg.strokeRoundedRect(510, 244, 220, 130, 8)
    this.teachElements.push(misBg)

    const misLbl = this.add.text(620, 256, 'YOUR MISSION', {
      fontSize: '10px', color: '#e94560',
      fontFamily: 'Courier New', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(17)
    this.teachElements.push(misLbl)

    const misTxt = this.add.text(522, 270, L.mission, {
      fontSize: '11px', color: '#ffcccc',
      fontFamily: 'Courier New', lineSpacing: 4
    }).setDepth(17)
    this.teachElements.push(misTxt)

    const btnBg = this.add.graphics().setDepth(16)
    btnBg.fillStyle(0xf5a623, 1)
    btnBg.fillRoundedRect(510, 388, 220, 44, 8)
    this.teachElements.push(btnBg)

    const btnTxt = this.add.text(620, 410,
      'Start Level ' + level + '! →', {
      fontSize: '14px', color: '#1a1a2e',
      fontFamily: 'Courier New', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(17)
    this.teachElements.push(btnTxt)

    const btnHit = this.add.rectangle(
      620, 410, 220, 44, 0xffffff, 0).setDepth(17)
    btnHit.setInteractive({ useHandCursor: true })
    btnHit.on('pointerover', () => {
      btnBg.clear()
      btnBg.fillStyle(0xffd700, 1)
      btnBg.fillRoundedRect(510, 388, 220, 44, 8)
    })
    btnHit.on('pointerout', () => {
      btnBg.clear()
      btnBg.fillStyle(0xf5a623, 1)
      btnBg.fillRoundedRect(510, 388, 220, 44, 8)
    })
    btnHit.on('pointerdown', () => {
      this.clearTeaching()
      this.startLevel(level)
    })
    this.teachElements.push(btnHit)

    const skip = this.add.text(755, 458, 'skip >>', {
      fontSize: '10px', color: '#333333',
      fontFamily: 'Courier New'
    }).setOrigin(1).setDepth(17)
    skip.setInteractive({ useHandCursor: true })
    skip.on('pointerdown', () => {
      this.clearTeaching()
      this.startLevel(level)
    })
    this.teachElements.push(skip)
  }

  typeText(text) {
    if (this.typeTimer) this.typeTimer.remove()
    this.adaDialogText?.setText('')
    let i = 0
    this.typeTimer = this.time.addEvent({
      delay: 18,
      repeat: text.length - 1,
      callback: () => {
        if (this.adaDialogText)
          this.adaDialogText.text += text[i++]
      }
    })
  }

  clearTeaching() {
    if (this.typeTimer) this.typeTimer.remove()
    this.teachElements?.forEach(e => e?.destroy())
    this.teachElements = []
  }

  startLevel(level) {
    this.currentLevel = level
    this.gameActive = true
    this.isPuzzleOpen = false
    this.currentWave = 0
    this.levelText.setText(
      'Level ' + level +
      (level === 1 ? ': range(n)' :
       level === 2 ? ': range(start,stop)' :
       ': range(start,stop,step)'))

    const cfg = {
      1: { waves: 2, minions: 3, speed: 55 },
      2: { waves: 2, minions: 4, speed: 75 },
      3: { waves: 2, minions: 3, speed: 95 }
    }
    this.config = cfg[level]
    this.totalWaves = this.config.waves

    this.journey[level] = { attempts: 0, livesLost: 0, completed: false, mastery: 0 }

    this.createPlayerSprite()
    this.createCannon()
    this.startNextWave()
  }

  createPlayerSprite() {
    this.playerSprite?.destroy()
    this.playerLabel?.destroy()
    this.playerPos = { x: 65, y: 250 }

    if (window.playerData?.characterKey) {
      this.playerSprite = this.add.image(65, 250, 'player_char')
        .setScale(0.1).setDepth(10)
    } else {
      this.playerSprite = this.add.circle(65, 250, 16, 0xff6b9d)
        .setDepth(10)
    }

    this.playerLabel = this.add.text(65, 274,
      window.playerData?.name || 'You', {
      fontSize: '9px', color: '#ffffff',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setDepth(11)

    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = this.input.keyboard.addKeys('W,A,S,D')
  }

  createCannon() {
    this.cannonGraphic?.destroy()
    this.cannonFireBtn?.destroy()
    this.cannonFireLabel?.destroy()

    this.cannonGraphic = this.add.graphics().setDepth(8)
    this.cannonGraphic.fillStyle(0x888888, 1)
    this.cannonGraphic.fillRect(140, 238, 55, 24)
    this.cannonGraphic.fillStyle(0x555555, 1)
    this.cannonGraphic.fillCircle(132, 250, 18)
    this.cannonGraphic.lineStyle(2, 0xf5a623, 1)
    this.cannonGraphic.strokeCircle(132, 250, 18)

    this.cannonFireBtn = this.add.graphics().setDepth(9)
    this.cannonFireBtn.fillStyle(0xf5a623, 1)
    this.cannonFireBtn.fillRoundedRect(112, 270, 80, 26, 6)

    this.cannonFireLabel = this.add.text(152, 283, '⚡ FIRE!', {
      fontSize: '11px', color: '#1a1a2e',
      fontFamily: 'Courier New', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10)

    this.tweens.add({
      targets: [this.cannonFireBtn, this.cannonFireLabel],
      alpha: { from: 0.6, to: 1 },
      duration: 500, yoyo: true, repeat: -1
    })

    const fireZone = this.add.rectangle(152, 283, 80, 26, 0xffffff, 0).setDepth(10)
    fireZone.setInteractive({ useHandCursor: true })
    fireZone.on('pointerdown', () => {
      if (!this.gameActive || this.isPuzzleOpen) return
      this.showWaveQuestion(this.currentWave, this.currentWaveCount)
    })
    // store so cleanupLevel can destroy it
    this.cannonZone = fireZone
  }

  startNextWave() {
    if (this.currentWave >= this.totalWaves) {
      this.completeLevel()
      return
    }
    this.currentWave++
    const count = this.config.minions + this.currentWave - 1
    this.currentWaveCount = count
    this.spawnMinions(count, this.config.speed)
  }

  spawnMinions(count, speed) {
    this.cleanupMinions()
    this.minionData = []

    const starts = [
      { x: 750, y: 140 }, { x: 780, y: 220 },
      { x: 760, y: 300 }, { x: 740, y: 380 },
      { x: 770, y: 170 }, { x: 790, y: 340 }
    ]

    for (let i = 0; i < count; i++) {
      const p = starts[i % starts.length]
      const ox = Phaser.Math.Between(-15, 15)
      const oy = Phaser.Math.Between(-15, 15)
      const m = this.add.image(p.x + ox, p.y + oy, 'minion')
        .setScale(0.06).setDepth(9)
      this.tweens.add({
        targets: m,
        scaleX: 0.065, scaleY: 0.065,
        duration: 300 + i * 80,
        yoyo: true, repeat: -1
      })
      this.minionData.push({
        sprite: m, x: p.x + ox, y: p.y + oy,
        speed, alive: true
      })
    }

    this.minionTimer = this.time.addEvent({
      delay: 80, repeat: -1,
      callback: () => {
        if (!this.gameActive || !this.playerAlive || this.isPuzzleOpen) return

        this.minionData.forEach(m => {
          if (!m.alive) return
          const dx = this.playerPos.x - m.x
          const dy = this.playerPos.y - m.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d > 6) {
            const f = m.speed * 0.08 / d
            m.x += dx * f
            m.y += dy * f
            m.sprite.setPosition(m.x, m.y)
          }
          if (d < 20) this.playerHit()
        })
      }
    })
  }

  playerHit() {
    if (!this.playerAlive) return
    this.lives--
    this.livesText.setText('Lives: ' + this.lives)
    if (this.journey[this.currentLevel]) this.journey[this.currentLevel].livesLost++
    this.cameras.main.shake(250, 0.012)
    this.tweens.add({
      targets: this.playerSprite,
      alpha: 0, duration: 80,
      yoyo: true, repeat: 4
    })
    if (this.lives <= 0) {
      this.playerAlive = false
      this.gameActive = false
      this.cleanupLevel()
      this.time.delayedCall(300, () => this.showGameOver())
    } else {
      this.playerPos = { x: 65, y: 250 }
      this.playerSprite?.setPosition(65, 250)
      this.playerLabel?.setPosition(65, 274)
    }
  }

  showWaveQuestion(wave, minionCount) {
    this.puzzleElements?.forEach(e => e?.destroy())
    this.puzzleElements = []
    this.isPuzzleOpen = true
    const L = this.currentLevel

    const qs = {
      1: [
        {
          code: 'for i in range(???):\n    fire_cannonball()',
          prompt: minionCount + ' Minions incoming!\nrange(???) — one param.\nHow many shots needed?',
          opts: this.makeOpts(minionCount, minionCount - 1, minionCount + 2),
          ans: minionCount.toString(),
          hint: 'range(' + minionCount + ') fires ' + minionCount + ' times!'
        },
        {
          code: 'for i in range(???):\n    fire_cannonball()',
          prompt: 'Wave 2 — harder!\nrange(???) — one param.\n' + minionCount + ' shots needed!',
          opts: this.makeOpts(minionCount, minionCount + 1, minionCount - 2),
          ans: minionCount.toString(),
          hint: 'range(' + minionCount + ') = 0 to ' + (minionCount - 1) + '!'
        }
      ],
      2: [
        {
          code: 'for i in range(1, ???):\n    fire_cannonball()',
          prompt: minionCount + ' Minions!\nrange(1, ???) — two params.\nWhat stop value gives ' + minionCount + ' shots?',
          opts: this.makeOpts(minionCount + 1, minionCount, minionCount + 3),
          ans: (minionCount + 1).toString(),
          hint: 'range(1,' + (minionCount + 1) + ') = 1 to ' + minionCount + '!'
        },
        {
          code: 'for i in range(2, ???):\n    fire_cannonball()',
          prompt: 'Wave 2!\nrange(2, ???) — two params.\n' + minionCount + ' shots needed!',
          opts: this.makeOpts(minionCount + 2, minionCount, minionCount + 4),
          ans: (minionCount + 2).toString(),
          hint: 'range(2,' + (minionCount + 2) + ') = 2 to ' + (minionCount + 1) + '!'
        }
      ],
      3: [
        {
          code: 'for i in range(0, 9, ???):\n    fire_cannonball()',
          prompt: '3 Elite Minions!\nrange(0, 9, ???) — three params.\nWhat step fires exactly 3 shots?',
          opts: ['2', '3', '4'],
          ans: '3',
          hint: 'range(0,9,3) = 0,3,6 = 3 shots!'
        },
        {
          code: 'for i in range(0, 8, ???):\n    fire_cannonball()',
          prompt: 'Final wave!\nrange(0, 8, ???)\nWhat step gives 4 shots?',
          opts: ['1', '2', '3'],
          ans: '2',
          hint: 'range(0,8,2) = 0,2,4,6 = 4 shots!'
        }
      ]
    }

    const q = qs[L][wave - 1]

    const pb = this.add.graphics().setDepth(20)
    pb.fillStyle(0x0a0a1a, 0.96)
    pb.fillRoundedRect(398, 48, 384, 390, 12)
    pb.lineStyle(2, 0xf5a623, 1)
    pb.strokeRoundedRect(398, 48, 384, 390, 12)
    this.puzzleElements.push(pb)

    const wl = this.add.text(408, 60,
      'Wave ' + wave + '/' + this.totalWaves + ' — Level ' + L, {
      fontSize: '11px', color: '#555555',
      fontFamily: 'Courier New'
    }).setDepth(21)
    this.puzzleElements.push(wl)

    const pt = this.add.text(598, 112, q.prompt, {
      fontSize: '13px', color: '#ffffff',
      fontFamily: 'Courier New',
      align: 'center', lineSpacing: 5
    }).setOrigin(0.5).setDepth(21)
    this.puzzleElements.push(pt)

    const cb = this.add.graphics().setDepth(20)
    cb.fillStyle(0x050a0f, 1)
    cb.fillRoundedRect(413, 193, 370, 78, 8)
    cb.lineStyle(1, 0x00ff88, 0.8)
    cb.strokeRoundedRect(413, 193, 370, 78, 8)
    this.puzzleElements.push(cb)

    const ct = this.add.text(598, 232, q.code, {
      fontSize: '13px', color: '#00ff88',
      fontFamily: 'Courier New', align: 'center'
    }).setOrigin(0.5).setDepth(21)
    this.puzzleElements.push(ct)

    const cl = this.add.text(598, 284, 'Replace ??? with:', {
      fontSize: '11px', color: '#aaaaaa',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setDepth(21)
    this.puzzleElements.push(cl)

    this.fbTxt = this.add.text(598, 405, '', {
      fontSize: '11px', color: '#00ff88',
      fontFamily: 'Courier New',
      align: 'center', wordWrap: { width: 370 }
    }).setOrigin(0.5).setDepth(21)
    this.puzzleElements.push(this.fbTxt)

    const ox = [473, 598, 723]
    q.opts.forEach((opt, i) => {
      const bb = this.add.graphics().setDepth(21)
      bb.fillStyle(0x1e3a5f, 1)
      bb.fillRoundedRect(ox[i] - 48, 300, 96, 58, 8)
      bb.lineStyle(1.5, 0x4a90d9, 1)
      bb.strokeRoundedRect(ox[i] - 48, 300, 96, 58, 8)

      const bt = this.add.text(ox[i], 329, opt, {
        fontSize: '24px', color: '#ffffff',
        fontFamily: 'Courier New', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(22)

      const bh = this.add.rectangle(ox[i], 329, 96, 58, 0xffffff, 0).setDepth(22)
      bh.setInteractive({ useHandCursor: true })

      bh.on('pointerover', () => {
        bb.clear()
        bb.fillStyle(0x2d5a8e, 1)
        bb.fillRoundedRect(ox[i] - 48, 300, 96, 58, 8)
        bb.lineStyle(1.5, 0xf5a623, 1)
        bb.strokeRoundedRect(ox[i] - 48, 300, 96, 58, 8)
      })
      bh.on('pointerout', () => {
        bb.clear()
        bb.fillStyle(0x1e3a5f, 1)
        bb.fillRoundedRect(ox[i] - 48, 300, 96, 58, 8)
        bb.lineStyle(1.5, 0x4a90d9, 1)
        bb.strokeRoundedRect(ox[i] - 48, 300, 96, 58, 8)
      })
      bh.on('pointerdown', () => {
        if (this.journey[this.currentLevel]) this.journey[this.currentLevel].attempts++
        if (opt === q.ans) {
          this.isPuzzleOpen = false
          this.score += 100 * L
          this.scoreText.setText('Score: ' + this.score)
          this.fbTxt.setColor('#00ff88')
          this.fbTxt.setText('Correct! ' + q.hint)
          this.time.delayedCall(800, () => {
            this.puzzleElements?.forEach(e => e?.destroy())
            this.puzzleElements = []
            this.fireCannonballs(
              this.minionData.filter(m => m.alive).length,
              () => {
                this.time.delayedCall(500, () => this.startNextWave())
              }
            )
          })
        } else {
          this.fbTxt.setColor('#e94560')
          this.fbTxt.setText('Not quite! Count the repetitions.')
          this.tweens.add({
            targets: bt, x: ox[i] + 5,
            duration: 50, yoyo: true, repeat: 3
          })
          this.playerHit()
        }
      })
      this.puzzleElements.push(bb, bt, bh)
    })
  }

  makeOpts(a, b, c) {
    return Phaser.Utils.Array.Shuffle([
      Math.max(1, a).toString(),
      Math.max(1, b).toString(),
      Math.max(1, c).toString()
    ])
  }

  fireCannonballs(count, onComplete) {
    this.cleanupMinions()
    const alive = this.minionData.filter(m => m.alive)
    if (!alive.length) { onComplete(); return }

    let idx = 0
    const next = () => {
      if (idx >= alive.length) { onComplete(); return }
      const t = alive[idx]
      const ball = this.add.circle(200, 250, 9, 0xf5a623).setDepth(12)
      const glow = this.add.circle(200, 250, 14, 0xf5a623, 0.3).setDepth(11)
      this.tweens.add({
        targets: [ball, glow],
        x: t.x, y: t.y, duration: 350, ease: 'Power2',
        onComplete: () => {
          ball.destroy(); glow.destroy()
          const exp = this.add.circle(t.x, t.y, 20, 0xe94560, 0.7).setDepth(13)
          this.tweens.add({
            targets: exp, scaleX: 2, scaleY: 2,
            alpha: 0, duration: 300,
            onComplete: () => exp.destroy()
          })
          this.tweens.add({
            targets: t.sprite,
            scaleX: 0, scaleY: 0, alpha: 0, duration: 200,
            onComplete: () => {
              t.sprite.destroy()
              t.alive = false
              idx++
              this.time.delayedCall(150, next)
            }
          })
        }
      })
    }
    next()
  }

  completeLevel() {
    this.gameActive = false
    this.cleanupLevel()

    const lvl = this.journey[this.currentLevel]
    if (lvl) {
      const extraAttempts = Math.max(0, lvl.attempts - this.totalWaves)
      lvl.mastery = Math.max(0, 100 - extraAttempts * 20 - lvl.livesLost * 15)
      lvl.completed = true
    }

    try {
      const saved = JSON.parse(localStorage.getItem('codebuilder_journey') || '{}')
      saved[this.currentLevel] = lvl
      localStorage.setItem('codebuilder_journey', JSON.stringify(saved))
    } catch (e) {}

    if (this.currentLevel < 3) {
      this.showLevelComplete()
    } else {
      this.showWinScreen()
    }
  }

  showLevelComplete() {
    const L = this.currentLevel
    const lcEls = []

    const ov = this.add.graphics().setDepth(25)
    ov.fillStyle(0x000000, 0.88)
    ov.fillRect(0, 0, 800, 500)
    lcEls.push(ov)

    lcEls.push(this.add.text(400, 160, 'Level ' + L + ' Complete!', {
      fontSize: '28px', color: '#00ff88',
      fontFamily: 'Courier New', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(26))

    const recap = {
      1: 'range(n) — repeats n times from 0',
      2: 'range(start,stop) — start to stop-1'
    }
    lcEls.push(this.add.text(400, 220, 'Mastered: ' + recap[L], {
      fontSize: '13px', color: '#f5a623',
      fontFamily: 'Courier New', align: 'center'
    }).setOrigin(0.5).setDepth(26))

    lcEls.push(this.add.text(400, 268, 'Score: ' + this.score + ' pts', {
      fontSize: '16px', color: '#ffffff',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setDepth(26))

    const bg = this.add.graphics().setDepth(26)
    bg.fillStyle(0xf5a623, 1)
    bg.fillRoundedRect(300, 340, 200, 48, 8)
    lcEls.push(bg)

    lcEls.push(this.add.text(400, 364, 'Level ' + (L + 1) + ' →', {
      fontSize: '16px', color: '#1a1a2e',
      fontFamily: 'Courier New', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(27))

    const h = this.add.rectangle(400, 364, 200, 48, 0xffffff, 0).setDepth(27)
    h.setInteractive({ useHandCursor: true })
    lcEls.push(h)

    h.on('pointerdown', () => {
      lcEls.forEach(e => e?.destroy())
      this.puzzleElements?.forEach(e => e?.destroy())
      this.puzzleElements = []
      this.teachElements?.forEach(e => e?.destroy())
      this.teachElements = []
      this.cleanupMinions()
      this.showLevelTeaching(L + 1)
    })
  }

  showGameOver() {
    // Hide any lingering teach/puzzle elements so they don't show through
    this.teachElements?.forEach(e => { if (e?.setVisible) e.setVisible(false) })
    this.puzzleElements?.forEach(e => e?.destroy())
    this.puzzleElements = []

    const goEls = []

    const ov = this.add.graphics().setDepth(100)
    ov.fillStyle(0x000000, 0.9)
    ov.fillRect(0, 0, 800, 500)
    goEls.push(ov)

    goEls.push(this.add.text(400, 160, 'GLITCHED!', {
      fontSize: '36px', color: '#e94560',
      fontFamily: 'Courier New', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101))

    goEls.push(this.add.text(400, 220,
      'The Malware Minions got you!\n' +
      'Tip: Count the loop repetitions\n' +
      'carefully before answering!', {
      fontSize: '13px', color: '#aaaaaa',
      fontFamily: 'Courier New', align: 'center', lineSpacing: 5
    }).setOrigin(0.5).setDepth(101))

    goEls.push(this.add.text(400, 305, 'Score: ' + this.score + ' pts', {
      fontSize: '14px', color: '#f5a623',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setDepth(101))

    const rb = this.add.graphics().setDepth(101)
    rb.fillStyle(0xe94560, 1)
    rb.fillRoundedRect(210, 360, 160, 44, 8)
    goEls.push(rb)

    goEls.push(this.add.text(290, 382, 'Try Again', {
      fontSize: '14px', color: '#ffffff',
      fontFamily: 'Courier New', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(102))

    const rh = this.add.rectangle(290, 382, 160, 44, 0xffffff, 0).setDepth(102)
    rh.setInteractive({ useHandCursor: true })
    goEls.push(rh)
    rh.on('pointerdown', () => {
      this.lives = 3; this.score = 0
      this.livesText.setText('Lives: 3')
      this.scoreText.setText('Score: 0')
      goEls.forEach(e => e?.destroy())
      this.teachElements?.forEach(e => e?.destroy())
      this.teachElements = []
      this.showLevelTeaching(1)
    })

    const hb = this.add.graphics().setDepth(101)
    hb.fillStyle(0x2d1b4e, 1)
    hb.fillRoundedRect(410, 360, 160, 44, 8)
    hb.lineStyle(1, 0x9b59b6, 1)
    hb.strokeRoundedRect(410, 360, 160, 44, 8)
    goEls.push(hb)

    goEls.push(this.add.text(490, 382, 'Back to Hub', {
      fontSize: '12px', color: '#9b59b6',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setDepth(102))

    const hh = this.add.rectangle(490, 382, 160, 44, 0xffffff, 0).setDepth(102)
    hh.setInteractive({ useHandCursor: true })
    goEls.push(hh)
    hh.on('pointerdown', () => this.scene.start('MapScene'))
  }

  showWinScreen() {
    const ov = this.add.graphics().setDepth(25)
    ov.fillStyle(0x000000, 0.9)
    ov.fillRect(0, 0, 800, 500)

    this.add.text(400, 95, 'CODE CAVERNS CLEARED!', {
      fontSize: '24px', color: '#f5a623',
      fontFamily: 'Courier New', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(26)

    this.add.text(400, 142,
      'You defeated ALL Malware Minions!\n' +
      'King Glitchy is retreating!', {
      fontSize: '13px', color: '#ffffff',
      fontFamily: 'Courier New', align: 'center'
    }).setOrigin(0.5).setDepth(26)

    this.add.text(400, 195, 'Final Score: ' + this.score + ' pts', {
      fontSize: '20px', color: '#f5a623',
      fontFamily: 'Courier New', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(26)

    this.add.text(400, 242, 'For Loop Master Unlocked!', {
      fontSize: '14px', color: '#00ff88',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setDepth(26)

    this.add.text(400, 280,
      'range(n)              repeats n times\n' +
      'range(start, stop)    start to stop-1\n' +
      'range(start,stop,step) jumps by step', {
      fontSize: '12px', color: '#4a90d9',
      fontFamily: 'Courier New', lineSpacing: 7
    }).setOrigin(0.5).setDepth(26)

    const wb = this.add.graphics().setDepth(26)
    wb.fillStyle(0xf5a623, 1)
    wb.fillRoundedRect(300, 385, 200, 48, 8)
    this.add.text(400, 409, 'Back to Hub →', {
      fontSize: '15px', color: '#1a1a2e',
      fontFamily: 'Courier New', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(27)
    const wh = this.add.rectangle(400, 409, 200, 48, 0xffffff, 0).setDepth(27)
    wh.setInteractive({ useHandCursor: true })
    wh.on('pointerdown', () => {
      this.scene.start('TechHubScene', { journey: this.journey, fromMission: true })
    })
  }

  cleanupMinions() {
    this.minionTimer?.remove()
    this.minionTimer = null
    this.minionData?.forEach(m => m.sprite?.destroy())
    this.minionData = []
  }

  cleanupLevel() {
    this.cleanupMinions()
    this.puzzleElements?.forEach(e => e?.destroy())
    this.puzzleElements = []
    this.playerSprite?.destroy()
    this.playerLabel?.destroy()
    this.cannonGraphic?.destroy()
    this.cannonFireBtn?.destroy()
    this.cannonFireLabel?.destroy()
    this.cannonZone?.destroy()
  }

  update() {
    if (!this.gameActive || !this.playerAlive || this.isPuzzleOpen) return
    const s = 220
    let vx = 0, vy = 0
    if (this.cursors?.left.isDown || this.wasd?.A.isDown) vx = -s
    else if (this.cursors?.right.isDown || this.wasd?.D.isDown) vx = s
    if (this.cursors?.up.isDown || this.wasd?.W.isDown) vy = -s
    else if (this.cursors?.down.isDown || this.wasd?.S.isDown) vy = s
    const nx = this.playerPos.x + vx * (1 / 60)
    const ny = this.playerPos.y + vy * (1 / 60)
    if (nx > 50 && nx < 750) this.playerPos.x = nx
    if (ny > 45 && ny < 460) this.playerPos.y = ny
    this.playerSprite?.setPosition(this.playerPos.x, this.playerPos.y)
    this.playerLabel?.setPosition(this.playerPos.x, this.playerPos.y + 24)
  }
}
