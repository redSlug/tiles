import './App.css';
import './Game.css';

import { useGameState } from './state/useGameState.ts';
import { useState } from 'react';
import Rows from './Rows.tsx';
import { useParams } from 'react-router-dom';
import Factories from './Factories.tsx';
import FinalRows from './FinalRows.tsx';
import { getInitialState } from './state/initialGame.ts';
import { usePeerJsStore } from './networking/PeerStore.ts';
import PeerConnection from './networking/PeerConnection.tsx';

function Game() {
  const { state, dispatch } = useGameState(getInitialState());
  const { shareCode } = useParams();

  const zustandConnection = usePeerJsStore(state => state.zustandConnection);
  const [playerNumber, setPlayerNumber] = useState(1);

  function getTitleString(): string {
    if (state.isGameOver) {
      if (state.playerScores[0] == state.playerScores[1]) {
        return 'game over - tie game';
      }
      if (
        state.playerScores[playerNumber] >
        state.playerScores[playerNumber === 0 ? 1 : 0]
      ) {
        return 'game over - you win!';
      }
      return 'game over - you lose!';
    }

    if (zustandConnection === undefined) {
      return 'not connected';
    }

    return playerNumber === state.turnNumber % 2
      ? 'waiting for friend'
      : 'your turn';
  }
  const titleString = getTitleString();
  if (zustandConnection === undefined) {
    return (
      <>
        <PeerConnection
          gameState={state}
          gameDispatch={dispatch}
          peerShareCode={shareCode}
          setPlayerNumber={setPlayerNumber}
        />
      </>
    );
  }

  return (
    <div className="game-container">
      <h1 className={'title-string'}>{titleString}</h1>
      <div className={'break'}></div>
      <Factories
        state={state}
        gameDispatch={dispatch}
        peerDataConnection={zustandConnection!}
        playerNumber={playerNumber}
      />

      <div className={'break'}></div>

      <div className={'destinations'}>
        <div className={'player-board'}>
          <Rows
            gameDispatch={dispatch}
            peerDataConnection={zustandConnection!}
            state={state}
            playerNumber={playerNumber}
            overflowTiles={state.playerPenaltyRows[playerNumber]}
          />
          <FinalRows
            finalRows={state.finalPlayerRows[playerNumber]}
            playerName={'your'}
            playerScore={state.playerScores[playerNumber]}
          />
        </div>
        <h2 className={'divider'} />
        <div className={'player-board'}>
          <Rows
            gameDispatch={dispatch}
            peerDataConnection={zustandConnection!}
            state={state}
            playerNumber={playerNumber === 0 ? 1 : 0}
            overflowTiles={state.playerPenaltyRows[playerNumber === 0 ? 1 : 0]}
          />
          <FinalRows
            finalRows={state.finalPlayerRows[playerNumber === 0 ? 1 : 0]}
            playerName={"friend's"}
            playerScore={state.playerScores[playerNumber === 0 ? 1 : 0]}
          />
        </div>
      </div>
    </div>
  );
}

export default Game;
