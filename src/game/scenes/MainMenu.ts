import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    playButton: GameObjects.Text;
    subtitle: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.3);

        // Add animated background glow
        const glowGraphics = this.add.graphics();
        glowGraphics.fillStyle(0xFF6B6B, 0.1);
        glowGraphics.fillRect(0, 0, 1024, 768);

        this.title = this.add.text(512, 120, '🎤 Speaker Slash 🎤', {
            fontFamily: 'Arial Black', fontSize: 54, color: '#FF6B6B',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100)
         .setAlpha(0);

        this.subtitle = this.add.text(512, 220, 'Slash the speaker cards as they fall!', {
            fontFamily: 'Arial', fontSize: 24, color: '#4ECDC4',
            align: 'center'
        }).setOrigin(0.5).setDepth(100)
         .setAlpha(0);

        this.playButton = this.add.text(512, 350, 'PLAY', {
            fontFamily: 'Arial Black', fontSize: 44, color: '#ffffff',
            backgroundColor: '#FF6B6B',
            padding: { x: 40, y: 18 },
            stroke: '#000000', strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5).setDepth(100)
         .setAlpha(0)
         .setInteractive()
         .on('pointerover', () => {
             this.playButton.setScale(1.12);
             this.playButton.setBackgroundColor('#FF5555');
         })
         .on('pointerout', () => {
             this.playButton.setScale(1);
             this.playButton.setBackgroundColor('#FF6B6B');
         })
         .on('pointerdown', () => {
             this.changeScene();
         });

        this.logo = this.add.image(512, 600, 'logo').setDepth(100).setScale(0.5).setAlpha(0);

        // Animate in on create
        this.tweens.add({
            targets: this.title,
            alpha: 1,
            y: 100,
            duration: 600,
            ease: 'Quad.easeOut'
        });

        this.tweens.add({
            targets: this.subtitle,
            alpha: 1,
            delay: 150,
            duration: 600,
            ease: 'Quad.easeOut'
        });

        this.tweens.add({
            targets: this.playButton,
            alpha: 1,
            scale: 1,
            delay: 300,
            duration: 600,
            ease: 'Quad.easeOut'
        });

        this.tweens.add({
            targets: this.logo,
            alpha: 1,
            delay: 450,
            duration: 600,
            ease: 'Quad.easeOut'
        });

        this.animateLogo();

        EventBus.emit('current-scene-ready', this);
    }

    animateLogo ()
    {
        this.logoTween = this.tweens.add({
            targets: this.logo,
            y: { value: 570, duration: 1200, ease: 'Sine.inOut' },
            yoyo: true,
            repeat: -1
        });
    }
    
    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.tweens.add({
            targets: [this.title, this.subtitle, this.playButton, this.logo],
            alpha: 0,
            duration: 400,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this.scene.start('Game');
            }
        });
    }
}
