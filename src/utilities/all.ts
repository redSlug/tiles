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

export function deepCopy<T>(originalObject: T): T {
  return JSON.parse(JSON.stringify(originalObject));
}

export function getRandomColorPalette() {
  return getRandomElement(palettes);
}

export function getOtherPlayer(playerNumber: number) {
  return playerNumber === 0 ? 1 : 0;
}

export const antiAddictionMessages = [
  'messaging a friend',
  'drinking some water',
  'writing some gratitudes',
  'checking in on someone',
  'writing some self affirmations',
  'looking at pictures',
  'doing some exercises',
  'doing some stretches',
  'listening to a podcast',
  'dancing',
  'smiling in the mirror',
  'doing something creative',
  'writing yourself a love letter',
  'starting to envision your next vacation',
  'looking or going outside',
  'studying a new language',
  'making plans with a friend',
  'writing a letter to a friend',
  'sending love to someone you care about',
  'planning your next outdoor adventure',
  'making some art',
  'writing a poem',
  'reading a book or listening to an audiobook',
  'listening to music',
  'making a plan to host a game night',
  'observing three things in your physical space',
  'writing a letter to your future self',
  'signing up for a 5K race or a physical fitness challenge',
];
