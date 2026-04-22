import { EventBus } from '../EventBus';
import { Scene, Cameras, GameObjects } from 'phaser';

export class GameOver extends Scene
{
    camera: Cameras.Scene2D.Camera;
    background: GameObjects.Image;

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0x1a1a2e);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.15);

        // Game Over Title with animation
        const gameOverTitle = this.add.text(512, 100, 'GAME OVER', {
            fontFamily: 'Arial Black', fontSize: 68, color: '#FF6B6B',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100)
         .setAlpha(0)
         .setScale(1.5);

        this.tweens.add({
            targets: gameOverTitle,
            alpha: 1,
            scale: 1,
            duration: 500,
            ease: 'Quad.easeOut'
        });

        // Get final score from Game scene
        const previousScene = this.scene.get('Game');
        const finalScore = (previousScene as any).score || 0;
        
        const scoreText = this.add.text(512, 220, `Final Score: ${Math.floor(finalScore)}`, {
            fontFamily: 'Arial Black', fontSize: 48, color: '#FFE66D',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setDepth(100)
         .setAlpha(0);

        this.tweens.add({
            targets: scoreText,
            alpha: 1,
            duration: 500,
            delay: 200,
            ease: 'Quad.easeOut'
        });

        // Stats
        const gameScene = this.scene.get('Game') as any;
        const comboReached = gameScene.maxCombo || 0;

        const statsText = this.add.text(512, 300, 
            `Max Combo: ${comboReached}x | Cards Slashed: ${Math.floor(finalScore / 100)}`, {
            fontFamily: 'Arial', fontSize: 18, color: '#4ECDC4',
            align: 'center'
        }).setOrigin(0.5).setDepth(100)
         .setAlpha(0);

        this.tweens.add({
            targets: statsText,
            alpha: 1,
            duration: 500,
            delay: 300,
            ease: 'Quad.easeOut'
        });

        // Buttons container for uniform animation
        const restartButton = this.add.text(380, 430, 'RESTART', {
            fontFamily: 'Arial Black', fontSize: 36, color: '#ffffff',
            backgroundColor: '#FF6B6B',
            padding: { x: 25, y: 12 },
            stroke: '#000000', strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5).setDepth(100)
         .setAlpha(0)
         .setInteractive()
         .on('pointerover', () => {
             restartButton.setScale(1.12);
             restartButton.setBackgroundColor('#FF5555');
         })
         .on('pointerout', () => {
             restartButton.setScale(1);
             restartButton.setBackgroundColor('#FF6B6B');
         })
         .on('pointerdown', () => {
             this.changeScene();
         });

        const menuButton = this.add.text(640, 430, 'MENU', {
            fontFamily: 'Arial Black', fontSize: 36, color: '#ffffff',
            backgroundColor: '#4ECDC4',
            padding: { x: 30, y: 12 },
            stroke: '#000000', strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5).setDepth(100)
         .setAlpha(0)
         .setInteractive()
         .on('pointerover', () => {
             menuButton.setScale(1.12);
             menuButton.setBackgroundColor('#3BBAAD');
         })
         .on('pointerout', () => {
             menuButton.setScale(1);
             menuButton.setBackgroundColor('#4ECDC4');
         })
         .on('pointerdown', () => {
             this.goToMenu();
         });

        this.tweens.add({
            targets: [restartButton, menuButton],
            alpha: 1,
            y: 420,
            duration: 600,
            delay: 400,
            ease: 'Quad.easeOut'
        });
        
        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.tweens.add({
            targets: [this.background],
            alpha: 0,
            duration: 300,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this.scene.start('Game');
            }
        });
    }

    goToMenu ()
    {
        this.tweens.add({
            targets: [this.background],
            alpha: 0,
            duration: 300,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this.scene.start('MainMenu');
            }
        });
    }
}
