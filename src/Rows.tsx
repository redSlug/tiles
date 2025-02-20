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
  const { source, playerRows, finalPlayerRows } = state as GameState;

  const rows = playerRows[playerNumber];
  const finalRows = finalPlayerRows[playerNumber];
  const [isProcessing, setIsProcessing] = useState(false);

  function rowIsDisabled(
    row: Row,
    rowIndex: number,
    source: Source | undefined,
    isProcessing: boolean,
  ): boolean {
    const finalRow = finalRows[rowIndex];
    const colorAlreadyFull = finalRow.some(
      tile => tile.isFilled && tile.tileColor === source?.tileColor,
    );
    return (
      playerNumber === state.turnNumber % 2 ||
      isProcessing ||
      source == undefined ||
      row.openSpaceCount === 0 ||
      (row.tileColor != undefined && row.tileColor != source!.tileColor) ||
      source!.tileColor === 'white' ||
      colorAlreadyFull
    );
  }

  function handleRowClick(index: number) {
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
    rowIndex: number,
    colIndex: number,
    source: Source | undefined,
    isProcessing: boolean,
  ): string {
    if (row.tileColor === undefined || colIndex < row.openSpaceCount) {
      if (!rowIsDisabled(row, rowIndex, source, isProcessing)) {
        return `empty-tile clickable-row`;
      }

      return 'empty-tile';
    }

    return `${row.tileColor}-tiles`;
  }

  return (
    <div className={'rows-container'}>
      <PenaltyRow
        gameDispatch={gameDispatch}
        peerDataConnection={peerDataConnection}
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
                isDisabled={rowIsDisabled(row, rowIndex, source, isProcessing)}
                className={getTileClassName(
                  row,
                  rowIndex,
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
