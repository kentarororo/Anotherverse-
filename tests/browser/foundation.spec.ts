import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1365, height: 768 } });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('starts a seeded campaign and reaches the Command shell', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'ANOTHERVERSE' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();

  await page.getByText('Advanced').click();
  await page.getByLabel('Campaign seed').fill('browser-smoke-seed');
  await page.getByRole('button', { name: 'New Campaign' }).click();

  await expect(page.getByRole('heading', { name: 'The Trio' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No active operation' })).toBeVisible();
  await expect(page.getByText('browser-smoke-seed')).toBeVisible();
  await expect(page.getByRole('button', { name: /Commit unavailable/ })).toBeDisabled();
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight <= globalThis.innerHeight),
  ).toBe(true);

  await page.reload();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'The Trio' })).toBeVisible();
});
