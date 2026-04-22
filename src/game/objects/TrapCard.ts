import * as Phaser from 'phaser';
import { TrapItem } from '../types/TrapItem';

const TRAP_BASE_SIZE = { width: 120, height: 120 };

export class TrapCard extends Phaser.Physics.Arcade.Sprite {
    trapItem: TrapItem;
    cardWidth: number;
    cardHeight: number;
    scaleFactor: number;
    isDestroyed: boolean = false;
    isSlashed: boolean = false;
    isTrap: boolean = true;
    hitZone: Phaser.Geom.Rectangle;

    private emojiText: Phaser.GameObjects.Text;
    private nameText: Phaser.GameObjects.Text;
    private warningText: Phaser.GameObjects.Text;
    private wobbleTween: Phaser.Tweens.Tween | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, trapItem: TrapItem, scaleFactor: number = 1) {
        super(scene, x, y, 'card-placeholder');

        this.trapItem = trapItem;
        this.scaleFactor = scaleFactor;
        this.cardWidth = Math.round(TRAP_BASE_SIZE.width * scaleFactor);
        this.cardHeight = Math.round(TRAP_BASE_SIZE.height * scaleFactor);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setDepth(10);
        this.body?.setVelocityY(150);
        this.body?.setBounce(0, 0);
        this.body?.setCollideWorldBounds(false);
        this.body?.setDrag(0);

        this.hitZone = new Phaser.Geom.Rectangle(
            this.x - this.cardWidth / 2,
            this.y - this.cardHeight / 2,
            this.cardWidth,
            this.cardHeight
        );

        this.createCardGraphics();
        this.startWobble();
    }

    private createCardGraphics() {
        const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = this.cardWidth;
        const h = this.cardHeight;

        // Dark background with red tint
        graphics.fillStyle(0x2a0a0a, 1);
        graphics.fillRoundedRect(0, 0, w, h, 12);

        // Red danger border (double stroke)
        graphics.lineStyle(4, 0xFF0000);
        graphics.strokeRoundedRect(0, 0, w, h, 12);
        graphics.lineStyle(2, 0xFF4444);
        graphics.strokeRoundedRect(4, 4, w - 8, h - 8, 9);

        // Corner danger triangles
        graphics.fillStyle(0xFF0000, 0.6);
        graphics.fillTriangle(0, 0, 20, 0, 0, 20);
        graphics.fillTriangle(w, 0, w - 20, 0, w, 20);

        const textureKey = 'trap-' + this.trapItem.id + '-' + Date.now();
        graphics.generateTexture(textureKey, w, h);
        graphics.destroy();

        this.setTexture(textureKey);
        this.setDisplaySize(w, h);

        // Emoji
        const emojiFontSize = Math.round(36 * this.scaleFactor);
        this.emojiText = this.scene.add.text(this.x, this.y - 15, this.trapItem.emoji, {
            fontSize: emojiFontSize,
            align: 'center'
        }).setOrigin(0.5).setDepth(11);

        // Name
        const nameFontSize = Math.round(10 * this.scaleFactor);
        this.nameText = this.scene.add.text(this.x, this.y + 25, this.trapItem.name, {
            fontFamily: 'Arial Black',
            fontSize: nameFontSize,
            color: '#FF6666',
            align: 'center'
        }).setOrigin(0.5).setDepth(11);

        // Warning icon
        const warningFontSize = Math.round(14 * this.scaleFactor);
        this.warningText = this.scene.add.text(this.x, this.y - this.cardHeight / 2 + 10, '⚠️', {
            fontSize: warningFontSize,
            align: 'center'
        }).setOrigin(0.5).setDepth(12);
    }

    private startWobble() {
        this.wobbleTween = this.scene.tweens.add({
            targets: this,
            angle: { from: -5, to: 5 },
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        this.hitZone.setPosition(
            this.x - this.cardWidth / 2,
            this.y - this.cardHeight / 2
        );

        if (this.emojiText) this.emojiText.setPosition(this.x, this.y - 15);
        if (this.nameText) this.nameText.setPosition(this.x, this.y + 25);
        if (this.warningText) this.warningText.setPosition(this.x, this.y - this.cardHeight / 2 + 10);
    }

    slash() {
        if (this.isDestroyed || this.isSlashed) return;
        this.isSlashed = true;

        if (this.wobbleTween) this.wobbleTween.stop();

        this.createPenaltyEffect();

        // Shrink animation
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this,
                    scaleY: 0,
                    duration: 100,
                    ease: 'Quad.easeIn'
                });
            }
        });

        // Fade texts
        [this.emojiText, this.nameText, this.warningText].forEach(t => {
            if (t) {
                this.scene.tweens.add({
                    targets: t,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => t.destroy()
                });
            }
        });

        this.scene.time.delayedCall(200, () => {
            this.isDestroyed = true;
            this.destroy();
        });
    }

    private createPenaltyEffect() {
        // Red explosion particles
        const emitter = this.scene.add.particles(this.x, this.y, undefined, {
            speed: { min: 80, max: 250 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.8, end: 0 },
            lifespan: 600,
            gravityY: 100,
            quantity: 15,
            emitting: false,
            color: [0xFF0000, 0xFF4444, 0xFFFFFF]
        });
        emitter.explode(15);
        this.scene.time.delayedCall(800, () => emitter.destroy());

        // Red flash on camera
        this.scene.cameras.main.flash(300, 255, 0, 0, false, undefined, this.scene);

        // Screen shake
        this.scene.cameras.main.shake(200, 0.01);
    }

    isMissed(): boolean {
        return this.y > this.scene.scale.height + 100;
    }

    containsPoint(x: number, y: number): boolean {
        return Phaser.Geom.Rectangle.Contains(this.hitZone, x, y);
    }
}
