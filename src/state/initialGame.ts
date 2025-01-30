import { FactoryCircle, GameState } from "../types/all.ts";

function getBagOfTiles(): Array<string> {
  const duplicate = (arr: Array<string>, times: number) =>
    Array(times)
      .fill([...arr])
      .reduce((a, b) => a.concat(b));
  const bagOfTiles = duplicate(
    ["orange", "red", "blue", "purple", "green"],
    20,
  );
  bagOfTiles.sort(() => Math.random() - 0.5);
  return bagOfTiles;
}

function getCircle(tiles: Array<string>): FactoryCircle {
  const colorCounts = tiles.reduce(
    (acc: Map<string, number>, color: string) => {
      acc.set(color, (acc.get(color) || 0) + 1);
      return acc;
    },
    new Map(),
  );
  const factorCircleTiles = Array.from(colorCounts).map(([color, count]) => ({
    tileColor: color,
    tileCount: count,
  }));
  return { tiles: factorCircleTiles };
}

function getCircles(tiles: Array<string>): Array<FactoryCircle> {
  const tilesPerCircle = 4;
  const circles = [];
  for (let i = 0; i < tiles.length; i += tilesPerCircle) {
    const currentTiles = tiles.slice(i, i + tilesPerCircle);
    circles.push(getCircle(currentTiles));
  }

  circles.push({ tiles: [{ tileColor: "white", tileCount: 1 }] });
  return circles;
}

export function getInitialState(): GameState {
  let bagOfTiles = getBagOfTiles();
  const startingTiles = bagOfTiles.slice(0, 20);
  bagOfTiles = bagOfTiles.slice(20);

  return {
    circles: getCircles(startingTiles),
    playerScores: [0, 0],
    isGameOver: false,
    playerOverflowRows: [
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
    ],
    playerRows: [
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
    ],
    finalPlayerRows: [
      [
        [
          { tileColor: "purple", isFilled: false },
          { tileColor: "red", isFilled: false },
          { tileColor: "orange", isFilled: false },
          { tileColor: "green", isFilled: false },
          { tileColor: "blue", isFilled: false },
        ],
        [
          { tileColor: "blue", isFilled: false },
          { tileColor: "purple", isFilled: false },
          { tileColor: "red", isFilled: false },
          { tileColor: "orange", isFilled: false },
          { tileColor: "green", isFilled: false },
        ],
        [
          { tileColor: "green", isFilled: false },
          { tileColor: "blue", isFilled: false },
          { tileColor: "purple", isFilled: false },
          { tileColor: "red", isFilled: false },
          { tileColor: "orange", isFilled: false },
        ],
        [
          { tileColor: "orange", isFilled: false },
          { tileColor: "green", isFilled: false },
          { tileColor: "blue", isFilled: false },
          { tileColor: "purple", isFilled: false },
          { tileColor: "red", isFilled: false },
        ],
        [
          { tileColor: "red", isFilled: false },
          { tileColor: "orange", isFilled: false },
          { tileColor: "green", isFilled: false },
          { tileColor: "blue", isFilled: false },
          { tileColor: "purple", isFilled: false },
        ],
      ],
      [
        [
          { tileColor: "purple", isFilled: false },
          { tileColor: "red", isFilled: false },
          { tileColor: "orange", isFilled: false },
          { tileColor: "green", isFilled: false },
          { tileColor: "blue", isFilled: false },
        ],
        [
          { tileColor: "blue", isFilled: false },
          { tileColor: "purple", isFilled: false },
          { tileColor: "red", isFilled: false },
          { tileColor: "orange", isFilled: false },
          { tileColor: "green", isFilled: false },
        ],
        [
          { tileColor: "green", isFilled: false },
          { tileColor: "blue", isFilled: false },
          { tileColor: "purple", isFilled: false },
          { tileColor: "red", isFilled: false },
          { tileColor: "orange", isFilled: false },
        ],
        [
          { tileColor: "orange", isFilled: false },
          { tileColor: "green", isFilled: false },
          { tileColor: "blue", isFilled: false },
          { tileColor: "purple", isFilled: false },
          { tileColor: "red", isFilled: false },
        ],
        [
          { tileColor: "red", isFilled: false },
          { tileColor: "orange", isFilled: false },
          { tileColor: "green", isFilled: false },
          { tileColor: "blue", isFilled: false },
          { tileColor: "purple", isFilled: false },
        ],
      ],
    ],
    source: undefined,
    bagOfTiles,
    turnNumber: 0,
  };
}
