import { RepeatMode, REPEAT_MODE_STORAGE_KEY, DEFAULT_REPEAT_MODE } from './types';

/**
 * Background script to handle extension icon updates
 */

interface BadgeInfo {
  text: string;
  color: string;
}

const modeBadge: Record<RepeatMode, BadgeInfo> = {
  'all': { text: 'ALL', color: '#4285F4' }, // Blue
  'one': { text: '1', color: '#1DB954' },   // Green
  'none': { text: '', color: '#000000' }    // Hidden
};

/**
 * Update the browser action badge based on the repeat mode
 */
function updateBadge(mode: RepeatMode): void {
  const badge = modeBadge[mode] || modeBadge['none'];
  chrome.action.setBadgeText({ text: badge.text });
  chrome.action.setBadgeBackgroundColor({ color: badge.color });
}

// Initial update
chrome.storage.sync.get({ [REPEAT_MODE_STORAGE_KEY]: DEFAULT_REPEAT_MODE }, (data) => {
  const mode = data[REPEAT_MODE_STORAGE_KEY] as RepeatMode;
  updateBadge(mode);
});

// Listen for changes from content script or popup
chrome.storage.onChanged.addListener((changes) => {
  if (changes[REPEAT_MODE_STORAGE_KEY]) {
    const newMode = changes[REPEAT_MODE_STORAGE_KEY].newValue as RepeatMode;
    updateBadge(newMode);
  }
});
