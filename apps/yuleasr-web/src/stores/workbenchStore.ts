import { create } from 'zustand';

interface WorkbenchSessionState {
  configId: string | null;
  selectedIssueId: string | null;
  acknowledgedIssueIds: string[];
  selectIssue: (id: string | null) => void;
  acknowledgeIssue: (id: string) => void;
  resetForConfig: (configId: string) => void;
}

export const useWorkbenchStore = create<WorkbenchSessionState>(set => ({
  configId: null,
  selectedIssueId: null,
  acknowledgedIssueIds: [],

  selectIssue: id => set({ selectedIssueId: id }),

  acknowledgeIssue: id =>
    set(state => ({
      acknowledgedIssueIds: state.acknowledgedIssueIds.includes(id)
        ? state.acknowledgedIssueIds
        : [...state.acknowledgedIssueIds, id],
    })),

  resetForConfig: configId => set({ configId, selectedIssueId: null, acknowledgedIssueIds: [] }),
}));
