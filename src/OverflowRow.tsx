import { OverFlowTile } from "./types/all.ts";
import Tile from "./components/Tile.tsx";
import "./components/Tile.css";
import "./OverflowRow.css";

function OverflowRow({ tiles }: { tiles: Array<OverFlowTile> }) {
  function getClassName(tile: OverFlowTile) {
    if (tile.tileColor === undefined) {
      return "empty-tile";
    }
    return `${tile.tileColor}-tiles`;
  }

  return (
    <div key={"overflow-row"} className={"overflow-row-container"}>
      {tiles.map((tile, colIndex: number) => (
        <Tile
          key={`overflow-${colIndex}`}
          isDisabled={true}
          className={getClassName(tile)}
          onClick={() => {}}
          value={"-" + tile.penaltyAmount.toString()}
        />
      ))}
    </div>
  );
}

export default OverflowRow;
