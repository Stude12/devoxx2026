import * as Phaser from 'phaser';

export class MicrophoneCursor {
    scene: Phaser.Scene;
    pointer: Phaser.Input.Pointer;
    graphics: Phaser.GameObjects.Graphics;
    trailPoints: Array<{ x: number; y: number }> = [];
    maxTrailLength: number = 10;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.pointer = scene.input.activePointer;

        // Create graphics for the microphone
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(100);

        // Hide default cursor
        scene.input.setDefaultCursor('none');

        // Listen to pointer move
        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            this.pointer = pointer;
            this.updateCursor();
        });
    }

    private updateCursor() {
        this.graphics.clear();

        const x = this.pointer.x;
        const y = this.pointer.y;

        // Add to trail
        this.trailPoints.push({ x, y });
        if (this.trailPoints.length > this.maxTrailLength) {
            this.trailPoints.shift();
        }

        // Draw trail (fade effect)
        for (let i = 0; i < this.trailPoints.length; i++) {
            const point = this.trailPoints[i];
            const alpha = i / this.trailPoints.length;
            this.graphics.fillStyle(0xFF6B6B, alpha * 0.6);
            this.graphics.fillCircle(point.x, point.y, 3 - (3 * (1 - alpha)));
        }

        // Draw microphone cursor
        this.drawMicrophone(x, y);
    }

    private drawMicrophone(x: number, y: number) {
        // Microphone head (circle)
        this.graphics.fillStyle(0xFF6B6B, 1);
        this.graphics.fillCircle(x, y, 8);

        // Microphone grill (rectangle below)
        this.graphics.fillStyle(0xFF4444, 1);
        this.graphics.fillRect(x - 6, y + 8, 12, 10);

        // Microphone handle (line going down)
        this.graphics.lineStyle(3, 0x4ECDC4, 1);
        this.graphics.beginPath();
        this.graphics.moveTo(x, y + 18);
        this.graphics.lineTo(x, y + 25);
        this.graphics.strokePath();

        // Glow effect
        this.graphics.lineStyle(2, 0xFFFFFF, 0.5);
        this.graphics.strokeCircle(x, y, 10);
    }

    getPosition(): { x: number; y: number } {
        return { x: this.pointer.x, y: this.pointer.y };
    }

    destroy() {
        this.graphics.destroy();
        this.scene.input.setDefaultCursor('auto');
    }
}
