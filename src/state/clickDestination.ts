import {
  ClickDestinationAction,
  FactoryColorGroup,
  GameState,
  OverFlowTile,
  Row,
} from '../types/all.ts';

function manageWhiteTile(
  sourceTiles: Array<FactoryColorGroup>,
  penaltyRow: Array<OverFlowTile>,
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
  playerPenaltyRow: Array<OverFlowTile>,
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
  const { tileColor, tileCount, circleNumber } = state.source!;
  const circles = state.circles;
  const sourceTiles = circles[circleNumber].tiles;
  const lastCircleNumber = 5;

  manageWhiteTile(
    sourceTiles,
    state.playerOverflowRows[playerNumber],
    circleNumber === lastCircleNumber,
  );

  updatePenaltyRow(
    state.playerOverflowRows[playerNumber],
    state.playerRows[playerNumber][rowNumber],
    tileColor,
    tileCount,
  );

  console.log('XXX', state.playerOverflowRows[playerNumber]);

  const openSpaceCount = calculateOpenSpaceCount(
    state.playerRows[playerNumber][rowNumber],
    tileCount,
  );

  console.log('YYY', state.playerOverflowRows[playerNumber]);

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
