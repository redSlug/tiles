import { useCallback, useEffect, useState } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { Action, GameState } from '../types/all.ts';
import { usePeerJsStore } from './PeerStore.ts';
import { GameType } from '../types/all.ts';
import { getParsedGameState, peerConfig } from './Shared.ts';
import { HOST_PLAYER_NUMBER } from '../constants/all.ts';

const baseUrl = import.meta.env.VITE_BASE_URL || 'garbage';

export function useHostPeerConnection({
  gameState,
  gameType,
  shouldConnect,
  gameDispatch,
  setPlayerNumber,
  onLoaded,
  onShareLinkGenerated,
  onPeerConnected,
  setShowPeerModal,
  showPeerModal,
}: {
  gameState: GameState;
  gameType: GameType | undefined;
  shouldConnect: boolean;
  gameDispatch: (action: Action) => void;
  setPlayerNumber: (playerNumber: number) => void;
  onLoaded: () => void;
  onShareLinkGenerated: (shareLink: string) => void;
  onPeerConnected: (connected: boolean) => void;
  setShowPeerModal: (showPeerModal: boolean) => void;
  showPeerModal: boolean;
}) {
  const setZustandConnection = usePeerJsStore(
    state => state.setZustandConnection,
  );
  const [, setMyPeerId] = useState('');
  const [shouldSendMessage, setShouldSendMessage] = useState(false);
  const [, setIsConnected] = useState(false);
  const [peer, setPeer] = useState<undefined | Peer>(undefined);

  // create the peer connection
  useEffect(() => {
    if (shouldConnect) {
      return;
    }

    setPeer(new Peer(peerConfig));
  }, [gameType]);

  const sendInitialGameToPeer = useCallback(
    (conn: DataConnection) => {
      console.log('=> host sending initial game', conn);
      if (conn) {
        setShouldSendMessage(!shouldSendMessage);
        conn.send(JSON.stringify(gameState));
        setIsConnected(true);
        setPlayerNumber(HOST_PLAYER_NUMBER);
      } else {
        console.log('==> host no connection found', conn);
      }
    },
    [gameState],
  );

  useEffect(() => {
    if (shouldConnect) {
      return;
    }

    peer?.on('open', id => {
      setMyPeerId(id);
      const shareLink = `${baseUrl}/#/game/${id}`;
      onShareLinkGenerated(shareLink);
      onLoaded();
    });
    peer?.on('connection', (conn: DataConnection) => {
      setZustandConnection(conn);
      conn.on('data', data => {
        console.log('==> host received data');
        setIsConnected(true);
        gameDispatch({
          type: 'set_peer_game_state',
          peerId: peer?.id,
          peerGameState: getParsedGameState(data as string),
        });
      });
      conn.on('open', () => {
        sendInitialGameToPeer(conn);
        onPeerConnected(true);
        setShowPeerModal(false);
      });
    });

    peer?.on('disconnected', function () {
      console.log('connection lost, reconnecting');
      peer.reconnect();
    });
    peer?.on('close', function () {
      setIsConnected(false); // this doesn't do much
      console.log('==> host connection closed');
      alert('peer closed');
    });
    peer?.on('error', function (err) {
      console.log('error will connect automatically when back on line', err);
    });
  }, [peer, sendInitialGameToPeer, showPeerModal, gameType]);
}
