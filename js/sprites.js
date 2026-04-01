// Canvas-drawn sprite functions - cute pixel art style
const Sprites = (() => {
  const T = 32; // tile size

  // Color palettes
  const NINJA = {
    body: '#2d2d2d',
    skin: '#ffcc99',
    eyes: '#fff',
    pupils: '#222',
    headband: '#e53935',
    scarf: '#e53935',
    scarfDark: '#c62828'
  };

  function drawNinja(ctx, x, y, state, frame, facingRight, t) {
    ctx.save();
    ctx.translate(x + T / 2, y + T);
    if (!facingRight) ctx.scale(-1, 1);

    const bob = state === 'idle' ? Math.sin(t * 0.05) * 1.5 : 0;
    const runBob = state === 'run' ? Math.sin(t * 0.3) * 2 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    const bodyY = -16 + bob + runBob;

    // Scarf (flows behind)
    ctx.fillStyle = NINJA.scarf;
    const scarfWave = Math.sin(t * 0.1) * 3;
    const scarfLen = state === 'run' ? 14 : 8;
    ctx.beginPath();
    ctx.moveTo(-2, bodyY - 4);
    ctx.quadraticCurveTo(-scarfLen - 2, bodyY - 6 + scarfWave, -scarfLen - 4, bodyY - 2 + scarfWave * 1.5);
    ctx.quadraticCurveTo(-scarfLen - 2, bodyY - 1 + scarfWave, -2, bodyY - 1);
    ctx.fill();
    // Second scarf tail
    ctx.fillStyle = NINJA.scarfDark;
    ctx.beginPath();
    ctx.moveTo(-2, bodyY - 2);
    ctx.quadraticCurveTo(-scarfLen, bodyY - 3 + scarfWave * 0.8, -scarfLen - 2, bodyY + 1 + scarfWave);
    ctx.quadraticCurveTo(-scarfLen, bodyY + 1 + scarfWave * 0.8, -2, bodyY + 1);
    ctx.fill();

    // Legs
    ctx.fillStyle = NINJA.body;
    if (state === 'run') {
      const legAng = Math.sin(t * 0.3) * 0.4;
      // Left leg
      ctx.save();
      ctx.translate(-4, bodyY + 14);
      ctx.rotate(legAng);
      ctx.fillRect(-2, 0, 4, 8);
      ctx.restore();
      // Right leg
      ctx.save();
      ctx.translate(4, bodyY + 14);
      ctx.rotate(-legAng);
      ctx.fillRect(-2, 0, 4, 8);
      ctx.restore();
    } else if (state === 'jump') {
      // Tucked legs
      ctx.fillRect(-6, bodyY + 10, 4, 6);
      ctx.fillRect(2, bodyY + 10, 4, 6);
    } else {
      // Standing
      ctx.fillRect(-5, bodyY + 14, 4, 8);
      ctx.fillRect(1, bodyY + 14, 4, 8);
    }

    // Body
    ctx.fillStyle = NINJA.body;
    roundRect(ctx, -7, bodyY, 14, 16, 3);
    ctx.fill();

    // Belt
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(-7, bodyY + 11, 14, 2);

    // Arms
    if (state === 'attack') {
      // Throwing arm extended
      ctx.fillStyle = NINJA.body;
      ctx.fillRect(7, bodyY + 2, 10, 3);
      // Hand
      ctx.fillStyle = NINJA.skin;
      ctx.fillRect(16, bodyY + 1, 4, 4);
    } else {
      const armSwing = state === 'run' ? Math.sin(t * 0.3) * 15 : 0;
      ctx.fillStyle = NINJA.body;
      // Left arm
      ctx.save();
      ctx.translate(-7, bodyY + 3);
      ctx.rotate((armSwing * Math.PI) / 180);
      ctx.fillRect(-4, 0, 4, 8);
      ctx.restore();
      // Right arm
      ctx.save();
      ctx.translate(7, bodyY + 3);
      ctx.rotate((-armSwing * Math.PI) / 180);
      ctx.fillRect(0, 0, 4, 8);
      ctx.restore();
    }

    // Head
    ctx.fillStyle = NINJA.body;
    roundRect(ctx, -8, bodyY - 14, 16, 14, 4);
    ctx.fill();

    // Face area (skin showing through mask opening)
    ctx.fillStyle = NINJA.skin;
    ctx.fillRect(-6, bodyY - 10, 12, 5);

    // Big cute eyes
    ctx.fillStyle = NINJA.eyes;
    ctx.beginPath();
    ctx.ellipse(-3, bodyY - 8, 3, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3, bodyY - 8, 3, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils (follow direction slightly)
    const lookX = state === 'idle' ? Math.sin(t * 0.02) * 1 : 0.5;
    ctx.fillStyle = NINJA.pupils;
    ctx.beginPath();
    ctx.arc(-3 + lookX, bodyY - 8, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3 + lookX, bodyY - 8, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-2, bodyY - 9, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, bodyY - 9, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Headband
    ctx.fillStyle = NINJA.headband;
    ctx.fillRect(-9, bodyY - 13, 18, 3);
    // Headband knot
    ctx.fillRect(-10, bodyY - 14, 3, 5);

    // Idle animation: adjust headband
    if (state === 'idle' && Math.floor(t / 120) % 4 === 0) {
      const idleFrame = (t % 120) / 120;
      if (idleFrame > 0.3 && idleFrame < 0.6) {
        ctx.fillStyle = NINJA.skin;
        ctx.fillRect(8, bodyY - 12, 4, 4); // hand near headband
      }
    }

    ctx.restore();
  }

  // Sushi collectible
  function drawSushi(ctx, x, y, t) {
    const bob = Math.sin(t * 0.08) * 2;
    const sy = y + bob;

    // Rice base
    ctx.fillStyle = '#fff';
    roundRect(ctx, x + 6, sy + 10, 20, 12, 4);
    ctx.fill();
    // Fish on top
    ctx.fillStyle = '#ff8a65';
    roundRect(ctx, x + 5, sy + 6, 22, 8, 3);
    ctx.fill();
    // Nori wrap
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(x + 12, sy + 6, 8, 16);
    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(x + 8, sy + 8, 4, 2);
    // Sparkle
    const sparkle = Math.sin(t * 0.1) > 0.5;
    if (sparkle) {
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.arc(x + 26, sy + 6, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Shuriken power-up
  function drawShurikenPickup(ctx, x, y, t) {
    const bob = Math.sin(t * 0.08) * 2;
    ctx.save();
    ctx.translate(x + T / 2, y + T / 2 + bob);
    ctx.rotate(t * 0.05);

    ctx.fillStyle = '#90a4ae';
    ctx.strokeStyle = '#546e7a';
    ctx.lineWidth = 1;
    // Draw 4-pointed star
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? 10 : 4;
      const a = (i * Math.PI) / 4;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Center
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Glow
    ctx.fillStyle = `rgba(100,200,255,${0.1 + Math.sin(t * 0.1) * 0.05})`;
    ctx.beginPath();
    ctx.arc(x + T / 2, y + T / 2 + bob, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  // Flying shuriken projectile
  function drawShuriken(ctx, x, y, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.3);
    ctx.fillStyle = '#b0bec5';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? 6 : 2.5;
      const a = (i * Math.PI) / 4;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#546e7a';
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Tanuki enemy (cute raccoon dog)
  function drawTanuki(ctx, x, y, facingRight, t) {
    ctx.save();
    ctx.translate(x + T / 2, y + T);
    if (!facingRight) ctx.scale(-1, 1);
    const bob = Math.sin(t * 0.1) * 1;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.ellipse(-10, -8 + bob, 5, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Tail stripes
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-14, -6 + bob, 8, 2);
    ctx.fillRect(-13, -10 + bob, 6, 2);

    // Body
    ctx.fillStyle = '#a1887f';
    roundRect(ctx, -9, -14 + bob, 18, 16, 5);
    ctx.fill();

    // Belly
    ctx.fillStyle = '#d7ccc8';
    ctx.beginPath();
    ctx.ellipse(0, -4 + bob, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Feet
    ctx.fillStyle = '#5d4037';
    const waddle = Math.sin(t * 0.15) * 2;
    ctx.beginPath();
    ctx.ellipse(-5 + waddle, -1, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5 - waddle, -1, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#8d6e63';
    roundRect(ctx, -10, -26 + bob, 20, 14, 5);
    ctx.fill();

    // Face markings
    ctx.fillStyle = '#5d4037';
    // Eye patches
    ctx.beginPath();
    ctx.ellipse(-4, -20 + bob, 4, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(4, -20 + bob, 4, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (cute and silly)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-4, -21 + bob, 3, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(4, -21 + bob, 3, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Derpy pupils
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(-3, -20 + bob, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, -21 + bob, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.ellipse(0, -17 + bob, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Silly smile
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -15 + bob, 4, 0.1, Math.PI - 0.1);
    ctx.stroke();

    // Ears
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.moveTo(-10, -24 + bob);
    ctx.lineTo(-13, -30 + bob);
    ctx.lineTo(-6, -26 + bob);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10, -24 + bob);
    ctx.lineTo(13, -30 + bob);
    ctx.lineTo(6, -26 + bob);
    ctx.fill();

    ctx.restore();
  }

  // Kappa enemy (water imp)
  function drawKappa(ctx, x, y, facingRight, t) {
    ctx.save();
    ctx.translate(x + T / 2, y + T);
    if (!facingRight) ctx.scale(-1, 1);
    const bob = Math.sin(t * 0.08) * 1.5;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shell
    ctx.fillStyle = '#4caf50';
    roundRect(ctx, -8, -12 + bob, 16, 14, 4);
    ctx.fill();
    ctx.fillStyle = '#388e3c';
    // Shell pattern
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, -10 + bob); ctx.lineTo(-4, 0 + bob);
    ctx.moveTo(0, -10 + bob); ctx.lineTo(0, 0 + bob);
    ctx.moveTo(4, -10 + bob); ctx.lineTo(4, 0 + bob);
    ctx.stroke();

    // Belly
    ctx.fillStyle = '#c8e6c9';
    ctx.beginPath();
    ctx.ellipse(0, -3 + bob, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Feet
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.ellipse(-5, -1, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, -1, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#66bb6a';
    roundRect(ctx, -9, -24 + bob, 18, 13, 6);
    ctx.fill();

    // Head plate (sara - water dish)
    ctx.fillStyle = '#bbdefb';
    ctx.strokeStyle = '#90caf9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, -25 + bob, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Water shimmer
    ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(t * 0.1) * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(-1, -25 + bob, 3, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#ffb74d';
    ctx.beginPath();
    ctx.moveTo(0, -16 + bob);
    ctx.lineTo(5, -14 + bob);
    ctx.lineTo(0, -12 + bob);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-4, -18 + bob, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3, -18 + bob, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(-3.5, -18 + bob, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3.5, -18 + bob, 1.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Oni enemy (cute little demon)
  function drawOni(ctx, x, y, facingRight, t) {
    ctx.save();
    ctx.translate(x + T / 2, y + T);
    if (!facingRight) ctx.scale(-1, 1);
    const bob = Math.sin(t * 0.12) * 1;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#e57373';
    roundRect(ctx, -8, -14 + bob, 16, 16, 5);
    ctx.fill();

    // Belly
    ctx.fillStyle = '#ffcdd2';
    ctx.beginPath();
    ctx.ellipse(0, -5 + bob, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Feet
    ctx.fillStyle = '#c62828';
    ctx.beginPath();
    ctx.ellipse(-4, -1, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(4, -1, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Little club
    ctx.fillStyle = '#8d6e63';
    ctx.save();
    ctx.translate(9, -8 + bob);
    ctx.rotate(Math.sin(t * 0.1) * 0.2);
    ctx.fillRect(0, -2, 3, 12);
    ctx.fillStyle = '#795548';
    roundRect(ctx, -1, -5, 5, 6, 2);
    ctx.fill();
    ctx.restore();

    // Head
    ctx.fillStyle = '#ef5350';
    roundRect(ctx, -10, -28 + bob, 20, 16, 6);
    ctx.fill();

    // Horns
    ctx.fillStyle = '#fff9c4';
    ctx.beginPath();
    ctx.moveTo(-6, -26 + bob);
    ctx.lineTo(-8, -34 + bob);
    ctx.lineTo(-3, -27 + bob);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, -26 + bob);
    ctx.lineTo(8, -34 + bob);
    ctx.lineTo(3, -27 + bob);
    ctx.fill();

    // Eyes (big cute angry eyes)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-4, -20 + bob, 3.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(4, -20 + bob, 3.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Angry eyebrows
    ctx.strokeStyle = '#b71c1c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-7, -24 + bob);
    ctx.lineTo(-2, -23 + bob);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(7, -24 + bob);
    ctx.lineTo(2, -23 + bob);
    ctx.stroke();

    // Pupils
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(-3.5, -20 + bob, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4.5, -20 + bob, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (fang grin)
    ctx.fillStyle = '#b71c1c';
    ctx.beginPath();
    ctx.arc(0, -14 + bob, 4, 0, Math.PI);
    ctx.fill();
    // Tiny fangs
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(-3, -14 + bob);
    ctx.lineTo(-2, -11 + bob);
    ctx.lineTo(-1, -14 + bob);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(1, -14 + bob);
    ctx.lineTo(2, -11 + bob);
    ctx.lineTo(3, -14 + bob);
    ctx.fill();

    ctx.restore();
  }

  // Level-specific tile drawing
  function drawTile(ctx, type, x, y, levelTheme, t) {
    switch (type) {
      case 1: // Ground
        if (levelTheme === 'forest') {
          ctx.fillStyle = '#5d4037';
          ctx.fillRect(x, y, T, T);
          ctx.fillStyle = '#4caf50';
          ctx.fillRect(x, y, T, 6);
          ctx.fillStyle = '#66bb6a';
          ctx.fillRect(x + 2, y, 4, 3);
          ctx.fillRect(x + 14, y, 6, 4);
          ctx.fillRect(x + 26, y, 4, 3);
        } else if (levelTheme === 'castle') {
          ctx.fillStyle = '#616161';
          ctx.fillRect(x, y, T, T);
          ctx.strokeStyle = '#424242';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, T - 1, T - 1);
          ctx.strokeRect(x + 4, y + 4, T - 8, T - 8);
        } else {
          ctx.fillStyle = '#8d6e63';
          ctx.fillRect(x, y, T, T);
          ctx.fillStyle = '#a1887f';
          ctx.fillRect(x, y, T, 5);
        }
        break;

      case 2: // Platform (wood/bamboo)
        if (levelTheme === 'forest') {
          // Bamboo platform
          ctx.fillStyle = '#7cb342';
          roundRect(ctx, x, y + 2, T, 8, 3);
          ctx.fill();
          ctx.fillStyle = '#689f38';
          ctx.fillRect(x + 4, y + 4, T - 8, 2);
          // Bamboo nodes
          ctx.fillStyle = '#8bc34a';
          ctx.fillRect(x, y + 2, 3, 8);
          ctx.fillRect(x + T - 3, y + 2, 3, 8);
        } else if (levelTheme === 'castle') {
          // Wooden bridge
          ctx.fillStyle = '#6d4c41';
          ctx.fillRect(x, y + 2, T, 8);
          ctx.fillStyle = '#5d4037';
          ctx.fillRect(x, y + 5, T, 2);
          ctx.fillStyle = '#8d6e63';
          for (let i = 0; i < T; i += 8) {
            ctx.fillRect(x + i, y + 2, 1, 8);
          }
        } else {
          // Pagoda rooftop
          ctx.fillStyle = '#c62828';
          ctx.beginPath();
          ctx.moveTo(x - 2, y + 10);
          ctx.lineTo(x + T / 2, y);
          ctx.lineTo(x + T + 2, y + 10);
          ctx.fill();
          ctx.fillStyle = '#d32f2f';
          ctx.fillRect(x, y + 8, T, 4);
        }
        break;

      case 3: // Cloud platform
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        const cloudBob = Math.sin(t * 0.02 + x * 0.01) * 2;
        ctx.beginPath();
        ctx.ellipse(x + T / 2, y + 10 + cloudBob, T / 2 + 4, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + T / 2 - 8, y + 8 + cloudBob, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + T / 2 + 8, y + 8 + cloudBob, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 4: // Decoration: bamboo
        ctx.fillStyle = '#66bb6a';
        ctx.fillRect(x + 13, y, 6, T);
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(x + 13, y + 8, 6, 2);
        ctx.fillRect(x + 13, y + 22, 6, 2);
        // Leaves
        ctx.fillStyle = '#81c784';
        ctx.beginPath();
        ctx.ellipse(x + 8, y + 6, 6, 3, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 24, y + 18, 6, 3, 0.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 5: // Decoration: lantern
        ctx.fillStyle = '#f44336';
        roundRect(ctx, x + 10, y + 4, 12, 16, 4);
        ctx.fill();
        ctx.fillStyle = '#ffcdd2';
        ctx.fillRect(x + 12, y + 8, 8, 2);
        ctx.fillRect(x + 12, y + 14, 8, 2);
        // String
        ctx.strokeStyle = '#795548';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 16, y);
        ctx.lineTo(x + 16, y + 4);
        ctx.stroke();
        // Glow
        ctx.fillStyle = `rgba(255,200,50,${0.1 + Math.sin(t * 0.05) * 0.05})`;
        ctx.beginPath();
        ctx.arc(x + 16, y + 12, 14, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 9: // Level end flag
        // Pole
        ctx.fillStyle = '#795548';
        ctx.fillRect(x + 14, y, 4, T);
        // Flag
        ctx.fillStyle = '#e53935';
        const flagWave = Math.sin(t * 0.08) * 2;
        ctx.beginPath();
        ctx.moveTo(x + 18, y + 2);
        ctx.lineTo(x + 30 + flagWave, y + 6);
        ctx.lineTo(x + 28 + flagWave, y + 14);
        ctx.lineTo(x + 18, y + 12);
        ctx.fill();
        // Star on flag
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(x + 24 + flagWave * 0.5, y + 8, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }

  // Backgrounds
  function drawBackground(ctx, levelTheme, camX, canvasW, canvasH, t) {
    if (levelTheme === 'forest') {
      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvasH);
      grad.addColorStop(0, '#87ceeb');
      grad.addColorStop(0.6, '#b3e5fc');
      grad.addColorStop(1, '#e1f5fe');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Far mountains (parallax 0.1)
      drawMountains(ctx, camX * 0.1, canvasH, canvasW, '#a5d6a7', 0.5);
      drawMountains(ctx, camX * 0.15, canvasH, canvasW, '#81c784', 0.4);

      // Clouds (parallax 0.05)
      drawClouds(ctx, camX * 0.05, canvasH, canvasW, t);

      // Trees (parallax 0.3)
      drawTrees(ctx, camX * 0.3, canvasH, canvasW, '#4caf50', '#388e3c');

    } else if (levelTheme === 'castle') {
      // Night sky
      const grad = ctx.createLinearGradient(0, 0, 0, canvasH);
      grad.addColorStop(0, '#1a237e');
      grad.addColorStop(0.5, '#283593');
      grad.addColorStop(1, '#3949ab');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Stars
      drawStars(ctx, canvasW, canvasH, t);

      // Moon
      ctx.fillStyle = '#fff9c4';
      ctx.beginPath();
      ctx.arc(canvasW * 0.8 - camX * 0.02, canvasH * 0.15, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a237e';
      ctx.beginPath();
      ctx.arc(canvasW * 0.8 - camX * 0.02 + 8, canvasH * 0.15 - 5, 25, 0, Math.PI * 2);
      ctx.fill();

      // Castle silhouettes
      drawCastleBg(ctx, camX * 0.15, canvasH, canvasW);

    } else { // village
      // Sunset sky
      const grad = ctx.createLinearGradient(0, 0, 0, canvasH);
      grad.addColorStop(0, '#ffccbc');
      grad.addColorStop(0.3, '#ffab91');
      grad.addColorStop(0.6, '#ff8a65');
      grad.addColorStop(1, '#ffcc80');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Mountains
      drawMountains(ctx, camX * 0.1, canvasH, canvasW, '#ef9a9a', 0.5);

      // Cherry blossom trees
      drawCherryTrees(ctx, camX * 0.25, canvasH, canvasW, t);

      // Clouds
      drawClouds(ctx, camX * 0.05, canvasH, canvasW, t);
    }
  }

  function drawMountains(ctx, offsetX, h, w, color, heightRatio) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = -100; x < w + 200; x += 80) {
      const mx = x - (offsetX % 160);
      const my = h - h * heightRatio + Math.sin(mx * 0.01 + 1) * 40 + Math.cos(mx * 0.007) * 30;
      ctx.lineTo(mx, my);
    }
    ctx.lineTo(w + 100, h);
    ctx.fill();
  }

  function drawClouds(ctx, offsetX, h, w, t) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i < 6; i++) {
      const cx = ((i * 250 + 100) - offsetX) % (w + 300) - 100;
      const cy = 40 + i * 30 + Math.sin(t * 0.005 + i) * 5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 40 + i * 5, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - 20, cy + 5, 25, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 25, cy + 5, 30, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawTrees(ctx, offsetX, h, w, c1, c2) {
    for (let i = 0; i < 12; i++) {
      const tx = ((i * 130 + 50) - offsetX) % (w + 300) - 100;
      const treeH = 60 + (i % 3) * 20;
      // Trunk
      ctx.fillStyle = '#795548';
      ctx.fillRect(tx - 4, h - treeH - 20, 8, treeH + 20);
      // Foliage
      ctx.fillStyle = c1;
      ctx.beginPath();
      ctx.arc(tx, h - treeH - 10, 25 + (i % 3) * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.arc(tx - 10, h - treeH, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawStars(ctx, w, h, t) {
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 30; i++) {
      const sx = (i * 97 + 23) % w;
      const sy = (i * 53 + 17) % (h * 0.5);
      const twinkle = Math.sin(t * 0.03 + i * 2) > 0.3;
      if (twinkle) {
        ctx.globalAlpha = 0.5 + Math.sin(t * 0.05 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawCastleBg(ctx, offsetX, h, w) {
    ctx.fillStyle = '#1a1a3e';
    for (let i = 0; i < 5; i++) {
      const cx = ((i * 300 + 100) - offsetX) % (w + 400) - 100;
      const ch = 80 + (i % 3) * 40;
      ctx.fillRect(cx, h - ch - 30, 50, ch + 30);
      // Turret
      ctx.beginPath();
      ctx.moveTo(cx - 5, h - ch - 30);
      ctx.lineTo(cx + 25, h - ch - 50);
      ctx.lineTo(cx + 55, h - ch - 30);
      ctx.fill();
      // Windows
      ctx.fillStyle = '#ffeb3b';
      ctx.globalAlpha = 0.4;
      ctx.fillRect(cx + 15, h - ch, 8, 10);
      ctx.fillRect(cx + 30, h - ch + 20, 8, 10);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#1a1a3e';
    }
  }

  function drawCherryTrees(ctx, offsetX, h, w, t) {
    for (let i = 0; i < 8; i++) {
      const tx = ((i * 170 + 80) - offsetX) % (w + 400) - 100;
      // Trunk
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(tx - 3, h - 80, 6, 60);
      // Branches
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tx, h - 60);
      ctx.quadraticCurveTo(tx + 20, h - 70, tx + 30, h - 65);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tx, h - 70);
      ctx.quadraticCurveTo(tx - 15, h - 80, tx - 25, h - 75);
      ctx.stroke();
      // Blossoms
      ctx.fillStyle = '#f8bbd0';
      ctx.beginPath();
      ctx.arc(tx, h - 80, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f48fb1';
      ctx.beginPath();
      ctx.arc(tx + 10, h - 75, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fce4ec';
      ctx.beginPath();
      ctx.arc(tx - 12, h - 78, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tx + 25, h - 68, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tx - 22, h - 72, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // HUD
  function drawHUD(ctx, score, lives, level, shurikens, canvasW) {
    ctx.save();
    // Semi-transparent bar
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, canvasW, 36);

    ctx.font = 'bold 16px monospace';
    ctx.textBaseline = 'middle';

    // Score (sushi icon + number)
    ctx.fillStyle = '#ffeb3b';
    ctx.fillText('SUSHI: ' + score, 10, 18);

    // Lives (hearts)
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < lives ? '#e53935' : '#555';
      drawHeart(ctx, canvasW / 2 - 30 + i * 22, 18, 8);
    }

    // Level
    ctx.fillStyle = '#81d4fa';
    ctx.textAlign = 'right';
    ctx.fillText('LV ' + level, canvasW - 80, 18);

    // Shurikens
    ctx.fillStyle = '#b0bec5';
    ctx.fillText('x' + shurikens, canvasW - 10, 18);

    ctx.restore();
  }

  function drawHeart(ctx, cx, cy, size) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + size * 0.3);
    ctx.bezierCurveTo(cx, cy - size * 0.3, cx - size, cy - size * 0.3, cx - size, cy + size * 0.1);
    ctx.bezierCurveTo(cx - size, cy + size * 0.6, cx, cy + size, cx, cy + size);
    ctx.bezierCurveTo(cx, cy + size, cx + size, cy + size * 0.6, cx + size, cy + size * 0.1);
    ctx.bezierCurveTo(cx + size, cy - size * 0.3, cx, cy - size * 0.3, cx, cy + size * 0.3);
    ctx.fill();
  }

  // Title screen
  function drawTitle(ctx, w, h, t) {
    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#ff8a80');
    grad.addColorStop(0.5, '#ffab91');
    grad.addColorStop(1, '#ffccbc');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Cherry blossoms bg
    ctx.fillStyle = '#fce4ec';
    for (let i = 0; i < 20; i++) {
      const bx = (i * 73 + t * 0.3) % (w + 40) - 20;
      const by = (i * 47 + Math.sin(t * 0.02 + i) * 20) % h;
      ctx.beginPath();
      ctx.ellipse(bx, by, 4, 2.5, (t * 0.01 + i), 0, Math.PI * 2);
      ctx.fill();
    }

    // Title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.font = 'bold 42px monospace';
    ctx.fillText('NINJA', w / 2 + 2, h * 0.25 + 2);
    ctx.font = 'bold 32px monospace';
    ctx.fillText('ADVENTURE!', w / 2 + 2, h * 0.25 + 42);

    // Main title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 42px monospace';
    ctx.fillText('NINJA', w / 2, h * 0.25);
    ctx.fillStyle = '#ffeb3b';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('ADVENTURE!', w / 2, h * 0.25 + 40);

    // Draw ninja character in center
    drawNinja(ctx, w / 2 - T / 2, h * 0.45, 'idle', 0, true, t);

    // Press start
    ctx.globalAlpha = 0.6 + Math.sin(t * 0.08) * 0.4;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PRESS ENTER / TAP TO START', w / 2, h * 0.75);
    ctx.globalAlpha = 1;

    // Controls hint
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '12px monospace';
    ctx.fillText('Arrow Keys: Move | Space: Jump | X: Shuriken', w / 2, h * 0.85);

    ctx.restore();
  }

  // Game Over screen
  function drawGameOver(ctx, w, h, score, t) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#e53935';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('GAME OVER', w / 2, h * 0.35);

    ctx.fillStyle = '#ffeb3b';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('SCORE: ' + score, w / 2, h * 0.48);

    ctx.globalAlpha = 0.5 + Math.sin(t * 0.08) * 0.5;
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText('PRESS ENTER TO RETRY', w / 2, h * 0.65);
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  // Level complete screen
  function drawLevelComplete(ctx, w, h, level, score, t) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#ffeb3b';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('LEVEL ' + level + ' CLEAR!', w / 2, h * 0.35);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('SCORE: ' + score, w / 2, h * 0.48);

    ctx.globalAlpha = 0.5 + Math.sin(t * 0.08) * 0.5;
    ctx.fillStyle = '#81d4fa';
    ctx.font = '16px monospace';
    ctx.fillText('PRESS ENTER FOR NEXT LEVEL', w / 2, h * 0.65);
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  return {
    T,
    drawNinja,
    drawSushi,
    drawShurikenPickup,
    drawShuriken,
    drawTanuki,
    drawKappa,
    drawOni,
    drawTile,
    drawBackground,
    drawHUD,
    drawTitle,
    drawGameOver,
    drawLevelComplete
  };
})();
