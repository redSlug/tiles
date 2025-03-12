import {
  ClickSourceAction,
  ClickDestinationAction,
  ClickPenaltyDestinationAction,
  GameState,
  FinalTile,
} from '../types/all.ts';

type CandidateMove = {
  source: ClickSourceAction;
  destination: ClickDestinationAction | ClickPenaltyDestinationAction;
};

function getCandidateScore(
  state: GameState,
  candidateMove: CandidateMove,
): number {
  let score = 0;

  const { source, destination } = candidateMove;
  const botPlayer = state.players[1];
  const opponentPlayer = state.players[0];

  if (destination.type === 'click_penalty_destination') {
    return -40;
  }
  const rowNumber = (destination as ClickDestinationAction).rowNumber;


    const filledPenaltyTiles = botPlayer.penaltyRows.filter(
      tile => tile.tileColor !== undefined,
    ).length;

    score -= filledPenaltyTiles * 5;

    return score;
  }

  const destinationRow = botPlayer.rows[rowNumber];
  const finalRow = botPlayer.finalRows[rowNumber];

  const currentOpenSpace = destinationRow.openSpaceCount;
  const tilesBeingPlaced = Math.min(source.tileCount, currentOpenSpace);
  const remainingOpenSpace = Math.max(0, currentOpenSpace - tilesBeingPlaced);

  if (remainingOpenSpace === 0) {
    score += 50;

    score += rowNumber * 5;
  } else {
    const completionPercentage = 1 - remainingOpenSpace / (rowNumber + 1);
    score += completionPercentage * 30;
  }

  const matchingTileInFinalRow = finalRow.find(
    tile => tile.tileColor === source.tileColor && !tile.isFilled,
  );

  if (matchingTileInFinalRow) {
    score += 25;
  }

  score += tilesBeingPlaced * 5;

  if (rowNumber === 2) {
    score += 10;
  } else if (rowNumber === 1 || rowNumber === 3) {
    score += 5;
  }

  const opponentColorRows = opponentPlayer.rows.filter(
    row => row.tileColor === source.tileColor && row.openSpaceCount > 0,
  );

  if (opponentColorRows.length > 0) {
    score += source.tileCount * 8;
  }

  const isLateGame = state.factories.flatMap(f => f.tiles).length < 10;

  if (isLateGame && remainingOpenSpace === 0) {
    score += 15;
  }

  return score;
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

  function finalRowHasColorUnfilled(
    color: string,
    finalRow: Array<FinalTile>,
  ): boolean {
    return finalRow.some(tile => {
      return tile.tileColor === color && !tile.isFilled;
    });
  }

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

  console.log('Top candidate moves before sorting:');
  for (let i = 0; i < Math.min(3, candidateMoves.length); i++) {
    const move = candidateMoves[i];
    const score = getCandidateScore(state, move);
    console.log(`Move ${i + 1}:`, {
      factoryNumber: move.source.factoryNumber,
      tileColor: move.source.tileColor,
      tileCount: move.source.tileCount,
      rowNumber:
        move.destination.type === 'click_destination'
          ? (move.destination as ClickDestinationAction).rowNumber
          : 'penalty',
      score: score,
    });
  }

  candidateMoves.sort((moveA, moveB) => {
    const scoreA = getCandidateScore(state, moveA);
    const scoreB = getCandidateScore(state, moveB);
    return scoreB - scoreA;
  });

  dispatch(candidateMoves[0].source);
  dispatch(candidateMoves[0].destination);

  await new Promise(resolve => setTimeout(resolve, 500));
}
