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

export const getAffirmingQuotes = [
  'Habits are fully up to you. Feed the good ones. Starve the toxic ones. Understand you are never too old to grow new ones.\n-Dawn Staley',
  'I see beauty in all things',
  'I am so grateful for the discipline and consistency I have with everything I do',
  'Those with a grateful mindset tend to see the message in the mess. And even though life may knock them down, the grateful find reasons, if even small ones, to get up.\n-Steve Maraboli',
  'At the end of the day, let there be no excuses, no explanations, no regrets.\n-Steve Maraboli',
  'I find the best way to love someone is not to change them, but instead, help them reveal the greatest version of themselves.\n-Steve Maraboli',
  'Live your truth. Express your love. Share your enthusiasm. Take action towards your dreams. Walk your talk. Dance and sing to your music. Embrace your blessings. Make today worth remembering.\n-Steve Maraboli',
  "Stop giving your attention to anything that isn't contributing to your happiness. Your mental health is so much more important.",
  'Believe that you can do it cause you can do it.\n-Bob Ross',
  'Every time you are tempted to react in the same old way, ask if you want to be a prisoner of the past or a pioneer of the future.\n--Deepak Chopra',
  'The life of your dreams will happen by design, not by accident. You have to create it in your mind and then in your space.',
  'the next chapter of your life is going to be so amazing',
  'o fall in love with yourself is the first secret to happiness',
  "strength grows in the moments when you think you can't go on but you keep going anyway",
  'let things flow naturally to you',
  'let go of outcome, focus on journey',
  'allow adversity to be your teacher',
  "You'll never be able to control your mood if you let it depend on other people. Decide today that you're the only one in charge of how you feel.",
  'The real difficulty is to overcome how you think about yourself.\n-Maya Angelou',
  "When a difficult situation comes into our life, it's important to realize that every moment we get to choose the way we want to feel--the way we want to write the narrative of our story. Pick the one that contributes most to your aliveness and growth.",
];

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
  'taking a few deep, mindful breaths',
  'watching a short documentary on a random topic',
  'organizing your phone apps or digital files',
  'setting a small, achievable goal for the next hour.',
  'taking yourself on a small, solo "date"',
];
