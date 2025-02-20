import { FinalTile, PenaltyTile, Row } from '../../types/all';
import { calculatePlayerScoreWhilePlacingFinalTiles } from '../../state/clickDestination';

// Mock console.log to avoid cluttering test output
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('calculatePlayerScoreWhilePlacingFinalTiles', () => {
  // Helper function to create a basic final row configuration
  function createFinalRow(colors: string[]): FinalTile[] {
    return colors.map(color => ({
      tileColor: color,
      isFilled: false,
    }));
  }

  test('should calculate score correctly with no penalties', () => {
    // Arrange
    const playerRows: Row[] = [
      { openSpaceCount: 0, tileColor: 'red' },
      { openSpaceCount: 0, tileColor: 'blue' },
    ];

    const playerPenaltyRow: PenaltyTile[] = [];

    const finalPlayerRows: FinalTile[][] = [
      createFinalRow(['red', 'blue', 'yellow']),
      createFinalRow(['red', 'blue', 'green']),
    ];

    // Create a deep copy for comparison after function execution
    // const finalPlayerRowsOriginal = JSON.parse(JSON.stringify(finalPlayerRows));

    // Act
    const result = calculatePlayerScoreWhilePlacingFinalTiles(
      playerRows,
      playerPenaltyRow,
      finalPlayerRows,
    );

    // Assert
    // Verify the tiles were filled
    expect(finalPlayerRows[0][0].isFilled).toBe(true); // 'red' in first row
    expect(finalPlayerRows[1][1].isFilled).toBe(true); // 'blue' in second row

    // Expect score to be 2 (no continuous paths, just individual tiles)
    expect(result).toBe(2);
  });

  test('should subtract penalties from score', () => {
    // Arrange
    const playerRows: Row[] = [{ openSpaceCount: 0, tileColor: 'red' }];

    const playerPenaltyRow: PenaltyTile[] = [
      { tileColor: 'yellow', penaltyAmount: 2 },
      { tileColor: 'green', penaltyAmount: 3 },
    ];

    const finalPlayerRows: FinalTile[][] = [
      createFinalRow(['red', 'blue', 'yellow']),
    ];

    // Act
    const result = calculatePlayerScoreWhilePlacingFinalTiles(
      playerRows,
      playerPenaltyRow,
      finalPlayerRows,
    );

    // Assert
    // Expect score to be -4: 1 (from placing 'red') - 5 (total penalties)
    expect(result).toBe(-4);
  });

  test('should ignore rows with open spaces', () => {
    // Arrange
    const playerRows: Row[] = [
      { openSpaceCount: 1, tileColor: 'red' }, // Has open space, should be ignored
      { openSpaceCount: 0, tileColor: 'blue' }, // No open space, should be counted
    ];

    const playerPenaltyRow: PenaltyTile[] = [];

    const finalPlayerRows: FinalTile[][] = [
      createFinalRow(['red', 'blue', 'yellow']),
      createFinalRow(['green', 'blue', 'red']),
    ];

    // Act
    const result = calculatePlayerScoreWhilePlacingFinalTiles(
      playerRows,
      playerPenaltyRow,
      finalPlayerRows,
    );

    // Assert
    // First row should not be filled due to open space
    expect(finalPlayerRows[0][0].isFilled).toBe(false);
    // Second row should be filled (blue)
    expect(finalPlayerRows[1][1].isFilled).toBe(true);

    // Expect score to be 1 (only blue tile counts)
    expect(result).toBe(1);
  });

  test('should handle contiguous scoring when tiles form a line', () => {
    // Arrange
    // Setup a scenario where we already have some filled tiles
    // and new placements create contiguous lines
    const playerRows: Row[] = [{ openSpaceCount: 0, tileColor: 'red' }];

    const playerPenaltyRow: PenaltyTile[] = [];

    const finalPlayerRows: FinalTile[][] = [
      [
        { tileColor: 'red', isFilled: false },
        { tileColor: 'blue', isFilled: true },
        { tileColor: 'green', isFilled: true },
      ],
      [
        { tileColor: 'yellow', isFilled: true },
        { tileColor: 'red', isFilled: true },
        { tileColor: 'blue', isFilled: false },
      ],
      [
        { tileColor: 'green', isFilled: true },
        { tileColor: 'yellow', isFilled: false },
        { tileColor: 'red', isFilled: false },
      ],
    ];

    // Act
    const result = calculatePlayerScoreWhilePlacingFinalTiles(
      playerRows,
      playerPenaltyRow,
      finalPlayerRows,
    );

    // Assert
    // The red tile in the first row should connect to the already filled red tile
    // in the second row, creating a contiguous line of 2 tiles
    expect(finalPlayerRows[0][0].isFilled).toBe(true);
    expect(result).toBe(5); // Score for contiguous line of 2 red tiles
  });

  test('should ignore undefined tile colors in player rows', () => {
    // Arrange
    const playerRows: Row[] = [
      { openSpaceCount: 0, tileColor: undefined },
      { openSpaceCount: 0, tileColor: 'blue' },
    ];

    const playerPenaltyRow: PenaltyTile[] = [];

    const finalPlayerRows: FinalTile[][] = [
      createFinalRow(['red', 'blue', 'yellow']),
      createFinalRow(['red', 'blue', 'green']),
    ];

    // Act
    const result = calculatePlayerScoreWhilePlacingFinalTiles(
      playerRows,
      playerPenaltyRow,
      finalPlayerRows,
    );

    // Assert
    // First row should not be filled due to undefined tileColor
    expect(finalPlayerRows[0][0].isFilled).toBe(false);
    expect(finalPlayerRows[0][1].isFilled).toBe(false);

    // Second row blue tile should be filled
    expect(finalPlayerRows[1][1].isFilled).toBe(true);

    // Expect score to be 1 (only blue tile counts)
    expect(result).toBe(1);
  });

  test('should ignore undefined tile colors in penalty row', () => {
    // Arrange
    const playerRows: Row[] = [{ openSpaceCount: 0, tileColor: 'red' }];

    const playerPenaltyRow: PenaltyTile[] = [
      { tileColor: undefined, penaltyAmount: 5 },
      { tileColor: 'blue', penaltyAmount: 2 },
    ];

    const finalPlayerRows: FinalTile[][] = [
      createFinalRow(['red', 'blue', 'yellow']),
    ];

    // Act
    const result = calculatePlayerScoreWhilePlacingFinalTiles(
      playerRows,
      playerPenaltyRow,
      finalPlayerRows,
    );

    // Assert
    // Expect score to be -1: 1 (from placing 'red') - 2 (only the defined penalty)
    expect(result).toBe(-1);
  });
});
