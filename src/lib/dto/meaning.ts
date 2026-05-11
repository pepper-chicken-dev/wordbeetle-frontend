import 'server-only';

import { toExampleView, type ExampleView } from './example';

export type MeaningView = {
  id: number;
  definition: string;
  display_order: number;
  examples: ExampleView[];
};

export function toMeaningView(input: {
  id: number;
  definition: string;
  display_order: number;
  examples: Array<{
    id: number;
    sentence: string;
    translation: string;
    display_order: number;
  }>;
}): MeaningView {
  return {
    id: input.id,
    definition: input.definition,
    display_order: input.display_order,
    examples: input.examples.map(toExampleView),
  };
}
