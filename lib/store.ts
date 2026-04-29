import { create } from 'zustand';

interface AppState {
  parsedResult: any | null;
  setParsedResult: (result: any) => void;
  clearParsedResult: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  parsedResult: null,
  setParsedResult: (result) => set({ parsedResult: result }),
  clearParsedResult: () => set({ parsedResult: null }),
}));
