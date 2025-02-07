import './Factories.css';
import Factory from './Factory.tsx';
import { Action, GameState } from './types/all.ts';
import { DataConnection } from 'peerjs';

function Factories({
  state,
  gameDispatch,
  peerDataConnection,
  playerNumber,
}: {
  state: GameState;
  gameDispatch: (action: Action) => void;
  peerDataConnection: DataConnection;
  playerNumber: number;
}) {
  return (
    <div className="factories-container">
      {state.factories.map((factory, index: number) => (
        <div key={index}>
          <Factory
            factoryNumber={index}
            factoryColorGroups={factory.tiles}
            gameDispatch={gameDispatch}
            peerDataConnection={peerDataConnection!}
            playerNumber={playerNumber}
            turnNumber={state.turnNumber}
            sourceFactoryNumber={state.source?.factoryNumber}
          />
        </div>
      ))}
    </div>
  );
}

export default Factories;
