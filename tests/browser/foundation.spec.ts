import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

test.use({ viewport: { width: 1365, height: 768 } });

async function revealBattleResult(page: Page) {
  const skip = page.getByRole('button', { name: 'Skip to result' });
  if ((await skip.count()) > 0 && (await skip.isVisible())) await skip.click();
}

async function recruitOpeningTrio(page: Page) {
  for (const nextTurn of [2, 3]) {
    const choices = page.getByRole('radio');
    if ((await choices.count()) > 0) await choices.first().click();
    await page.getByRole('button', { name: 'Take Action' }).click();
    await revealBattleResult(page);
    await expect(page.getByRole('heading', { name: 'Aftermath' })).toBeVisible();
    await page.getByRole('button', { name: `Continue to Turn ${nextTurn}` }).click();
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('renders authored campaign and character stories with exact rules kept visible', async ({
  page,
}) => {
  await page.getByText('Advanced').click();
  await page.getByLabel('Campaign seed').fill('authored-world-browser-seed');
  await page.getByRole('button', { name: 'New Campaign' }).click();

  await page.getByText('Campaign details').click();
  await expect(page.locator('.campaign-details')).toContainText(
    'Seed: authored-world-browser-seed',
  );
  await expect(page.locator('.dossier-story')).toHaveCount(3);
  await expect(page.locator('.dossier-techniques')).toHaveCount(3);
  await expect(page.locator('.technique-mechanics')).toHaveCount(6);
  await expect(page.locator('.technique-mechanics').first()).toContainText('Cost');
  await expect(page.locator('.technique-mechanics').first()).toContainText(/cooldown/i);

  await page.locator('.hero-choice-button').first().click();
  await page.getByRole('button', { name: /Begin with/ }).click();
  await page
    .getByRole('button', { name: /Details · Level/ })
    .first()
    .click();
  const drawer = page.getByRole('dialog', { name: 'character details' });
  await expect(drawer.getByRole('heading', { name: 'Class features' })).toBeVisible();
  await expect(drawer.getByText('Wants', { exact: true })).toBeVisible();
  await expect(drawer.getByText('Fatal flaw', { exact: true })).toBeVisible();
  await expect(drawer.locator('.technique-mechanics').first()).toContainText('Cost');
  await expect(drawer.locator('.technique-mechanics').first()).toContainText('Cooldown');
  const development = drawer.locator('.development-unlock');
  await expect(development).toHaveCount(1);
  await expect(development).toContainText('Progress toward:');
  await expect(development).not.toContainText('Cost');
  await expect(development).not.toContainText('Cooldown');
  await expect(development).not.toContainText('undefined');
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
      JSON.stringify({ schemaVersion: 7, savedAtCommandIndex: 0, state: {} }),
    ),
  );
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Save schema 7 cannot be safely migrated');
  await page.getByRole('button', { name: 'Reset autosave' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('explains when a same-schema autosave belongs to different content', async ({ page }) => {
  await page.getByText('Advanced').click();
  await page.getByLabel('Campaign seed').fill('stale-content-browser-seed');
  await page.getByRole('button', { name: 'New Campaign' }).click();
  await page.locator('.hero-choice-button').first().click();
  await page.getByRole('button', { name: /Begin with/ }).click();
  await recruitOpeningTrio(page);
  await page.evaluate(() => {
    const key = 'anotherverse.prototype.autosave';
    const envelope = JSON.parse(localStorage.getItem(key)!);
    envelope.state.contentManifestHash = 'fnv1a-stale-content';
    localStorage.setItem(key, JSON.stringify(envelope));
  });
  await page.reload();

  await expect(page.getByRole('alert')).toContainText('different story or gameplay content');
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

test('keeps the command hierarchy and sticky action at mobile width with scaled text', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByText('Advanced').click();
  await page.getByLabel('Campaign seed').fill('mobile-accessibility-seed');
  await page.getByRole('button', { name: 'New Campaign' }).click();
  await page.locator('.hero-choice-button').first().click();
  await page.getByRole('button', { name: /Begin with/ }).click();
  await recruitOpeningTrio(page);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '125%';
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('heading', { name: 'Your Heroes' })).toBeVisible();
  await expect(page.locator('.operation-content h2')).toBeVisible();
  await expect(page.getByLabel('Planned battle formation')).toBeVisible();
  await expect(page.locator('.planning-battle-stage [data-art-slot^="unit:"]')).toHaveCount(5);
  const commit = page.getByRole('button', { name: 'Take Action' });
  await commit.scrollIntoViewIfNeeded();
  await expect(commit).toBeVisible();
  expect(await commit.evaluate((element) => getComputedStyle(element).position)).toBe('sticky');
  expect(
    await commit.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).transitionDuration),
    ),
  ).toBeLessThan(0.001);
  await commit.click();
  const stage = page.getByLabel('Battle playback', { exact: true });
  await expect(stage).toBeFocused();
  expect(
    await stage.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.top >= 0 && bounds.bottom <= globalThis.innerHeight;
    }),
  ).toBe(true);
  expect(
    await stage.evaluate((element) => {
      const stageBounds = element.getBoundingClientRect();
      return [...element.querySelectorAll('.combat-unit')].every((unit) => {
        const unitBounds = unit.getBoundingClientRect();
        return (
          unitBounds.left >= stageBounds.left &&
          unitBounds.right <= stageBounds.right &&
          unitBounds.top >= stageBounds.top &&
          unitBounds.bottom <= stageBounds.bottom
        );
      });
    }),
  ).toBe(true);
  await expect(page.locator('.battle-result')).toHaveCount(0);
  const nextHighlight = page.getByRole('button', { name: 'Next action' });
  await expect(nextHighlight).toBeVisible();
  await nextHighlight.click();
  await expect(page.locator('.battle-beat .round-label')).toBeVisible();
  await page.getByRole('button', { name: 'Skip to result' }).click();
  await expect(page.locator('.battle-result')).toBeVisible();
});

