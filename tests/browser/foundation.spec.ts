import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1365, height: 768 } });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('completes a planned battle, reviews aftermath, and resumes the next turn', async ({
  page,
}) => {
  await expect(page.getByRole('heading', { name: 'ANOTHERVERSE' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();

  await page.getByText('Advanced').click();
  await page.getByLabel('Campaign seed').fill('browser-smoke-seed');
  await page.getByRole('button', { name: 'New Campaign' }).click();

  await expect(page.getByRole('heading', { name: 'The Trio' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Glassline Breach' })).toBeVisible();
  await expect(page.getByLabel('Dax Ren position')).toHaveValue('centre');
  await page.getByLabel('Dax Ren position').selectOption('front');
  await expect(page.getByLabel('Mira Vale position')).toHaveValue('centre');
  await page.getByLabel('Dax Ren stance').selectOption('guarded');
  await page.getByLabel('Team priority').selectOption('focus-weakest');
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight <= globalThis.innerHeight),
  ).toBe(true);

  await page.getByRole('button', { name: 'Commit Plan' }).click();
  await expect(page.getByRole('heading', { name: /Victory|Defeat|Round Cap/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue to Turn 2' })).toBeVisible();
  await expect(page.getByText('Glassline result recorded')).toBeVisible();
  await expect(page.locator('.event-feed summary').first()).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight <= globalThis.innerHeight),
  ).toBe(true);

  await page.getByRole('button', { name: 'Continue to Turn 2' }).click();
  await expect(page.getByRole('button', { name: 'Commit Plan' })).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'The Trio' })).toBeVisible();
  await expect(page.getByText('Turn').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Commit Plan' })).toBeVisible();
});
