// gameData.js — Static game data and player persistence for Codebuilder Quest

// ---------------------------------------------------------------------------
// 1. AVATAR OPTIONS
// ---------------------------------------------------------------------------
const AVATAR_OPTIONS = [
  { id: 'avatar1', label: 'Tech Star',    color: '#ff6b9d', emoji: '👩‍💻', bodyColor: '#ffb3d1' },
  { id: 'avatar2', label: 'Space Coder', color: '#9b59b6', emoji: '👩‍🚀', bodyColor: '#d7b8f3' },
  { id: 'avatar3', label: 'Bot Builder', color: '#1abc9c', emoji: '🤖',  bodyColor: '#a8eddc' },
];

// ---------------------------------------------------------------------------
// 2. HAIR STYLES
// ---------------------------------------------------------------------------
const HAIR_STYLES = [
  {
    id: 'hair1',
    name: 'Pixel Ponytail',
    colorOptions: ['#2c2c2c', '#8B4513', '#ff6b9d', '#f1c40f'],
    unlocked: true,
  },
  {
    id: 'hair2',
    name: 'Curly Cascade',
    colorOptions: ['#1a1a1a', '#c0392b', '#9b59b6', '#1abc9c'],
    unlocked: true,
  },
  {
    id: 'hair3',
    name: 'Galaxy Buns',
    colorOptions: ['#6c5ce7', '#fd79a8', '#00cec9', '#fdcb6e'],
    unlocked: false,
  },
  {
    id: 'hair4',
    name: 'Neon Spikes',
    colorOptions: ['#e17055', '#00b894', '#0984e3', '#d63031'],
    unlocked: false,
  },
  {
    id: 'hair5',
    name: 'Hologram Wave',
    colorOptions: ['#74b9ff', '#a29bfe', '#55efc4', '#ffeaa7'],
    unlocked: false,
  },
  {
    id: 'hair6',
    name: 'Star Streak',
    colorOptions: ['#ffffff', '#dfe6e9', '#b2bec3', '#636e72'],
    unlocked: false,
  },
];

// ---------------------------------------------------------------------------
// 3. OUTFITS
// ---------------------------------------------------------------------------
const OUTFITS = [
  {
    id: 'outfit1',
    name: 'Starter Kit',
    description: 'A cozy hoodie and jeans — every coder\'s classic.',
    color: '#4a90d9',
    unlocked: true,
    source: 'starter',
  },
  {
    id: 'outfit2',
    name: 'Lab Coat',
    description: 'Clean and professional, ready for experiments.',
    color: '#ecf0f1',
    unlocked: true,
    source: 'starter',
  },
  {
    id: 'outfit3',
    name: 'Galactic Suit',
    description: 'For missions beyond the stratosphere.',
    color: '#2c3e50',
    unlocked: false,
    source: 'mission',
  },
  {
    id: 'outfit4',
    name: 'Neon Runner',
    description: 'Sleek cyberpunk threads that glow in the dark.',
    color: '#e74c3c',
    unlocked: false,
    source: 'mission',
  },
  {
    id: 'outfit5',
    name: 'Debug Armor',
    description: 'Heavy-duty gear forged in the heat of bug battles.',
    color: '#7f8c8d',
    unlocked: false,
    source: 'mission',
  },
  {
    id: 'outfit6',
    name: 'Champion\'s Cloak',
    description: 'Awarded only to those who conquer the final tower.',
    color: '#f39c12',
    unlocked: false,
    source: 'mission',
  },
];

// ---------------------------------------------------------------------------
// 4. ACCESSORIES
// ---------------------------------------------------------------------------
const ACCESSORIES = [
  {
    id: 'headset1',
    name: 'Dev Headset',
    type: 'headset',
    unlocked: true,
  },
  {
    id: 'headset2',
    name: 'Neon Cans',
    type: 'headset',
    unlocked: false,
  },
  {
    id: 'backpack1',
    name: 'Circuit Pack',
    type: 'backpack',
    unlocked: true,
  },
  {
    id: 'backpack2',
    name: 'Jetpack Bag',
    type: 'backpack',
    unlocked: false,
  },
  {
    id: 'gauntlet1',
    name: 'Glowing Gauntlets',
    type: 'gauntlet',
    unlocked: false,
  },
  {
    id: 'gauntlet2',
    name: 'Plasma Fists',
    type: 'gauntlet',
    unlocked: false,
  },
];

