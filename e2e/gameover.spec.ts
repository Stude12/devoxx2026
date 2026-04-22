import { test, expect } from '@playwright/test';
import { waitForScene, getCurrentScene, navigateToGame, clickAt } from './helpers';

test.describe('Game Over', () => {
    test('game transitions to GameOver when lives reach 0', async ({ page }) => {
        test.setTimeout(120000);
        await navigateToGame(page);

        // Wait for game to become active
        await page.waitForFunction(() => {
            const game = (window as any).__PHASER_GAME__;
            return game?.scene?.getScene('Game')?.gameActive === true;
        }, { timeout: 10000 });

        // Wait for all lives to be lost — cards will fall and be missed
        await page.waitForFunction(() => {
            const game = (window as any).__PHASER_GAME__;
            const gameScene = game?.scene?.getScene('Game');
            return gameScene && gameScene.lives <= 0;
        }, { timeout: 90000 });

        // Wait for scene transition (500ms delay + 400ms tween)
        await waitForScene(page, 'GameOver', 15000);
        const scene = await getCurrentScene(page);
        expect(scene).toBe('GameOver');
    });

    test('RESTART returns to Game scene with reset state', async ({ page }) => {
        test.setTimeout(120000);
        await navigateToGame(page);

        // Wait for GameOver
        await page.waitForFunction(() => {
            const game = (window as any).__PHASER_GAME__;
            return game?.scene?.getScenes(true).some((s: any) => s.scene.key === 'GameOver');
        }, { timeout: 90000 });

        // Wait for RESTART button to animate in
        await page.waitForTimeout(1500);

        // RESTART button is at (380, 420) after tween
        await clickAt(page, 380, 420);
        await waitForScene(page, 'Game', 10000);

        const scene = await getCurrentScene(page);
        expect(scene).toBe('Game');

        // Verify state reset
        const state = await page.evaluate(() => {
            const game = (window as any).__PHASER_GAME__;
            const gs = game?.scene?.getScene('Game');
            return gs ? { score: gs.score, lives: gs.lives } : null;
        });
        expect(state).not.toBeNull();
        expect(state!.score).toBe(0);
        expect(state!.lives).toBe(3);
    });

    test('MENU returns to MainMenu scene', async ({ page }) => {
        test.setTimeout(120000);
        await navigateToGame(page);

        // Wait for GameOver
        await page.waitForFunction(() => {
            const game = (window as any).__PHASER_GAME__;
            return game?.scene?.getScenes(true).some((s: any) => s.scene.key === 'GameOver');
        }, { timeout: 90000 });

        // Wait for MENU button to animate in
        await page.waitForTimeout(1500);

        // MENU button is at (640, 420) after tween
        await clickAt(page, 640, 420);
        await waitForScene(page, 'MainMenu', 10000);

        const scene = await getCurrentScene(page);
        expect(scene).toBe('MainMenu');
    });
});
