import { FinalTile } from './types/all.ts';
import './FinalRows.css';
import './components/Tile.css';
import Tile from './components/Tile.tsx';

function Rows({
  finalRows,
  playerName,
  playerScore,
}: {
  finalRows: Array<Array<FinalTile>>;
  playerName: string;
  playerScore: number;
}) {
  function getTileClassName(tile: FinalTile): string {
    if (tile.isFilled) {
      return `${tile.tileColor}-tiles`;
    }
    return `${tile.tileColor}-tiles empty-final-tile`;
  }

  return (
    <div className={'final-rows-container'}>
      <div className={'score'}>
        {playerName} score: {playerScore}
      </div>
      {finalRows.map((finalRow: Array<FinalTile>, rowIndex: number) => (
        <div key={rowIndex}>
          {finalRow.map((tile: FinalTile, colIndex: number) => (
            <Tile
              key={`factory-${rowIndex}-${colIndex}`}
              isDisabled={true}
              className={getTileClassName(tile)}
              onClick={() => {}}
              value={undefined}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Rows;
