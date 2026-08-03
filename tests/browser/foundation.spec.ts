import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1365, height: 768 } });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('offers explicit corrupted and incompatible-save recovery', async ({ page }) => {
  await page.evaluate(() =>
    localStorage.setItem('anotherverse.prototype.autosave', '{not-valid-json'),
  );
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('not valid JSON');
  await page.getByRole('button', { name: 'Reset autosave' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);

  await page.evaluate(() =>
    localStorage.setItem(
      'anotherverse.prototype.autosave',
      JSON.stringify({ schemaVersion: 6, savedAtCommandIndex: 0, state: {} }),
    ),
  );
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Save schema 6 is not compatible');
  await page.getByRole('button', { name: 'Reset autosave' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('persists accessible title settings without adding them to campaign state', async ({
  page,
}) => {
  const settingsButton = page.getByRole('button', { name: 'Settings' });
  await settingsButton.focus();
  await settingsButton.click();
  const dialog = page.getByRole('dialog', { name: 'Settings' });
  await expect(dialog).toBeVisible();
  await page.getByLabel('125% text').check();
  await page.getByLabel('Reduce interface motion').check();
  await dialog.getByRole('button', { name: 'Done' }).click();
  await expect(settingsButton).toBeFocused();
  await expect(page.locator('html')).toHaveAttribute('data-text-scale', '125');
  await expect(page.locator('html')).toHaveAttribute('data-reduce-motion', 'true');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-text-scale', '125');
  await expect(page.locator('html')).toHaveAttribute('data-reduce-motion', 'true');
  expect(
    await page
      .getByRole('button', { name: 'New Campaign' })
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration)),
  ).toBeLessThan(0.001);
});

test('keeps the command hierarchy and sticky commit at mobile width with scaled text', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByText('Advanced').click();
  await page.getByLabel('Campaign seed').fill('mobile-accessibility-seed');
  await page.getByRole('button', { name: 'New Campaign' }).click();
  await page.getByRole('button', { name: 'Start Campaign' }).click();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '125%';
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('heading', { name: 'The Trio' })).toBeVisible();
  await expect(page.locator('.operation-content h2')).toBeVisible();
  const commit = page.getByRole('button', { name: 'Commit Plan' });
  await commit.scrollIntoViewIfNeeded();
  await expect(commit).toBeVisible();
  expect(await commit.evaluate((element) => getComputedStyle(element).position)).toBe('sticky');
  expect(
    await commit.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).transitionDuration),
    ),
  ).toBeLessThan(0.001);
});

