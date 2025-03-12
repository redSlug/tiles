import { DataConnection } from 'peerjs';
import { create } from 'zustand/index';

interface ZustandState {
  zustandConnection: DataConnection | undefined;
  setZustandConnection: (zustandConnection: DataConnection) => void;
  whatever: string;
  setWhatever: (whatever: string) => void;
}

export const usePeerJsStore = create<ZustandState>(set => ({
  zustandConnection: undefined,
  setZustandConnection: (zustandConnection: DataConnection) =>
    set(state => ({
      ...state,
      zustandConnection: zustandConnection,
    })),
  whatever: 'hi',
  setWhatever: (newWhatever: string) =>
    set(state => ({
      ...state,
      whatever: newWhatever,
    })),
}));
