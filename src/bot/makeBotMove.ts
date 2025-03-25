import {
  ClickSourceAction,
  ClickDestinationAction,
  ClickPenaltyDestinationAction,
  GameState,
  FinalTile,
} from '../types/all.ts';
import { BOT_PLAYER_NUMBER } from '../constants/all.ts';
import { getOtherPlayer } from '../utilities/all.ts';
import { searchMovesRouterReducer } from '../state/useGameState.ts';
import { sortBy } from 'sort-by-typescript';

type CandidateMove = {
  initialGameState: GameState;
  source: ClickSourceAction;
  destination: ClickDestinationAction | ClickPenaltyDestinationAction;
};

type ScoredCandidateMove = {
  candidateMove: CandidateMove;
  evalScore: number;
  scoreDelta: number | undefined;
  nextGameState: GameState | undefined;
};

function getNewGameState(candidateMove: CandidateMove): GameState {
  const stateAfterSourceMove = {
    ...searchMovesRouterReducer(
      candidateMove.initialGameState,
      candidateMove.source,
    ),
  };

  return searchMovesRouterReducer(
    stateAfterSourceMove,
    candidateMove.destination,
  );
}

function getScoreDelta(
  candidateMove: CandidateMove,
  playerNumber: number,
): number {
  const initialState = candidateMove.initialGameState;
  const newState = getNewGameState(candidateMove);
  return (
    newState.players[playerNumber].score -
    initialState.players[playerNumber].score
  );
}

function getEvaluationScore(
  candidateMove: CandidateMove,
  playerNumber: number,
): number {
  const player = candidateMove.initialGameState.players[playerNumber];
  const opponent =
    candidateMove.initialGameState.players[getOtherPlayer(playerNumber)];
  const factories = candidateMove.initialGameState.factories;
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
  const isLateRound = factories.flatMap(f => f.tiles).length < 8;
  if (isLateRound && leftoverSpaceCount === 0) {
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

function getScoredCandidateMoves(
  state: GameState,
  playerNumber: number,
): Array<ScoredCandidateMove> {
  const candidateMoves = [];
  console.log('getting scored candidate moves');
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
  const finalRows = state.players[playerNumber].finalRows;
  for (const source of candidateSourceActions) {
    const availableRows = state.players[playerNumber].rows
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
            playerNumber,
            gameType: 'bot',
          }) as ClickDestinationAction,
      );
    for (const destination of availableDestinationActions) {
      candidateMoves.push({
        initialGameState: state,
        source,
        destination,
      } as CandidateMove);
    }
    candidateMoves.push({
      initialGameState: state,
      source,
      destination: {
        type: 'click_penalty_destination',
        peerDataConnection: undefined,
        playerNumber,
        gameType: 'bot',
      } as ClickPenaltyDestinationAction,
    });
  }

  return candidateMoves.map(
    candidateMove =>
      ({
        candidateMove,
        evalScore: getEvaluationScore(candidateMove, playerNumber),
        scoreDelta: undefined,
        nextGameState: undefined,
      }) as ScoredCandidateMove,
  );
}

export function sortBotMoves(moves: Array<ScoredCandidateMove>) {
  moves.sort(sortBy('-scoreDelta', '-evalScore'));
}

export async function makeBetterBotMove(
  state: GameState,
  dispatch: (
    action:
      | ClickSourceAction
      | ClickDestinationAction
      | ClickPenaltyDestinationAction,
  ) => void,
): Promise<void> {
  const stateCopy = { ...state };
  const candidateMoves = getScoredCandidateMoves(stateCopy, BOT_PLAYER_NUMBER);

  for (const candidateMove of candidateMoves) {
    candidateMove.nextGameState = getNewGameState(candidateMove.candidateMove);
    candidateMove.scoreDelta = getScoreDelta(
      candidateMove.candidateMove,
      BOT_PLAYER_NUMBER,
    );
  }
  sortBotMoves(candidateMoves);
  const { source, destination } = candidateMoves[0].candidateMove;
  dispatch(source);
  setTimeout(() => {
    dispatch(destination);
  }, 500);
  await new Promise(resolve => setTimeout(resolve, 500));
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
  const stateCopy = { ...state };
  const candidateMoves = getScoredCandidateMoves(stateCopy, BOT_PLAYER_NUMBER);
  // candidateMoves.sort((moveA, moveB) => {
  //   return moveB.evalScore - moveA.evalScore;
  // });
  const { source, destination } = candidateMoves[0].candidateMove;
  dispatch(source);
  setTimeout(() => {
    dispatch(destination);
  }, 500);
  await new Promise(resolve => setTimeout(resolve, 500));
}
