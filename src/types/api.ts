export type WordStatus = 'not_studied' | 'hard' | 'uncertain' | 'easy';

export type Interval = {
  days: number;
  hours: number;
  minutes: number;
};

export type User = {
  id: number;
  provider: 'google' | 'guest';
  provider_uid: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  guest_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Wordbook = {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
};

export type Word = {
  id: number;
  wordbook_id: number;
  spelling: string;
  status: WordStatus;
  next_review_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Meaning = {
  id: number;
  word_id: number;
  content: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type WordWithFirstMeaning = Word & {
  first_meaning: Meaning | null;
};

export type Example = {
  id: number;
  word_id: number;
  sentence: string;
  translation: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type Setting = {
  id: number;
  user_id: number;
  hard_interval: Interval | null;
  uncertain_interval: Interval | null;
  easy_interval: Interval | null;
  created_at: string;
  updated_at: string;
};

export type CreateWordbookInput = {
  title: string;
};

export type UpdateWordbookInput = {
  title?: string;
};

export type CreateWordInput = {
  spelling: string;
  status: WordStatus;
  next_review_at?: string | null;
};

export type UpdateWordInput = {
  spelling?: string;
  status?: WordStatus;
  next_review_at?: string | null;
};

export type CreateMeaningInput = {
  content: string;
  display_order: number;
};

export type UpdateMeaningInput = {
  content?: string;
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
