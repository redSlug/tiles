import { useEffect, useState } from "react";
import Peer, { DataConnection } from "peerjs";
import { Action, GameState } from "../types/all.ts";
import { create } from "zustand";
import "./PeerConnection.css";

interface ZustandState {
  zustandConnection: DataConnection | undefined;
  setZustandConnection: (zustandConnection: DataConnection) => void;
}

const baseUrl = import.meta.env.VITE_BASE_URL || "garbage";

const userName = import.meta.env.VITE_TURN_SERVER_USERNAME || "garbage";

const credential = import.meta.env.VITE_TURN_SERVER_CREDENTIAL || "garbage";

const hello = import.meta.env.HELLO || "garbage";
const yo = import.meta.env.YO || "garbage";

console.log(`hello ${hello}`);
console.log(`yo ${yo}`);

console.log(
  "VITE_TURN_SERVER_USERNAME",
  import.meta.env.VITE_TURN_SERVER_USERNAME,
);

console.log("VITE_BASE_URL", import.meta.env.VITE_BASE_URL);
console.log("var", import.meta.env.VITE_TEST);

export const usePeerJsStore = create<ZustandState>((set) => ({
  zustandConnection: undefined,
  setZustandConnection: (zustandConnection: DataConnection) =>
    set((): { zustandConnection: DataConnection } => ({
      zustandConnection: zustandConnection,
    })),
}));

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
    (state) => state.setZustandConnection,
  );

  const [myPeerId, setMyPeerId] = useState("");
  const [shouldSendMessage, setShouldSendMessage] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [peer, setPeer] = useState<undefined | Peer>(undefined);

  useEffect(() => {
    setPeer(
      new Peer({
        config: {
          iceServers: [
            {
              urls: "stun:stun.relay.metered.ca:80",
            },
            {
              urls: "turn:global.relay.metered.ca:80",
              username: userName,
              credential: credential,
            },
            {
              urls: "turn:global.relay.metered.ca:80?transport=tcp",
              username: userName,
              credential: credential,
            },
            {
              urls: "turn:global.relay.metered.ca:443",
              username: userName,
              credential: credential,
            },
            {
              urls: "turns:global.relay.metered.ca:443?transport=tcp",
              username: userName,
              credential: credential,
            },
          ],
        },
      }),
    );
  }, []);

  useEffect(() => {
    peer?.on("open", (id) => {
      setMyPeerId(id);
      console.log("in PeerConnection useEffect on open, peerId", id);
      if (peerShareCode !== undefined) {
        const conn = peer.connect(peerShareCode);
        conn?.on("open", () => {
          conn?.on("data", (data) => {
            setZustandConnection(conn);
            console.log("received data");
            setIsConnected(true);
            gameDispatch({
              type: "set_peer_game_state",
              peerGameState: getParsedGameState(data as string),
            });
          });
        });
      }
    });
    peer?.on("connection", (conn: DataConnection) => {
      setZustandConnection(conn);
      conn.on("data", (data) => {
        console.log("received data");
        setIsConnected(true);
        gameDispatch({
          type: "set_peer_game_state",
          peerGameState: getParsedGameState(data as string),
        });
      });
      setTimeout(() => sendInitialGameToPeer(conn), 5000);
    });
  }, [peer]);

  const sendInitialGameToPeer = (conn: DataConnection) => {
    if (conn) {
      setShouldSendMessage(!shouldSendMessage);
      conn.send(JSON.stringify(gameState));
      setIsConnected(true);
      setPlayerNumber(0);
    } else {
      console.log("no connection found", conn);
    }
  };

  if (isConnected) {
    return <></>;
  }

  if (peerShareCode === undefined && myPeerId !== "") {
    return (
      <div>
        <button
          className={"share-button"}
          key={`share-game`}
          onClick={() => {
            const shareLink = `${baseUrl}/#/game/${myPeerId}`;
            navigator.clipboard
              .writeText(shareLink)
              .then(() => console.log("successfully copying to clipboard"))
              .catch((error) =>
                console.log("errored copying to clipboard", error),
              );
            navigator
              .share({
                title: "tiles game",
                url: shareLink,
              })
              .then(() => console.log("successfully shared"))
              .catch((error) => console.log("errored sharing", error));
          }}
        >
          click and share to play with friend
        </button>
      </div>
    );
  }
}

export default PeerConnection;
