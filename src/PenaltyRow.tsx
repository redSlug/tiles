import { Action, GameType, PenaltyTile, Source } from './types/all.ts';
import Tile from './components/Tile.tsx';
import './components/Tile.css';
import './PenaltyRow.css';
import { useState } from 'react';
import { DataConnection } from 'peerjs';

function PenaltyRow({
  gameDispatch,
  peerDataConnection,
  tiles,
  playerNumber,
  turnNumber,
  source,
  gameType,
  currentTurnNumber,
}: {
  gameDispatch: (action: Action) => void;
  peerDataConnection: DataConnection | undefined;
  tiles: Array<PenaltyTile>;
  playerNumber: number;
  turnNumber: number;
  source: Source | undefined;
  gameType: GameType;
  currentTurnNumber: number;
}) {
  const [isProcessing, setIsProcessing] = useState(false);

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
    if (source === undefined) {
      return true;
    }

    switch (gameType) {
      case 'bot':
        return playerNumber !== 0 || turnNumber % 2 !== 0;
      default:
        return playerNumber === turnNumber % 2;
    }
  }

  async function handleRowClick() {
    console.log('in click penalty destination');
    if (isProcessing) {
      return;
    }
    setIsProcessing(true);
    gameDispatch({
      type: 'click_penalty_destination',
      peerDataConnection: peerDataConnection,
      playerNumber,
      gameType,
      currentTurnNumber,
    });
    setIsProcessing(false);
  }

  return (
    <div key={'penalty-row'} className={'penalty-row-container'}>
      {tiles.map((tile, colIndex: number) => (
        <Tile
          key={`penalty-${colIndex}`}
          isDisabled={rowIsDisabled(source, playerNumber, turnNumber)}
          className={getClassName(tile)}
          onClick={handleRowClick}
          value={'-' + tile.penaltyAmount.toString()}
        />
      ))}
    </div>
  );
}

export default PenaltyRow;
