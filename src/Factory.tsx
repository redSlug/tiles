import './Factory.css';
import './components/Tile.css';
import { Action, FactoryColorGroup, GameType } from './types/all.ts';
import React, { useState } from 'react';
import Tile from './components/Tile.tsx';

function Factory({
  factoryNumber,
  factoryColorGroups,
  gameDispatch,
  playerNumber,
  turnNumber,
  sourceFactoryNumber,
  gameType,
}: {
  factoryNumber: number;
  factoryColorGroups: Array<FactoryColorGroup>;
  gameDispatch: (action: Action) => void;
  playerNumber: number;
  turnNumber: number;
  sourceFactoryNumber: number | undefined;
  gameType: GameType;
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
    });
  }

  function tileIsDisabled(): boolean {
    if (gameType === 'local') {
      return false;
    }

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
