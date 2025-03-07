import './App.css';
import './Game.css';
import Rows from './Rows.tsx';
import Factories from './Factories.tsx';
import FinalRows from './FinalRows.tsx';
import { usePeerJsStore } from './networking/PeerStore.ts';
import { useEffect } from 'react';
import { getLocalStorage } from './storage/localStorage.ts';
import { Action, GameState } from './types/all.ts';

function Board({
  titleString,
  isLocalGame,
  playerNumber,
  shareCode,
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (action: Action) => void;
  titleString: string;
  isLocalGame: boolean;
  playerNumber: number;
  shareCode: string;
}) {
  const zustandConnection = usePeerJsStore(state => state.zustandConnection);

  useEffect(() => {
    // if there is a share code, refresh uses game state stored in local storage
    // so moves are not reverted
    if (shareCode) {
      const storedState = getLocalStorage(shareCode);
      if (
        storedState !== undefined &&
        storedState.turnNumber > state.turnNumber
      ) {
        console.log('out of turn, setting state to stored state', storedState);
        dispatch({
          type: 'set_peer_game_state',
          peerId: shareCode,
          peerGameState: storedState,
        });
      }
    }
  });

  const player1Name = isLocalGame ? 'your' : 'player 1';
  const player2Name = isLocalGame ? 'friend' : 'player 2';
  const peerDataConnection = isLocalGame ? undefined : zustandConnection;

  return (
    <div className="game-container">
      <h1 className={'title-string'}>{titleString}</h1>
      <div className={'break'}></div>
      <Factories
        state={state}
        gameDispatch={dispatch}
        playerNumber={playerNumber}
        isLocalGame={isLocalGame}
      />

      <div className={'break'}></div>

      <div className={'destinations'}>
        <div className={'player-board'}>
          <Rows
            gameDispatch={dispatch}
            peerDataConnection={zustandConnection!}
            state={state}
            playerNumber={playerNumber}
            overflowTiles={state.players[playerNumber].penaltyRows}
            isLocalGame={isLocalGame}
          />
          <FinalRows
            finalRows={state.players[playerNumber].finalRows}
            playerName={player1Name}
            playerScore={state.playerScores[playerNumber]}
          />
        </div>
        <h2 className={'divider'} />
        <div className={'player-board'}>
          <Rows
            gameDispatch={dispatch}
            peerDataConnection={peerDataConnection!}
            state={state}
            playerNumber={playerNumber === 0 ? 1 : 0}
            overflowTiles={
              state.players[playerNumber === 0 ? 1 : 0].penaltyRows
            }
            isLocalGame={isLocalGame}
          />
          <FinalRows
            finalRows={state.players[playerNumber === 0 ? 1 : 0].finalRows}
            playerName={player2Name}
            playerScore={state.playerScores[playerNumber === 0 ? 1 : 0]}
          />
        </div>
      </div>
    </div>
  );
}

export default Board;
