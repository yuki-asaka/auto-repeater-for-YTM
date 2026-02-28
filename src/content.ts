import { RepeatMode, REPEAT_MODE_STORAGE_KEY, AUTO_REPEAT_EVENT_NAME, DEFAULT_REPEAT_MODE, ISetModeEventDetail } from './types';

/**
 * Content Script for YouTube Music Auto Repeat
 */

const DEBUG = false; // Set to true to enable logging
const PREFIX = '[YTM-AutoRepeat-Content]';

const log = (msg: string) => DEBUG && console.log(`${PREFIX} ${msg}`);
const warn = (msg: string) => DEBUG && console.warn(`${PREFIX} ${msg}`);

let isInternalChange = false;
let isUserClicking = false;
let pendingTargetMode: RepeatMode | null = null;
let userClickTimeout: number | null = null;

/**
 * Determine the current repeat mode from SVG path data
 */
function getModeFromElement(element: Element | null): RepeatMode {
  if (!element) return 'none';
  const svgPath = element.querySelector('path');
  if (!svgPath) return 'none';
  const d = svgPath.getAttribute('d') || '';
  // Check SVG path data to identify repeat mode
  if (d.includes('M13 15') || d.includes('v5Z') || d.includes('h-2v-4h-1')) return 'one';
  if (d.includes('M12 10a2 2')) return 'all';
  return 'none';
}

function findRepeatButton(): Element | null {
  return document.querySelector('ytmusic-player-bar yt-icon-button.repeat, ytmusic-player-bar .repeat');
}

/**
 * Request mode change with current state context
 */
function requestModeChange(targetMode: RepeatMode, currentMode: RepeatMode): void {
  const detail: ISetModeEventDetail = { targetMode, currentMode };
  window.dispatchEvent(new CustomEvent(AUTO_REPEAT_EVENT_NAME, { detail }));
}

async function enforceMode(targetMode: RepeatMode): Promise<void> {
  if (isInternalChange && pendingTargetMode === targetMode) return;

  const button = findRepeatButton();
  if (!button) {
    warn('Repeat button not found in DOM');
    return;
  }

  const currentMode = getModeFromElement(button);
  if (currentMode === targetMode) {
    pendingTargetMode = null;
    isInternalChange = false;
    return;
  }

  log(`Enforcing mode: ${currentMode} -> ${targetMode}`);
  isInternalChange = true;
  pendingTargetMode = targetMode;
  requestModeChange(targetMode, currentMode);

  let checks = 0;
  const interval = window.setInterval(() => {
    const btn = findRepeatButton();
    const nowMode = getModeFromElement(btn);
    if (nowMode === targetMode) {
      clearInterval(interval);
      setTimeout(() => {
        isInternalChange = false;
        pendingTargetMode = null;
        log(`SUCCESS: Mode changed to ${targetMode}`);
      }, 500);
    } else if (checks > 15) {
      clearInterval(interval);
      isInternalChange = false;
      pendingTargetMode = null;
      warn(`TIMEOUT: Mode failed to change to ${targetMode}`);
    }
    checks++;
  }, 200);
}

/**
 * Register click listener to detect manual user interaction
 */
function registerClickListener(button: Element): void {
  button.addEventListener('click', () => {
    log('User clicked repeat button manually');
    isUserClicking = true;
    if (userClickTimeout) window.clearTimeout(userClickTimeout);
    userClickTimeout = window.setTimeout(() => {
      isUserClicking = false;
    }, 1500); // Consider "manual action" for 1.5 seconds
  });
}

function setupPlayerObserver(playerBar: Element): void {
  const button = findRepeatButton();
  if (button) registerClickListener(button);

  const observer = new MutationObserver(() => {
    if (isInternalChange) return;

    const btn = findRepeatButton();
    if (!btn) return;

    const currentMode = getModeFromElement(btn);
    
    chrome.storage.sync.get({ [REPEAT_MODE_STORAGE_KEY]: DEFAULT_REPEAT_MODE }, (data) => {
      const storedMode = data[REPEAT_MODE_STORAGE_KEY] as RepeatMode;
      
      if (storedMode !== currentMode) {
        if (isUserClicking) {
          // If the user is clicking the button, update the storage to match the new UI state
          log(`Manual UI change detected via click: ${storedMode} -> ${currentMode}. Updating storage.`);
          chrome.storage.sync.set({ [REPEAT_MODE_STORAGE_KEY]: currentMode });
        } else {
          // If it's an automatic reset (no recent click), re-enforce the preference
          if (pendingTargetMode !== null && currentMode !== pendingTargetMode) return;
          log(`Automatic UI reset detected: stored=${storedMode}, ui=${currentMode}. Re-enforcing...`);
          enforceMode(storedMode);
        }
      }
    });
  });

  observer.observe(playerBar, { 
    childList: true, attributes: true, subtree: true
  });
  
  // Track title observer for track changes
  const titleElement = playerBar.querySelector('.title');
  if (titleElement) {
    const titleObserver = new MutationObserver(() => {
      log('Track change detected via title observer');
      chrome.storage.sync.get({ [REPEAT_MODE_STORAGE_KEY]: DEFAULT_REPEAT_MODE }, (data) => {
        enforceMode(data[REPEAT_MODE_STORAGE_KEY] as RepeatMode);
      });
    });
    titleObserver.observe(titleElement, { childList: true, characterData: true, subtree: true });
  }
}

function startObserver(): void {
  const playerBar = document.querySelector('ytmusic-player-bar');
  if (!playerBar) {
    const bodyObserver = new MutationObserver(() => {
      const bar = document.querySelector('ytmusic-player-bar');
      if (bar) {
        bodyObserver.disconnect();
        setupPlayerObserver(bar);
        chrome.storage.sync.get({ [REPEAT_MODE_STORAGE_KEY]: DEFAULT_REPEAT_MODE }, (data) => {
          enforceMode(data[REPEAT_MODE_STORAGE_KEY] as RepeatMode);
        });
      }
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
    return;
  }
  setupPlayerObserver(playerBar);
  chrome.storage.sync.get({ [REPEAT_MODE_STORAGE_KEY]: DEFAULT_REPEAT_MODE }, (data) => {
    enforceMode(data[REPEAT_MODE_STORAGE_KEY] as RepeatMode);
  });
}

function init(): void {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    startObserver();
    chrome.storage.onChanged.addListener((changes) => {
      if (changes[REPEAT_MODE_STORAGE_KEY]) {
        const newMode = changes[REPEAT_MODE_STORAGE_KEY].newValue as RepeatMode;
        if (!isInternalChange && !isUserClicking) {
          log(`External storage change detected: enforcing ${newMode}`);
          enforceMode(newMode);
        }
      }
    });
  }
}

init();
log('Ready (Hybrid Logic)');
