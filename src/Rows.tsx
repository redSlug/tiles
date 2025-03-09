import {
  Action,
  GameState,
  GameType,
  PenaltyTile,
  Row,
  Source,
} from './types/all.ts';
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
  gameType,
}: {
  gameDispatch: (action: Action) => void;
  peerDataConnection: DataConnection | undefined;
  state: GameState;
  playerNumber: number;
  overflowTiles: Array<PenaltyTile>;
  gameType: GameType;
}) {
  const { source, players } = state as GameState;

  const rows = players[playerNumber].rows;
  const finalRows = players[playerNumber].finalRows;
  const [isProcessing, setIsProcessing] = useState(false);

  function rowIsDisabled(
    row: Row,
    rowIndex: number,
    source: Source | undefined,
    isProcessing: boolean,
  ): boolean {
    if (source === undefined) {
      return true;
    }

    const finalRow = finalRows[rowIndex];
    const colorAlreadyFull = finalRow.some(
      tile => tile.isFilled && tile.tileColor === source.tileColor,
    );

    if (
      isProcessing ||
      row.openSpaceCount === 0 ||
      (row.tileColor != undefined && row.tileColor != source.tileColor) ||
      source.tileColor === 'white' ||
      colorAlreadyFull
    ) {
      return true;
    }

    switch (gameType) {
      case 'bot':
        return playerNumber !== 0 || state.turnNumber % 2 !== 0;
      default:
        return playerNumber === state.turnNumber % 2;
    }
  }

  function handleRowClick(index: number) {
    if (isProcessing) {
      return;
    }
    setIsProcessing(true);
    gameDispatch({
      type: 'click_destination',
      rowNumber: index,
      peerDataConnection: peerDataConnection,
      playerNumber,
      gameType,
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
        gameType={gameType}
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
