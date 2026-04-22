import { EventBus } from '../EventBus';
import { Scene, Math as PhaserMath, Cameras, GameObjects } from 'phaser';
import { SpeakerSpawner } from '../objects/SpeakerSpawner';
import { MicrophoneCursor } from '../objects/MicrophoneCursor';
import { SlashDetector } from '../objects/SlashDetector';
import { AudioManager } from '../objects/AudioManager';
import { SlashFeedbackRenderer } from '../objects/SlashFeedbackRenderer';
import { UIManager } from '../objects/UIManager';
import { SpeakerCard } from '../objects/SpeakerCard';

export class Game extends Scene
{
    camera: Cameras.Scene2D.Camera;
    background: GameObjects.Image;
    readyText: GameObjects.Text;
    score: number = 0;
    lives: number = 3;
    combo: number = 0;
    maxCombo: number = 0;
    spawner: SpeakerSpawner;
    cursor: MicrophoneCursor;
    slashDetector: SlashDetector;
    audioManager: AudioManager;
    feedbackRenderer: SlashFeedbackRenderer;
    uiManager: UIManager;
    gameActive: boolean = false;
    countdownText: GameObjects.Text;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.score = 0;
        this.lives = 3;
        this.combo = 0;
        this.maxCombo = 0;
        this.gameActive = false;

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x1a1a2e);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.2);

        // Initialize all systems
        this.uiManager = new UIManager(this);
        this.spawner = new SpeakerSpawner(this);
        this.cursor = new MicrophoneCursor(this);
        this.slashDetector = new SlashDetector(this);
        this.audioManager = new AudioManager(this);
        this.feedbackRenderer = new SlashFeedbackRenderer(this);

        // Ready text with countdown
        this.countdownText = this.add.text(512, 384, 'GET READY!', {
            fontFamily: 'Arial Black',
            fontSize: 56,
            color: '#4ECDC4',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Countdown animation
        this.tweens.add({
            targets: this.countdownText,
            scale: 0.8,
            alpha: 0,
            duration: 1000,
            delay: 1500,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this.countdownText.destroy();
                this.gameActive = true;
                this.audioManager.playSlash();
            }
        });

        // Listen for missed cards
        this.events.on('card-missed', () => {
            this.onCardMissed();
        });

        EventBus.emit('current-scene-ready', this);
    }

    update(time: number, delta: number) {
        if (!this.gameActive) return;

        this.spawner.update(delta);

        // Draw live trail while slashing
        if (this.slashDetector.isSlashing) {
            const points = this.slashDetector.getSlashPoints();
            this.feedbackRenderer.drawTrail(points);
        }

        // Check for slashes when the pointerup event fires
        if (!this.slashDetector.isSlashing && this.slashDetector.isValidSlash()) {
            const slashLine = this.slashDetector.getSlashLine();
            if (slashLine) {
                this.feedbackRenderer.drawSlashLine(slashLine.start, slashLine.end);
                this.checkSlashesOnLine(slashLine.start, slashLine.end);
            }
            this.slashDetector.reset();
        }
    }

    private checkSlashesOnLine(start: { x: number; y: number }, end: { x: number; y: number }) {
        const cards = this.spawner.getActiveCards();
        const slashedCards: SpeakerCard[] = [];

        for (const card of cards) {
            if (card.isDestroyed || card.isSlashed || !card.scene) continue;

            if (this.isCardOnSlashLine(card, start, end)) {
                slashedCards.push(card);
            }
        }

        slashedCards.sort((a, b) => {
            const distA = this.distanceToLine(a, start, end);
            const distB = this.distanceToLine(b, start, end);
            return distA - distB;
        });

        if (slashedCards.length > 0) {
            this.audioManager.playSlash();
            
            for (const card of slashedCards) {
                card.slash();
                this.updateScore(card.speaker.points);
                this.incrementCombo();
            }

            this.feedbackRenderer.showComboFeedback(
                slashedCards[0].x,
                slashedCards[0].y - 60,
                this.combo
            );

            if (this.combo % 5 === 0 && this.combo > 0) {
                this.audioManager.playCombo();
            }
        }
    }

    private isCardOnSlashLine(card: SpeakerCard, start: { x: number; y: number }, end: { x: number; y: number }): boolean {
        const distance = this.distanceToLine(card, start, end);
        return distance < 40;
    }

    private distanceToLine(card: SpeakerCard, start: { x: number; y: number }, end: { x: number; y: number }): number {
        const px = card.x;
        const py = card.y;

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const len2 = dx * dx + dy * dy;

        if (len2 === 0) return PhaserMath.Distance.Between(px, py, start.x, start.y);

        let t = ((px - start.x) * dx + (py - start.y) * dy) / len2;
        t = Math.max(0, Math.min(1, t));

        const closestX = start.x + t * dx;
        const closestY = start.y + t * dy;

        return PhaserMath.Distance.Between(px, py, closestX, closestY);
    }

    private onCardMissed() {
        this.resetCombo();
        this.uiManager.showMissAlert();
        this.audioManager.playMiss();
        this.decrementLives();
    }

    changeScene ()
    {
        this.gameActive = false;
        this.spawner.destroy();
        this.cursor.destroy();
        this.slashDetector.reset();
        this.feedbackRenderer.destroy();
        this.uiManager.destroy();
        this.audioManager.playGameOver();
        
        this.tweens.add({
            targets: this.background,
            alpha: 0,
            duration: 400,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this.scene.start('GameOver');
            }
        });
    }

    updateScore(points: number)
    {
        this.score += points * (1 + this.combo * 0.1);
        this.uiManager.updateScore(this.score);
    }

    incrementCombo()
    {
        this.combo++;
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        this.uiManager.updateCombo(this.combo);
    }

    resetCombo()
    {
        this.combo = 0;
        this.uiManager.updateCombo(0);
    }

    decrementLives()
    {
        this.lives--;
        this.uiManager.updateLives(this.lives);
        
        if (this.lives <= 0) {
            this.time.delayedCall(500, () => {
                this.changeScene();
            });
        }
    }
}
