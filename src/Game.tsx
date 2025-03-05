import './App.css';
import './Game.css';

import { useGameState } from './state/useGameState.ts';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getInitialState } from './state/initialGame.ts';
import { usePeerJsStore } from './networking/PeerStore.ts';
import Button from './components/Button.tsx';
import Board from './Board.tsx';
import HostPeerConnection from './networking/HostPeerConnection.tsx';
import FriendPeerConnection from './networking/FriendPeerConnection.tsx';

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
      <Board
        state={state}
        dispatch={dispatch}
        titleString={titleString}
        isLocalGame={isLocalGame}
        playerNumber={playerNumber}
        shareCode={shareCode!}
      />
    );
  }

  if (zustandConnection === undefined) {
    return (
      <div className="button-container">
        {shareCode === undefined ? (
          <>
            <Button
              onClick={playLocalButtonHandler}
              value="Click to play with local friend"
            />
            <HostPeerConnection
              gameState={state}
              gameDispatch={dispatch}
              peerShareCode={shareCode}
              setPlayerNumber={setPlayerNumber}
            />
          </>
        ) : (
          <>
            <div className={'title-string'}>loading</div>
            <FriendPeerConnection
              gameDispatch={dispatch}
              peerShareCode={shareCode}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <Board
      state={state}
      dispatch={dispatch}
      titleString={titleString}
      isLocalGame={isLocalGame}
      playerNumber={playerNumber}
      shareCode={shareCode!}
    />
  );
}

export default Game;
