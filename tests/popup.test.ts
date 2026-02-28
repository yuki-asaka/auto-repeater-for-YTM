import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { REPEAT_MODE_STORAGE_KEY } from '../src/types';

// Mock chrome API
const chromeMock: any = {
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
    onChanged: {
      addListener: vi.fn(),
    }
  },
  runtime: {
    lastError: null,
  }
};
(global as any).chrome = chromeMock;

describe('popup.ts', () => {
  let dom: JSDOM;
  let document: Document;
  let popup: any;

  beforeEach(async () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../src/popup.html'), 'utf8');
    dom = new JSDOM(html);
    document = dom.window.document;
    (global as any).document = document;
    (global as any).window = dom.window;
    (global as any).HTMLElement = dom.window.HTMLElement;
    (global as any).Node = dom.window.Node;
    (global as any).HTMLInputElement = dom.window.HTMLInputElement;
    vi.clearAllMocks();

    // Re-import the module to ensure it picks up the mock globals
    popup = await import('../src/popup');
  });

  it('loads and displays repeat mode from storage', async () => {
    chromeMock.storage.sync.get.mockImplementation((_defaults: any, callback: any) => {
      callback({ [REPEAT_MODE_STORAGE_KEY]: 'one' });
    });

    popup.init();

    const radioOne = document.getElementById('mode-one') as HTMLInputElement;
    expect(radioOne.checked).toBe(true);
  });

  it('saves repeat mode to storage on change', async () => {
    chromeMock.storage.sync.get.mockImplementation((_defaults: any, callback: any) => {
      callback({ [REPEAT_MODE_STORAGE_KEY]: 'all' });
    });

    popup.init();

    const radioOne = document.getElementById('mode-one') as HTMLInputElement;
    // Simulate radio click/change
    radioOne.checked = true;
    radioOne.dispatchEvent(new dom.window.Event('change'));

    expect(chromeMock.storage.sync.set).toHaveBeenCalledWith(
      expect.objectContaining({ [REPEAT_MODE_STORAGE_KEY]: 'one' }),
      expect.any(Function)
    );
  });
});
