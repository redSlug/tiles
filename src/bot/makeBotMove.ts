import {
  ClickSourceAction,
  ClickDestinationAction,
  ClickPenaltyDestinationAction,
  GameState,
  FinalTile,
} from '../types/all.ts';

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
    let availableRows = state.players[1].rows
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
    let availableDestinationActions: Array<ClickDestinationAction> =
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

  dispatch(candidateMoves[0].source);

  dispatch(candidateMoves[0].destination);

  await new Promise(resolve => setTimeout(resolve, 500));
}
