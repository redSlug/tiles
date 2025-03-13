import './App.css';
import './Game.css';

import { useGameState } from './state/useGameState.ts';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getInitialState } from './state/initialGame.ts';
import { usePeerJsStore } from './networking/PeerStore.ts';
import Button from './components/Button.tsx';
import Board from './Board.tsx';
import HostPeerConnection from './networking/HostPeerConnection.tsx';
import FriendPeerConnection from './networking/FriendPeerConnection.tsx';
import { GameType } from './types/all.ts';
import { makeBotMove } from './bot/makeBotMove.ts';

function Game() {
  const { state, dispatch } = useGameState(getInitialState());
  const { shareCode } = useParams();
  const zustandConnection = usePeerJsStore(state => state.zustandConnection);
  const [playerNumber, setPlayerNumber] = useState<number>(1);
  const [gameType, setGameType] = useState<GameType>('remote');
  const [botThinking, setBotThinking] = useState<boolean>(false);
  const [hostLoaded, setHostLoaded] = useState<boolean>(false);

  function playLocalButtonHandler() {
    console.log('playLocalButtonHandler');
    setGameType('local');
  }

  function playBotButtonHandler() {
    console.log('playBotButtonHandler');
    setGameType('bot');
    setPlayerNumber(0);
  }

  useEffect(() => {
    if (
      gameType === 'bot' &&
      state.turnNumber % 2 === 1 &&
      !state.isGameOver &&
      !botThinking
    ) {
      setBotThinking(true);
      makeBotMove(state, dispatch).then(() => {
        setBotThinking(false);
      });
    }
  }, [state.turnNumber]);

  function getTitleString(): string {
    if (state.isGameOver) {
      if (state.players[0].score === state.players[1].score) {
        return 'game over - tie game';
      }
      if (
        state.players[playerNumber].score >
        state.players[playerNumber === 0 ? 1 : 0].score
      ) {
        return 'game over - you win!';
      }
      return 'game over - you lose!';
    }

    if (gameType === 'local') {
      return 'local game';
    }

    if (gameType === 'bot') {
      return state.turnNumber % 2 === 0 ? 'your turn' : 'bot is thinking...';
    }

    if (zustandConnection === undefined) {
      return 'not connected';
    }

    return playerNumber === state.turnNumber % 2
      ? 'waiting for friend'
      : 'your turn';
  }

  const titleString = getTitleString();

  if (gameType === 'local' || gameType === 'bot') {
    return (
      <Board
        state={state}
        dispatch={dispatch}
        titleString={titleString}
        gameType={gameType}
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
            <HostPeerConnection
              gameState={state}
              gameDispatch={dispatch}
              peerShareCode={shareCode}
              setPlayerNumber={setPlayerNumber}
              onLoaded={() => setHostLoaded(true)}
            />
            {hostLoaded && (
              <>
                <Button
                  onClick={playBotButtonHandler}
                  value="Click to play with bot"
                />
                <Button
                  onClick={playLocalButtonHandler}
                  value="Click to play with local friend"
                />
              </>
            )}
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
      gameType={gameType}
      playerNumber={playerNumber}
      shareCode={shareCode!}
    />
  );
}

export default Game;
