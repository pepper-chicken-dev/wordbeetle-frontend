import { expect, test, type Page } from '@playwright/test';

import { signInAsGuest } from './fixtures/auth';

function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now()}`;
}

async function createWordbook(page: Page, title: string): Promise<string> {
  await page.getByRole('link', { name: '新しい単語帳' }).click();
  await expect(page.getByText('新しい単語帳を作成')).toBeVisible();
  await page.getByLabel('タイトル').fill(title);
  await page.getByRole('button', { name: '作成する' }).click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();

  const match = /\/wordbooks\/(?<id>\d+)$/.exec(page.url());
  expect(match?.groups?.id).toBeDefined();
  return match?.groups?.id ?? '';
}

async function createWord(
  page: Page,
  params: {
    spelling: string;
    meaning: string;
    sentence: string;
    translation: string;
  },
): Promise<string> {
  await page.getByRole('link', { name: '単語を追加' }).click();
  await page.getByLabel('スペル').fill(params.spelling);
  await page.getByLabel('意味 1').fill(params.meaning);
  await page.getByLabel('例文').fill(params.sentence);
  await page
    .getByPlaceholder('例: 私はりんごを食べた。')
    .fill(params.translation);
  await page.getByRole('button', { name: '登録する' }).click();
  await expect(page.getByRole('link', { name: params.spelling })).toBeVisible();
  await page.getByRole('link', { name: params.spelling }).click();
  await expect(
    page.getByRole('heading', { name: params.spelling }),
  ).toBeVisible();

  const match = /\/words\/(?<id>\d+)$/.exec(page.url());
  expect(match?.groups?.id).toBeDefined();
  return match?.groups?.id ?? '';
}

test.describe('Core flows', () => {
  test('redirects unauthenticated users to auth', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('/auth');
    await expect(
      page.getByRole('button', { name: 'ゲストとして始める' }),
    ).toBeVisible();
  });

  test('signs in as a guest and shows the dashboard user menu', async ({
    page,
  }) => {
    await signInAsGuest(page);
    await page.getByRole('button', { name: 'ゲスト' }).click();
    await expect(page.getByRole('menu', { name: 'ゲスト' })).toBeVisible();
    await expect(
      page.getByText('7日間の有効期限があります', { exact: true }),
    ).toBeVisible();
  });

  test('covers wordbook, word, filters, test, delete, and sign out', async ({
    page,
  }) => {
    await signInAsGuest(page);

    const originalTitle = uniqueName('E2E 単語帳');
    const updatedTitle = `${originalTitle} Updated`;
    const wordbookId = await createWordbook(page, originalTitle);

    await expect(page.getByRole('link', { name: '編集' })).toBeVisible();
    await expect(page.getByRole('button', { name: '削除' })).toBeVisible();
    await expect(page.getByText('まだ単語がありません')).toBeVisible();

    await page.goto('/dashboard');
    await expect(page.getByRole('link', { name: originalTitle })).toBeVisible();

    await page.goto(`/wordbooks/${wordbookId}/edit`);
    await page.getByLabel('タイトル').fill(updatedTitle);
    await page.getByRole('button', { name: '更新する' }).click();
    await expect(page.getByRole('heading', { name: updatedTitle })).toBeVisible();

    const firstWord = {
      spelling: uniqueName('aurora'),
      meaning: '夜明け',
      sentence: 'The aurora brightened the sky.',
      translation: 'オーロラが空を明るくした。',
    };
    const firstWordId = await createWord(page, firstWord);

    await expect(page.getByText('未学習', { exact: true }).first()).toBeVisible();
    await expect(page.getByText(firstWord.meaning).first()).toBeVisible();
    await expect(
      page.getByRole('paragraph').filter({ hasText: firstWord.sentence }),
    ).toBeVisible();
    await expect(
      page.getByRole('paragraph').filter({ hasText: firstWord.translation }),
    ).toBeVisible();

    const updatedWord = {
      spelling: `${firstWord.spelling}-edited`,
      meaning: '極光',
    };
    await page.goto(`/wordbooks/${wordbookId}/words/${firstWordId}/edit`);
    await page.getByLabel('スペル').fill(updatedWord.spelling);
    await page.getByLabel('意味 1').fill(updatedWord.meaning);
    await page.getByRole('button', { name: '更新する' }).click();
    await expect(
      page.getByRole('heading', { name: updatedWord.spelling }),
    ).toBeVisible();
    await expect(
      page.getByRole('paragraph').filter({ hasText: updatedWord.meaning }),
    ).toBeVisible();

    await page.goto(`/wordbooks/${wordbookId}`);
    await createWord(page, {
      spelling: uniqueName('nebula'),
      meaning: '星雲',
      sentence: 'A nebula can form new stars.',
      translation: '星雲は新しい星を形成することがある。',
    });

    await page.goto(`/wordbooks/${wordbookId}/test`);
    await expect(page.getByText('1 / 2')).toBeVisible();
    await expect(page.getByText(updatedWord.spelling)).toBeVisible();
    await page.getByRole('button', { name: '難しい' }).click();
    await expect(page.getByText('2 / 2')).toBeVisible();
    await page.getByRole('button', { name: '簡単' }).click();
    await expect(page.getByText('テスト完了！')).toBeVisible();

    await page.goto(`/wordbooks/${wordbookId}/words/${firstWordId}`);
    await expect(page.getByText('難しい')).toBeVisible();
    await expect(page.getByText('次の復習')).toBeVisible();

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: '設定' })).toBeVisible();
    await page.locator('input[name="hard_days"]').fill('2');
    await page.locator('input[name="hard_hours"]').fill('3');
    await page.locator('input[name="hard_minutes"]').fill('4');
    await page.locator('input[name="uncertain_days"]').fill('5');
    await page.locator('input[name="easy_days"]').fill('8');
    await page.getByRole('button', { name: '設定を保存' }).click();
    await expect(page.getByText('設定を保存しました')).toBeVisible();
    await page.reload();
    await expect(page.locator('input[name="hard_days"]')).toHaveValue('2');
    await expect(page.locator('input[name="hard_hours"]')).toHaveValue('3');
    await expect(page.locator('input[name="hard_minutes"]')).toHaveValue('4');
    await expect(page.locator('input[name="uncertain_days"]')).toHaveValue('5');
    await expect(page.locator('input[name="easy_days"]')).toHaveValue('8');

    await page.goto(`/wordbooks/${wordbookId}?status=hard`);
    await expect(page.getByRole('tab', { name: '難しい' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByRole('link', { name: /aurora/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /nebula/ })).toHaveCount(0);

    await page.goto(`/wordbooks/${wordbookId}?q=${updatedWord.meaning}`);
    await expect(page.getByRole('link', { name: /aurora/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /nebula/ })).toHaveCount(0);

    await page.goto(`/wordbooks/${wordbookId}/words/${firstWordId}`);
    await page.getByRole('button', { name: '削除' }).click();
    await expect(
      page.getByRole('heading', { name: '単語を削除しますか？' }),
    ).toBeVisible();
    await page.getByRole('button', { name: '削除する' }).click();
    await page.waitForURL(`/wordbooks/${wordbookId}`);
    await expect(page.getByRole('link', { name: /aurora/ })).toHaveCount(0);

    await page.goto(`/wordbooks/${wordbookId}`);
    await page.getByRole('button', { name: '削除' }).click();
    await expect(
      page.getByRole('heading', { name: '単語帳を削除しますか？' }),
    ).toBeVisible();
    await page.getByRole('button', { name: '削除する' }).click();
    await page.waitForURL('/dashboard');
    await expect(page.getByRole('link', { name: updatedTitle })).toHaveCount(0);

    await page.getByRole('button', { name: 'ゲスト' }).click();
    await page.getByRole('menuitem', { name: 'ログアウト' }).click();
    await expect(
      page.getByRole('heading', { name: 'ログアウトしますか？' }),
    ).toBeVisible();
    const signOutRequest = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().includes('/dashboard'),
    );
    await page.getByRole('button', { name: 'ログアウト' }).click();
    await signOutRequest;
    await page.goto('/dashboard');
    await page.waitForURL('/auth');
  });
});
