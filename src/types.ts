/**
 * YouTube Music のリピートモード
 */
export type RepeatMode = 'all' | 'one' | 'none';

/**
 * 拡張機能の設定構造
 */
export interface IRepeatSettings {
  repeatMode: RepeatMode;
}

/**
 * Bridge (MAIN World) へ送信されるカスタムイベントのペイロード
 */
export interface ISetModeEventDetail {
  targetMode: RepeatMode;
  currentMode: RepeatMode;
}

/**
 * 共通定数
 */
export const REPEAT_MODE_STORAGE_KEY = 'repeatMode';
export const AUTO_REPEAT_EVENT_NAME = 'YTM_AUTO_REPEAT_SET_MODE';
export const DEFAULT_REPEAT_MODE: RepeatMode = 'all';
