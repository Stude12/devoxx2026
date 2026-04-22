import { test, expect } from '@playwright/test';
import { waitForPhaser, waitForScene, getCurrentScene, clickCanvasCenter } from './helpers';

test.describe('Main Menu', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForPhaser(page);
    });

    test('page loads with correct title', async ({ page }) => {
        await expect(page).toHaveTitle(/Speaker Slash/);
    });

    test('canvas renders with proper dimensions', async ({ page }) => {
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
        const box = await canvas.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.width).toBeGreaterThanOrEqual(800);
        expect(box!.height).toBeGreaterThanOrEqual(600);
    });

    test('Phaser game instance exists on window', async ({ page }) => {
        const hasGame = await page.evaluate(() => {
            return !!(window as any).__PHASER_GAME__;
        });
        expect(hasGame).toBe(true);
    });

    test('game starts in MainMenu scene', async ({ page }) => {
        await waitForScene(page, 'MainMenu');
        const scene = await getCurrentScene(page);
        expect(scene).toBe('MainMenu');
    });

    test('clicking PLAY transitions to Game scene', async ({ page }) => {
        await waitForScene(page, 'MainMenu');
        // Wait for animations to complete
        await page.waitForTimeout(1000);
        await clickCanvasCenter(page);
        await waitForScene(page, 'Game', 10000);
        const scene = await getCurrentScene(page);
        expect(scene).toBe('Game');
    });
});
