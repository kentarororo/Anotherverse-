import { expect, test } from '@playwright/test';

test('compares and reviews coherent Mythic Narrative v2 drafts', async ({ page }) => {
  await page.goto('/?review=mythic-v2');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.getByRole('heading', { name: 'Mythic Narrative v2' })).toBeVisible();
  await expect(page.locator('.mythic-hero-card')).toHaveCount(3);
  await expect(page.locator('.mythic-technique-card')).toHaveCount(6);
  await expect(page.locator('.mythic-relic-card')).toHaveCount(3);
  await expect(page.locator('.mythic-chapter-card')).toHaveCount(3);
  await expect(page.getByText('Protected seams, not word soup')).toBeVisible();

  const firstFingerprint = await page.locator('.mythic-review-footer code').textContent();
  await page.getByRole('button', { name: 'Review seed underworld-oath' }).click();
  await expect(page.getByText('Generated world · underworld-oath')).toBeVisible();
  await expect(page.locator('.mythic-review-footer code')).not.toHaveText(firstFingerprint!);

  await page.getByLabel('World hook and laws make sense').check();
  await page.getByLabel('Skills are vivid and mechanically clear').check();
  await expect(page.getByLabel('Review progress')).toContainText('2/4');

  await page.reload();
  await expect(page.getByLabel('World hook and laws make sense')).toBeChecked();
  await expect(page.getByLabel('Skills are vivid and mechanically clear')).toBeChecked();
  await expect(page.getByLabel('Characters feel specific and human')).not.toBeChecked();
});
