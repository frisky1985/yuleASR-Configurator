import { describe, it, expect, beforeEach } from 'vitest';

import { useWorkbenchStore } from '@/stores/workbenchStore';

describe('workbenchStore 会话态', () => {
  beforeEach(() => {
    useWorkbenchStore.getState().resetForConfig('c1');
  });

  it('选中与确认', () => {
    const store = useWorkbenchStore.getState();
    store.selectIssue('e1');
    store.acknowledgeIssue('e1');
    expect(useWorkbenchStore.getState().selectedIssueId).toBe('e1');
    expect(useWorkbenchStore.getState().acknowledgedIssueIds).toEqual(['e1']);
  });

  it('切换配置时清空选中与确认', () => {
    useWorkbenchStore.getState().acknowledgeIssue('e1');
    useWorkbenchStore.getState().resetForConfig('c2');
    expect(useWorkbenchStore.getState().acknowledgedIssueIds).toEqual([]);
    expect(useWorkbenchStore.getState().selectedIssueId).toBeNull();
    expect(useWorkbenchStore.getState().configId).toBe('c2');
  });
});
