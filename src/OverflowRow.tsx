import { OverFlowTile, Source } from './types/all.ts';
import Tile from './components/Tile.tsx';
import './components/Tile.css';
import './OverflowRow.css';

function OverflowRow({
  tiles,
  playerNumber,
  turnNumber,
  source,
}: {
  tiles: Array<OverFlowTile>;
  playerNumber: number;
  turnNumber: number;
  source: Source | undefined;
}) {
  function getClassName(tile: OverFlowTile) {
    if (!rowIsDisabled(source, playerNumber, turnNumber)) {
      return `empty-tile clickable-row`;
    } else if (tile.tileColor === undefined) {
      return 'empty-tile';
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
    <div key={'overflow-row'} className={'overflow-row-container'}>
      {tiles.map((tile, colIndex: number) => (
        <Tile
          key={`overflow-${colIndex}`}
          isDisabled={rowIsDisabled(source, playerNumber, turnNumber)}
          className={getClassName(tile)}
          onClick={() => {}}
          value={'-' + tile.penaltyAmount.toString()}
        />
      ))}
    </div>
  );
}

export default OverflowRow;
