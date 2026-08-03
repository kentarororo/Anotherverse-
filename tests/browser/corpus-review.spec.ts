import { expect, test } from '@playwright/test';

test('renders and persists the fixed 100-paragraph human review gate', async ({ page }) => {
  await page.goto('/?review=corpus');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem(
      'anotherverse.corpus-review.v1',
      JSON.stringify({
        'read-aloud-lumen-turn-1': { natural: true, coherent: true },
      }),
    );
  });
  await page.reload();

  await expect(
    page.getByRole('heading', { name: '100-paragraph read-aloud review' }),
  ).toBeVisible();
  await expect(page.locator('.review-entry')).toHaveCount(100);
  await expect(page.locator('.review-metrics dd').first()).toHaveText('0/100');
  await expect(page.getByLabel('Natural paragraph 1', { exact: true })).not.toBeChecked();
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).some((key) =>
        /^anotherverse\.corpus-review\.v2\.[0-9a-f]{8}$/.test(key),
      ),
    ),
  ).toBe(true);

  await page.getByLabel('Natural paragraph 1', { exact: true }).check();
  await page.getByLabel('Coherent paragraph 1', { exact: true }).check();
  await expect(page.locator('.review-metrics dd').nth(1)).toContainText('1/100');
  await expect(page.locator('.review-metrics dd').nth(2)).toContainText('1/100');

  await page.reload();
  await expect(page.getByLabel('Natural paragraph 1', { exact: true })).toBeChecked();
  await expect(page.getByLabel('Coherent paragraph 1', { exact: true })).toBeChecked();
  await expect(page.getByText('Two live source facts').first()).toBeVisible();
});