test('completes a planned battle, reviews aftermath, and resumes the next turn', async ({
  page,
}) => {
  await expect(page.getByRole('heading', { name: 'ANOTHERVERSE' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();

  await page.getByText('Advanced').click();
  await page.getByLabel('Campaign seed').fill('browser-smoke-seed');
  await page.getByRole('button', { name: 'New Campaign' }).click();

  await expect(page.getByText('Campaign draft')).toBeVisible();
  await expect(page.locator('.dossier')).toHaveCount(3);
  const heroNames = await page.locator('.dossier h2').allTextContents();
  const [vanguardName, strikerName] = heroNames;
  expect(vanguardName).toBeTruthy();
  expect(strikerName).toBeTruthy();
  await page.getByRole('button', { name: 'Start Campaign' }).click();

  await expect(page.getByRole('heading', { name: 'The Trio' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Glassline Breach' })).toBeVisible();
  await expect(page.getByLabel('Why this situation is happening')).toBeVisible();
  await expect(page.getByLabel('Why this situation is happening').locator('span')).toHaveCount(2);
  await expect(page.getByLabel(`${strikerName} position`)).toHaveValue('centre');
  await page.getByLabel(`${strikerName} position`).selectOption('front');
  await expect(page.getByLabel(`${vanguardName} position`)).toHaveValue('centre');
  await page.getByLabel(`${strikerName} stance`).selectOption('guarded');
  await page.getByLabel('Team priority').selectOption('focus-weakest');
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight <= globalThis.innerHeight),
  ).toBe(true);

  await page.getByRole('button', { name: 'Commit Plan' }).click();
  await expect(page.getByRole('heading', { name: /Victory|Defeat|Round Cap/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue to Turn 2' })).toBeVisible();
  await expect(page.getByText('1 campaign fact recorded')).toBeVisible();
  await expect(page.locator('.event-feed summary').first()).toBeVisible();
  const savedTotals = await page.evaluate(() => {
    const envelope = JSON.parse(localStorage.getItem('anotherverse.prototype.autosave')!);
    const state = envelope.state;
    const firstAttack = state.battleReports[0].events.find(
      (event: { eventType: string }) => event.eventType === 'attack',
    ) as { rawAmount: number; mitigatedAmount: number; finalAmount: number };
    return {
      heroes: state.generatedDefinitions.characters.map((hero: { id: string; name: string }) => ({
        name: hero.name,
        hp: state.aftermathReports.at(-1).hpByCharacter[hero.id],
        xp: state.aftermathReports.at(-1).experienceByCharacter[hero.id],
      })),
      firstAttack,
    };
  });
  for (const hero of savedTotals.heroes) {
    const row = page.locator('.aftermath-list > div').filter({ hasText: hero.name });
    await expect(row).toContainText(`${hero.hp} HP`);
    await expect(row).toContainText(`+${hero.xp} XP`);
  }
  const firstMechanics = page
    .locator('.event-feed details')
    .filter({ hasText: `Raw ${savedTotals.firstAttack.rawAmount}` })
    .first();
  await firstMechanics.locator('summary').click();
  await expect(firstMechanics.locator('.mechanics-line')).toContainText(
    `Raw ${savedTotals.firstAttack.rawAmount}`,
  );
  await expect(firstMechanics.locator('.mechanics-line')).toContainText(
    `Mitigated ${savedTotals.firstAttack.mitigatedAmount}`,
  );
  await expect(firstMechanics.locator('.mechanics-line')).toContainText(
    `Final ${savedTotals.firstAttack.finalAmount}`,
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight <= globalThis.innerHeight),
  ).toBe(true);

  const inventoryButton = page.getByRole('button', { name: 'Inventory' });
  await inventoryButton.focus();
  await inventoryButton.click();
  await expect(page.getByRole('dialog', { name: 'equipment details' })).toBeVisible();
  await expect(
    page.getByRole('dialog', { name: 'equipment details' }).getByRole('heading', {
      name: /Houndglass Edge|Weaver Ward/,
    }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: /Equip ·/ })
    .first()
    .click();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(inventoryButton).toBeFocused();

  const logsButton = page.getByRole('button', { name: 'Logs' });
  await logsButton.focus();
  await logsButton.click();
  await expect(page.getByRole('heading', { name: 'Archived turn reports' })).toBeVisible();
  await expect(page.getByText(/Turn 1 · Battle/)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(logsButton).toBeFocused();

  await page.getByRole('button', { name: 'Continue to Turn 2' }).click();
  await expect(page.getByText('Personal', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Commit Plan' })).toBeDisabled();
  await page.getByRole('radio').first().click();
  await page.getByRole('button', { name: 'Commit Plan' }).click();
  await expect(page.getByRole('heading', { name: 'Resolved' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to Turn 3' }).click();

  await page.reload();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'The Trio' })).toBeVisible();
  await expect(page.getByText('Turn').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Commit Plan' })).toBeDisabled();

  await page.getByRole('button', { name: 'Save / Menu' }).click();
  let confirmation = '';
  page.once('dialog', async (dialog) => {
    confirmation = dialog.message();
    await dialog.dismiss();
  });
  await page.getByRole('button', { name: 'New Campaign' }).click();
  expect(confirmation).toContain('replace');
  await expect(page.getByRole('heading', { name: 'ANOTHERVERSE' })).toBeVisible();
});
