import * as Phaser from 'phaser';

export class SlashFeedbackRenderer {
    scene: Phaser.Scene;
    graphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(50);
    }

    drawSlashLine(start: { x: number; y: number }, end: { x: number; y: number }) {
        this.graphics.clear();

        // Main slash line
        this.graphics.lineStyle(4, 0xFF6B6B, 1);
        this.graphics.beginPath();
        this.graphics.moveTo(start.x, start.y);
        this.graphics.lineTo(end.x, end.y);
        this.graphics.strokePath();

        // Glow effect (thicker, transparent)
        this.graphics.lineStyle(12, 0xFF6B6B, 0.3);
        this.graphics.beginPath();
        this.graphics.moveTo(start.x, start.y);
        this.graphics.lineTo(end.x, end.y);
        this.graphics.strokePath();

        // Animation: fade out
        this.scene.tweens.add({
            targets: this.graphics,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                this.graphics.clear();
                this.graphics.setAlpha(1);
            }
        });
    }

    drawTrail(points: Array<{ x: number; y: number }>) {
        this.graphics.clear();

        if (points.length < 2) return;

        // Draw fading trail
        for (let i = 0; i < points.length - 1; i++) {
            const alpha = (i / points.length) * 0.5;
            const size = 2 + (i / points.length) * 3;

            this.graphics.fillStyle(0xFF6B6B, alpha);
            this.graphics.fillCircle(points[i].x, points[i].y, size);
        }
    }

    showComboFeedback(x: number, y: number, comboCount: number) {
        const text = this.scene.add.text(x, y, `+${comboCount}!`, {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#FFD700',
            stroke: '#FF6B6B',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(100);

        this.scene.tweens.add({
            targets: text,
            y: y - 40,
            alpha: 0,
            duration: 600,
            ease: 'Quad.easeOut',
            onComplete: () => text.destroy()
        });
    }

    showPenaltyFeedback(x: number, y: number, message: string) {
        const text = this.scene.add.text(x, y, message, {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#FF0000',
            stroke: '#FFFFFF',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(100);

        this.scene.tweens.add({
            targets: text,
            y: y - 60,
            scale: 1.3,
            alpha: 0,
            duration: 800,
            ease: 'Quad.easeOut',
            onComplete: () => text.destroy()
        });
    }

    destroy() {
        this.graphics.destroy();
    }
}
