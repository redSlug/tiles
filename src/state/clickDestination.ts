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
import {
  INITIAL_FACTORY_GROUP_COUNT,
  OVERFLOW_FACTORY_NUMBER,
  TILES_PER_FACTORY_GROUP,
} from '../constants/all';
import {
  getNewBagOfTiles,
  getEmptyPenaltyRows,
  getInitialFactories,
  getEmptyRows,
} from './initialGame';
import { deepCopy, getOtherPlayer } from '../utilities/all';

function clearFullRows(rows: Array<Row>) {
  const newRows = getEmptyRows();
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    if (rows[rowIndex].openSpaceCount > 0) {
      newRows[rowIndex] = rows[rowIndex];
    }
  }
  return newRows;
}

function manageWhiteTile(
  tileColor: string,
  sourceTiles: Array<FactoryColorGroup>,
  penaltyRow: Array<PenaltyTile>,
  isOverflowFactory: boolean,
) {
  if (tileColor === 'white') {
    return;
  }

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
    console.log('=====> penaltyRow', penaltyRow);
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

    if (lastOpenOverflowIndex == -1) {
      return;
    }

    for (let i = lastOpenOverflowIndex; i < playerPenaltyRow.length; i++) {
      if (tileCountToPlaceInOverflow > 0) {
        console.log('====> playerPenaltyRow', playerPenaltyRow);
        console.log('====> tileColor', tileColor, i, lastOpenOverflowIndex);

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

function calculateEndGameBonus(finalRows: Array<Array<FinalTile>>) {
  let bonus = 0;

  for (const playerFinalRow of finalRows) {
    const emptyTiles = playerFinalRow.filter(tile => !tile.isFilled);
    if (emptyTiles.length === 0) {
      bonus += 2;
      console.log('row complete: +2 points');
    }
  }

  for (let col = 0; col < finalRows[0].length; col++) {
    let isColumnComplete = true;
    for (let row = 0; row < finalRows.length; row++) {
      if (!finalRows[row][col].isFilled) {
        isColumnComplete = false;
        break;
      }
    }
    if (isColumnComplete) {
      bonus += 7;
      console.log('column complete: +7 points');
    }
  }

  const colorCounts = new Map<string, number>();
  for (let row = 0; row < finalRows.length; row++) {
    for (let col = 0; col < finalRows[row].length; col++) {
      const tile = finalRows[row][col];
      if (tile.isFilled) {
        const color = tile.tileColor;
        colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
      }
    }
  }
  for (const [color, count] of colorCounts.entries()) {
    if (count === finalRows.length) {
      bonus += 10;
      console.log(`color ${color} tiles: +10 points`);
    }
  }

  return bonus;
}

function hasWhiteTile(penaltyRow: Array<PenaltyTile>): boolean {
  return penaltyRow.findIndex(tile => tile.tileColor === 'white') !== -1;
}

function endPlayerTurn(
  state: GameState,
  factories: Array<Factory>,
  action: ClickDestinationAction | ClickPenaltyDestinationAction,
) {
  const player0 = state.players[0];
  const player1 = state.players[1];
  const isRoundOver = factories.every(c => c.tiles.length == 0);

  let nextPlayerTurn = getOtherPlayer(state.playerTurn);
  const finalPlayerRows = [player0.finalRows, player1.finalRows];

  if (isRoundOver) {
    nextPlayerTurn = hasWhiteTile(state.players[0].penaltyRows) ? 0 : 1;

    player0.score += calculatePlayerScoreWhilePlacingFinalTiles(
      player0.rows,
      player0.penaltyRows,
      player0.finalRows,
    );
    player1.score += calculatePlayerScoreWhilePlacingFinalTiles(
      player1.rows,
      player1.penaltyRows,
      player1.finalRows,
    );

    if (state.bagOfTiles.length < factories.length * 4) {
      state.bagOfTiles = getNewBagOfTiles();
    }

    player0.rows = clearFullRows(player0.rows);
    player1.rows = clearFullRows(player1.rows);

    player0.penaltyRows = getEmptyPenaltyRows();
    player1.penaltyRows = getEmptyPenaltyRows();

    if (!isGameOver(finalPlayerRows)) {
      factories = getInitialFactories(
        state.bagOfTiles.slice(
          0,
          INITIAL_FACTORY_GROUP_COUNT * TILES_PER_FACTORY_GROUP,
        ),
      );
    }
    state.bagOfTiles = state.bagOfTiles.slice(20, state.bagOfTiles.length);
  }

  if (isGameOver(finalPlayerRows)) {
    player0.score += calculateEndGameBonus(player0.finalRows);
    player1.score += calculateEndGameBonus(player1.finalRows);
  }

  const newGameState = {
    ...state,
    isGameOver: isGameOver(finalPlayerRows),
    factories,
    source: undefined,
    turnNumber: state.turnNumber + 1,
    playerTurn: nextPlayerTurn,
    players: [{ ...player0 }, { ...player1 }],
  };
  if (action.gameType === 'remote') {
    sendGameStateToPeer(newGameState, action);
  }

  console.log('sent newGameState in endPlayerTurn', newGameState);
  return newGameState;
}

export function clickPenaltyDestination(
  state: GameState,
  action: ClickPenaltyDestinationAction,
) {
  const stateCopy = deepCopy(state);
  const { playerNumber } = action;
  const { tileColor, tileCount, factoryNumber } = stateCopy.source!;
  const factories = stateCopy.factories;
  const sourceTiles = factories[factoryNumber].tiles;
  const penaltyRow = stateCopy.players[playerNumber].penaltyRows;
  const isOverflowFactory = factoryNumber === OVERFLOW_FACTORY_NUMBER;

  manageWhiteTile(tileColor, sourceTiles, penaltyRow, isOverflowFactory);

  const firstEmptyPenaltyIndex = penaltyRow.findIndex(
    tile => tile.tileColor === undefined,
  );
  let lastIndexToFill = Math.min(
    penaltyRow.length,
    firstEmptyPenaltyIndex + tileCount,
  );
  lastIndexToFill = Math.max(lastIndexToFill, 0);
  for (let i = firstEmptyPenaltyIndex; i < lastIndexToFill; i++) {
    if (penaltyRow[i] === undefined) {
      console.log('yoo this should never happen');
      continue;
    }
    penaltyRow[i].tileColor = tileColor;
  }

  if (isOverflowFactory) {
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

  return endPlayerTurn(stateCopy, factories, action);
}

export function clickDestination(
  state: GameState,
  action: ClickDestinationAction,
) {
  console.log('clickDestination state', state);
  const stateCopy = deepCopy(state);
  const { rowNumber, playerNumber } = action;
  const { tileColor, tileCount, factoryNumber } = stateCopy.source!;
  const factories = stateCopy.factories;
  const sourceTiles = factories[factoryNumber].tiles;

  manageWhiteTile(
    tileColor,
    sourceTiles,
    stateCopy.players[playerNumber].penaltyRows,
    factoryNumber === OVERFLOW_FACTORY_NUMBER,
  );

  updatePenaltyRow(
    stateCopy.players[playerNumber].penaltyRows,
    stateCopy.players[playerNumber].rows[rowNumber],
    tileColor,
    tileCount,
  );

  const openSpaceCount = calculateOpenSpaceCount(
    stateCopy.players[playerNumber].rows[rowNumber],
    tileCount,
  );

  // Move source tile to destination row
  stateCopy.players[playerNumber].rows[rowNumber] = {
    tileColor,
    openSpaceCount,
  };

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

  return endPlayerTurn(stateCopy, factories, action);
}