// ---------------------------------------------------------------------------
// 5. GADGETS
// ---------------------------------------------------------------------------
const GADGETS = [
  {
    id: 'shield',
    name: 'Code Shield',
    description: 'Blocks glitch attacks',
    color: '#4ecdc4',
    unlocked: true,
    missionRequired: null,
  },
  {
    id: 'robot',
    name: 'Debug Bot',
    description: 'Fixes glitched platforms',
    color: '#f7dc6f',
    unlocked: false,
    missionRequired: 'tech_tower_1',
  },
  {
    id: 'bridge',
    name: 'Builder Bridge',
    description: 'Spans broken gaps',
    color: '#e67e22',
    unlocked: false,
    missionRequired: 'tech_tower_2',
  },
];

// ---------------------------------------------------------------------------
// 6. ROOM ITEMS
// ---------------------------------------------------------------------------
const ROOM_ITEMS = [
  // Furniture
  {
    id: 'desk',
    name: 'Coding Desk',
    type: 'furniture',
    color: '#8B4513',
    unlocked: true,
    missionRequired: null,
  },
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    type: 'furniture',
    color: '#795548',
    unlocked: false,
    missionRequired: 'library_quest',
  },
  {
    id: 'gaming_chair',
    name: 'Gaming Chair',
    type: 'furniture',
    color: '#e74c3c',
    unlocked: false,
    missionRequired: 'speed_run_1',
  },
  {
    id: 'bean_bag',
    name: 'Bean Bag',
    type: 'furniture',
    color: '#9b59b6',
    unlocked: false,
    missionRequired: 'chill_zone',
  },

  // Decor
  {
    id: 'plant',
    name: 'Pixel Plant',
    type: 'decor',
    color: '#27ae60',
    unlocked: true,
    missionRequired: null,
  },
  {
    id: 'fairy_lights',
    name: 'Fairy Lights',
    type: 'decor',
    color: '#f1c40f',
    unlocked: false,
    missionRequired: 'night_mission',
  },
  {
    id: 'trophy_shelf',
    name: 'Trophy Shelf',
    type: 'decor',
    color: '#f39c12',
    unlocked: false,
    missionRequired: 'first_victory',
  },
  {
    id: 'hologram_poster',
    name: 'Hologram Poster',
    type: 'decor',
    color: '#3498db',
    unlocked: false,
    missionRequired: 'tech_tower_1',
  },

  // Tech
  {
    id: 'computer_setup',
    name: 'Computer Setup',
    type: 'tech',
    color: '#2c3e50',
    unlocked: false,
    missionRequired: 'hardware_hunt',
  },
  {
    id: 'robot_companion',
    name: 'Robot Companion',
    type: 'tech',
    color: '#1abc9c',
    unlocked: false,
    missionRequired: 'tech_tower_2',
  },
  {
    id: 'code_display',
    name: 'Code Display Screen',
    type: 'tech',
    color: '#00d2ff',
    unlocked: false,
    missionRequired: 'debug_dungeon',
  },
  {
    id: 'gadget_rack',
    name: 'Gadget Rack',
    type: 'tech',
    color: '#95a5a6',
    unlocked: false,
    missionRequired: 'gadget_gauntlet',
  },
];

// ---------------------------------------------------------------------------
// 7. DEFAULT PLAYER STATE
// ---------------------------------------------------------------------------
const PLAYER_STATE = {
  name: '',
  avatar: 'avatar1',
  hair: 'hair1',
  outfit: 'outfit1',
  accessory: null,
  gadgets: ['shield'],
  roomItems: ['desk', 'plant'],
  completedMissions: [],
  earnedRewards: [],
};

// ---------------------------------------------------------------------------
// 8. savePlayer — persists player state to localStorage
// ---------------------------------------------------------------------------
function savePlayer(state) {
  try {
    localStorage.setItem('codebuilder_player', JSON.stringify(state));
  } catch (err) {
    console.warn('savePlayer: could not write to localStorage', err);
  }
}

// ---------------------------------------------------------------------------
// 9. loadPlayer — loads from localStorage, falls back to PLAYER_STATE default
// ---------------------------------------------------------------------------
function loadPlayer() {
  try {
    const raw = localStorage.getItem('codebuilder_player');
    if (!raw) return { ...PLAYER_STATE };
    const saved = JSON.parse(raw);
    // Merge with defaults so new fields added later are never missing
    return { ...PLAYER_STATE, ...saved };
  } catch (err) {
    console.warn('loadPlayer: could not read from localStorage', err);
    return { ...PLAYER_STATE };
  }
}

export {
  AVATAR_OPTIONS,
  HAIR_STYLES,
  OUTFITS,
  ACCESSORIES,
  GADGETS,
  ROOM_ITEMS,
  PLAYER_STATE,
  savePlayer,
  loadPlayer,
};
