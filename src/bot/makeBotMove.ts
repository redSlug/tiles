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
  const availableFactories = state.factories
    .map((factory, factoryIndex) => {
      return factory.tiles.map((tile, tileIndex) => ({
        factoryNumber: factoryIndex,
        tileColor: tile.tileColor,
        tileCount: tile.tileCount,
        tilesIndex: tileIndex,
      }));
    })
    .flat()
    .filter(source => source.tileCount > 0);

  await new Promise(resolve => setTimeout(resolve, 800));

  const selectedSource =
    availableFactories[Math.floor(Math.random() * availableFactories.length)];

  const clickSourceAction: ClickSourceAction = {
    type: 'click_source',
    factoryNumber: selectedSource.factoryNumber,
    tileColor: selectedSource.tileColor,
    tileCount: selectedSource.tileCount,
    tilesIndex: selectedSource.tilesIndex,
  };

  dispatch(clickSourceAction);

  await new Promise(resolve => setTimeout(resolve, 1200));

  const selectedTileColor = selectedSource.tileColor;

  const availableRows = state.players[1].rows
    .map((row, index) => ({
      index,
      row,
    }))
    .filter(({ row }) => {
      return (
        (row.tileColor === undefined || row.tileColor === selectedTileColor) &&
        row.openSpaceCount > 0
      );
    });

  await new Promise(resolve => setTimeout(resolve, 500));

  if (availableRows.length > 0 && selectedTileColor !== 'white') {
    const destinationRow = availableRows[0];

    const clickDestinationAction: ClickDestinationAction = {
      type: 'click_destination',
      rowNumber: destinationRow.index,
      peerDataConnection: undefined,
      playerNumber: 1,
      gameType: 'bot',
    };

    dispatch(clickDestinationAction);
  } else {
    const clickPenaltyAction: ClickPenaltyDestinationAction = {
      type: 'click_penalty_destination',
      peerDataConnection: undefined,
      playerNumber: 1,
      gameType: 'bot',
    };

    dispatch(clickPenaltyAction);
  }
}
