// Level data
// Tile types:
// 0 = empty, 1 = ground, 2 = platform, 3 = cloud, 4 = bamboo deco, 5 = lantern deco, 9 = end flag
// Entity types in separate arrays
const Levels = (() => {
  const T = 32;

  // Level 1: Bamboo Forest
  const forest = {
    theme: 'forest',
    name: 'Bamboo Forest',
    width: 120, // in tiles
    height: 15,
    playerStart: { x: 3, y: 11 },
    tiles: [],
    enemies: [
      { type: 'tanuki', x: 18, y: 12 },
      { type: 'tanuki', x: 30, y: 12 },
      { type: 'tanuki', x: 45, y: 12 },
      { type: 'kappa',  x: 55, y: 12 },
      { type: 'tanuki', x: 68, y: 12 },
      { type: 'tanuki', x: 80, y: 8 },
      { type: 'kappa',  x: 90, y: 12 },
      { type: 'tanuki', x: 100, y: 12 },
    ],
    collectibles: [
      // Sushi rolls
      { type: 'sushi', x: 8, y: 10 },
      { type: 'sushi', x: 9, y: 10 },
      { type: 'sushi', x: 10, y: 10 },
      { type: 'sushi', x: 22, y: 8 },
      { type: 'sushi', x: 23, y: 8 },
      { type: 'sushi', x: 24, y: 8 },
      { type: 'sushi', x: 35, y: 9 },
      { type: 'sushi', x: 36, y: 9 },
      { type: 'sushi', x: 40, y: 6 },
      { type: 'sushi', x: 41, y: 6 },
      { type: 'sushi', x: 42, y: 6 },
      { type: 'sushi', x: 50, y: 10 },
      { type: 'sushi', x: 60, y: 8 },
      { type: 'sushi', x: 61, y: 8 },
      { type: 'sushi', x: 75, y: 10 },
      { type: 'sushi', x: 76, y: 10 },
      { type: 'sushi', x: 85, y: 7 },
      { type: 'sushi', x: 95, y: 10 },
      { type: 'sushi', x: 96, y: 10 },
      { type: 'sushi', x: 105, y: 10 },
      // Shuriken pickups
      { type: 'shuriken', x: 15, y: 9 },
      { type: 'shuriken', x: 48, y: 5 },
      { type: 'shuriken', x: 88, y: 9 },
    ]
  };

  // Generate forest tiles
  forest.tiles = generateTiles(forest.width, forest.height, (x, y) => {
    // Gaps (must check before ground fill)
    if (y >= 13 && (x >= 25 && x <= 27)) return 0;
    if (y >= 13 && (x >= 52 && x <= 54)) return 0;
    if (y >= 13 && (x >= 72 && x <= 73)) return 0;
    // Ground level at row 13-14
    if (y >= 13) return 1;

    // Platforms
    if (y === 10 && x >= 20 && x <= 25) return 2;
    if (y === 8 && x >= 33 && x <= 37) return 2;
    if (y === 7 && x >= 39 && x <= 43) return 3; // cloud
    if (y === 10 && x >= 58 && x <= 63) return 2;
    if (y === 9 && x >= 78 && x <= 82) return 2;
    if (y === 7 && x >= 84 && x <= 87) return 3;

    // Raised ground sections
    if (y >= 11 && y < 13 && x >= 78 && x <= 84) return 1;

    // Decorations
    if (y >= 10 && y < 13 && x === 5) return 4; // bamboo
    if (y >= 10 && y < 13 && x === 15) return 4;
    if (y >= 10 && y < 13 && x === 32) return 4;
    if (y >= 10 && y < 13 && x === 65) return 4;
    if (y >= 10 && y < 13 && x === 95) return 4;

    // End flag
    if (x === 115 && y >= 10 && y < 13) return 9;

    return 0;
  });

  // Level 2: Castle Rooftops
  const castle = {
    theme: 'castle',
    name: 'Castle Rooftops',
    width: 130,
    height: 15,
    playerStart: { x: 3, y: 11 },
    tiles: [],
    enemies: [
      { type: 'oni',    x: 15, y: 12 },
      { type: 'oni',    x: 28, y: 8 },
      { type: 'tanuki', x: 40, y: 12 },
      { type: 'oni',    x: 50, y: 10 },
      { type: 'kappa',  x: 60, y: 12 },
      { type: 'oni',    x: 70, y: 6 },
      { type: 'oni',    x: 85, y: 12 },
      { type: 'tanuki', x: 95, y: 12 },
      { type: 'oni',    x: 105, y: 8 },
      { type: 'kappa',  x: 115, y: 12 },
    ],
    collectibles: [
      { type: 'sushi', x: 10, y: 10 },
      { type: 'sushi', x: 11, y: 10 },
      { type: 'sushi', x: 20, y: 6 },
      { type: 'sushi', x: 21, y: 6 },
      { type: 'sushi', x: 22, y: 6 },
      { type: 'sushi', x: 35, y: 10 },
      { type: 'sushi', x: 45, y: 8 },
      { type: 'sushi', x: 46, y: 8 },
      { type: 'sushi', x: 55, y: 6 },
      { type: 'sushi', x: 65, y: 10 },
      { type: 'sushi', x: 66, y: 10 },
      { type: 'sushi', x: 75, y: 5 },
      { type: 'sushi', x: 80, y: 10 },
      { type: 'sushi', x: 90, y: 10 },
      { type: 'sushi', x: 100, y: 6 },
      { type: 'sushi', x: 101, y: 6 },
      { type: 'sushi', x: 110, y: 10 },
      { type: 'shuriken', x: 25, y: 5 },
      { type: 'shuriken', x: 58, y: 5 },
      { type: 'shuriken', x: 82, y: 7 },
      { type: 'shuriken', x: 108, y: 5 },
    ]
  };

  castle.tiles = generateTiles(castle.width, castle.height, (x, y) => {
    // Gaps (must check before ground fill)
    if (y >= 13 && (x >= 18 && x <= 20)) return 0;
    if (y >= 13 && (x >= 32 && x <= 34)) return 0;
    if (y >= 13 && (x >= 48 && x <= 51)) return 0;
    if (y >= 13 && (x >= 62 && x <= 64)) return 0;
    if (y >= 13 && (x >= 78 && x <= 79)) return 0;
    if (y >= 13 && (x >= 92 && x <= 95)) return 0;
    if (y >= 13) return 1;

    // Platforms and rooftops
    if (y === 10 && x >= 15 && x <= 18) return 2;
    if (y === 7 && x >= 19 && x <= 23) return 2;
    if (y === 9 && x >= 26 && x <= 30) return 2;
    if (y === 6 && x >= 35 && x <= 38) return 3;
    if (y === 11 && x >= 43 && x <= 47) return 2;
    if (y === 8 && x >= 44 && x <= 46) return 2;
    if (y === 7 && x >= 53 && x <= 57) return 2;
    if (y === 10 && x >= 58 && x <= 61) return 2;
    if (y === 7 && x >= 68 && x <= 73) return 2;
    if (y === 5 && x >= 74 && x <= 76) return 3;
    if (y === 9 && x >= 80 && x <= 84) return 2;
    if (y === 11 && x >= 96 && x <= 100) return 2;
    if (y === 8 && x >= 98 && x <= 102) return 2;
    if (y === 6 && x >= 103 && x <= 107) return 2;

    // Lanterns
    if (x === 12 && y === 11) return 5;
    if (x === 42 && y === 11) return 5;
    if (x === 75 && y === 11) return 5;
    if (x === 110 && y === 11) return 5;

    // End flag
    if (x === 125 && y >= 10 && y < 13) return 9;

    return 0;
  });

  // Level 3: Cherry Blossom Village
  const village = {
    theme: 'village',
    name: 'Cherry Blossom Village',
    width: 140,
    height: 15,
    playerStart: { x: 3, y: 11 },
    tiles: [],
    enemies: [
      { type: 'tanuki', x: 12, y: 12 },
      { type: 'kappa',  x: 25, y: 12 },
      { type: 'oni',    x: 35, y: 8 },
      { type: 'tanuki', x: 45, y: 12 },
      { type: 'oni',    x: 55, y: 6 },
      { type: 'kappa',  x: 65, y: 12 },
      { type: 'oni',    x: 75, y: 12 },
      { type: 'tanuki', x: 85, y: 10 },
      { type: 'oni',    x: 95, y: 8 },
      { type: 'kappa',  x: 105, y: 12 },
      { type: 'oni',    x: 115, y: 6 },
      { type: 'tanuki', x: 125, y: 12 },
    ],
    collectibles: [
      { type: 'sushi', x: 8, y: 10 },
      { type: 'sushi', x: 9, y: 10 },
      { type: 'sushi', x: 10, y: 10 },
      { type: 'sushi', x: 18, y: 8 },
      { type: 'sushi', x: 19, y: 8 },
      { type: 'sushi', x: 28, y: 6 },
      { type: 'sushi', x: 29, y: 6 },
      { type: 'sushi', x: 38, y: 7 },
      { type: 'sushi', x: 39, y: 7 },
      { type: 'sushi', x: 50, y: 10 },
      { type: 'sushi', x: 51, y: 10 },
      { type: 'sushi', x: 58, y: 5 },
      { type: 'sushi', x: 70, y: 10 },
      { type: 'sushi', x: 71, y: 10 },
      { type: 'sushi', x: 80, y: 8 },
      { type: 'sushi', x: 88, y: 6 },
      { type: 'sushi', x: 100, y: 10 },
      { type: 'sushi', x: 101, y: 10 },
      { type: 'sushi', x: 110, y: 8 },
      { type: 'sushi', x: 120, y: 10 },
      { type: 'shuriken', x: 15, y: 7 },
      { type: 'shuriken', x: 42, y: 5 },
      { type: 'shuriken', x: 78, y: 7 },
      { type: 'shuriken', x: 98, y: 5 },
      { type: 'shuriken', x: 128, y: 9 },
    ]
  };

  village.tiles = generateTiles(village.width, village.height, (x, y) => {
    // Gaps (must check before ground fill)
    if (y >= 13 && (x >= 20 && x <= 22)) return 0;
    if (y >= 13 && (x >= 38 && x <= 40)) return 0;
    if (y >= 13 && (x >= 58 && x <= 61)) return 0;
    if (y >= 13 && (x >= 82 && x <= 84)) return 0;
    if (y >= 13 && (x >= 108 && x <= 111)) return 0;
    if (y >= 13) return 1;

    // Varied platforms
    if (y === 10 && x >= 8 && x <= 11) return 2;
    if (y === 8 && x >= 16 && x <= 20) return 2;
    if (y === 7 && x >= 27 && x <= 30) return 3;
    if (y === 9 && x >= 33 && x <= 37) return 2;
    if (y === 6 && x >= 40 && x <= 43) return 3;
    if (y === 10 && x >= 48 && x <= 52) return 2;
    if (y === 7 && x >= 53 && x <= 57) return 2;
    if (y === 5 && x >= 56 && x <= 59) return 3;
    if (y === 10 && x >= 68 && x <= 72) return 2;
    if (y === 8 && x >= 78 && x <= 81) return 2;
    if (y === 11 && x >= 85 && x <= 89) return 2;
    if (y === 8 && x >= 86 && x <= 89) return 2;
    if (y === 10 && x >= 93 && x <= 97) return 2;
    if (y === 7 && x >= 95 && x <= 99) return 2;
    if (y === 5 && x >= 113 && x <= 117) return 3;
    if (y === 8 && x >= 112 && x <= 116) return 2;
    if (y === 10 && x >= 118 && x <= 122) return 2;

    // Decorations
    if (x === 6 && y === 11) return 5;
    if (x === 30 && y === 11) return 5;
    if (x === 62 && y === 11) return 5;
    if (x === 90 && y === 11) return 5;
    if (x === 122 && y === 11) return 5;

    // End flag
    if (x === 135 && y >= 10 && y < 13) return 9;

    return 0;
  });

  function generateTiles(w, h, fn) {
    const tiles = [];
    for (let y = 0; y < h; y++) {
      tiles[y] = [];
      for (let x = 0; x < w; x++) {
        tiles[y][x] = fn(x, y);
      }
    }
    return tiles;
  }

  const levels = [forest, castle, village];

  return {
    get(index) {
      return levels[index];
    },
    count: levels.length,
    T
  };
})();
