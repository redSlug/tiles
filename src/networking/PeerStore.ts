import { DataConnection } from 'peerjs';
import { create } from 'zustand/index';

interface ZustandState {
  zustandConnection: DataConnection | undefined;
  setZustandConnection: (zustandConnection: DataConnection) => void;
}

export const usePeerJsStore = create<ZustandState>(set => ({
  zustandConnection: undefined,
  setZustandConnection: (zustandConnection: DataConnection) =>
    set((): { zustandConnection: DataConnection } => ({
      zustandConnection: zustandConnection,
    })),
}));
