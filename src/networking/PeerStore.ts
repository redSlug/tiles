import { DataConnection } from 'peerjs';
import { create } from 'zustand/index';

interface ZustandState {
  zustandConnection: DataConnection | undefined;
  setZustandConnection: (zustandConnection: DataConnection) => void;
  peerWithShareCodeIsConnected: boolean;
  setPeerWithShareCodeIsConnected: (
    peerWithShareCodeIsConnected: boolean,
  ) => void;
}

export const usePeerJsStore = create<ZustandState>(set => ({
  zustandConnection: undefined,
  setZustandConnection: (zustandConnection: DataConnection) =>
    set((): { zustandConnection: DataConnection } => ({
      zustandConnection: zustandConnection,
    })),
  peerWithShareCodeIsConnected: false,
  setPeerWithShareCodeIsConnected: (peerWithShareCodeIsConnected: boolean) => {
    set((): { peerWithShareCodeIsConnected: boolean } => ({
      peerWithShareCodeIsConnected: peerWithShareCodeIsConnected,
    }));
  },
}));
