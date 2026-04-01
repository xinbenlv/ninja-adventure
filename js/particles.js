// Particle system for visual effects
const Particles = (() => {
  const particles = [];

  function add(x, y, count, config) {
    for (let i = 0; i < count; i++) {
      const angle = config.angle !== undefined
        ? config.angle + (Math.random() - 0.5) * (config.spread || Math.PI)
        : Math.random() * Math.PI * 2;
      const speed = (config.speed || 2) * (0.5 + Math.random());
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: config.life || 60,
        maxLife: config.life || 60,
        size: config.size || 3,
        color: config.colors
          ? config.colors[Math.floor(Math.random() * config.colors.length)]
          : config.color || '#fff',
        gravity: config.gravity || 0,
        shape: config.shape || 'circle',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        friction: config.friction || 1
      });
    }
  }

  function update() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function draw(ctx, camX, camY) {
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      const sx = p.x - camX;
      const sy = p.y - camY;

      if (p.shape === 'petal') {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.shape === 'star') {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(p.rotation);
        drawStar(ctx, 0, 0, 4, p.size, p.size * 0.4);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / spikes - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  return {
    add,
    update,
    draw,
    // Preset effects
    enemyDefeat(x, y) {
      add(x, y, 12, {
        speed: 3, life: 30, size: 4, shape: 'star',
        colors: ['#ffeb3b', '#ff9800', '#fff', '#ffd54f'],
        gravity: 0.05
      });
    },
    coinCollect(x, y) {
      add(x, y, 6, {
        speed: 2, life: 20, size: 3,
        colors: ['#ffeb3b', '#fff', '#ffd54f'],
        gravity: -0.02
      });
    },
    playerHit(x, y) {
      add(x, y, 8, {
        speed: 2, life: 20, size: 3,
        colors: ['#f44336', '#fff', '#ff8a80']
      });
    },
    cherryBlossoms(x, y, w) {
      // Ambient falling petals across screen width
      if (Math.random() < 0.03) {
        add(
          x + Math.random() * w, y - 10, 1,
          {
            speed: 0.5, life: 180, size: 3, shape: 'petal',
            colors: ['#ffb7c5', '#ffc1cc', '#ffd1dc', '#fff0f5'],
            gravity: 0.02, friction: 0.99,
            angle: Math.PI / 2, spread: 0.5
          }
        );
      }
    }
  };
})();
