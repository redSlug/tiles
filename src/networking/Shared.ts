import { GameState } from '../types/all.ts';

const username = import.meta.env.VITE_TURN_SERVER_USERNAME || 'garbage';
const credential = import.meta.env.VITE_TURN_SERVER_CREDENTIAL || 'garbage';

export function getParsedGameState(data: string): GameState {
  // Correct data that altered in transport
  return JSON.parse(data, (_, value) => {
    if (value === null) {
      return undefined;
    }
    return value;
  });
}

export const peerConfig = {
  config: {
    iceServers: [
      {
        urls: 'stun:stun.relay.metered.ca:80',
      },
      {
        urls: 'turn:global.relay.metered.ca:80',
        username,
        credential,
      },
      {
        urls: 'turn:global.relay.metered.ca:80?transport=tcp',
        username,
        credential,
      },
      {
        urls: 'turn:global.relay.metered.ca:443',
        username,
        credential,
      },
      {
        urls: 'turns:global.relay.metered.ca:443?transport=tcp',
        username,
        credential,
      },
    ],
  },
};
