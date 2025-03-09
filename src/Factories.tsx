import './Factories.css';

import Factory from './Factory.tsx';
import { Action, GameState, GameType } from './types/all.ts';

function Factories({
  state,
  gameDispatch,
  playerNumber,
  gameType,
}: {
  state: GameState;
  gameDispatch: (action: Action) => void;
  playerNumber: number;
  gameType: GameType;
}) {
  return (
    <div className="factories-container">
      {state.factories.map((factory, index: number) => (
        <div key={index}>
          <Factory
            factoryNumber={index}
            factoryColorGroups={factory.tiles}
            gameDispatch={gameDispatch}
            playerNumber={playerNumber}
            turnNumber={state.turnNumber}
            sourceFactoryNumber={state.source?.factoryNumber}
            gameType={gameType}
          />
        </div>
      ))}
    </div>
  );
}

export default Factories;
