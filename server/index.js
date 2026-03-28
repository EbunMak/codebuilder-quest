const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the client folder
app.use(express.static(path.join(__dirname, '../client')));

// Explicitly serve index.html on the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Track player positions and states
const players = {};

// Track rooms for co-op sessions
const rooms = {};

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // 1. Initial Sync: Send existing players to the newly connected player
  socket.emit('currentPlayers', players);

  // 2. Player Join: Register a new player
  socket.on('playerJoin', (data) => {
    players[socket.id] = {
      id: socket.id,
      x: data.x || 400,
      y: data.y || 300,
      scene: data.scene || 'WelcomeScene',
      name: data.name || `Player_${socket.id.slice(0, 4)}`,
      avatar: data.avatar || 'avatar1'
    };

    // Notify all other players that a new player joined
    socket.broadcast.emit('playerJoined', players[socket.id]);
  });

  // 3. Movement Updates: Broadcast player movement to all other players
  socket.on('playerMove', (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      players[socket.id].scene = data.scene || players[socket.id].scene;

      // Update others so they can render the remote player sprite
      socket.broadcast.emit('playerMoved', {
        id: socket.id,
        x: data.x,
        y: data.y,
        scene: players[socket.id].scene,
      });
    }
  });

  // 4. Puzzle Synchronization: When a player solves a puzzle in TowerScene
  socket.on('puzzleSolved', (data) => {
    console.log(`Puzzle [${data.puzzle}] solved by: ${socket.id}`);

    // Broadcast the effect to all OTHER players so their bridge/door updates
    socket.broadcast.emit('puzzleEffect', {
      id: socket.id,
      puzzle: data.puzzle,
      scene: 'TowerScene'
    });
  });

  // 5. Mission Completion: Broadcast achievements
  socket.on('missionComplete', (data) => {
    console.log(`Mission Complete achievement for: ${data.player}`);

    // Notify all clients to trigger celebration UI
    io.emit('missionComplete', {
      player: data.player
    });
  });

  // 6. Room Management: Create a private co-op room
  socket.on('createRoom', (playerData) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    rooms[code] = {
      players: {},
      missionStarted: false,
      soloMode: false
    };
    rooms[code].mapSeed = Math.floor(Math.random() * 10000);
    rooms[code].missingTiles = null;
    rooms[code].players[socket.id] = { ...playerData, x: 400, y: 300 };
    socket.join(code);
    socket.roomCode = code;
    socket.emit('roomCreated', { code });

    socket.soloTimer = setTimeout(() => {
      if (rooms[code] && Object.keys(rooms[code].players).length === 1) {
        rooms[code].soloMode = true;
        socket.emit('soloModeActivated');
      }
    }, 60000);
  });

  // 7. Room Management: Join an existing room
  socket.on('joinRoom', ({ code, playerData }) => {
    if (!rooms[code]) {
      socket.emit('roomError', 'Room not found! Check the code and try again.');
      return;
    }
    if (Object.keys(rooms[code].players).length >= 3) {
      socket.emit('roomError', 'Room is full!');
      return;
    }
    rooms[code].players[socket.id] = { ...playerData, x: 400, y: 300 };
    socket.join(code);
    socket.roomCode = code;

    const otherPlayers = { ...rooms[code].players };
    delete otherPlayers[socket.id];
    socket.emit('roomJoined', { code, players: otherPlayers });
    socket.to(code).emit('friendJoined', { id: socket.id, ...playerData });
  });

  // 8. Room Movement: Sync position within a room
  socket.on('roomPlayerMove', ({ code, x, y, scene }) => {
    if (rooms[code] && rooms[code].players[socket.id]) {
      rooms[code].players[socket.id].x = x;
      rooms[code].players[socket.id].y = y;
      rooms[code].players[socket.id].scene = scene;
      socket.to(code).emit('friendMoved', { id: socket.id, x, y, scene });
    }
  });

  // 9. Partner code puzzle sync
  socket.on('partnerCodeSubmit', ({ code, half, value }) => {
    if (rooms[code]) {
      io.to(code).emit('partnerSubmitted', { id: socket.id, half, value });
    }
  });

  // 10. Start mission for a room
  socket.on('startMission', ({ code, soloMode }) => {
    if (rooms[code]) {
      rooms[code].missionStarted = true;
      rooms[code].soloMode = soloMode || false;
      const playerCount = Object.keys(rooms[code].players).length;
      io.to(code).emit('missionStarting', {
        mission: 'code_caverns',
        playerCount,
        soloMode: rooms[code].soloMode,
      });
    } else {
      socket.emit('missionStarting', {
        mission: 'code_caverns',
        playerCount: 1,
        soloMode: true,
      });
    }
  });

  // 11. Map seed sync: Send seed/tiles to a player who requests them
  socket.on('requestMapSeed', ({ code }) => {
    if (rooms[code]) {
      socket.emit('mapSeedReceived', {
        seed: rooms[code].mapSeed,
        missingTiles: rooms[code].missingTiles
      });
    }
  });

  // 12. Map generated: First player to generate stores tiles; others receive them
  socket.on('mapGenerated', ({ code, missingTiles }) => {
    if (rooms[code] && !rooms[code].missingTiles) {
      rooms[code].missingTiles = missingTiles;
      socket.to(code).emit('syncMissingTiles', { missingTiles });
    }
  });

  // 13. Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);

    if (socket.roomCode && rooms[socket.roomCode]) {
      delete rooms[socket.roomCode].players[socket.id];
      socket.to(socket.roomCode).emit('friendLeft', { id: socket.id });
      if (Object.keys(rooms[socket.roomCode].players).length === 0) {
        delete rooms[socket.roomCode];
      }
    }

    delete players[socket.id];
    io.emit('playerLeft', socket.id);
  });
});

server.listen(PORT, () =>
  console.log('Running on port ' + PORT));