import {
  ClickDestinationAction,
  ClickPenaltyDestinationAction,
  Factory,
  FactoryColorGroup,
  FinalTile,
  GameState,
  PenaltyTile,
  Row,
} from '../types/all';
import { OVERFLOW_FACTORY_NUMBER } from '../constants/all';
import {
  getNewBagOfTiles,
  getEmptyPenaltyRows,
  getInitialFactories,
  getEmptyPlayerRows,
} from './initialGame';

function clearFullPlayerRows(rows: Array<Array<Row>>) {
  const newPlayerRows = getEmptyPlayerRows();
  for (let playerIndex = 0; playerIndex < rows.length; playerIndex++) {
    for (let rowIndex = 0; rowIndex < rows[playerIndex].length; rowIndex++) {
      if (rows[playerIndex][rowIndex].openSpaceCount > 0) {
        newPlayerRows[playerIndex][rowIndex] = rows[playerIndex][rowIndex];
      }
    }
  }
  return newPlayerRows;
}

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
    action.peerDataConnection!.send(JSON.stringify(state));
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

export function calculateContiguousScoreForTile(
  color: string,
  finalRows: Array<Array<FinalTile>>,
  index: number,
) {
  const startRow = index;
  const startCol = finalRows[index].findIndex(tile => tile.tileColor === color);
  const numRows = finalRows.length;
  const numCols = finalRows[0].length;
  let score = 1;

  // Expand upwards
  let currentRow = startRow - 1;
  while (currentRow >= 0 && finalRows[currentRow][startCol].isFilled) {
    score++;
    currentRow--;
  }

  // Expand downwards
  currentRow = startRow + 1;
  while (currentRow < numRows && finalRows[currentRow][startCol].isFilled) {
    score++;
    currentRow++;
  }

  // Expand left
  let currentCol = startCol - 1;
  while (currentCol >= 0 && finalRows[startRow][currentCol].isFilled) {
    score++;
    currentCol--;
  }

  // Expand right
  currentCol = startCol + 1;
  while (currentCol < numCols && finalRows[startRow][currentCol].isFilled) {
    score++;
    currentCol++;
  }

  return score;
}

export function sumAllContiguousScoresWhilePlacingTiles(
  playerRows: Array<Row>,
  finalPlayerRows: Array<Array<FinalTile>>,
): number {
  let score = 0;
  playerRows.forEach((row, index) => {
    if (row.tileColor !== undefined && row.openSpaceCount === 0) {
      score += calculateContiguousScoreForTile(
        row.tileColor,
        finalPlayerRows,
        index,
      );
      updateFinalRowWithTile(index, row.tileColor, finalPlayerRows);
    }
  });
  return score;
}

export function calculatePlayerScoreWhilePlacingFinalTiles(
  playerRows: Array<Row>,
  playerPenaltyRow: Array<PenaltyTile>,
  finalPlayerRows: Array<Array<FinalTile>>,
): number {
  const score = sumAllContiguousScoresWhilePlacingTiles(
    playerRows,
    finalPlayerRows,
  );
  const penaltyAmount = playerPenaltyRow
    .filter(tile => tile.tileColor !== undefined)
    .reduce((accumulator, currentTile) => {
      return currentTile.tileColor === undefined
        ? 0
        : accumulator + currentTile.penaltyAmount;
    }, 0);
  return score - penaltyAmount;
}

function updateFinalRowWithTile(
  rowIndex: number,
  tileColor: string | undefined,
  finalRows: Array<Array<FinalTile>>,
) {
  if (tileColor === undefined) {
    return;
  }

  const updateColIndex = finalRows[rowIndex].findIndex(
    tile => tile.tileColor === tileColor,
  );
  console.log('other update data', {
    tileColor,
    finalRow: finalRows[rowIndex],
    updateColIndex,
  });
  finalRows[rowIndex][updateColIndex].isFilled = true;
}

function isGameOver(finalTiles: Array<Array<Array<FinalTile>>>): boolean {
  for (const playerFinalRows of finalTiles) {
    for (const playerFinalRow of playerFinalRows) {
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
  const isRoundOver = factories.every(c => c.tiles.length == 0);

  if (isRoundOver) {
    player0Score += calculatePlayerScoreWhilePlacingFinalTiles(
      state.playerRows[0],
      state.playerPenaltyRows[0],
      state.finalPlayerRows[0],
    );
    player1Score += calculatePlayerScoreWhilePlacingFinalTiles(
      state.playerRows[1],
      state.playerPenaltyRows[1],
      state.finalPlayerRows[1],
    );

    if (state.bagOfTiles.length < factories.length * 4) {
      state.bagOfTiles = getNewBagOfTiles();
    }

    state.playerRows = clearFullPlayerRows(state.playerRows);
    state.playerPenaltyRows = getEmptyPenaltyRows();
    factories = getInitialFactories(state.bagOfTiles.slice(0, 20));
    state.bagOfTiles = state.bagOfTiles.slice(20, state.bagOfTiles.length);
  }

  if (isGameOver(state.finalPlayerRows)) {
    // calculate end of game bonus
    for (let i = 0; i < state.finalPlayerRows.length; i++) {
      for (const playerFinalRow of state.finalPlayerRows[i]) {
        const emptyTiles = playerFinalRow.filter(tile => !tile.isFilled);
        if (emptyTiles.length === 0) {
          if (i == 0) {
            player0Score += 2;
          } else {
            player1Score += 2;
          }
        }
      }
    }
    // TODO calculate end game bonuses for column and all color full
  }

  const newGameState = {
    ...state,
    isGameOver: isGameOver(state.finalPlayerRows),
    factories,
    source: undefined,
    turnNumber: state.turnNumber + 1,
    playerScores: [player0Score, player1Score],
  };
  if (!action.isLocalGame) {
    sendGameStateToPeer(newGameState, action);
  }

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
  console.log('clickDestination state', state);

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
