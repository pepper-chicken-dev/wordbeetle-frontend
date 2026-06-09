import { createServer } from 'node:http';

const port = 3101;

const sessions = new Map();
let nextGuestId = 1;

function createStore() {
  return {
    nextWordbookId: 1,
    nextWordId: 1,
    nextMeaningId: 1,
    nextExampleId: 1,
    setting: undefined,
    wordbooks: [],
  };
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function noContent(res) {
  res.writeHead(204);
  res.end();
}

function notFound(res) {
  json(res, 404, { errors: ['Not found'] });
}

async function readJson(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }
  return body === '' ? {} : JSON.parse(body);
}

function getStore(req) {
  const header = req.headers.authorization;
  if (header === undefined || !header.startsWith('Bearer ')) {
    return undefined;
  }
  return sessions.get(header.slice('Bearer '.length));
}

function paginate(data, url) {
  const page = Number(url.searchParams.get('page') ?? 1);
  const perPage = Number(url.searchParams.get('per_page') ?? data.length);
  const start = (page - 1) * perPage;
  const paged = data.slice(start, start + perPage);
  return {
    data: paged,
    pagination: {
      current_page: page,
      total_pages: Math.max(1, Math.ceil(data.length / perPage)),
      total_count: data.length,
      per_page: perPage,
    },
  };
}

function findWordbook(store, id) {
  return store.wordbooks.find((wordbook) => wordbook.id === id);
}

function wordListItem(word) {
  const firstMeaning = word.meanings[0];
  return {
    id: word.id,
    spelling: word.spelling,
    status: word.status,
    next_review_at: word.next_review_at,
    first_meaning:
      firstMeaning === undefined ? null : { definition: firstMeaning.definition },
  };
}

function createMeanings(store, attributes = []) {
  return attributes.map((meaning, index) => ({
    id: store.nextMeaningId++,
    definition: meaning.definition,
    display_order: meaning.display_order ?? index + 1,
    examples: (meaning.examples_attributes ?? []).map((example, exampleIndex) => ({
      id: store.nextExampleId++,
      sentence: example.sentence,
      translation: example.translation,
      display_order: example.display_order ?? exampleIndex + 1,
    })),
  }));
}

function updateMeanings(store, word, attributes = []) {
  for (const meaningInput of attributes) {
    if (meaningInput.id === undefined) {
      word.meanings.push(...createMeanings(store, [meaningInput]));
      continue;
    }

    const meaning = word.meanings.find((item) => item.id === meaningInput.id);
    if (meaning === undefined) continue;

    if (meaningInput.definition !== undefined) {
      meaning.definition = meaningInput.definition;
    }
    if (meaningInput.display_order !== undefined) {
      meaning.display_order = meaningInput.display_order;
    }

    for (const exampleInput of meaningInput.examples_attributes ?? []) {
      if (exampleInput.id === undefined) {
        meaning.examples.push({
          id: store.nextExampleId++,
          sentence: exampleInput.sentence ?? '',
          translation: exampleInput.translation ?? '',
          display_order:
            exampleInput.display_order ?? meaning.examples.length + 1,
        });
        continue;
      }

      const example = meaning.examples.find(
        (item) => item.id === exampleInput.id,
      );
      if (example === undefined) continue;
      if (exampleInput.sentence !== undefined) {
        example.sentence = exampleInput.sentence;
      }
      if (exampleInput.translation !== undefined) {
        example.translation = exampleInput.translation;
      }
      if (exampleInput.display_order !== undefined) {
        example.display_order = exampleInput.display_order;
      }
    }
  }
}

function nextReviewAt(store, status) {
  const fallback = {
    hard: { days: 1, hours: 0, minutes: 0 },
    uncertain: { days: 3, hours: 0, minutes: 0 },
    easy: { days: 7, hours: 0, minutes: 0 },
  };
  const key = `${status}_interval`;
  const interval = store.setting?.[key] ?? fallback[status];
  const ms =
    ((interval.days * 24 + interval.hours) * 60 + interval.minutes) *
    60 *
    1000;
  return new Date(Date.now() + ms).toISOString();
}

