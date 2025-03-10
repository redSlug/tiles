import {
  ClickSourceAction,
  ClickDestinationAction,
  ClickPenaltyDestinationAction,
  GameState,
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

  for (const source of candidateSourceActions) {
    let availableRows = state.players[1].rows
      .map((row, rowNumber) => ({
        rowNumber,
        row,
      }))
      .filter(({ row }) => {
        return (
          (row.tileColor === undefined || row.tileColor === source.tileColor) &&
          row.openSpaceCount > 0
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
