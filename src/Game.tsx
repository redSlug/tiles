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
import Button from './components/Button.tsx';

function Game() {
  const { state, dispatch } = useGameState(getInitialState());
  const { shareCode } = useParams();

  const zustandConnection = usePeerJsStore(state => state.zustandConnection);
  const [playerNumber, setPlayerNumber] = useState<number>(1);
  const [isLocalGame, setIsLocalGame] = useState<boolean>(false);

  function playLocalButtonHandler() {
    console.log('playLocalButtonHandler');
    setIsLocalGame(true);
    console.log('isLocalGame', isLocalGame);
  }

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

    if (isLocalGame) {
      return 'local game';
    }

    if (zustandConnection === undefined) {
      return 'not connected';
    }

    return playerNumber === state.turnNumber % 2
      ? 'waiting for friend'
      : 'your turn';
  }

  const titleString = getTitleString();

  if (isLocalGame) {
    return (
      <div className="game-container">
        <h1 className={'title-string'}>{titleString}</h1>
        <div className={'break'}></div>
        <Factories
          state={state}
          gameDispatch={dispatch}
          playerNumber={playerNumber}
          isLocalGame={true}
        />

        <div className={'break'}></div>

        <div className={'destinations'}>
          <div className={'player-board'}>
            <Rows
              gameDispatch={dispatch}
              peerDataConnection={undefined}
              state={state}
              playerNumber={playerNumber}
              overflowTiles={state.playerPenaltyRows[playerNumber]}
              isLocalGame={true}
            />
            <FinalRows
              finalRows={state.finalPlayerRows[playerNumber]}
              playerName={'player 1'}
              playerScore={state.playerScores[playerNumber]}
            />
          </div>
          <h2 className={'divider'} />
          <div className={'player-board'}>
            <Rows
              gameDispatch={dispatch}
              peerDataConnection={undefined}
              state={state}
              playerNumber={playerNumber === 0 ? 1 : 0}
              overflowTiles={
                state.playerPenaltyRows[playerNumber === 0 ? 1 : 0]
              }
              isLocalGame={true}
            />
            <FinalRows
              finalRows={state.finalPlayerRows[playerNumber === 0 ? 1 : 0]}
              playerName={'player 2'}
              playerScore={state.playerScores[playerNumber === 0 ? 1 : 0]}
            />
          </div>
        </div>
      </div>
    );
  }

  if (zustandConnection === undefined) {
    return (
      <div className="button-container">
        <Button
          onClick={playLocalButtonHandler}
          value="Click to play with local friend"
        />
        <PeerConnection
          gameState={state}
          gameDispatch={dispatch}
          peerShareCode={shareCode}
          setPlayerNumber={setPlayerNumber}
        />
      </div>
    );
  }

  return (
    <div className="game-container">
      <h1 className={'title-string'}>{titleString}</h1>
      <div className={'break'}></div>
      <Factories
        state={state}
        gameDispatch={dispatch}
        playerNumber={playerNumber}
        isLocalGame={false}
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
            isLocalGame={false}
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
            isLocalGame={false}
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
