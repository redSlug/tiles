import { Factory, GameState } from '../types/all.ts';

export function getNewBagOfTiles(): Array<string> {
  const duplicate = (arr: Array<string>, times: number) =>
    Array(times)
      .fill([...arr])
      .reduce((a, b) => a.concat(b));
  const bagOfTiles = duplicate(
    ['orange', 'red', 'blue', 'purple', 'green'],
    20,
  );
  bagOfTiles.sort(() => Math.random() - 0.5);
  return bagOfTiles;
}

function getFactory(tiles: Array<string>): Factory {
  const colorCounts = tiles.reduce(
    (acc: Map<string, number>, color: string) => {
      acc.set(color, (acc.get(color) || 0) + 1);
      return acc;
    },
    new Map(),
  );
  const factoryTiles = Array.from(colorCounts).map(([color, count]) => ({
    tileColor: color,
    tileCount: count,
  }));
  return { tiles: factoryTiles };
}

export function getInitialFactories(tiles: Array<string>): Array<Factory> {
  const tilesPerFactory = 4;
  const factories = [];
  for (let i = 0; i < tiles.length; i += tilesPerFactory) {
    const currentTiles = tiles.slice(i, i + tilesPerFactory);
    factories.push(getFactory(currentTiles));
  }

  factories.push({ tiles: [{ tileColor: 'white', tileCount: 1 }] });
  return factories;
}

export function getEmptyPenaltyRows() {
  return [
    [
      { tileColor: undefined, penaltyAmount: 1 },
      { tileColor: undefined, penaltyAmount: 1 },
      { tileColor: undefined, penaltyAmount: 1 },
      { tileColor: undefined, penaltyAmount: 2 },
      { tileColor: undefined, penaltyAmount: 2 },
      { tileColor: undefined, penaltyAmount: 3 },
    ],
    [
      { tileColor: undefined, penaltyAmount: 1 },
      { tileColor: undefined, penaltyAmount: 1 },
      { tileColor: undefined, penaltyAmount: 1 },
      { tileColor: undefined, penaltyAmount: 2 },
      { tileColor: undefined, penaltyAmount: 2 },
      { tileColor: undefined, penaltyAmount: 3 },
    ],
  ];
}

export function getEmptyPlayerRows() {
  return [
    [
      { openSpaceCount: 1, tileColor: undefined },
      { openSpaceCount: 2, tileColor: undefined },
      { openSpaceCount: 3, tileColor: undefined },
      { openSpaceCount: 4, tileColor: undefined },
      { openSpaceCount: 5, tileColor: undefined },
    ],
    [
      { openSpaceCount: 1, tileColor: undefined },
      { openSpaceCount: 2, tileColor: undefined },
      { openSpaceCount: 3, tileColor: undefined },
      { openSpaceCount: 4, tileColor: undefined },
      { openSpaceCount: 5, tileColor: undefined },
    ],
  ];
}

export function getInitialState(): GameState {
  let bagOfTiles = getNewBagOfTiles();
  // TODO define and use constant for amount of tiles in initial factory setup
  const startingTiles = bagOfTiles.slice(0, 20);
  bagOfTiles = bagOfTiles.slice(20);

  return {
    factories: getInitialFactories(startingTiles),
    playerScores: [0, 0],
    isGameOver: false,
    playerPenaltyRows: getEmptyPenaltyRows(),
    playerRows: getEmptyPlayerRows(),
    finalPlayerRows: [
      [
        [
          { tileColor: 'purple', isFilled: false },
          { tileColor: 'red', isFilled: false },
          { tileColor: 'orange', isFilled: false },
          { tileColor: 'green', isFilled: false },
          { tileColor: 'blue', isFilled: false },
        ],
        [
          { tileColor: 'blue', isFilled: false },
          { tileColor: 'purple', isFilled: false },
          { tileColor: 'red', isFilled: false },
          { tileColor: 'orange', isFilled: false },
          { tileColor: 'green', isFilled: false },
        ],
        [
          { tileColor: 'green', isFilled: false },
          { tileColor: 'blue', isFilled: false },
          { tileColor: 'purple', isFilled: false },
          { tileColor: 'red', isFilled: false },
          { tileColor: 'orange', isFilled: false },
        ],
        [
          { tileColor: 'orange', isFilled: false },
          { tileColor: 'green', isFilled: false },
          { tileColor: 'blue', isFilled: false },
          { tileColor: 'purple', isFilled: false },
          { tileColor: 'red', isFilled: false },
        ],
        [
          { tileColor: 'red', isFilled: false },
          { tileColor: 'orange', isFilled: false },
          { tileColor: 'green', isFilled: false },
          { tileColor: 'blue', isFilled: false },
          { tileColor: 'purple', isFilled: false },
        ],
      ],
      [
        [
          { tileColor: 'purple', isFilled: false },
          { tileColor: 'red', isFilled: false },
          { tileColor: 'orange', isFilled: false },
          { tileColor: 'green', isFilled: false },
          { tileColor: 'blue', isFilled: false },
        ],
        [
          { tileColor: 'blue', isFilled: false },
          { tileColor: 'purple', isFilled: false },
          { tileColor: 'red', isFilled: false },
          { tileColor: 'orange', isFilled: false },
          { tileColor: 'green', isFilled: false },
        ],
        [
          { tileColor: 'green', isFilled: false },
          { tileColor: 'blue', isFilled: false },
          { tileColor: 'purple', isFilled: false },
          { tileColor: 'red', isFilled: false },
          { tileColor: 'orange', isFilled: false },
        ],
        [
          { tileColor: 'orange', isFilled: false },
          { tileColor: 'green', isFilled: false },
          { tileColor: 'blue', isFilled: false },
          { tileColor: 'purple', isFilled: false },
          { tileColor: 'red', isFilled: false },
        ],
        [
          { tileColor: 'red', isFilled: false },
          { tileColor: 'orange', isFilled: false },
          { tileColor: 'green', isFilled: false },
          { tileColor: 'blue', isFilled: false },
          { tileColor: 'purple', isFilled: false },
        ],
      ],
    ],
    source: undefined,
    bagOfTiles,
    turnNumber: 0,
  };
}
