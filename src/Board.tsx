import './App.css';
import './Game.css';
import Rows from './Rows.tsx';
import Factories from './Factories.tsx';
import FinalRows from './FinalRows.tsx';
import { usePeerJsStore } from './networking/PeerStore.ts';
import { useEffect } from 'react';
import { getLocalStorage } from './storage/localStorage.ts';
import { Action, GameState, GameType } from './types/all.ts';

function Board({
  titleString,
  gameType,
  playerNumber,
  shareCode,
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (action: Action) => void;
  titleString: string;
  gameType: GameType;
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

  let player1Name = 'your';
  let player2Name = 'friend';

  if (gameType === 'local') {
    player1Name = 'player 1';
    player2Name = 'player 2';
  } else if (gameType === 'bot') {
    player1Name = 'your';
    player2Name = 'bot';
  }

  const peerDataConnection =
    gameType === 'remote' ? zustandConnection : undefined;

  return (
    <div className="game-container">
      <h1 className={'title-string'}>{titleString}</h1>
      <div className={'break'}></div>
      <Factories
        state={state}
        gameDispatch={dispatch}
        playerNumber={playerNumber}
        gameType={gameType}
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
            gameType={gameType}
          />
          <FinalRows
            finalRows={state.players[playerNumber].finalRows}
            playerName={player1Name}
            playerScore={state.players[playerNumber].score}
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
            gameType={gameType}
          />
          <FinalRows
            finalRows={state.players[playerNumber === 0 ? 1 : 0].finalRows}
            playerName={player2Name}
            playerScore={state.players[playerNumber === 0 ? 1 : 0].score}
          />
        </div>
      </div>
    </div>
  );
}

export default Board;
