import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1365, height: 768 } });

test('plays a complete six-chapter campaign with recruitment, rewards, and resume', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByText('Advanced').click();
  await page.getByLabel('Campaign seed').fill('six-turn-browser-seed');
  await page.getByRole('button', { name: 'New Campaign' }).click();
  await page.locator('.hero-choice-button').first().click();
  await page.getByRole('button', { name: /Begin with/ }).click();

  const encounteredCategories = new Set<string>();

  for (let turn = 1; turn <= 6; turn += 1) {
    await expect(page.locator('.campaign-metrics dd').first()).toHaveText(String(turn));
    const category =
      (await page.locator('.operation-panel').getAttribute('data-scenario-category')) ?? '';
    encounteredCategories.add(category);
    await expect(page.getByLabel('Story situation')).toContainText('Current goal:');
    await expect(page.getByLabel('Story situation')).not.toContainText(/live campaign facts/i);

    if (category !== 'operation') await page.getByRole('radio').first().click();

    await page.getByRole('button', { name: 'Take Action' }).click();
    const skip = page.getByRole('button', { name: 'Skip to result' });
    if ((await skip.count()) > 0 && (await skip.isVisible())) await skip.click();
    await expect(page.getByText(`Chapter ${turn} complete`)).toBeVisible();

    if (turn === 2) await expect(page.locator('.hero-detail-button')).toHaveCount(2);
    if (turn === 3) await expect(page.locator('.hero-detail-button')).toHaveCount(3);

    if (turn === 3) {
      await page.reload();
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.locator('.campaign-metrics dd').first()).toHaveText('4');
      continue;
    }

    if (turn < 6) {
      await page.getByRole('button', { name: `Continue to Turn ${turn + 1}` }).click();
    }
  }

  expect(encounteredCategories.has('operation')).toBe(true);
  expect(encounteredCategories.size).toBeGreaterThan(1);
  await expect(page.getByRole('button', { name: 'Finish Campaign' })).toBeVisible();

  await page.getByRole('button', { name: 'Logs' }).click();
  await expect(page.locator('.drawer-item')).toHaveCount(6);
  await expect(page.getByText('Turn 6', { exact: false }).first()).toBeVisible();
});
