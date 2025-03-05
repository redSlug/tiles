import { useCallback, useEffect, useState } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { Action, GameState } from '../types/all.ts';
import './PeerConnection.css';
import { usePeerJsStore } from './PeerStore.ts';
import Button from '../components/Button.tsx';
import { getParsedGameState, peerConfig } from './Shared.ts';

const baseUrl = import.meta.env.VITE_BASE_URL || 'garbage';

function HostPeerConnection({
  gameState,
  gameDispatch,
  peerShareCode,
  setPlayerNumber,
}: {
  gameState: GameState;
  gameDispatch: (action: Action) => void;
  peerShareCode: string | undefined;
  setPlayerNumber: (playerNumber: number) => void;
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
        setPlayerNumber(0);
      } else {
        console.log('no connection found', conn);
      }
    },
    [gameState],
  );

  useEffect(() => {
    peer?.on('open', id => {
      setMyPeerId(id);
    });
    peer?.on('connection', (conn: DataConnection) => {
      setZustandConnection(conn);
      conn.on('data', data => {
        console.log('received data');
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
      console.log('Connection lost');
      alert('peer disconnected. reconnecting');
    });
    peer?.on('close', function () {
      setIsConnected(false); // this doesn't do much
      console.log('Connection destroyed');
      alert('peer closed');
    });
    peer?.on('error', function (err) {
      console.log('error', err);
      alert('peer error' + err);
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
              .then(() => console.log('successfully copying to clipboard'))
              .catch(error =>
                console.log('errored copying to clipboard', error),
              );
            navigator
              .share({
                title: 'tiles game',
                url: shareLink,
              })
              .then(() => console.log('successfully shared'))
              .catch(error => console.log('errored sharing', error));
          }}
          value="Click + share to play with remote friend"
        />
      </div>
    );
  }
}

export default HostPeerConnection;
