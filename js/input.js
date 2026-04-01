// Input handling for keyboard and touch
const Input = (() => {
  const keys = {};
  const justPressed = {};

  // Keyboard
  window.addEventListener('keydown', e => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'KeyX', 'KeyZ', 'Enter'].includes(e.code)) {
      e.preventDefault();
      if (!keys[e.code]) justPressed[e.code] = true;
      keys[e.code] = true;
    }
  });

  window.addEventListener('keyup', e => {
    keys[e.code] = false;
  });

  // Touch
  const touchState = { left: false, right: false, jump: false, attack: false };
  let jumpTouchJustPressed = false;
  let attackTouchJustPressed = false;

  function setupTouch() {
    const bind = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;

      const onStart = (e) => {
        e.preventDefault();
        touchState[key] = true;
        el.classList.add('pressed');
        if (key === 'jump') jumpTouchJustPressed = true;
        if (key === 'attack') attackTouchJustPressed = true;
      };
      const onEnd = (e) => {
        e.preventDefault();
        touchState[key] = false;
        el.classList.remove('pressed');
      };

      el.addEventListener('touchstart', onStart, { passive: false });
      el.addEventListener('touchend', onEnd, { passive: false });
      el.addEventListener('touchcancel', onEnd, { passive: false });
      // Mouse fallback for testing
      el.addEventListener('mousedown', onStart);
      el.addEventListener('mouseup', onEnd);
      el.addEventListener('mouseleave', onEnd);
    };

    bind('btnLeft', 'left');
    bind('btnRight', 'right');
    bind('btnJump', 'jump');
    bind('btnAttack', 'attack');
  }

  // Prevent default touch on canvas
  window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    canvas.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    setupTouch();
  });

  return {
    isDown(action) {
      switch (action) {
        case 'left': return keys['ArrowLeft'] || touchState.left;
        case 'right': return keys['ArrowRight'] || touchState.right;
        case 'jump': return keys['Space'] || keys['ArrowUp'] || keys['KeyZ'] || touchState.jump;
        case 'attack': return keys['KeyX'] || touchState.attack;
        case 'enter': return keys['Enter'] || keys['Space'];
      }
      return false;
    },

    isJustPressed(action) {
      switch (action) {
        case 'jump':
          return justPressed['Space'] || justPressed['ArrowUp'] || justPressed['KeyZ'] || jumpTouchJustPressed;
        case 'attack':
          return justPressed['KeyX'] || attackTouchJustPressed;
        case 'enter':
          return justPressed['Enter'] || justPressed['Space'] || jumpTouchJustPressed;
      }
      return false;
    },

    clearFrame() {
      for (const k in justPressed) justPressed[k] = false;
      jumpTouchJustPressed = false;
      attackTouchJustPressed = false;
    }
  };
})();