async function handleRequest(req, res) {
  const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);

  if (url.pathname === '/health') {
    json(res, 200, { ok: true });
    return;
  }

  const path = url.pathname.replace(/^\/api\/v1/, '');
  const segments = path.split('/').filter(Boolean);

  if (req.method === 'POST' && path === '/auth/guest') {
    const token = `guest-${nextGuestId++}`;
    sessions.set(token, createStore());
    json(res, 200, {
      user: {
        email: null,
        name: 'ゲスト',
        avatar_url: null,
        guest_expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      token,
    });
    return;
  }

  const store = getStore(req);
  if (store === undefined) {
    json(res, 401, { errors: ['Unauthorized'] });
    return;
  }

  if (path === '/setting') {
    if (req.method === 'GET') {
      if (store.setting === undefined) {
        notFound(res);
        return;
      }
      json(res, 200, store.setting);
      return;
    }

    if (req.method === 'POST' || req.method === 'PATCH') {
      const body = await readJson(req);
      store.setting = body.setting;
      json(res, 200, store.setting);
      return;
    }
  }

  if (segments[0] === 'wordbooks' && segments.length === 1) {
    if (req.method === 'GET') {
      json(res, 200, paginate(store.wordbooks, url));
      return;
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const wordbook = {
        id: store.nextWordbookId++,
        title: body.wordbook.title,
        created_at: new Date().toISOString(),
        words: [],
      };
      store.wordbooks.push(wordbook);
      json(res, 201, wordbook);
      return;
    }
  }

  const wordbookId = Number(segments[1]);
  const wordbook = findWordbook(store, wordbookId);
  if (segments[0] !== 'wordbooks' || wordbook === undefined) {
    notFound(res);
    return;
  }

  if (segments.length === 2) {
    if (req.method === 'GET') {
      json(res, 200, wordbook);
      return;
    }

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      wordbook.title = body.wordbook.title ?? wordbook.title;
      json(res, 200, wordbook);
      return;
    }

    if (req.method === 'DELETE') {
      store.wordbooks = store.wordbooks.filter((item) => item.id !== wordbookId);
      noContent(res);
      return;
    }
  }

  if (segments[2] === 'test' && segments[3] === 'words') {
    const now = Date.now();
    json(res, 200, {
      wordbook: { id: wordbook.id, title: wordbook.title },
      words: wordbook.words.filter(
        (word) =>
          word.next_review_at === null ||
          Date.parse(word.next_review_at) <= now,
      ),
    });
    return;
  }

  if (segments[2] === 'words' && segments.length === 3) {
    if (req.method === 'GET') {
      json(res, 200, paginate(wordbook.words.map(wordListItem), url));
      return;
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const word = {
        id: store.nextWordId++,
        spelling: body.word.spelling,
        status: body.word.status ?? 'not_studied',
        next_review_at: body.word.next_review_at ?? null,
        meanings: createMeanings(store, body.word.meanings_attributes),
      };
      wordbook.words.push(word);
      json(res, 201, word);
      return;
    }
  }

  const wordId = Number(segments[3]);
  const word = wordbook.words.find((item) => item.id === wordId);
  if (segments[2] !== 'words' || word === undefined) {
    notFound(res);
    return;
  }

  if (segments.length === 4) {
    if (req.method === 'GET') {
      json(res, 200, word);
      return;
    }

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      if (body.word.spelling !== undefined) {
        word.spelling = body.word.spelling;
      }
      if (body.word.status !== undefined) {
        word.status = body.word.status;
        if (body.word.status !== 'not_studied') {
          word.next_review_at = nextReviewAt(store, body.word.status);
        }
      }
      updateMeanings(store, word, body.word.meanings_attributes);
      json(res, 200, word);
      return;
    }

    if (req.method === 'DELETE') {
      wordbook.words = wordbook.words.filter((item) => item.id !== wordId);
      noContent(res);
      return;
    }
  }

  notFound(res);
}

const server = createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    console.error(error);
    json(res, 500, { errors: ['Internal server error'] });
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Mock API listening on http://127.0.0.1:${port}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
