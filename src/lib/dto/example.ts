import 'server-only';

export type ExampleView = {
  id: number;
  sentence: string;
  translation: string;
  display_order: number;
};

export function toExampleView(input: {
  id: number;
  sentence: string;
  translation: string;
  display_order: number;
}): ExampleView {
  return {
    id: input.id,
    sentence: input.sentence,
    translation: input.translation,
    display_order: input.display_order,
  };
}
