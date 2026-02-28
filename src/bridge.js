/**
 * Main World script to interact with YouTube Music's internal Player API.
 * Standalone script - Manually maintained to avoid build tool interference.
 */

(function() {
  const DEBUG = false; // Set to true to enable logging
  const PREFIX = '[YTM-AutoRepeat-Bridge]';
  const AUTO_REPEAT_EVENT_NAME = 'YTM_AUTO_REPEAT_SET_MODE';
  
  const log = (msg) => DEBUG && console.log(`${PREFIX} ${msg}`);
  const error = (msg, e) => DEBUG && console.error(`${PREFIX} ${msg}`, e);

  let playerApi = null;
  const modeMap = { 'none': 'NONE', 'all': 'ALL', 'one': 'ONE' };
  const modeOrder = ['none', 'all', 'one'];

  function findApi() {
    const app = document.querySelector('ytmusic-app');
    const playerBar = document.querySelector('ytmusic-player-bar');
    const layout = document.querySelector('ytmusic-app-layout');
    const moviePlayer = document.getElementById('movie_player');
    
    const player = app?.playerApi || app?.playerApi_ ||
                   playerBar?.playerApi || playerBar?.playerApi_ ||
                   layout?.playerApi || moviePlayer;

    if (player && typeof player.setRepeatMode === 'function') {
      playerApi = player;
      log('Player API successfully found.');
      return true;
    }
    return false;
  }

  let retries = 0;
  const poll = setInterval(() => {
    if (findApi() || retries > 30) {
      clearInterval(poll);
    }
    retries++;
  }, 500);

  window.addEventListener(AUTO_REPEAT_EVENT_NAME, (event) => {
    const { targetMode, currentMode } = event.detail || {};
    if (!targetMode) return;

    const apiMode = modeMap[targetMode];
    
    if (!playerApi) findApi();

    if (playerApi) {
      try {
        playerApi.setRepeatMode(apiMode);
        log(`API Call: setRepeatMode(${apiMode})`);
      } catch (e) {
        error('API call failed', e);
        smartFallback(targetMode, currentMode);
      }
    } else {
      smartFallback(targetMode, currentMode);
    }
  });

  function smartFallback(target, current) {
    if (!target || !current || target === current) return;

    const targetIdx = modeOrder.indexOf(target);
    const currentIdx = modeOrder.indexOf(current);
    
    if (targetIdx === -1 || currentIdx === -1) {
      pressR();
      return;
    }

    const presses = (targetIdx - currentIdx + 3) % 3;
    for (let i = 0; i < presses; i++) {
      setTimeout(() => pressR(), i * 150);
    }
  }

  function pressR() {
    const options = { key: 'r', code: 'KeyR', keyCode: 82, bubbles: true, composed: true };
    document.dispatchEvent(new KeyboardEvent('keydown', options));
    document.dispatchEvent(new KeyboardEvent('keyup', options));
  }

  log('Bridge ready');
})();
