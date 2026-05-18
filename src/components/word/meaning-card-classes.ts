export const MEANING_CARD_CLASSES = [
  'bg-blue-50 border-blue-200',
  'bg-pink-50 border-pink-200',
  'bg-amber-50 border-amber-200',
  'bg-green-50 border-green-200',
  'bg-purple-50 border-purple-200',
];

export function meaningCardClass(index: number): string {
  return MEANING_CARD_CLASSES[index % MEANING_CARD_CLASSES.length];
}
