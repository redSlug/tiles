import {
  ClickSourceAction,
  ClickDestinationAction,
  ClickPenaltyDestinationAction,
  GameState,
  FinalTile,
  Player,
} from '../types/all.ts';

type CandidateMove = {
  source: ClickSourceAction;
  destination: ClickDestinationAction | ClickPenaltyDestinationAction;
};

function getCandidateScore(
  state: GameState,
  candidateMove: CandidateMove,
  player: Player,
  opponent: Player,
): number {
  let score = 0;
  const { source, destination } = candidateMove;
  if (destination.type === 'click_penalty_destination') {
    score = -20;
    const filledPenaltyTiles = player.penaltyRows.filter(
      tile => tile.tileColor !== undefined,
    ).length;
    score -= filledPenaltyTiles * 5;

    return score;
  }
  const rowNumber = (destination as ClickDestinationAction).rowNumber;
  const destinationRow = player.rows[rowNumber];

  const openSpaceCount = destinationRow.openSpaceCount;
  const sourceTilesCount = Math.min(source.tileCount, openSpaceCount);
  const leftoverSpaceCount = Math.max(0, openSpaceCount - sourceTilesCount);

  if (leftoverSpaceCount === 0) {
    score += 50;
    score += rowNumber * 10;
  } else {
    const completionPercentage = 1 - leftoverSpaceCount / (rowNumber + 1);
    score += completionPercentage * 40;
  }

  score += sourceTilesCount * 20;

  if (rowNumber === 2) {
    score += 10;
  } else if (rowNumber === 1 || rowNumber === 3) {
    score += 5;
  }

  const opponentColorRows = opponent.rows.filter(
    row => row.tileColor === source.tileColor && row.openSpaceCount > 0,
  );

  if (opponentColorRows.length > 0) {
    score += source.tileCount * 5;
  }

  const isLateGame = state.factories.flatMap(f => f.tiles).length < 8;

  if (isLateGame && leftoverSpaceCount === 0) {
    score += 15;
  }

  return score;
}

function finalRowHasColorUnfilled(
  color: string,
  finalRow: Array<FinalTile>,
): boolean {
  return finalRow.some(tile => {
    return tile.tileColor === color && !tile.isFilled;
  });
}

export async function makeBotMove(
  state: GameState,
  dispatch: (
    action:
      | ClickSourceAction
      | ClickDestinationAction
      | ClickPenaltyDestinationAction,
  ) => void,
): Promise<void> {
  const candidateMoves = [];

  const candidateSourceActions = state.factories
    .map((factory, factoryIndex) => {
      return factory.tiles.map(
        (tile, tileIndex) =>
          ({
            type: 'click_source',
            factoryNumber: factoryIndex,
            tileColor: tile.tileColor,
            tileCount: tile.tileCount,
            tilesIndex: tileIndex,
          }) as ClickSourceAction,
      );
    })
    .flat()
    .filter(source => source.tileCount > 0 && source.tileColor !== 'white');

  const finalRows = state.players[1].finalRows;
  for (const source of candidateSourceActions) {
    const availableRows = state.players[1].rows
      .map((row, rowNumber) => ({
        rowNumber,
        row,
      }))
      .filter(row => {
        return (
          finalRowHasColorUnfilled(
            source.tileColor,
            finalRows[row.rowNumber],
          ) &&
          row.row.openSpaceCount > 0 &&
          (row.row.tileColor === undefined ||
            row.row.tileColor === source.tileColor)
        );
      });
    const availableDestinationActions: Array<ClickDestinationAction> =
      availableRows.map(
        item =>
          ({
            type: 'click_destination',
            rowNumber: item.rowNumber,
            peerDataConnection: undefined,
            playerNumber: 1,
            gameType: 'bot',
          }) as ClickDestinationAction,
      );

    for (const destination of availableDestinationActions) {
      candidateMoves.push({ source, destination });
    }
    candidateMoves.push({
      source,
      destination: {
        type: 'click_penalty_destination',
        peerDataConnection: undefined,
        playerNumber: 1,
        gameType: 'bot',
      } as ClickPenaltyDestinationAction,
    });
  }

  candidateMoves.sort((moveA, moveB) => {
    const scoreA = getCandidateScore(
      state,
      moveA,
      state.players[1],
      state.players[0],
    );
    const scoreB = getCandidateScore(
      state,
      moveB,
      state.players[1],
      state.players[0],
    );
    return scoreB - scoreA;
  });

  const { source, destination } = candidateMoves[0];

  dispatch(source);
  setTimeout(() => {
    dispatch(destination);
  }, 500);
  await new Promise(resolve => setTimeout(resolve, 500));
}
