import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1365, height: 768 } });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('makes the mythic brief, plan, battle cause, and memory legible as one loop', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByText('Advanced').click();
  await page.getByLabel('Campaign seed').fill('visible-causal-loop');
  await page.getByRole('button', { name: 'New Campaign' }).click();

  await expect(page.getByText('A new legend')).toBeVisible();
  await expect(page.locator('.dossier')).toHaveCount(3);
  await expect(page.locator('.creation-screen')).not.toContainText(
    /telemetry|licen[cs]e|bureau|network|contract squad/i,
  );
  await page.getByRole('button', { name: 'Start Campaign' }).click();

  await expect(page.getByRole('heading', { name: 'The Mythic Trio' })).toBeVisible();
  await expect(page.getByText('Exact priority rule')).toBeVisible();
  await expect(page.getByLabel('Expected opening actions').locator('p')).toHaveCount(3);
  const breakThreatActions = await page
    .getByLabel('Expected opening actions')
    .locator('strong')
    .allTextContents();

  await page.getByLabel('Team priority').selectOption('conserve-power');
  await expect(page.getByText(/Heroes reserve AP and use basic attacks/)).toBeVisible();
  await expect(page.getByLabel('Expected opening actions').locator('small')).toHaveText([
    /builds 1 AP/,
    /builds 1 AP/,
    /builds 1 AP/,
  ]);
  const conserveActions = await page
    .getByLabel('Expected opening actions')
    .locator('strong')
    .allTextContents();
  expect(conserveActions).not.toEqual(breakThreatActions);

  await page.getByLabel('Team priority').selectOption('protect-rear');
  await expect(page.getByText(/Rear-line hits lose up to 2 damage/)).toBeVisible();
  await page.screenshot({ path: 'test-results/playwrite-plan.png', fullPage: true });
  await page.getByRole('button', { name: 'Take Action' }).click();

  const causalReview = page.getByLabel('Why the battle ended this way');
  await expect(causalReview).toBeVisible();
  await expect(causalReview.locator('article')).toHaveCount(3);
  await expect(causalReview).toContainText('Enemy pressure');
  await expect(causalReview).toContainText('Your plan');
  await expect(causalReview).toContainText('Turning point');
  await expect(page.getByText('1 campaign fact recorded')).toBeVisible();
  await page.screenshot({ path: 'test-results/playwrite-aftermath.png', fullPage: true });

  await page.getByRole('button', { name: 'Continue to Turn 2' }).click();
  await expect(page.getByLabel('Story situation')).toContainText('Why now');
  await expect(page.getByLabel('Story situation')).toContainText('What is at stake');
  await expect(page.getByLabel('Story situation')).toContainText('Your decision');
  await expect(page.getByLabel('Story situation')).toContainText(
    /Soul Ledger remembers that the trio chose to Enter the trial/i,
  );
});
