import "./Factories.css";
import Factory from "./Factory.tsx";
import { Action, FactoryCircle, GameState } from "./types/all.ts";
import { DataConnection } from "peerjs";

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
      {state.circles.map((circle: FactoryCircle, index: number) => (
        <div key={index}>
          <Factory
            circleNumber={index}
            factoryColorGroups={circle.tiles}
            gameDispatch={gameDispatch}
            peerDataConnection={peerDataConnection!}
            playerNumber={playerNumber}
            turnNumber={state.turnNumber}
            sourceCircleNumber={state.source?.circleNumber}
          />
        </div>
      ))}
    </div>
  );
}

export default Factories;
