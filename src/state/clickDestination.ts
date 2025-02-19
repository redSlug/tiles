import {
  ClickDestinationAction,
  ClickPenaltyDestinationAction,
  Factory,
  FactoryColorGroup,
  FinalTile,
  GameState,
  PenaltyTile,
  Row,
} from '../types/all.ts';
import { OVERFLOW_FACTORY_NUMBER } from '../constants/all.ts';
import {
  getNewBagOfTiles,
  getEmptyPenaltyRows,
  getEmptyPlayerRows,
  getInitialFactories,
} from './initialGame.ts';

function manageWhiteTile(
  sourceTiles: Array<FactoryColorGroup>,
  penaltyRow: Array<PenaltyTile>,
  isOverflowFactory: boolean,
) {
  const whiteTileIndex = sourceTiles.findIndex(
    tile => tile.tileColor === 'white',
  );

  if (isOverflowFactory && whiteTileIndex > -1) {
    // update source tiles by removing white tile only
    sourceTiles.splice(whiteTileIndex, 1);
    const lastOverflowIndex = penaltyRow.findIndex(
      tile => tile.tileColor === undefined,
    );
    // put white tile in penalty area
    penaltyRow[lastOverflowIndex].tileColor = 'white';
  }
}

function calculateOpenSpaceCount(currentRowData: Row, tileCount: number) {
  return Math.max(0, currentRowData.openSpaceCount - tileCount);
}

function updatePenaltyRow(
  playerPenaltyRow: Array<PenaltyTile>,
  currentRow: Row,
  tileColor: string,
  tileCount: number,
) {
  const overflowCount = currentRow.openSpaceCount - tileCount;
  if (overflowCount < 0) {
    const lastOpenOverflowIndex = playerPenaltyRow.findIndex(
      tile => tile.tileColor === undefined,
    );
    let tileCountToPlaceInOverflow = Math.abs(overflowCount);

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
  const score = playerRows.filter(row => row.openSpaceCount === 0).length;
  const penaltyAmount = playerPenaltyRow
    .filter(tile => tile.tileColor !== undefined)
    .reduce((accumulator, currentTile) => {
      return currentTile.tileColor === undefined
        ? 0
        : accumulator + currentTile.penaltyAmount;
    }, 0);
  console.log(`Score: ${score}, penaltyAmount: ${penaltyAmount}`);
  return score - penaltyAmount;
}

function updateFinalRows(rows: Array<Row>, finalRows: Array<Array<FinalTile>>) {
  console.log(`FinalRows: ${rows.length}`);
  console.log(`FinalRows: ${finalRows.length}`);

  // TODO make sure you can't populate a row w/ a tile that has already been populated with that color tile
  const colorsToPopulate = rows.map(row =>
    row.openSpaceCount === 0 ? row.tileColor : undefined,
  );

  console.log('colors', colorsToPopulate);

  for (let i = 0; i < colorsToPopulate.length; i++) {
    if (colorsToPopulate[i] === undefined) {
      continue;
    }
    const finalRowToUpdate = finalRows[i];
    const updateIndex = finalRowToUpdate.findIndex(
      tile => tile.tileColor === colorsToPopulate[i],
    );
    finalRowToUpdate[updateIndex].isFilled = true;
  }
}

function isGameOver(finalTiles: Array<Array<Array<FinalTile>>>): boolean {
  for (let playerFinalRows of finalTiles) {
    for (let playerFinalRow of playerFinalRows) {
      const emptyTiles = playerFinalRow.filter(tile => !tile.isFilled);
      if (emptyTiles.length === 0) {
        return true;
      }
    }
  }
  return false;
}

function endPlayerTurn(
  state: GameState,
  factories: Array<Factory>,
  action: ClickDestinationAction | ClickPenaltyDestinationAction,
) {
  let player0Score = state.playerScores[0];
  let player1Score = state.playerScores[1];

  let isRoundOver = factories.every(c => c.tiles.length == 0);

  if (isRoundOver) {
    player0Score = calculatePlayerScore(
      state.playerRows[0],
      state.playerPenaltyRows[0],
    );
    player1Score = calculatePlayerScore(
      state.playerRows[1],
      state.playerPenaltyRows[1],
    );

    updateFinalRows(state.playerRows[0], state.finalPlayerRows[0]);
    updateFinalRows(state.playerRows[1], state.finalPlayerRows[1]);

    if (state.bagOfTiles.length < factories.length * 4) {
      console.log(`Bag of Tiles: ${state.bagOfTiles.length}`);
      state.bagOfTiles = getNewBagOfTiles();
    }

    state.playerRows = getEmptyPlayerRows();
    state.playerPenaltyRows = getEmptyPenaltyRows();
    factories = getInitialFactories(state.bagOfTiles.slice(0, 20));
    state.bagOfTiles = state.bagOfTiles.slice(20, state.bagOfTiles.length);
  }

  const newGameState = {
    ...state,
    isGameOver: isGameOver(state.finalPlayerRows),
    factories,
    source: undefined,
    turnNumber: state.turnNumber + 1,
    playerScores: [player0Score, player1Score],
  };

  sendGameStateToPeer(newGameState, action);
  console.log('sent newGameState in endPlayerTurn', newGameState);
  return newGameState;
}

export function clickPenaltyDestination(
  state: GameState,
  action: ClickPenaltyDestinationAction,
) {
  const { playerNumber } = action;
  const { tileColor, tileCount, factoryNumber } = state.source!;
  const factories = state.factories;
  const sourceTiles = factories[factoryNumber].tiles;
  const penaltyRow = state.playerPenaltyRows[playerNumber];
  const isOverflowFactory = factoryNumber === OVERFLOW_FACTORY_NUMBER;

  manageWhiteTile(sourceTiles, penaltyRow, isOverflowFactory);

  // Fill penalty row
  const openPenaltyIndex = penaltyRow.findIndex(
    tile => tile.tileColor === undefined,
  );
  let lastIndexToFill = Math.min(
    penaltyRow.length,
    openPenaltyIndex + tileCount,
  );
  lastIndexToFill = Math.max(lastIndexToFill, 0);
  for (let i = openPenaltyIndex; i < lastIndexToFill; i++) {
    if (penaltyRow[i] === undefined) {
      console.log('yoo this should never happen');
      continue;
    }
    penaltyRow[i].tileColor = tileColor;
  }

  if (isOverflowFactory) {
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

  return endPlayerTurn(state, factories, action);
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

  return endPlayerTurn(state, factories, action);
}
