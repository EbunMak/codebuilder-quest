// game.js — Main entry point for Codebuilder Quest
import SplashScene from './scenes/SplashScene.js';
import StoryScene from './scenes/StoryScene.js';
import NameScene from './scenes/NameScene.js';
import CustomizeScene from './scenes/CustomizeScene.js';
import WelcomeScene from './scenes/WelcomeScene.js';
import MapScene from './scenes/MapScene.js';
import ApartmentScene from './scenes/ApartmentScene.js';
import TechHubScene from './scenes/TechHubScene.js';
import MissionBriefScene from './scenes/MissionBriefScene.js';
import RoomScene from './scenes/RoomScene.js';
import CavernsScene from './scenes/CavernsScene.js';

/**
 * Global Socket Instance
 * Attaching this to window makes it accessible across all Phaser scenes
 * via window.socket or just socket.
 */
window.socket = io();

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 500,
  parent: 'game-container', // Matches the ID in index.html
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // TowerScene can override this if needed
      debug: false,
    },
  },
  // The first scene in the array is the one that starts automatically
  scene: [
    SplashScene,
    StoryScene,
    NameScene,
    CustomizeScene,
    WelcomeScene,
    MapScene,
    ApartmentScene,
    TechHubScene,
    MissionBriefScene,
    RoomScene,
    CavernsScene,
  ]
};

// Initialize the Phaser Game
const game = new Phaser.Game(config);

/**
 * Global Multiplayer State
 * This replaces your old remotePlayers object logic.
 * Individual scenes will now listen for these events.
 */
window.remotePlayers = {};

window.socket.on('currentPlayers', (players) => {
  window.remotePlayers = players;
  delete window.remotePlayers[window.socket.id];
});

window.socket.on('playerJoined', (player) => {
  if (player.id !== window.socket.id) {
    window.remotePlayers[player.id] = player;
  }
});

window.socket.on('playerMoved', (data) => {
  if (window.remotePlayers[data.id]) {
    window.remotePlayers[data.id].x = data.x;
    window.remotePlayers[data.id].y = data.y;
    window.remotePlayers[data.id].scene = data.scene;
  }
});

window.socket.on('playerLeft', (data) => {
  delete window.remotePlayers[data.id];
});