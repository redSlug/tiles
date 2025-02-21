import './Factories.css';
import Factory from './Factory.tsx';
import { Action, GameState } from './types/all.ts';

function Factories({
  state,
  gameDispatch,
  playerNumber,
  isLocalGame,
}: {
  state: GameState;
  gameDispatch: (action: Action) => void;
  playerNumber: number;
  isLocalGame: boolean;
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
            isLocalGame={isLocalGame}
          />
        </div>
      ))}
    </div>
  );
}

export default Factories;
