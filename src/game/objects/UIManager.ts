import * as Phaser from 'phaser';

export class UIManager {
    scene: Phaser.Scene;
    scoreText: Phaser.GameObjects.Text;
    livesText: Phaser.GameObjects.Text;
    comboText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        // Score
        this.scoreText = scene.add.text(20, 20, 'Score: 0', {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff'
        }).setDepth(100);

        // Lives
        this.livesText = scene.add.text(1024 - 20, 20, 'Lives: 3', {
            fontFamily: 'Arial', fontSize: 24, color: '#FF6B6B',
            align: 'right'
        }).setOrigin(1, 0).setDepth(100);

        // Combo
        this.comboText = scene.add.text(512, 20, 'Combo: 0x', {
            fontFamily: 'Arial Black', fontSize: 20, color: '#FFE66D',
            align: 'center'
        }).setOrigin(0.5, 0).setDepth(100);
    }

    updateScore(score: number) {
        this.scoreText.setText(`Score: ${Math.floor(score)}`);
        
        // Pulse animation
        this.scene.tweens.add({
            targets: this.scoreText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 100,
            yoyo: true
        });
    }

    updateCombo(combo: number) {
        this.comboText.setText(`Combo: ${combo}x`);
        
        if (combo > 0) {
            const color = combo > 10 ? '#FFD700' : combo > 5 ? '#FF8B00' : '#FFE66D';
            this.comboText.setColor(color);
            
            // Pulse animation
            this.scene.tweens.add({
                targets: this.comboText,
                scale: 1.2,
                duration: 100,
                yoyo: true
            });
        }
    }

    updateLives(lives: number) {
        this.livesText.setText(`Lives: ${lives}`);
        
        // Color intensity based on lives
        const colors = ['#FF0000', '#FF6B6B', '#FF6B6B'];
        this.livesText.setColor(colors[Math.max(0, lives - 1)] || '#FF0000');
        
        if (lives <= 1) {
            // Warning pulse
            this.scene.tweens.add({
                targets: this.livesText,
                scale: 1.15,
                duration: 200,
                yoyo: true,
                repeat: 1
            });
        }
    }

    showMissAlert() {
        const alert = this.scene.add.text(512, 400, 'MISSED!', {
            fontFamily: 'Arial Black',
            fontSize: 40,
            color: '#FF0000',
            stroke: '#FFFFFF',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(100);

        this.scene.tweens.add({
            targets: alert,
            scale: 0.5,
            alpha: 0,
            duration: 500,
            ease: 'Quad.easeOut',
            onComplete: () => alert.destroy()
        });
    }

    destroy() {
        this.scoreText.destroy();
        this.livesText.destroy();
        this.comboText.destroy();
    }
}
