import { useCallback, useEffect, useState } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { Action, GameState } from '../types/all.ts';
import { usePeerJsStore } from './PeerStore.ts';
import Button from '../components/Button.tsx';
import { getParsedGameState, peerConfig } from './Shared.ts';
import { HOST_PLAYER_NUMBER } from '../constants/all.ts';

const baseUrl = import.meta.env.VITE_BASE_URL || 'garbage';

function HostPeerConnection({
  gameState,
  gameDispatch,
  peerShareCode,
  setPlayerNumber,
  onLoaded,
}: {
  gameState: GameState;
  gameDispatch: (action: Action) => void;
  peerShareCode: string | undefined;
  setPlayerNumber: (playerNumber: number) => void;
  onLoaded: () => void;
}) {
  const setZustandConnection = usePeerJsStore(
    state => state.setZustandConnection,
  );

  const [myPeerId, setMyPeerId] = useState('');
  const [shouldSendMessage, setShouldSendMessage] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [peer, setPeer] = useState<undefined | Peer>(undefined);

  useEffect(() => {
    setPeer(new Peer(peerConfig));
  }, []);

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
    peer?.on('open', id => {
      setMyPeerId(id);
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
  }, [peer, sendInitialGameToPeer]);

  if (isConnected) {
    return <></>;
  }

  if (peerShareCode === undefined && myPeerId !== '') {
    return (
      <div>
        <Button
          onClick={() => {
            const shareLink = `${baseUrl}/#/game/${myPeerId}`;
            navigator.clipboard
              .writeText(shareLink)
              .then(() =>
                console.log('==> host successfully copying to clipboard'),
              )
              .catch(error =>
                console.log('==> host errored copying to clipboard', error),
              );
            navigator
              .share({
                title: 'tiles game',
                url: shareLink,
              })
              .then(() => console.log('==> host successfully shared'))
              .catch(error => console.log('==> host errored sharing', error));
          }}
          value="Click + share to play with remote friend"
        />
      </div>
    );
  }
}

export default HostPeerConnection;
