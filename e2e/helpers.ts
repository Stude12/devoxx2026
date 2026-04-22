import { Page } from '@playwright/test';

export async function waitForPhaser(page: Page) {
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForFunction(() => {
        const canvas = document.querySelector('canvas');
        return canvas && canvas.width > 0;
    }, { timeout: 15000 });
}

export async function waitForScene(page: Page, sceneKey: string, timeout = 15000) {
    await page.waitForFunction(
        (key) => {
            const game = (window as any).__PHASER_GAME__;
            if (!game) return false;
            const scenes = game.scene.getScenes(true);
            return scenes.some((s: any) => s.scene.key === key);
        },
        sceneKey,
        { timeout }
    );
}

export async function getCurrentScene(page: Page): Promise<string | null> {
    return page.evaluate(() => {
        const game = (window as any).__PHASER_GAME__;
        if (!game) return null;
        const scenes = game.scene.getScenes(true);
        return scenes.length > 0 ? scenes[0].scene.key : null;
    });
}

export async function getGameState(page: Page) {
    return page.evaluate(() => {
        const game = (window as any).__PHASER_GAME__;
        if (!game) return null;
        const gameScene = game.scene.getScene('Game');
        if (!gameScene) return null;
        return {
            score: gameScene.score ?? null,
            lives: gameScene.lives ?? null,
            combo: gameScene.combo ?? null,
            maxCombo: gameScene.maxCombo ?? null,
            gameActive: gameScene.gameActive ?? null,
        };
    });
}

export async function clickCanvasCenter(page: Page) {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    // PLAY button is at (512, 350) in a 1024x768 canvas
    const scaleX = box.width / 1024;
    const scaleY = box.height / 768;
    await page.mouse.click(box.x + 512 * scaleX, box.y + 350 * scaleY);
}

export async function clickAt(page: Page, gameX: number, gameY: number) {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    const scaleX = box.width / 1024;
    const scaleY = box.height / 768;
    await page.mouse.click(box.x + gameX * scaleX, box.y + gameY * scaleY);
}

export async function performSlash(page: Page, startX: number, startY: number, endX: number, endY: number) {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    const scaleX = box.width / 1024;
    const scaleY = box.height / 768;

    const sx = box.x + startX * scaleX;
    const sy = box.y + startY * scaleY;
    const ex = box.x + endX * scaleX;
    const ey = box.y + endY * scaleY;

    await page.mouse.move(sx, sy);
    await page.mouse.down();
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
        const x = sx + (ex - sx) * (i / steps);
        const y = sy + (ey - sy) * (i / steps);
        await page.mouse.move(x, y);
        await new Promise((r) => setTimeout(r, 20));
    }
    await page.mouse.up();
}

export async function navigateToGame(page: Page) {
    await page.goto('/');
    await waitForPhaser(page);
    await waitForScene(page, 'MainMenu');
    // Wait for PLAY button to animate in
    await page.waitForTimeout(1000);
    await clickCanvasCenter(page);
    await waitForScene(page, 'Game');
}
