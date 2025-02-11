import { Action, GameState, PenaltyTile, Row, Source } from './types/all.ts';
import { DataConnection } from 'peerjs';
import React, { useState } from 'react';
import './Rows.css';
import './components/Tile.css';
import Tile from './components/Tile.tsx';
import PenaltyRow from './PenaltyRow.tsx';

function Rows({
  gameDispatch,
  peerDataConnection,
  state,
  playerNumber,
  overflowTiles,
}: {
  gameDispatch: (action: Action) => void;
  peerDataConnection: DataConnection;
  state: GameState;
  playerNumber: number;
  overflowTiles: Array<PenaltyTile>;
}) {
  const { source, playerRows } = state as GameState;

  const rows = playerRows[playerNumber];
  const [isProcessing, setIsProcessing] = useState(false);

  function rowIsDisabled(
    row: Row,
    source: Source | undefined,
    isProcessing: boolean,
  ): boolean {
    return (
      playerNumber === state.turnNumber % 2 ||
      isProcessing ||
      source == undefined ||
      row.openSpaceCount === 0 ||
      (row.tileColor != undefined && row.tileColor != source!.tileColor) ||
      source!.tileColor === 'white'
    );
  }

  async function handleRowClick(index: number) {
    if (isProcessing) {
      return;
    }
    setIsProcessing(true);
    gameDispatch({
      type: 'click_destination',
      rowNumber: index,
      peerDataConnection: peerDataConnection!,
      playerNumber,
    });
    setIsProcessing(false);
  }

  function getTileClassName(
    row: Row,
    colIndex: number,
    source: Source | undefined,
    isProcessing: boolean,
  ): string {
    if (row.tileColor === undefined || colIndex < row.openSpaceCount) {
      if (!rowIsDisabled(row, source, isProcessing)) {
        return `empty-tile clickable-row`;
      }

      return 'empty-tile';
    }

    return `${row.tileColor}-tiles`;
  }

  return (
    <div className={'rows-container'}>
      <PenaltyRow
        tiles={overflowTiles}
        playerNumber={playerNumber}
        turnNumber={state.turnNumber}
        source={state.source}
      />
      {rows.map((row: Row, rowIndex: number) => (
        <div className={'row-container'} key={rowIndex}>
          {Array.from(Array(rowIndex + 1)).map((_, colIndex) => (
            <React.Fragment key={colIndex}>
              <Tile
                isDisabled={rowIsDisabled(row, source, isProcessing)}
                className={getTileClassName(
                  row,
                  colIndex,
                  source,
                  isProcessing,
                )}
                onClick={() => handleRowClick(rowIndex)}
                value={undefined}
              />
            </React.Fragment>
          ))}
        </div>
      ))}{' '}
    </div>
  );
}

export default Rows;
