import { useEffect, useState } from 'react';
import Peer from 'peerjs';
import { Action } from '../types/all.ts';
import './PeerConnection.css';
import { usePeerJsStore } from './PeerStore.ts';
import { getParsedGameState, peerConfig } from './Shared.ts';

function FriendPeerConnection({
  gameDispatch,
  peerShareCode,
}: {
  gameDispatch: (action: Action) => void;
  peerShareCode: string | undefined;
}) {
  const setZustandConnection = usePeerJsStore(
    state => state.setZustandConnection,
  );

  const [isConnected, setIsConnected] = useState(false);
  const [peer, setPeer] = useState<undefined | Peer>(undefined);

  useEffect(() => {
    setPeer(new Peer(peerConfig));
  }, []);

  useEffect(() => {
    peer?.on('open', id => {
      const conn = peer.connect(peerShareCode!);
      conn?.on('data', data => {
        setZustandConnection(conn);
        console.log('==> friend received data in peer open', id, Date.now());
        setIsConnected(true);
        gameDispatch({
          type: 'set_peer_game_state',
          peerId: peerShareCode!,
          peerGameState: getParsedGameState(data as string),
        });
      });
    });

    peer?.on('disconnected', function () {
      console.log('==> friend connection lost, reconnecting');
    });
    peer?.on('close', function () {
      console.log('==> friend connection closed');
    });
    peer?.on('error', function (err) {
      console.log('==> friend error', err);
      alert(
        'Your friend disconnected. Ask them to send a new link and open it in a new browser tab',
      );
    });
  }, [peer]);

  if (isConnected) {
    return <>connected</>;
  }
}

export default FriendPeerConnection;
