import { PenaltyTile, Source } from './types/all.ts';
import Tile from './components/Tile.tsx';
import './components/Tile.css';
import './PenaltyRow.css';

function PenaltyRow({
  tiles,
  playerNumber,
  turnNumber,
  source,
}: {
  tiles: Array<PenaltyTile>;
  playerNumber: number;
  turnNumber: number;
  source: Source | undefined;
}) {
  function getClassName(tile: PenaltyTile) {
    if (rowIsDisabled(source, playerNumber, turnNumber)) {
      return tile.tileColor === undefined
        ? `empty-tile`
        : `${tile.tileColor}-tiles`;
    } else if (tile.tileColor === undefined) {
      return 'empty-tile clickable-row';
    }
    return `${tile.tileColor}-tiles`;
  }
  function rowIsDisabled(
    source: Source | undefined,
    playerNumber: number,
    turnNumber: number,
  ): boolean {
    return playerNumber === turnNumber % 2 || source == undefined;
  }

  return (
    <div key={'penalty-row'} className={'penalty-row-container'}>
      {tiles.map((tile, colIndex: number) => (
        <Tile
          key={`penalty-${colIndex}`}
          isDisabled={rowIsDisabled(source, playerNumber, turnNumber)}
          className={getClassName(tile)}
          onClick={() => {}}
          value={'-' + tile.penaltyAmount.toString()}
        />
      ))}
    </div>
  );
}

export default PenaltyRow;
