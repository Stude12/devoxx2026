import { test, expect } from '@playwright/test';
import { waitForPhaser, waitForScene, getGameState, navigateToGame, performSlash } from './helpers';

test.describe('Gameplay', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToGame(page);
    });

    test('game enters Game scene after clicking PLAY', async ({ page }) => {
        const scene = await page.evaluate(() => {
            const game = (window as any).__PHASER_GAME__;
            const scenes = game.scene.getScenes(true);
            return scenes[0]?.scene.key;
        });
        expect(scene).toBe('Game');
    });

    test('game state initializes correctly', async ({ page }) => {
        const state = await getGameState(page);
        expect(state).not.toBeNull();
        expect(state!.score).toBe(0);
        expect(state!.lives).toBe(3);
        expect(state!.combo).toBe(0);
    });

    test('gameActive becomes true after GET READY countdown', async ({ page }) => {
        // Initially gameActive is false during countdown
        const initialState = await getGameState(page);
        expect(initialState!.gameActive).toBe(false);

        // Wait for countdown to finish (~2.5s)
        await page.waitForFunction(() => {
            const game = (window as any).__PHASER_GAME__;
            const gameScene = game?.scene?.getScene('Game');
            return gameScene?.gameActive === true;
        }, { timeout: 10000 });

        const activeState = await getGameState(page);
        expect(activeState!.gameActive).toBe(true);
    });

    test('performing slash gesture does not crash the game', async ({ page }) => {
        // Wait for game to be active
        await page.waitForFunction(() => {
            const game = (window as any).__PHASER_GAME__;
            return game?.scene?.getScene('Game')?.gameActive === true;
        }, { timeout: 10000 });

        // Perform several slashes across the canvas
        await performSlash(page, 200, 400, 800, 400);
        await page.waitForTimeout(200);
        await performSlash(page, 100, 300, 900, 500);

        // Game should still be active and state valid
        const state = await getGameState(page);
        expect(state).not.toBeNull();
        expect(state!.lives).toBeGreaterThanOrEqual(0);
        expect(state!.lives).toBeLessThanOrEqual(3);
    });

    test('lives decrement when cards are missed', async ({ page }) => {
        // Wait for game to become active
        await page.waitForFunction(() => {
            const game = (window as any).__PHASER_GAME__;
            return game?.scene?.getScene('Game')?.gameActive === true;
        }, { timeout: 10000 });

        // Wait for cards to spawn and fall off screen (miss)
        await page.waitForFunction(() => {
            const game = (window as any).__PHASER_GAME__;
            const gameScene = game?.scene?.getScene('Game');
            return gameScene && gameScene.lives < 3;
        }, { timeout: 30000 });

        const state = await getGameState(page);
        expect(state!.lives).toBeLessThan(3);
    });
});
