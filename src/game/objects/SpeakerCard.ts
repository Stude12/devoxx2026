import * as Phaser from 'phaser';
import { Speaker } from '../types/Speaker';

export class SpeakerCard extends Phaser.Physics.Arcade.Sprite {
    speaker: Speaker;
    cardWidth: number = 140;
    cardHeight: number = 180;
    isDestroyed: boolean = false;
    isSlashed: boolean = false;
    hitZone: Phaser.Geom.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number, speaker: Speaker) {
        super(scene, x, y, 'card-placeholder');

        this.speaker = speaker;
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setDepth(10);
        this.body?.setVelocityY(150);
        this.body?.setBounce(0, 0);
        this.body?.setCollideWorldBounds(false);
        this.body?.setDrag(0);

        // Hit zone for collision
        this.hitZone = new Phaser.Geom.Rectangle(
            this.x - this.cardWidth / 2,
            this.y - this.cardHeight / 2,
            this.cardWidth,
            this.cardHeight
        );

        this.createCardGraphics();
    }

    private createCardGraphics() {
        const graphics = this.scene.make.graphics({
            x: 0,
            y: 0,
            add: false
        });

        const w = this.cardWidth;
        const h = this.cardHeight;
        
        // Background
        graphics.fillStyle(Phaser.Display.Color.HexStringToColor(this.speaker.color).color, 1);
        graphics.fillRoundedRect(0, 0, w, h, 8);

        // Border
        graphics.lineStyle(3, 0xFFFFFF);
        graphics.strokeRoundedRect(0, 0, w, h, 8);

        // Generate texture from graphics
        const textureKey = 'card-' + this.speaker.id;
        graphics.generateTexture(textureKey, w, h);
        graphics.destroy();

        this.setTexture(textureKey);
        this.setDisplaySize(w, h);

        // Add text on top
        const nameText = this.scene.add.text(this.x, this.y - 40, this.speaker.name.substring(0, 15), {
            fontFamily: 'Arial Black',
            fontSize: 11,
            color: '#ffffff',
            align: 'center',
            backgroundColor: this.speaker.color,
            padding: { x: 5, y: 3 }
        }).setOrigin(0.5).setDepth(11);

        const topicText = this.scene.add.text(this.x, this.y, this.speaker.topic.substring(0, 16), {
            fontFamily: 'Arial',
            fontSize: 10,
            color: '#ffffff',
            align: 'center',
            backgroundColor: '#000000',
            padding: { x: 3, y: 2 }
        }).setOrigin(0.5).setDepth(11);

        const pointsText = this.scene.add.text(this.x, this.y + 45, `+${this.speaker.points}`, {
            fontFamily: 'Arial Black',
            fontSize: 13,
            color: '#FFD700',
            align: 'center'
        }).setOrigin(0.5).setDepth(11);

        // Store references for update
        (this as any).nameText = nameText;
        (this as any).topicText = topicText;
        (this as any).pointsText = pointsText;
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        
        // Update hit zone
        this.hitZone.setPosition(
            this.x - this.cardWidth / 2,
            this.y - this.cardHeight / 2
        );
        
        // Update text positions
        const nameText = (this as any).nameText;
        const topicText = (this as any).topicText;
        const pointsText = (this as any).pointsText;

        if (nameText) nameText.setPosition(this.x, this.y - 40);
        if (topicText) topicText.setPosition(this.x, this.y);
        if (pointsText) pointsText.setPosition(this.x, this.y + 45);
    }

    containsPoint(x: number, y: number): boolean {
        return Phaser.Geom.Rectangle.Contains(this.hitZone, x, y);
    }

    slash() {
        if (this.isDestroyed || this.isSlashed) return;
        this.isSlashed = true;

        const nameText = (this as any).nameText;
        const topicText = (this as any).topicText;
        const pointsText = (this as any).pointsText;

        // Animation de split - slice from top to bottom
        const tween1 = this.scene.tweens.add({
            targets: this,
            scaleY: 0,
            duration: 100,
            ease: 'Quad.easeIn'
        });

        // Particules
        this.createSlashEffect();

        // Clean up texts
        if (nameText) {
            this.scene.tweens.add({
                targets: nameText,
                alpha: 0,
                duration: 150,
                onComplete: () => nameText.destroy()
            });
        }
        if (topicText) {
            this.scene.tweens.add({
                targets: topicText,
                alpha: 0,
                duration: 150,
                onComplete: () => topicText.destroy()
            });
        }
        if (pointsText) {
            this.scene.tweens.add({
                targets: pointsText,
                alpha: 0,
                y: pointsText.y - 20,
                duration: 150,
                onComplete: () => pointsText.destroy()
            });
        }

        this.scene.time.delayedCall(120, () => {
            this.isDestroyed = true;
            this.destroy();
        });
    }

    private createSlashEffect() {
        const colors = [0xFF6B6B, 0xFF8B94, 0xFFFFFF];
        
        for (let i = 0; i < 3; i++) {
            const color = colors[i];
            const emitter = this.scene.add.particles(this.x, this.y, undefined, {
                speed: { min: 50, max: 300 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.6, end: 0 },
                lifespan: 400 + i * 100,
                gravityY: 200,
                quantity: 8 + i * 3,
                emitting: false,
                color: [color]
            });

            emitter.explode(8 + i * 3);
            
            this.scene.time.delayedCall(800, () => {
                emitter.destroy();
            });
        }

        // Slash line effect
        const graphics = this.scene.add.graphics();
        graphics.setDepth(100);
        graphics.lineStyle(3, 0xFF6B6B, 1);
        
        const startX = this.x - 50;
        const startY = this.y - 60;
        const endX = this.x + 50;
        const endY = this.y + 60;

        graphics.beginPath();
        graphics.moveTo(startX, startY);
        graphics.lineTo(endX, endY);
        graphics.strokePath();

        this.scene.tweens.add({
            targets: graphics,
            alpha: 0,
            duration: 200,
            onComplete: () => graphics.destroy()
        });
    }

    isMissed(): boolean {
        return this.y > this.scene.scale.height + 100;
    }
}