test('waits to consume mobile highlights until the battlefield is visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByText('Advanced').click();
  await page.getByLabel('Campaign seed').fill('mobile-visibility-gate-seed');
  await page.getByRole('button', { name: 'New Campaign' }).click();
  await page.locator('.hero-choice-button').first().click();
  await page.getByRole('button', { name: /Begin with/ }).click();
  await recruitOpeningTrio(page);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '125%';
    const scope = globalThis as typeof globalThis & {
      triggerBattleVisibility?: () => void;
    };
    class ControlledIntersectionObserver {
      readonly root = null;
      readonly rootMargin = '0px';
      readonly thresholds = [0.6];

      constructor(callback: IntersectionObserverCallback) {
        scope.triggerBattleVisibility = () =>
          callback(
            [{ isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          );
      }

      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    globalThis.IntersectionObserver =
      ControlledIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  const action = page.getByRole('button', { name: 'Take Action' });
  await action.scrollIntoViewIfNeeded();
  await action.click();
  const stage = page.getByLabel('Battle playback', { exact: true });
  await expect(stage).toHaveAttribute('data-playback-state', 'waiting');
  await expect(stage.locator('.playback-count')).toContainText('Ready');
  const initialHighlight = await stage.getAttribute('data-highlight-index');
  await page.waitForTimeout(750);
  await expect(stage).toHaveAttribute('data-playback-state', 'waiting');
  await expect(stage).toHaveAttribute('data-highlight-index', initialHighlight ?? '0');

  await page.evaluate(() => {
    const scope = globalThis as typeof globalThis & {
      triggerBattleVisibility?: () => void;
    };
    scope.triggerBattleVisibility?.();
  });
  await expect(stage).toHaveAttribute('data-playback-state', 'playing');
});

test('completes a planned battle, reviews aftermath, and resumes the next turn', async ({
  page,
}) => {
  await expect(page.getByRole('heading', { name: 'ANOTHERVERSE' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();

  await page.getByText('Advanced').click();
  await page.getByLabel('Campaign seed').fill('browser-smoke-seed');
  await page.getByRole('button', { name: 'New Campaign' }).click();

  await expect(page.getByText('A new legend')).toBeVisible();
  await expect(page.locator('.dossier')).toHaveCount(3);
  const heroNames = await page.locator('.dossier h2').allTextContents();
  expect(heroNames[0]).toBeTruthy();
  await page.locator('.hero-choice-button').first().click();
  await page.getByRole('button', { name: /Begin with/ }).click();
  await recruitOpeningTrio(page);
  const { vanguardName, strikerName } = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('anotherverse.prototype.autosave')!).state;
    return {
      vanguardName: state.generatedDefinitions.characters.find(
        (hero: { role: string }) => hero.role === 'vanguard',
      ).name as string,
      strikerName: state.generatedDefinitions.characters.find(
        (hero: { role: string }) => hero.role === 'striker',
      ).name as string,
    };
  });

  await expect(page.getByRole('heading', { name: 'Your Heroes' })).toBeVisible();
  const authoredOperationTitle = page.locator('.operation-content h2');
  await expect(authoredOperationTitle).toBeVisible();
  await expect(authoredOperationTitle).not.toHaveText('');
  await expect(page.getByLabel('Story situation')).toBeVisible();
  await expect(page.getByLabel('Story situation').locator('dt')).toHaveCount(3);
  await expect(page.getByLabel('Planned battle formation')).toBeVisible();
  await expect(page.locator('.planning-battle-stage [data-art-slot^="unit:"]')).toHaveCount(5);
  await expect(page.getByLabel(`${strikerName} position`)).toHaveValue('centre');
  await page.getByLabel(`${strikerName} position`).selectOption('front');
  await expect(page.getByLabel(`${vanguardName} position`)).toHaveValue('centre');
  await page.getByLabel(`${strikerName} stance`).selectOption('guarded');
  await page.getByLabel('Team priority').selectOption('focus-weakest');
  await expect(page.getByLabel('Planned battle formation')).toContainText('Focus Weakest');
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight <= globalThis.innerHeight),
  ).toBe(true);

  await page.getByRole('button', { name: 'Take Action' }).click();
  await expect(page.getByRole('heading', { name: 'Battle in progress' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Battle in progress' })).toBeDisabled();
  await expect(page.getByLabel('Battle playback', { exact: true })).toBeVisible();
  await expect(page.locator('.combat-unit')).toHaveCount(5);
  await expect(page.locator('.battle-playback-stage [data-art-slot^="unit:"]')).toHaveCount(5);
  await expect(page.locator('.battle-playback-stage [data-art-slot^="vfx:"]')).toHaveCount(1);
  await expect(page.locator('.combat-unit.is-actor')).toHaveCount(1);
  await expect(page.locator('.combat-unit.is-target')).toHaveCount(1);
  await expect(page.locator('.battle-result')).toHaveCount(0);
  await revealBattleResult(page);
  await expect(page.getByRole('heading', { name: /Victory|Defeat|Round Cap/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue to Turn 4' })).toBeVisible();
  await expect(page.getByText('Chapter 3 complete')).toBeVisible();
  await expect(page.locator('.battle-result')).toBeVisible();
  const exactLog = page.locator('.exact-battle-log');
  await expect(exactLog.getByText('Battle details')).toBeVisible();
  await exactLog.locator(':scope > summary').click();
  await expect(exactLog.locator('.exact-event').first()).toBeVisible();
  const savedTotals = await page.evaluate(() => {
    const envelope = JSON.parse(localStorage.getItem('anotherverse.prototype.autosave')!);
    const state = envelope.state;
    const report = state.battleReports.at(-1);
    const firstAttack = report.events.find(
      (event: { eventType: string }) => event.eventType === 'attack',
    ) as { rawAmount: number; mitigatedAmount: number; finalAmount: number };
    return {
      heroes: state.generatedDefinitions.characters.map((hero: { id: string; name: string }) => ({
        name: hero.name,
        hp: state.aftermathReports.at(-1).hpByCharacter[hero.id],
        xp: state.aftermathReports.at(-1).experienceByCharacter[hero.id],
      })),
      firstAttack,
      combatants: Object.entries(report.hpAtEnd).map(([id, hp]) => ({
        name: report.combatantNames[id],
        hp,
        maxHp: Math.max(
          report.hpAtStart[id],
          report.hpAtEnd[id],
          16 + state.generatedDefinitions.combatants[id].stats.vitality * 2,
        ),
      })),
    };
  });
  for (const hero of savedTotals.heroes) {
    const row = page.locator('.aftermath-hero-row').filter({ hasText: hero.name });
    await expect(row).toContainText(`${hero.hp} HP`);
    await expect(row).toContainText(`+${hero.xp} XP`);
  }
  for (const combatant of savedTotals.combatants) {
    await expect(page.locator('.combat-unit').filter({ hasText: combatant.name })).toContainText(
      `${combatant.hp}/${combatant.maxHp}`,
    );
  }
  const firstMechanics = page
    .locator('.exact-event')
    .filter({ hasText: `Raw ${savedTotals.firstAttack.rawAmount}` })
    .first();
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
  const latestEquipmentName = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('anotherverse.prototype.autosave')!).state;
    const latestItemId = state.aftermathReports.at(-1).itemIdsGranted[0];
    return latestItemId === undefined ? null : state.generatedDefinitions.items[latestItemId].name;
  });
  await inventoryButton.focus();
  await inventoryButton.click();
  await expect(page.getByRole('dialog', { name: 'equipment details' })).toBeVisible();
  const recovered = page
    .getByRole('dialog', { name: 'equipment details' })
    .locator('.inventory-item');
  if ((await recovered.count()) > 0) {
    const latestEquipment =
      latestEquipmentName === null
        ? recovered.first()
        : recovered.filter({ hasText: latestEquipmentName });
    await expect(latestEquipment).toHaveCount(1);
    await latestEquipment.getByRole('button').first().click();
  } else {
    await expect(page.getByText('No equipment recovered yet.')).toBeVisible();
  }
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(inventoryButton).toBeFocused();

  const logsButton = page.getByRole('button', { name: 'Logs' });
  await logsButton.focus();
  await logsButton.click();
  await expect(page.getByRole('heading', { name: 'Completed chapters' })).toBeVisible();
  await expect(page.getByText(/Turn 3 · Battle/)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(logsButton).toBeFocused();

  await page.getByRole('button', { name: 'Continue to Turn 4' }).click();

  await page.reload();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Your Heroes' })).toBeVisible();
  await expect(page.getByText('Chapter').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Take Action' })).toBeVisible();

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

test('shows weighty monster materials and forges a deterministic relic', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByText('Advanced').click();
  await page.getByLabel('Campaign seed').fill('balance-0');
  await page.getByRole('button', { name: 'New Campaign' }).click();
  await page.locator('.hero-choice-button').first().click();
  await page.getByRole('button', { name: /Begin with/ }).click();
  await recruitOpeningTrio(page);

  await expect(page.locator('.campaign-metrics')).toContainText('Rations');
  await expect(page.locator('.campaign-metrics')).toContainText('Coin');
  await expect(page.locator('.campaign-metrics')).toContainText('Dust');
  await expect(page.locator('.campaign-metrics')).toContainText('Monster parts');

  await page.getByRole('button', { name: 'Take Action' }).click();
  await revealBattleResult(page);
  await expect(page.getByText('Chapter 3 complete')).toBeVisible();
  await expect(page.getByText('Battle details')).toBeVisible();
  await expect(page.getByText('Monster material').first()).toBeVisible();

  await page.getByRole('button', { name: 'Forge' }).click();
  const forge = page.getByRole('dialog', { name: 'forge details' });
  const materialCountBefore = Number.parseInt(
    (await forge.locator('.forge-resources span').first().textContent()) ?? '0',
    10,
  );
  expect(materialCountBefore).toBeGreaterThanOrEqual(3);
  for (let index = 0; index < 3; index += 1) {
    await forge.locator('.material-card:not(:disabled)').first().click();
  }
  await expect(forge.getByLabel('Fusion preview')).toBeVisible();
  await forge.getByRole('button', { name: 'Forge relic · 10 Coin' }).click();
  await expect(forge.locator('.forge-result')).toBeVisible();
  await expect(forge.getByText(`${materialCountBefore - 3} materials`)).toBeVisible();
});
