import './Factory.css';
import './components/Tile.css';
import { Action, FactoryColorGroup } from './types/all.ts';
import { DataConnection } from 'peerjs';
import React, { useState } from 'react';
import Tile from './components/Tile.tsx';

function Factory({
  factoryNumber,
  factoryColorGroups,
  gameDispatch,
  peerDataConnection,
  playerNumber,
  turnNumber,
  sourceFactoryNumber,
}: {
  factoryNumber: number;
  factoryColorGroups: Array<FactoryColorGroup>;
  gameDispatch: (action: Action) => void;
  peerDataConnection: DataConnection;
  playerNumber: number;
  turnNumber: number;
  sourceFactoryNumber: number | undefined;
}) {
  const [clickedColor, setClickedColor] = useState<string | undefined>(
    undefined,
  );

  async function handleFactoryClick(index: number, group: FactoryColorGroup) {
    setClickedColor(group.tileColor);
    gameDispatch({
      type: 'click_source',
      factoryNumber: factoryNumber,
      tileColor: group.tileColor,
      tileCount: group.tileCount,
      tilesIndex: index,
      peerDataConnection: peerDataConnection,
    });
  }

  function tileIsDisabled(): boolean {
    return playerNumber === turnNumber % 2;
  }

  function getClassName(group: FactoryColorGroup): string {
    const tileColorClass = `${group.tileColor}-tiles`;
    if (
      sourceFactoryNumber !== undefined &&
      sourceFactoryNumber === factoryNumber &&
      clickedColor === group.tileColor
    ) {
      return tileColorClass + ' clicked-button';
    }
    return tileColorClass;
  }

  return (
    <div className="factory-container">
      {factoryColorGroups.map(
        (group: FactoryColorGroup, outerIndex: number) => (
          <React.Fragment key={outerIndex}>
            {Array.from({ length: group.tileCount }).map((_, index) => (
              <Tile
                key={`factory-${outerIndex}-${index}`}
                isDisabled={tileIsDisabled()}
                className={getClassName(group)}
                onClick={() => handleFactoryClick(index, group)}
                value={undefined}
              />
            ))}
          </React.Fragment>
        ),
      )}
    </div>
    // </div>
  );
}

export default Factory;
