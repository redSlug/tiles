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
  sourceFactoryNumber,
  gameType,
  playerTurn,
}: {
  factoryNumber: number;
  factoryColorGroups: Array<FactoryColorGroup>;
  gameDispatch: (action: Action) => void;
  playerNumber: number;
  sourceFactoryNumber: number | undefined;
  gameType: GameType;
  playerTurn: number;
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

    if (gameType === 'bot') {
      // TODO remove hard coding
      const isDisabled = playerTurn !== 0;
      console.log(
        `factory tileIsDisabled bot check: playerTurn=${playerTurn}, isDisabled=${isDisabled}`,
      );
      return isDisabled;
    }

    const isDisabled = playerNumber !== playerTurn;
    console.log(
      `factory tileIsDisabled remote check: playerNumber=${playerNumber}, playerTurn=${playerTurn}, isDisabled=${isDisabled}`,
    );
    return isDisabled;
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
