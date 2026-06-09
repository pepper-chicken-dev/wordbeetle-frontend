import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export async function signInAsGuest(page: Page): Promise<void> {
  await page.goto('/auth');
  await page.getByRole('button', { name: 'ゲストとして始める' }).click();
  await page.waitForURL('/dashboard');
  await expect(page.getByRole('heading', { name: '単語帳' })).toBeVisible();
}
