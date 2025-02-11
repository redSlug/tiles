import {
  ClickDestinationAction,
  ClickPenaltyDestinationAction,
  Factory,
  FactoryColorGroup,
  GameState,
  PenaltyTile,
  Row,
} from '../types/all.ts';
import { OVERFLOW_FACTORY_NUMBER } from '../constants/all.ts';

function manageWhiteTile(
  sourceTiles: Array<FactoryColorGroup>,
  penaltyRow: Array<PenaltyTile>,
  isOverFlowArea: boolean,
) {
  const whiteTileIndex = sourceTiles.findIndex(
    tile => tile.tileColor === 'white',
  );

  if (isOverFlowArea && whiteTileIndex > -1) {
    // update source tiles
    sourceTiles.splice(whiteTileIndex);
    const lastOverflowIndex = penaltyRow.findIndex(
      tile => tile.tileColor === undefined,
    );
    // put white tile in penalty area
    penaltyRow[lastOverflowIndex].tileColor = 'white';
  }
}

function calculateOpenSpaceCount(currentRowData: Row, tileCount: number) {
  return currentRowData.openSpaceCount - tileCount;
}

function updatePenaltyRow(
  playerPenaltyRow: Array<PenaltyTile>,
  currentRow: Row,
  tileColor: string,
  tileCount: number,
) {
  const openSpaceCount = calculateOpenSpaceCount(currentRow, tileCount);
  if (openSpaceCount < 0) {
    const lastOpenOverflowIndex = playerPenaltyRow.findIndex(
      tile => tile.tileColor === undefined,
    );
    let tileCountToPlaceInOverflow = Math.abs(openSpaceCount);

    for (let i = lastOpenOverflowIndex; i < playerPenaltyRow.length; i++) {
      if (tileCountToPlaceInOverflow > 0) {
        playerPenaltyRow[i].tileColor = tileColor;
        tileCountToPlaceInOverflow -= 1;
      }
    }
  }
}

function sendGameStateToPeer(
  state: GameState,
  action: ClickDestinationAction | ClickPenaltyDestinationAction,
) {
  try {
    action.peerDataConnection.send(JSON.stringify(state));
  } catch (error) {
    console.error('could not send to peer', {
      error,
      connection: action.peerDataConnection,
    });
  }
}

function moveRemainingSourceTilesToOverflow(
  sourceTiles: Array<FactoryColorGroup>,
  tileColor: string,
  factoryNumber: number,
  factories: Array<Factory>,
) {
  for (const sourceTile of sourceTiles) {
    if (sourceTile === undefined || sourceTile.tileColor === tileColor) {
      continue;
    }
    const overflowFactoryTiles = factories[OVERFLOW_FACTORY_NUMBER].tiles;
    let didRecordTile = false;
    for (const overflowFactoryTile of overflowFactoryTiles) {
      if (overflowFactoryTile.tileColor === sourceTile.tileColor) {
        overflowFactoryTile.tileCount += sourceTile.tileCount;
        didRecordTile = true;
        break;
      }
    }
    if (!didRecordTile) {
      overflowFactoryTiles.push(sourceTile);
    }
  }
  // clear out source factory
  factories[factoryNumber].tiles = [];
}

function calculatePlayerScore(
  playerRows: Array<Row>,
  playerPenaltyRow: Array<PenaltyTile>,
) {
  // TODO this needs to reflect game logic
  let score = playerRows.filter(row => row.openSpaceCount === 0).length;
  score += playerPenaltyRow.reduce((accumulator, currentTile) => {
    return currentTile.tileColor === undefined
      ? 0
      : accumulator + currentTile.penaltyAmount;
  }, 0);
  return score;
}

export function clickPenaltyDestination(
  state: GameState,
  action: ClickPenaltyDestinationAction,
) {
  console.log('clickPenaltyDestination', action);
  return state;
}

export function clickDestination(
  state: GameState,
  action: ClickDestinationAction,
) {
  const { rowNumber, playerNumber } = action;
  const { tileColor, tileCount, factoryNumber } = state.source!;
  const factories = state.factories;
  const sourceTiles = factories[factoryNumber].tiles;

  manageWhiteTile(
    sourceTiles,
    state.playerPenaltyRows[playerNumber],
    factoryNumber === OVERFLOW_FACTORY_NUMBER,
  );

  updatePenaltyRow(
    state.playerPenaltyRows[playerNumber],
    state.playerRows[playerNumber][rowNumber],
    tileColor,
    tileCount,
  );

  const openSpaceCount = calculateOpenSpaceCount(
    state.playerRows[playerNumber][rowNumber],
    tileCount,
  );

  // Move source tile to destination row
  state.playerRows[playerNumber][rowNumber] = { tileColor, openSpaceCount };

  if (factoryNumber === OVERFLOW_FACTORY_NUMBER) {
    // Remove chosen color tiles from overflow
    factories[OVERFLOW_FACTORY_NUMBER].tiles = factories[
      OVERFLOW_FACTORY_NUMBER
    ].tiles.filter(tile => tile.tileColor !== tileColor);
  } else {
    moveRemainingSourceTilesToOverflow(
      sourceTiles,
      tileColor,
      factoryNumber,
      factories,
    );
  }

  let player0Score = 0;
  let player1Score = 0;
  let isGameOver = false;
  if (factories.every(c => c.tiles.length == 0)) {
    isGameOver = true;
    player0Score = calculatePlayerScore(
      state.playerRows[0],
      state.playerPenaltyRows[0],
    );
    player1Score = calculatePlayerScore(
      state.playerRows[1],
      state.playerPenaltyRows[1],
    );
  }

  const newGameState = {
    ...state,
    isGameOver,
    factories,
    source: undefined,
    turnNumber: state.turnNumber + 1,
    playerScores: [player0Score, player1Score],
  };

  sendGameStateToPeer(newGameState, action);

  console.log('sent newGameState in click destination', newGameState);
  return newGameState;
}
