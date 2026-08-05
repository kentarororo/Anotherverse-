import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1365, height: 768 } });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('chooses a lead, recruits two companions, then explains the first trio battle', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByText('Advanced').click();
  await page.getByLabel('Campaign seed').fill('visible-causal-loop');
  await page.getByRole('button', { name: 'New Campaign' }).click();

  await expect(page.getByText('A new legend')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Choose your first hero' })).toBeVisible();
  await expect(page.locator('.dossier')).toHaveCount(3);
  await expect(page.locator('.dossier-heading > div > span')).toHaveCount(3);
  await expect(page.locator('.dossier-heading > div > span').first()).not.toHaveText(
    'Awakened hunter',
  );
  await expect(page.locator('.creation-screen')).toContainText('Mythic Awakening');
  await expect(page.locator('.creation-screen')).not.toContainText(
    /telemetry|licen[cs]e|bureau|network|contract squad|Mythic Path|Calling/i,
  );
  await page
    .getByRole('button', { name: /Begin as/ })
    .first()
    .click();
  await page.getByRole('button', { name: 'Begin Chapter One' }).click();

  await expect(page.getByRole('heading', { name: 'Your Heroes' })).toBeVisible();
  await expect(page.locator('.trio-panel .badge')).toHaveText('1 / 3');
  await expect(page.getByLabel('Story situation')).toContainText('A Star Falls');
  await expect(page.getByLabel('Story situation')).toContainText(/alone on Starfall Road/);
  await expect(page.getByLabel('Story situation')).toContainText('Choose');
  await page.getByRole('button', { name: 'Take Action' }).click();

  await expect(page.getByText('Companion joined')).toHaveCount(0);
  await expect(page.locator('.trio-panel .badge')).toHaveText('1 / 3');
  await expect(page.getByText('Chapter 1 complete')).toBeVisible();
  await page.getByRole('button', { name: 'Continue to Turn 2' }).click();

  await expect(page.locator('.trio-panel .badge')).toHaveText('1 / 3');
  await expect(page.getByLabel('Story situation')).toContainText('Previously');
  await expect(page.getByLabel('Story situation')).toContainText('Mythic Awakening');
  await expect(page.getByLabel('Story situation')).toContainText('Choose');
  await page.getByRole('radio').first().click();
  await page.getByRole('button', { name: 'Take Action' }).click();

  await expect(page.getByText('Companion joined')).toBeVisible();
  await expect(page.locator('.trio-panel .badge')).toHaveText('2 / 3');
  await expect(page.getByText('Chapter 2 complete')).toBeVisible();
  await page.getByRole('button', { name: 'Continue to Turn 3' }).click();

  await expect(page.locator('.trio-panel .badge')).toHaveText('3 / 3');
  await expect(page.getByLabel('Story situation')).toContainText('three hunters');
  await expect(page.locator('.command-screen')).not.toContainText(/â|Â|Ã|ð/);
  await expect(page.getByText('Order', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Expected opening actions').locator('p')).toHaveCount(3);
  const breakThreatActions = await page
    .getByLabel('Expected opening actions')
    .locator('strong')
    .allTextContents();

  await page.getByLabel('Team priority').selectOption('conserve-power');
  await expect(page.getByText(/Keep 1 AP in reserve/)).toBeVisible();
  await expect(page.getByLabel('Expected opening actions').locator('small')).toHaveCount(3);
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
  await expect(page.getByText('Chapter 3 complete')).toBeVisible();
  await page.screenshot({ path: 'test-results/playwrite-aftermath.png', fullPage: true });

  await page.getByRole('button', { name: 'Continue to Turn 4' }).click();
  await expect(page.getByLabel('Story situation')).toContainText('Previously');
  await expect(page.getByLabel('Story situation')).toContainText(
    /The three hunters|The guardians drove|The drowned broke|The crater shifted|The returning tide/i,
  );
});
