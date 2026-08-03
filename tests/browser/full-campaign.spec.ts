import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1365, height: 768 } });

test('plays twenty consecutive turns with progression, equipment, and a mid-run resume', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByText('Advanced').click();
  await page.getByLabel('Campaign seed').fill('twenty-turn-browser-seed');
  await page.getByRole('button', { name: 'New Campaign' }).click();
  await page.getByRole('button', { name: 'Start Campaign' }).click();

  const encounteredCategories = new Set<string>();

  for (let turn = 1; turn <= 20; turn += 1) {
    await expect(page.locator('.campaign-metrics dd').first()).toHaveText(String(turn));
    const phaseLabel = (await page.locator('.operation-content .eyebrow').textContent()) ?? '';
    const category = phaseLabel.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
    encounteredCategories.add(category);
    const causalRecord = page.getByLabel('Why this situation is happening');
    await expect(causalRecord.locator('span')).toHaveCount(2);
    if (turn > 1) await expect(causalRecord).toContainText(/Turn [1-9][0-9]?:/);

    if (category !== 'operation') {
      await page.getByRole('radio').first().click();
    }

    await page.getByRole('button', { name: 'Commit Plan' }).click();
    await expect(page.getByRole('heading', { name: 'Aftermath' })).toBeVisible();
    await expect(page.getByText('1 campaign fact recorded')).toBeVisible();

    if (turn === 1 || turn === 6) {
      await page.getByRole('button', { name: 'Inventory' }).click();
      const items = page.locator('.inventory-item');
      await expect(items).toHaveCount(turn === 1 ? 1 : 2);
      await items
        .nth(turn === 1 ? 0 : 1)
        .getByRole('button')
        .first()
        .click();
      await page.getByRole('button', { name: 'Close' }).click();
    }

    if (turn === 5) {
      const detailButtons = page.locator('.hero-detail-button');
      for (let heroIndex = 0; heroIndex < 3; heroIndex += 1) {
        await detailButtons.nth(heroIndex).click();
        const learn = page.getByRole('dialog').getByRole('button', { name: /Learn/ });
        await expect(learn).toBeEnabled();
        await learn.click();
        await page.getByRole('button', { name: 'Close' }).click();
      }
    }

    if (turn === 10) {
      await page.reload();
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.locator('.campaign-metrics dd').first()).toHaveText('11');
      continue;
    }

    if (turn < 20) {
      await page.getByRole('button', { name: `Continue to Turn ${turn + 1}` }).click();
    }
  }

  expect(encounteredCategories).toEqual(
    new Set(['operation', 'personal', 'discovery', 'rival', 'social']),
  );
  await expect(page.locator('.campaign-metrics dd').nth(1)).toContainText('Gold');

  await page.getByRole('button', { name: 'Logs' }).click();
  await expect(page.locator('.drawer-item')).toHaveCount(20);
  await expect(page.getByText('Turn 20', { exact: false }).first()).toBeVisible();
});
