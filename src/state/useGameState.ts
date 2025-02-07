import { useState } from 'react';
import {
  GameState,
  Action,
  ClickSourceAction,
  SetPeerGameStateAction,
  ClickDestinationAction,
} from '../types/all.ts';

function clickRouterReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'click_source':
      return clickSource(state, action);
    case 'click_destination':
      return clickDestination(state, action);
    case 'click_round_end':
      return state;
    case 'set_peer_game_state':
      console.log('setting peer game state', action.peerGameState);
      return setPeerGameState(action);
    default:
      throw new Error('Invalid action type');
  }
}

function setPeerGameState(action: SetPeerGameStateAction) {
  console.log('peer game state to set', action.peerGameState);
  return { ...action.peerGameState };
}

function clickDestination(state: GameState, action: ClickDestinationAction) {
  const { rowNumber, playerNumber } = action;
  const { tileColor, tileCount, circleNumber } = state.source!;
  const circles = state.circles;
  const sourceTiles = circles[circleNumber].tiles;
  const lastCircleNumber = 5;

  const whiteTileIndex = sourceTiles.findIndex(
    tile => tile.tileColor === 'white',
  );
  if (circleNumber === lastCircleNumber && whiteTileIndex > -1) {
    sourceTiles.splice(whiteTileIndex);
    const lastOverflowIndex = state.playerOverflowRows[playerNumber].findIndex(
      tile => tile.tileColor === undefined,
    );
    state.playerOverflowRows[playerNumber][lastOverflowIndex].tileColor =
      'white';
  }

  const currentRowData = state.playerRows[playerNumber][rowNumber];
  let openSpaceCount = currentRowData.openSpaceCount - tileCount;
  if (openSpaceCount < 0) {
    const lastOpenOverflowIndex = state.playerOverflowRows[
      playerNumber
    ].findIndex(tile => tile.tileColor === undefined);
    let tileCountToPlaceInOverflow = Math.abs(openSpaceCount);

    for (
      let i = lastOpenOverflowIndex;
      i < state.playerOverflowRows[playerNumber].length;
      i++
    ) {
      if (tileCountToPlaceInOverflow > 0) {
        state.playerOverflowRows[playerNumber][i].tileColor = tileColor;
        tileCountToPlaceInOverflow -= 1;
      }
    }
    openSpaceCount = 0;
  }

  state.playerRows[playerNumber][rowNumber] = { tileColor, openSpaceCount };

  // Must deal with all tiles in the circle that was chosen
  for (const sourceTile of sourceTiles) {
    if (
      sourceTile === undefined ||
      sourceTile.tileColor === tileColor ||
      circleNumber === lastCircleNumber
    ) {
      continue;
    }
    const lastCircleTiles = circles[lastCircleNumber].tiles;
    let didRecordTile = false;
    for (const lastCircleTile of lastCircleTiles) {
      if (lastCircleTile.tileColor === sourceTile.tileColor) {
        lastCircleTile.tileCount += sourceTile.tileCount;
        didRecordTile = true;
        break;
      }
    }
    if (!didRecordTile) {
      lastCircleTiles.push(sourceTile);
    }
  }

  if (circleNumber != lastCircleNumber) {
    circles[circleNumber].tiles = [];
  } else {
    circles[lastCircleNumber].tiles = circles[lastCircleNumber].tiles.filter(
      tile => tile.tileColor !== tileColor,
    );
  }

  const gameOver = circles.every(c => c.tiles.length == 0);

  let player0Score = 0;
  let player1Score = 0;
  let isGameOver = false;
  if (gameOver) {
    isGameOver = true;

    // TODO this needs to reflect game logic
    player0Score = state.playerRows[0].filter(
      row => row.openSpaceCount === 0,
    ).length;
    player0Score += state.playerOverflowRows[0].reduce(
      (accumulator, currentTile) => {
        return currentTile.tileColor === undefined
          ? 0
          : accumulator + currentTile.penaltyAmount;
      },
      0,
    );

    player1Score = state.playerRows[1].filter(
      row => row.openSpaceCount === 0,
    ).length;
    player1Score += state.playerOverflowRows[1].reduce(
      (accumulator, currentTile) => {
        return currentTile.tileColor === undefined
          ? 0
          : accumulator + currentTile.penaltyAmount;
      },
      0,
    );
  }

  const newGameState = {
    ...state,
    isGameOver,
    circles,
    source: undefined,
    turnNumber: state.turnNumber + 1,
    playerScores: [player0Score, player1Score],
  };

  try {
    action.peerDataConnection.send(JSON.stringify(newGameState));
  } catch (error) {
    console.error('could not send to peer', {
      error,
      connection: action.peerDataConnection,
    });
  }

  console.log('sent newGameState in click destination', newGameState);
  return newGameState;
}

function clickSource(state: GameState, action: ClickSourceAction) {
  console.log('in click source', state.source);
  return {
    ...state,
    source: {
      circleNumber: action.circleNumber,
      tileColor: action.tileColor,
      tileCount: action.tileCount,
      tilesIndex: action.tilesIndex,
    },
  };
}

export function useGameState(initialState: GameState): {
  state: GameState;
  dispatch: (action: Action) => void;
} {
  const [state, setState] = useState<GameState>(initialState);
  const dispatch = (action: Action) =>
    setState((state: GameState) => clickRouterReducer(state, action));
  return { state, dispatch };
}
