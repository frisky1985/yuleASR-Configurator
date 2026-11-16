// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';

import { useSettingsStore } from '@/stores/settingsStore';

describe('workbench 布局设置', () => {
  it('默认值可用', () => {
    expect(useSettingsStore.getState().workbench).toEqual({
      treeWidth: 280,
      inspectorWidth: 320,
      bottomHeight: 180,
      bottomCollapsed: false,
      activeSegment: 'basic',
      problemsFilter: 'all',
      bottomTab: 'problems',
    });
  });

  it('updateWorkbenchSettings 局部合并', () => {
    useSettingsStore.getState().updateWorkbenchSettings({ treeWidth: 340 });
    expect(useSettingsStore.getState().workbench.treeWidth).toBe(340);
    expect(useSettingsStore.getState().workbench.inspectorWidth).toBe(320);
  });
});
