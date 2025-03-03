import { useEffect, useState } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { Action, GameState } from '../types/all.ts';
import './PeerConnection.css';
import { usePeerJsStore } from './PeerStore.ts';
import Button from '../components/Button.tsx';

const baseUrl = import.meta.env.VITE_BASE_URL || 'garbage';

const username = import.meta.env.VITE_TURN_SERVER_USERNAME || 'garbage';
const credential = import.meta.env.VITE_TURN_SERVER_CREDENTIAL || 'garbage';

function getParsedGameState(data: string): GameState {
  // Correct data that altered in transport
  return JSON.parse(data, (_, value) => {
    if (value === null) {
      return undefined;
    }
    return value;
  });
}

function PeerConnection({
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
    setPeer(
      new Peer({
        config: {
          iceServers: [
            {
              urls: 'stun:stun.relay.metered.ca:80',
            },
            {
              urls: 'turn:global.relay.metered.ca:80',
              username,
              credential,
            },
            {
              urls: 'turn:global.relay.metered.ca:80?transport=tcp',
              username,
              credential,
            },
            {
              urls: 'turn:global.relay.metered.ca:443',
              username,
              credential,
            },
            {
              urls: 'turns:global.relay.metered.ca:443?transport=tcp',
              username,
              credential,
            },
          ],
        },
      }),
    );
  }, []);

  useEffect(() => {
    peer?.on('open', id => {
      setMyPeerId(id);
      console.log('in PeerConnection useEffect on open, peerId', id);
      if (peerShareCode !== undefined) {
        const conn = peer.connect(peerShareCode);
        conn?.on('open', () => {
          conn?.on('data', data => {
            setZustandConnection(conn);
            console.log('received data');
            setIsConnected(true);
            gameDispatch({
              type: 'set_peer_game_state',
              peerId: peerShareCode, // consistent with the other client
              peerGameState: getParsedGameState(data as string),
            });
          });
        });
      }
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
      setTimeout(() => sendInitialGameToPeer(conn), 2000);
    });

    peer?.on('disconnected', function () {
      console.log('Connection lost');
      alert('peer disconnected. reconnecting');
      peer.reconnect();
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
  }, [peer]);

  const sendInitialGameToPeer = (conn: DataConnection) => {
    if (conn) {
      setShouldSendMessage(!shouldSendMessage);
      conn.send(JSON.stringify(gameState));
      setIsConnected(true);
      setPlayerNumber(0);
    } else {
      console.log('no connection found', conn);
    }
  };

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

export default PeerConnection;
