import {
  ClickDestinationAction,
  FactoryColorGroup,
  GameState,
  PenaltyTile,
  Row,
} from '../types/all.ts';

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

function updatePenaltyRow(
  playerPenaltyRow: Array<PenaltyTile>,
  currentRow: Row,
  tileColor: string,
  tileCount: number,
) {
  let openSpaceCount = currentRow.openSpaceCount - tileCount;
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

function calculateOpenSpaceCount(currentRowData: Row, tileCount: number) {
  return currentRowData.openSpaceCount - tileCount;
}

export function clickDestination(
  state: GameState,
  action: ClickDestinationAction,
) {
  const { rowNumber, playerNumber } = action;
  const { tileColor, tileCount, factoryNumber } = state.source!;
  const factories = state.factories;
  const sourceTiles = factories[factoryNumber].tiles;
  const overflowFactoryNumber = 5;

  manageWhiteTile(
    sourceTiles,
    state.playerPenaltyRows[playerNumber],
    factoryNumber === overflowFactoryNumber,
  );

  updatePenaltyRow(
    state.playerPenaltyRows[playerNumber],
    state.playerRows[playerNumber][rowNumber],
    tileColor,
    tileCount,
  );

  console.log('XXX', state.playerPenaltyRows[playerNumber]);

  const openSpaceCount = calculateOpenSpaceCount(
    state.playerRows[playerNumber][rowNumber],
    tileCount,
  );

  console.log('YYY', state.playerPenaltyRows[playerNumber]);

  state.playerRows[playerNumber][rowNumber] = { tileColor, openSpaceCount };

  // Must deal with all tiles in the factory that was chosen
  for (const sourceTile of sourceTiles) {
    if (
      sourceTile === undefined ||
      sourceTile.tileColor === tileColor ||
      factoryNumber === overflowFactoryNumber
    ) {
      continue;
    }
    const overflowFactoryTiles = factories[overflowFactoryNumber].tiles;
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

  if (factoryNumber != overflowFactoryNumber) {
    factories[factoryNumber].tiles = [];
  } else {
    factories[overflowFactoryNumber].tiles = factories[
      overflowFactoryNumber
    ].tiles.filter(tile => tile.tileColor !== tileColor);
  }

  const gameOver = factories.every(c => c.tiles.length == 0);

  let player0Score = 0;
  let player1Score = 0;
  let isGameOver = false;
  if (gameOver) {
    isGameOver = true;

    // TODO this needs to reflect game logic
    player0Score = state.playerRows[0].filter(
      row => row.openSpaceCount === 0,
    ).length;
    player0Score += state.playerPenaltyRows[0].reduce(
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
    player1Score += state.playerPenaltyRows[1].reduce(
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
    factories,
    source: undefined,
    turnNumber: state.turnNumber + 1,
    playerScores: [player0Score, player1Score],
  };

  console.log('ZZZ', newGameState);

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
