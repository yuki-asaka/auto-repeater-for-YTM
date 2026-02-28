import { describe, it, expect } from 'vitest';
import type { RepeatMode, IRepeatSettings } from '../src/types';

describe('Common Types', () => {
  it('should have correct RepeatMode type', () => {
    const modes: RepeatMode[] = ['all', 'one', 'none'];
    expect(modes).toContain('all');
    expect(modes).toContain('one');
    expect(modes).toContain('none');
  });

  it('should have correct IRepeatSettings interface', () => {
    const settings: IRepeatSettings = {
      repeatMode: 'all'
    };
    expect(settings.repeatMode).toBe('all');
  });
});
