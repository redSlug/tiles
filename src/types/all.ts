import { DataConnection } from 'peerjs';

export type Row = {
  openSpaceCount: number;
  tileColor?: string;
};

export type Source = {
  factoryNumber: number;
  tileColor: string;
  tileCount: number;
  tilesIndex: number;
};

export type Factory = {
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

export type PenaltyTile = {
  tileColor: string | undefined;
  penaltyAmount: number;
};

export type GameState = {
  factories: Array<Factory>;
  playerPenaltyRows: Array<Array<PenaltyTile>>;
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
  type: 'set_peer_game_state';
  peerId: string;
  peerGameState: GameState;
};

export type ClickSourceAction = {
  type: 'click_source';
  factoryNumber: number;
  tileColor: string;
  tileCount: number;
  tilesIndex: number;
};

export type ClickDestinationAction = {
  type: 'click_destination';
  rowNumber: number;
  peerDataConnection: DataConnection | undefined;
  playerNumber: number;
  isLocalGame: boolean;
};

export type ClickPenaltyDestinationAction = {
  type: 'click_penalty_destination';
  peerDataConnection: DataConnection | undefined;
  playerNumber: number;
  isLocalGame: boolean;
};

export type ClickRoundEndAction = {
  type: 'click_round_end';
};

export type Action =
  | SetPeerGameStateAction
  | ClickSourceAction
  | ClickDestinationAction
  | ClickPenaltyDestinationAction
  | ClickRoundEndAction;
