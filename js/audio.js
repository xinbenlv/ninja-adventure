// Web Audio API synthesized sound effects
const AudioManager = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function playTone(freq, duration, type, volume, slide) {
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type || 'square';
      osc.frequency.setValueAtTime(freq, c.currentTime);
      if (slide) {
        osc.frequency.linearRampToValueAtTime(slide, c.currentTime + duration);
      }
      gain.gain.setValueAtTime(volume || 0.15, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + duration);
    } catch (e) { /* audio not available */ }
  }

  return {
    jump() {
      playTone(300, 0.15, 'square', 0.12, 600);
    },
    doubleJump() {
      playTone(400, 0.12, 'square', 0.12, 900);
    },
    coin() {
      playTone(880, 0.08, 'square', 0.1);
      setTimeout(() => playTone(1200, 0.12, 'square', 0.1), 60);
    },
    hit() {
      playTone(200, 0.2, 'sawtooth', 0.12, 80);
    },
    enemyDefeat() {
      playTone(500, 0.08, 'square', 0.1, 800);
      setTimeout(() => playTone(700, 0.1, 'square', 0.08), 60);
    },
    shuriken() {
      playTone(800, 0.06, 'triangle', 0.08, 1200);
    },
    powerup() {
      playTone(500, 0.1, 'square', 0.1);
      setTimeout(() => playTone(600, 0.1, 'square', 0.1), 80);
      setTimeout(() => playTone(800, 0.15, 'square', 0.1), 160);
    },
    levelComplete() {
      const notes = [523, 659, 784, 1047];
      notes.forEach((n, i) => {
        setTimeout(() => playTone(n, 0.2, 'square', 0.1), i * 120);
      });
    },
    gameOver() {
      const notes = [400, 350, 300, 200];
      notes.forEach((n, i) => {
        setTimeout(() => playTone(n, 0.25, 'square', 0.1), i * 200);
      });
    },
    menuSelect() {
      playTone(600, 0.08, 'square', 0.08);
    }
  };
})();
