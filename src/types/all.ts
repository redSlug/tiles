import { DataConnection } from "peerjs";

export type Row = {
  openSpaceCount: number;
  tileColor?: string;
};

export type Source = {
  circleNumber: number;
  tileColor: string;
  tileCount: number;
  tilesIndex: number;
};

export type FactoryCircle = {
  tiles: Array<FactoryColorGroup>;
};

export type FactoryColorGroup = {
  tileColor: string;
  tileCount: number;
};

export type FinalTile = {
  tileColor: string;
  isFilled: boolean;
};

export type OverFlowTile = {
  tileColor: string | undefined;
  penaltyAmount: number;
};

export type GameState = {
  circles: Array<FactoryCircle>;
  playerOverflowRows: Array<Array<OverFlowTile>>;
  playerRows: Array<Array<Row>>;
  finalPlayerRows: Array<Array<Array<FinalTile>>>;
  source?: Source;
  bagOfTiles: Array<string>;
  peerId?: string;
  turnNumber: number;
  playerScores: Array<number>;
  isGameOver: boolean;
};

export type SetPeerGameStateAction = {
  type: "set_peer_game_state";
  peerGameState: GameState;
};

export type ClickSourceAction = {
  type: "click_source";
  circleNumber: number;
  tileColor: string;
  tileCount: number;
  tilesIndex: number;
  peerDataConnection: DataConnection;
};

export type ClickDestinationAction = {
  type: "click_destination";
  rowNumber: number;
  peerDataConnection: DataConnection;
  playerNumber: number;
};

export type ClickRoundEndAction = {
  type: "click_round_end";
};

export type Action =
  | SetPeerGameStateAction
  | ClickSourceAction
  | ClickDestinationAction
  | ClickRoundEndAction;
