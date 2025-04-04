export function hasDuplicateField<T, K extends keyof T>(
  arr: T[],
  field: K,
): boolean {
  const seen = new Set<T[K]>();
  for (const obj of arr) {
    const value = obj[field];
    if (seen.has(value)) {
      return true;
    }
    seen.add(value);
  }
  return false;
}

const palettes = [
  ['#4f5d78', '#5b95b9', '#6ac2e6', '#96c7f0', '#bacdf4', '#d7d4f4', '#ddd2ec'],
  ['#9ca577', '#cdd8a3', '#faf7bc', '#ffdfb4', '#ffcac6', '#ffbfe7', '#ffb9cf'],
  ['#4b7076', '#b7c0f2', '#a59def', '#a177e3', '#a745ce', '#e72786', '#e8734b'],
  ['#47126b', '#581caf', '#5e36e7', '#7b59ec', '#9478f0', '#ac97f2', '#c4a7ed'],
  ['#FF0000', '#FF8D00', '#FFEE00', '#00FF00', '#0088FF', '#3300FF', '#8800FF'],
  ['#FFF430', '#FFFFFF', '#9C59D1', '#000000'],
  ['#755158', '#d6909e', '#ea8ec4', '#e578e0', '#e172f5', '#e6a4f0'],
  ['#FFD7E9', '#FFBDDF', '#FF9FD1', '#F783AC', '#E45D95', '#FFE8F1', '#FFFFFF'],
  ['#5BCEFA', '#F5A9B8', '#FFFFFF'],
];

export function getSpecificColorPalette(index: number) {
  return palettes[index];
}

export function getRandomElement<T>(array: Array<T>) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function getRandomColorPalette() {
  return getRandomElement(palettes);
}

export function getOtherPlayer(playerNumber: number) {
  return playerNumber === 0 ? 1 : 0;
}

export const antiAddictionMessages = [
  'message a friend',
  'drink some water',
  'write some gratitudes',
  'check in on someone',
  'draw a picture',
  'write some self affirmations',
  'look at pictures',
  'do exercises',
  'do some stretches',
  'listen to a podcast',
  'dance',
  'smile in the mirror',
  'do something creative',
  'write yourself a love letter',
  'plan your next vacation',
  'go outside',
  'study a new language',
  'make plans with a friend',
  'write a letter to a friend',
];
