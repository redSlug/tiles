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
import {
  BOT_PLAYER_NUMBER,
  HUMAN_PLAYER_NUMBER,
  PEER_PLAYER_NUMBER,
} from './constants/all.ts';
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';
import {
  antiAddictionMessages,
  getOtherPlayer,
  getRandomColorPalette,
  getRandomElement,
} from './utilities/all.ts';
import Modal from './components/Modal.tsx';

function Game() {
  const { state, dispatch } = useGameState(getInitialState());
  const { shareCode } = useParams();
  const zustandConnection = usePeerJsStore(state => state.zustandConnection);
  const [playerNumber, setPlayerNumber] = useState<number>(PEER_PLAYER_NUMBER);
  const [gameType, setGameType] = useState<GameType>('remote');
  const [botThinking, setBotThinking] = useState<boolean>(false);
  const [hostLoaded, setHostLoaded] = useState<boolean>(false);
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);
  const { width, height } = useWindowSize();

  function playLocalButtonHandler() {
    console.log('playLocalButtonHandler');
    setGameType('local');
  }

  function playBotButtonHandler() {
    console.log('playBotButtonHandler');
    setGameType('bot');
    setPlayerNumber(HUMAN_PLAYER_NUMBER);
  }

  useEffect(() => {
    const playerIsWinner =
      state.players[playerNumber].score >
      state.players[getOtherPlayer(playerNumber)].score;
    if (
      gameType === 'bot' &&
      state.isGameOver &&
      playerIsWinner &&
      !showWinnerModal
    ) {
      console.log('showing win modal at turn', state.turnNumber);
      setShowWinnerModal(true);
    }
  }, [state.turnNumber, gameType, showWinnerModal]);

  useEffect(() => {
    if (
      gameType === 'bot' &&
      state.playerTurn === BOT_PLAYER_NUMBER &&
      !state.isGameOver &&
      !botThinking
    ) {
      console.log('bot thinking set to true, about to call makeBotMove');
      setBotThinking(true);
      makeBotMove(state, dispatch)
        .then(() => {
          console.log('makeBotMove completed successfully');
          setBotThinking(false);
        })
        .catch(error => {
          console.log('error in makeBotMove:', error);
          setBotThinking(false);
        });
    }
  }, [state.playerTurn, state.turnNumber, botThinking, gameType]);

  function currentPlayerHasWon(): boolean {
    return (
      state.isGameOver &&
      state.players[playerNumber].score >
        state.players[getOtherPlayer(playerNumber)].score
    );
  }

  function otherPlayerHasWon(): boolean {
    return (
      state.isGameOver &&
      state.players[getOtherPlayer(playerNumber)].score >
        state.players[playerNumber].score
    );
  }

  function localPlayerHasWon(): boolean {
    return state.isGameOver && gameType === 'local' && !isTieGame();
  }

  function isTieGame(): boolean {
    return (
      state.isGameOver && state.players[0].score === state.players[1].score
    );
  }

  function getTitleString(): string {
    if (isTieGame()) return 'game over - tie game';
    if (localPlayerHasWon()) return 'game over';
    if (currentPlayerHasWon()) return 'game over - you win!';
    if (otherPlayerHasWon()) return 'game over - you lose!';

    if (gameType === 'local') {
      return state.playerTurn === 1
        ? 'local game - player 1 turn'
        : 'local game - player 2 turn';
    }

    if (gameType === 'bot') {
      return state.playerTurn === HUMAN_PLAYER_NUMBER
        ? 'your turn'
        : 'bot is thinking...';
    }

    if (zustandConnection === undefined) {
      return 'not connected';
    }

    return playerNumber === state.playerTurn
      ? 'your turn'
      : 'waiting for friend';
  }

  const titleString = getTitleString();

  if (gameType === 'remote' && zustandConnection === undefined) {
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
            <div className={'loading-string'}>loading</div>
            <FriendPeerConnection
              gameDispatch={dispatch}
              peerShareCode={shareCode}
            />
          </>
        )}
      </div>
    );
  }

  const localPlayerWon = localPlayerHasWon();
  const board = (
    <>
      <Board
        state={state}
        dispatch={dispatch}
        titleString={titleString}
        gameType={gameType}
        playerNumber={playerNumber}
        shareCode={shareCode!}
      />
      <Modal
        isOpen={showWinnerModal}
        onClose={() => setShowWinnerModal(false)}
        header={
          localPlayerWon ? 'congratulations, you win!' : 'congratulations!'
        }
        message={'celebrate by ' + getRandomElement(antiAddictionMessages)}
        buttonValue={undefined}
      />
    </>
  );
  if (currentPlayerHasWon() || localPlayerWon) {
    return (
      <>
        <Confetti
          width={width}
          height={height}
          numberOfPieces={Math.floor(Math.random() * 200 + 50)}
          wind={0.002}
          gravity={0.3}
          colors={getRandomColorPalette()}
        />
        {board}
      </>
    );
  }

  return board;
}

export default Game;
