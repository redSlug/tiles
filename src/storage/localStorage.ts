import { GameState } from '../types/all.ts';

export function getLocalStorage(peerId: string): GameState | undefined {
  const storageId = `peerGameState-${peerId}`;
  const storedItem = localStorage.getItem(storageId);
  if (storedItem === null) return undefined;
  return JSON.parse(storedItem) as GameState;
}

export function setLocalStorage(
  gameState: GameState,
  peerId: string,
): GameState {
  console.log('in setLocalStorage but hmm', peerId);
  if (peerId === '') {
    alert('setLocalStorage peer ID should not be blank');
    console.log('setLocalStorage bypass with gameState', gameState.turnNumber);
    return gameState;
  }

  const storedState = getLocalStorage(peerId);
  if (storedState !== undefined) {
    if (storedState.turnNumber > gameState.turnNumber) {
      console.log(
        'setLocalStorage using storedState because user likely refreshed their browser',
        storedState.turnNumber,
      );
      return storedState;
    }
  }
  const storageId = `peerGameState-${peerId}`;
  localStorage.setItem(storageId, JSON.stringify(gameState));
  console.log('setLocalStorage using gameState', gameState.turnNumber);
  return gameState;
}
