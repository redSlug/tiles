import { useState } from 'react';
import {
  GameState,
  Action,
  ClickSourceAction,
  SetPeerGameStateAction,
} from '../types/all.ts';
import {
  clickDestination,
  clickPenaltyDestination,
} from './clickDestination.ts';
import { setLocalStorage } from '../storage/localStorage.ts';

export function searchMovesRouterReducer(state: GameState, action: Action) {
  if (action.type === 'set_peer_game_state') {
    throw new Error('searchRouterReducer cannot set communicate with peer');
  }
  return clickRouterReducer(state, action);
}

function clickRouterReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'click_source':
      return clickSource(state, action);
    case 'click_destination':
      return clickDestination(state, action);
    case 'click_penalty_destination':
      return clickPenaltyDestination(state, action);
    case 'click_round_end':
      return state;
    case 'set_peer_game_state':
      console.log('setting peer game state', action.peerGameState);
      return setPeerGameState(action);
    default:
      throw new Error('Invalid action type');
  }
}

function setPeerGameState(action: SetPeerGameStateAction) {
  return setLocalStorage(action.peerGameState, action.peerId);
}

function clickSource(state: GameState, action: ClickSourceAction) {
  console.log('in click source', state.source);
  return {
    ...state,
    source: {
      factoryNumber: action.factoryNumber,
      tileColor: action.tileColor,
      tileCount: action.tileCount,
      tilesIndex: action.tilesIndex,
    },
  };
}

export function useGameState(initialState: GameState): {
  state: GameState;
  dispatch: (action: Action) => void;
} {
  const [state, setState] = useState<GameState>(initialState);
  const dispatch = (action: Action) =>
    setState((state: GameState) => clickRouterReducer(state, action));
  return { state, dispatch };
}
