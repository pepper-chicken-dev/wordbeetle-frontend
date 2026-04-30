export type WordStatus = 'not_studied' | 'hard' | 'uncertain' | 'easy';

export type Interval = {
  days: number;
  hours: number;
  minutes: number;
};

export type User = {
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  guest_expires_at: string | null;
};

export type Wordbook = {
  id: number;
  title: string;
  created_at: string;
};

export type Word = {
  id: number;
  spelling: string;
  status: WordStatus;
  next_review_at: string | null;
};

export type Meaning = {
  id: number;
  definition: string;
  display_order: number;
};

export type WordWithFirstMeaning = Word & {
  first_meaning: { definition: string } | null;
};

export type WordWithDetails = Word & {
  meanings: Meaning[];
  examples: Example[];
};

export type TestWordsResponse = {
  wordbook: Wordbook;
  words: WordWithDetails[];
};

export type Example = {
  id: number;
  sentence: string;
  translation: string;
  display_order: number;
};

export type Setting = {
  hard_interval: Interval | null;
  uncertain_interval: Interval | null;
  easy_interval: Interval | null;
};

export type CreateWordbookInput = {
  title: string;
};

export type UpdateWordbookInput = {
  title?: string;
};

export type CreateWordInput = {
  spelling: string;
  status?: WordStatus;
  next_review_at?: string | null;
};

export type UpdateWordInput = {
  spelling?: string;
  status?: WordStatus;
};

export type CreateMeaningInput = {
  definition: string;
  display_order: number;
};

export type UpdateMeaningInput = {
  definition?: string;
  display_order?: number;
};

export type CreateExampleInput = {
  sentence: string;
  translation: string;
  display_order: number;
};

export type UpdateExampleInput = {
  sentence?: string;
  translation?: string;
  display_order?: number;
};

export type CreateSettingInput = {
  hard_interval: Interval;
  uncertain_interval: Interval;
  easy_interval: Interval;
};

export type UpdateSettingInput = {
  hard_interval?: Interval;
  uncertain_interval?: Interval;
  easy_interval?: Interval;
};

export type ValidationErrors = {
  errors: string[];
};

export type ApiError = {
  error: string;
};
