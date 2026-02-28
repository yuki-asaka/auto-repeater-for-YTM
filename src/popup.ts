import { RepeatMode, REPEAT_MODE_STORAGE_KEY, DEFAULT_REPEAT_MODE } from './types';

/**
 * Popup script for YouTube Music Auto Repeat
 */

const DEBUG = false; // Set to true to enable logging
const PREFIX = '[YTM-AutoRepeat-Popup]';

const log = (msg: string, ...args: any[]) => DEBUG && console.log(`${PREFIX} ${msg}`, ...args);

/**
 * Update the radio button selection in the UI
 */
export function updateUI(mode: RepeatMode): void {
  const radio = document.getElementById(`mode-${mode}`) as HTMLInputElement | null;
  if (radio) {
    radio.checked = true;
  }
}

/**
 * Initialize the popup UI and storage listeners
 */
export function init(): void {
  log('Popup script loaded');
  
  // 1. Load saved repeat mode from storage
  chrome.storage.sync.get({ [REPEAT_MODE_STORAGE_KEY]: DEFAULT_REPEAT_MODE }, (data) => {
    const currentMode = data[REPEAT_MODE_STORAGE_KEY] as RepeatMode;
    log('Loaded initial mode:', currentMode);
    updateUI(currentMode);
  });

  // 2. Save repeat mode to storage whenever a radio button is selected
  document.querySelectorAll<HTMLInputElement>('input[name="repeat-mode"]').forEach((radio) => {
    radio.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const repeatMode = target.value as RepeatMode;
      log('Changing mode to:', repeatMode);
      chrome.storage.sync.set({ [REPEAT_MODE_STORAGE_KEY]: repeatMode }, () => {
        log('Storage updated');
      });
    });
  });

  // 3. Listen for external changes (e.g. from YTM UI manual clicks)
  chrome.storage.onChanged.addListener((changes) => {
    if (changes[REPEAT_MODE_STORAGE_KEY]) {
      const newMode = changes[REPEAT_MODE_STORAGE_KEY].newValue as RepeatMode;
      log('External storage change detected:', newMode);
      updateUI(newMode);
    }
  });
}

// Handle initialization based on document ready state
if (document.readyState !== 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
