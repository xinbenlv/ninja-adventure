// Main game engine
const Game = (() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const T = Sprites.T; // tile size 32

  // Game constants
  const GRAVITY = 0.5;
  const PLAYER_SPEED = 3.5;
  const PLAYER_ACCEL = 0.4;
  const PLAYER_FRICTION = 0.85;
  const JUMP_FORCE = -9.5;
  const DOUBLE_JUMP_FORCE = -8;
  const SHURIKEN_SPEED = 7;
  const ENEMY_SPEED = 1;
  const ENEMY_PATROL_RANGE = 80;

  // Game state
  let state = 'title'; // title, playing, gameover, levelcomplete, wingame
  let tick = 0;
  let score = 0;
  let lives = 3;
  let currentLevel = 0;
  let levelData = null;
  let camX = 0;
  let camY = 0;

  // Player
  let player = {
    x: 0, y: 0, vx: 0, vy: 0,
    w: 24, h: 28,
    facingRight: true,
    onGround: false,
    jumps: 0,
    maxJumps: 2,
    state: 'idle', // idle, run, jump, attack
    attackTimer: 0,
    invincible: 0,
    shurikens: 5
  };

  // Game entities
  let enemies = [];
  let collectibles = [];
  let shurikens = [];

  // Canvas sizing
  let scale = 1;
  let gameW = 480;
  let gameH = 320;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // Determine game resolution based on screen
    const aspect = screenW / screenH;
    if (aspect > 1.6) {
      gameW = 560;
      gameH = 320;
    } else if (aspect > 1.2) {
      gameW = 480;
      gameH = 320;
    } else {
      gameW = 400;
      gameH = 560;
    }

    canvas.width = gameW * dpr;
    canvas.height = gameH * dpr;
    canvas.style.width = screenW + 'px';
    canvas.style.height = screenH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }

  function loadLevel(index) {
    levelData = Levels.get(index);
    if (!levelData) {
      state = 'wingame';
      return;
    }

    player.x = levelData.playerStart.x * T;
    player.y = levelData.playerStart.y * T;
    player.vx = 0;
    player.vy = 0;
    player.facingRight = true;
    player.onGround = false;
    player.jumps = 0;
    player.state = 'idle';
    player.attackTimer = 0;
    player.invincible = 0;

    enemies = levelData.enemies.map(e => ({
      type: e.type,
      x: e.x * T, y: e.y * T,
      vx: ENEMY_SPEED * (Math.random() > 0.5 ? 1 : -1),
      w: 24, h: 28,
      startX: e.x * T,
      alive: true,
      facingRight: true
    }));

    collectibles = levelData.collectibles.map(c => ({
      type: c.type,
      x: c.x * T, y: c.y * T,
      collected: false
    }));

    shurikens = [];
    camX = 0;
    camY = 0;
  }

  // Collision helpers
  function getTile(tx, ty) {
    if (ty < 0 || ty >= levelData.height || tx < 0 || tx >= levelData.width) return 0;
    return levelData.tiles[ty][tx];
  }

  function isSolid(tileType) {
    return tileType === 1;
  }

  function isPlatform(tileType) {
    return tileType === 2 || tileType === 3;
  }

  function rectOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // Physics and collision
  function movePlayer() {
    // Horizontal input
    let accel = 0;
    if (Input.isDown('left')) { accel = -PLAYER_ACCEL; player.facingRight = false; }
    if (Input.isDown('right')) { accel = PLAYER_ACCEL; player.facingRight = true; }

    player.vx += accel;
    player.vx *= PLAYER_FRICTION;
    if (Math.abs(player.vx) < 0.1) player.vx = 0;
    if (player.vx > PLAYER_SPEED) player.vx = PLAYER_SPEED;
    if (player.vx < -PLAYER_SPEED) player.vx = -PLAYER_SPEED;

    // Jump
    if (Input.isJustPressed('jump') && player.jumps < player.maxJumps) {
      if (player.jumps === 0) {
        player.vy = JUMP_FORCE;
        AudioManager.jump();
      } else {
        player.vy = DOUBLE_JUMP_FORCE;
        AudioManager.doubleJump();
        // Double jump particle
        Particles.add(player.x + player.w / 2, player.y + player.h, 5, {
          speed: 2, life: 15, size: 3,
          colors: ['#fff', '#e0e0e0', '#bdbdbd'],
          angle: -Math.PI / 2, spread: 1
        });
      }
      player.onGround = false;
      player.jumps++;
    }

    // Attack
    if (Input.isJustPressed('attack') && player.attackTimer <= 0 && player.shurikens > 0) {
      player.attackTimer = 15;
      player.shurikens--;
      AudioManager.shuriken();
      shurikens.push({
        x: player.x + (player.facingRight ? player.w : -8),
        y: player.y + player.h / 2 - 4,
        vx: player.facingRight ? SHURIKEN_SPEED : -SHURIKEN_SPEED,
        alive: true
      });
    }

    if (player.attackTimer > 0) player.attackTimer--;
    if (player.invincible > 0) player.invincible--;

    // Gravity
    player.vy += GRAVITY;
    if (player.vy > 12) player.vy = 12;

    // Move X
    player.x += player.vx;
    resolveCollisionX(player);

    // Move Y
    player.y += player.vy;
    player.onGround = false;
    resolveCollisionY(player);

    // Clamp to level bounds
    if (player.x < 0) player.x = 0;
    if (player.x > (levelData.width - 1) * T) player.x = (levelData.width - 1) * T;

    // Fall into pit
    if (player.y > levelData.height * T + 100) {
      playerDie();
    }

    // Determine animation state
    if (player.attackTimer > 8) {
      player.state = 'attack';
    } else if (!player.onGround) {
      player.state = 'jump';
    } else if (Math.abs(player.vx) > 0.5) {
      player.state = 'run';
    } else {
      player.state = 'idle';
    }
  }

  function resolveCollisionX(ent) {
    const left = Math.floor(ent.x / T);
    const right = Math.floor((ent.x + ent.w) / T);
    const top = Math.floor(ent.y / T);
    const bottom = Math.floor((ent.y + ent.h - 1) / T);

    for (let ty = top; ty <= bottom; ty++) {
      for (let tx = left; tx <= right; tx++) {
        const tile = getTile(tx, ty);
        if (isSolid(tile)) {
          if (ent.vx > 0) {
            ent.x = tx * T - ent.w;
            ent.vx = 0;
          } else if (ent.vx < 0) {
            ent.x = (tx + 1) * T;
            ent.vx = 0;
          }
        }
      }
    }
  }

  function resolveCollisionY(ent) {
    const left = Math.floor(ent.x / T);
    const right = Math.floor((ent.x + ent.w) / T);
    const top = Math.floor(ent.y / T);
    const bottom = Math.floor((ent.y + ent.h) / T);

    for (let ty = top; ty <= bottom; ty++) {
      for (let tx = left; tx <= right; tx++) {
        const tile = getTile(tx, ty);
        if (isSolid(tile)) {
          if (ent.vy > 0) {
            ent.y = ty * T - ent.h;
            ent.vy = 0;
            ent.onGround = true;
            if (ent === player) player.jumps = 0;
          } else if (ent.vy < 0) {
            ent.y = (ty + 1) * T;
            ent.vy = 0;
          }
        }
        // Platform: only solid from above
        if (isPlatform(tile) && ent.vy > 0) {
          const platTop = ty * T;
          const prevBottom = ent.y + ent.h - ent.vy;
          if (prevBottom <= platTop + 4) {
            ent.y = platTop - ent.h;
            ent.vy = 0;
            ent.onGround = true;
            if (ent === player) player.jumps = 0;
          }
        }
      }
    }
  }

  function updateEnemies() {
    for (const e of enemies) {
      if (!e.alive) continue;

      // Patrol movement
      e.x += e.vx;
      e.facingRight = e.vx > 0;

      // Reverse at patrol range or walls
      if (Math.abs(e.x - e.startX) > ENEMY_PATROL_RANGE) {
        e.vx = -e.vx;
      }

      // Check ground ahead
      const frontX = e.vx > 0 ? e.x + e.w + 2 : e.x - 2;
      const belowTile = getTile(Math.floor(frontX / T), Math.floor((e.y + e.h + 2) / T));
      if (!isSolid(belowTile) && belowTile !== 2 && belowTile !== 3) {
        e.vx = -e.vx;
      }

      // Wall collision
      const wallTile = getTile(
        Math.floor((e.vx > 0 ? e.x + e.w : e.x) / T),
        Math.floor((e.y + e.h / 2) / T)
      );
      if (isSolid(wallTile)) {
        e.vx = -e.vx;
      }

      // Player collision
      if (player.invincible <= 0 && rectOverlap(player, e)) {
        // Jump on top?
        if (player.vy > 0 && player.y + player.h - 8 < e.y + 4) {
          // Stomp!
          e.alive = false;
          player.vy = JUMP_FORCE * 0.6;
          score += 100;
          AudioManager.enemyDefeat();
          Particles.enemyDefeat(e.x + e.w / 2, e.y + e.h / 2);
        } else {
          playerHit();
        }
      }
    }
  }

  function updateShurikens() {
    for (const s of shurikens) {
      if (!s.alive) continue;
      s.x += s.vx;

      // Off screen
      if (s.x < camX - 50 || s.x > camX + gameW + 50) {
        s.alive = false;
        continue;
      }

      // Wall collision
      const tx = Math.floor((s.x + 4) / T);
      const ty = Math.floor((s.y + 4) / T);
      if (isSolid(getTile(tx, ty))) {
        s.alive = false;
        Particles.add(s.x, s.y, 4, {
          speed: 2, life: 10, size: 2,
          colors: ['#90a4ae', '#fff']
        });
        continue;
      }

      // Enemy hit
      for (const e of enemies) {
        if (!e.alive) continue;
        if (rectOverlap({ x: s.x - 4, y: s.y - 4, w: 8, h: 8 }, e)) {
          e.alive = false;
          s.alive = false;
          score += 150;
          AudioManager.enemyDefeat();
          Particles.enemyDefeat(e.x + e.w / 2, e.y + e.h / 2);
          break;
        }
      }
    }
    shurikens = shurikens.filter(s => s.alive);
  }

  function updateCollectibles() {
    for (const c of collectibles) {
      if (c.collected) continue;
      const cb = { x: c.x + 6, y: c.y + 6, w: 20, h: 20 };
      if (rectOverlap(player, cb)) {
        c.collected = true;
        if (c.type === 'sushi') {
          score += 50;
          AudioManager.coin();
          Particles.coinCollect(c.x + T / 2, c.y + T / 2);
        } else if (c.type === 'shuriken') {
          player.shurikens += 5;
          AudioManager.powerup();
          Particles.add(c.x + T / 2, c.y + T / 2, 8, {
            speed: 3, life: 25, size: 4, shape: 'star',
            colors: ['#64b5f6', '#fff', '#90caf9']
          });
        }
      }
    }
  }

  function checkLevelEnd() {
    // Check if player reached the flag
    const px = Math.floor((player.x + player.w / 2) / T);
    const py = Math.floor((player.y + player.h / 2) / T);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (getTile(px + dx, py + dy) === 9) {
          state = 'levelcomplete';
          AudioManager.levelComplete();
          return;
        }
      }
    }
  }

  function playerHit() {
    if (player.invincible > 0) return;
    lives--;
    player.invincible = 90; // 1.5 seconds
    player.vy = JUMP_FORCE * 0.5;
    AudioManager.hit();
    Particles.playerHit(player.x + player.w / 2, player.y + player.h / 2);

    if (lives <= 0) {
      state = 'gameover';
      AudioManager.gameOver();
    }
  }

  function playerDie() {
    lives--;
    if (lives <= 0) {
      state = 'gameover';
      AudioManager.gameOver();
    } else {
      // Respawn
      player.x = levelData.playerStart.x * T;
      player.y = levelData.playerStart.y * T;
      player.vx = 0;
      player.vy = 0;
      player.invincible = 90;
      AudioManager.hit();
    }
  }

  function updateCamera() {
    const targetX = player.x - gameW / 2 + player.w / 2;
    const targetY = player.y - gameH / 2 + player.h / 2;

    camX += (targetX - camX) * 0.1;
    camY += (targetY - camY) * 0.1;

    // Clamp
    const maxX = levelData.width * T - gameW;
    const maxY = levelData.height * T - gameH;
    if (camX < 0) camX = 0;
    if (camX > maxX) camX = maxX;
    if (camY < 0) camY = 0;
    if (camY > maxY) camY = maxY;
  }

  // Main update
  function update() {
    tick++;

    if (state === 'title') {
      if (Input.isJustPressed('enter')) {
        state = 'playing';
        score = 0;
        lives = 3;
        currentLevel = 0;
        player.shurikens = 5;
        loadLevel(0);
        AudioManager.menuSelect();
      }
    } else if (state === 'playing') {
      movePlayer();
      updateEnemies();
      updateShurikens();
      updateCollectibles();
      checkLevelEnd();
      updateCamera();
      Particles.update();

      // Ambient cherry blossom petals for village theme
      if (levelData.theme === 'village' || levelData.theme === 'forest') {
        Particles.cherryBlossoms(camX, camY, gameW);
      }
    } else if (state === 'gameover') {
      if (Input.isJustPressed('enter')) {
        state = 'title';
        AudioManager.menuSelect();
      }
    } else if (state === 'levelcomplete') {
      if (Input.isJustPressed('enter')) {
        currentLevel++;
        if (currentLevel >= Levels.count) {
          state = 'wingame';
        } else {
          loadLevel(currentLevel);
          state = 'playing';
          AudioManager.menuSelect();
        }
      }
    } else if (state === 'wingame') {
      if (Input.isJustPressed('enter')) {
        state = 'title';
        AudioManager.menuSelect();
      }
    }

    Input.clearFrame();
  }

  // Main render
  function render() {
    ctx.clearRect(0, 0, gameW, gameH);

    if (state === 'title') {
      Sprites.drawTitle(ctx, gameW, gameH, tick);
      return;
    }

    if (state === 'wingame') {
      drawWinScreen();
      return;
    }

    // Draw background with parallax
    Sprites.drawBackground(ctx, levelData.theme, camX, gameW, gameH, tick);

    // Draw tiles
    const startTX = Math.floor(camX / T) - 1;
    const endTX = Math.ceil((camX + gameW) / T) + 1;
    const startTY = Math.floor(camY / T) - 1;
    const endTY = Math.ceil((camY + gameH) / T) + 1;

    for (let ty = startTY; ty <= endTY; ty++) {
      for (let tx = startTX; tx <= endTX; tx++) {
        const tile = getTile(tx, ty);
        if (tile > 0) {
          Sprites.drawTile(ctx, tile, tx * T - camX, ty * T - camY, levelData.theme, tick);
        }
      }
    }

    // Draw collectibles
    for (const c of collectibles) {
      if (c.collected) continue;
      const sx = c.x - camX;
      const sy = c.y - camY;
      if (sx > -T && sx < gameW + T && sy > -T && sy < gameH + T) {
        if (c.type === 'sushi') {
          Sprites.drawSushi(ctx, sx, sy, tick);
        } else {
          Sprites.drawShurikenPickup(ctx, sx, sy, tick);
        }
      }
    }

    // Draw enemies
    for (const e of enemies) {
      if (!e.alive) continue;
      const sx = e.x - camX;
      const sy = e.y - camY;
      if (sx > -T * 2 && sx < gameW + T * 2) {
        if (e.type === 'tanuki') Sprites.drawTanuki(ctx, sx, sy, e.facingRight, tick);
        else if (e.type === 'kappa') Sprites.drawKappa(ctx, sx, sy, e.facingRight, tick);
        else if (e.type === 'oni') Sprites.drawOni(ctx, sx, sy, e.facingRight, tick);
      }
    }

    // Draw shurikens
    for (const s of shurikens) {
      Sprites.drawShuriken(ctx, s.x - camX, s.y - camY, tick);
    }

    // Draw player
    if (player.invincible <= 0 || Math.floor(tick / 3) % 2 === 0) {
      Sprites.drawNinja(ctx, player.x - camX, player.y - camY,
        player.state, 0, player.facingRight, tick);
    }

    // Draw particles
    Particles.draw(ctx, camX, camY);

    // Draw HUD
    Sprites.drawHUD(ctx, score, lives, currentLevel + 1, player.shurikens, gameW);

    // Overlay screens
    if (state === 'gameover') {
      Sprites.drawGameOver(ctx, gameW, gameH, score, tick);
    } else if (state === 'levelcomplete') {
      Sprites.drawLevelComplete(ctx, gameW, gameH, currentLevel + 1, score, tick);
    }
  }

  function drawWinScreen() {
    const grad = ctx.createLinearGradient(0, 0, 0, gameH);
    grad.addColorStop(0, '#4a148c');
    grad.addColorStop(0.5, '#7b1fa2');
    grad.addColorStop(1, '#ce93d8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, gameW, gameH);

    // Falling petals
    ctx.fillStyle = '#f8bbd0';
    for (let i = 0; i < 30; i++) {
      const bx = (i * 53 + tick * 0.5) % (gameW + 40) - 20;
      const by = (i * 37 + tick * 0.8 + Math.sin(tick * 0.02 + i) * 20) % gameH;
      ctx.beginPath();
      ctx.ellipse(bx, by, 3, 1.5, tick * 0.01 + i, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#ffeb3b';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('YOU WIN!', gameW / 2, gameH * 0.2);

    Sprites.drawNinja(ctx, gameW / 2 - T / 2, gameH * 0.35, 'idle', 0, true, tick);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('FINAL SCORE: ' + score, gameW / 2, gameH * 0.6);

    ctx.fillStyle = '#ce93d8';
    ctx.font = '14px monospace';
    ctx.fillText('The ninja saved the village!', gameW / 2, gameH * 0.7);

    ctx.globalAlpha = 0.5 + Math.sin(tick * 0.08) * 0.5;
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText('PRESS ENTER TO PLAY AGAIN', gameW / 2, gameH * 0.85);
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  // Game loop
  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }

  // Initialize
  function init() {
    resize();
    window.addEventListener('resize', resize);

    // Unlock audio on first interaction
    const unlock = () => {
      AudioManager.menuSelect();
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('touchstart', unlock, { once: true });
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });

    loop();
  }

  init();
})();
