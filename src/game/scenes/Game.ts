import { EventBus } from '../EventBus';
import { Scene, Math as PhaserMath, Cameras, GameObjects } from 'phaser';
import { SpeakerSpawner, FallingCard } from '../objects/SpeakerSpawner';
import { MicrophoneCursor } from '../objects/MicrophoneCursor';
import { SlashDetector } from '../objects/SlashDetector';
import { AudioManager } from '../objects/AudioManager';
import { SlashFeedbackRenderer } from '../objects/SlashFeedbackRenderer';
import { UIManager } from '../objects/UIManager';
import { SpeakerCard } from '../objects/SpeakerCard';
import { TrapCard } from '../objects/TrapCard';

export class Game extends Scene
{
    camera: Cameras.Scene2D.Camera;
    background: GameObjects.Image;
    readyText: GameObjects.Text;
    score: number = 0;
    lives: number = 3;
    combo: number = 0;
    maxCombo: number = 0;
    trapsSlashed: number = 0;
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
        this.trapsSlashed = 0;
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

        // Listen for missed cards (use .off first to avoid stacking on restart)
        this.events.off('card-missed');
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

        // Check for slashes when pointer is released and slash is ready
        if (this.slashDetector.hasSlashReady()) {
            const slashLine = this.slashDetector.getSlashLine();
            if (slashLine) {
                this.feedbackRenderer.drawSlashLine(slashLine.start, slashLine.end);
                this.checkSlashesOnTrail();
            }
            this.slashDetector.reset();
        }
    }

    private checkSlashesOnTrail() {
        const cards = this.spawner.getActiveCards();
        const segments = this.slashDetector.getSlashSegments();
        const slashedSpeakers: SpeakerCard[] = [];
        const slashedTraps: TrapCard[] = [];

        for (const card of cards) {
            if (card.isDestroyed || card.isSlashed || !card.scene) continue;

            if (this.isCardHitByTrail(card, segments)) {
                if ('isTrap' in card && card.isTrap) {
                    slashedTraps.push(card as TrapCard);
                } else {
                    slashedSpeakers.push(card as SpeakerCard);
                }
            }
        }

        // Handle slashed speaker cards (good!)
        if (slashedSpeakers.length > 0) {
            this.audioManager.playSlash();
            
            for (const card of slashedSpeakers) {
                card.slash();
                this.updateScore(card.speaker.points);
                this.incrementCombo();
            }

            this.feedbackRenderer.showComboFeedback(
                slashedSpeakers[0].x,
                slashedSpeakers[0].y - 60,
                this.combo
            );

            if (this.combo % 5 === 0 && this.combo > 0) {
                this.audioManager.playCombo();
            }
        }

        // Handle slashed traps (bad!)
        for (const trap of slashedTraps) {
            trap.slash();
            this.trapsSlashed++;
            this.audioManager.playTrapHit();
            this.resetCombo();

            if (trap.trapItem.penalty === 'life') {
                this.feedbackRenderer.showPenaltyFeedback(
                    trap.x, trap.y - 60,
                    `❌ -${trap.trapItem.penaltyValue} VIE!`
                );
                for (let i = 0; i < trap.trapItem.penaltyValue; i++) {
                    this.decrementLives();
                }
            } else {
                const scorePenalty = Math.min(this.score, trap.trapItem.penaltyValue);
                this.score = Math.max(0, this.score - trap.trapItem.penaltyValue);
                this.uiManager.updateScore(this.score);
                this.feedbackRenderer.showPenaltyFeedback(
                    trap.x, trap.y - 60,
                    `💥 -${scorePenalty} PTS!`
                );
            }
        }
    }

    private isCardHitByTrail(card: FallingCard, segments: Array<{ start: { x: number; y: number }; end: { x: number; y: number } }>): boolean {
        const toleranceX = card.cardWidth / 2;
        const toleranceY = card.cardHeight / 2;

        for (const seg of segments) {
            if (this.segmentIntersectsRect(
                seg.start.x, seg.start.y, seg.end.x, seg.end.y,
                card.x - toleranceX, card.y - toleranceY,
                card.x + toleranceX, card.y + toleranceY
            )) {
                return true;
            }
        }

        // Fallback: check full start→end line with generous distance
        const slashLine = this.slashDetector.getSlashLine();
        if (slashLine) {
            const dist = this.distanceToLine(card, slashLine.start, slashLine.end);
            if (dist < 70) return true;
        }

        return false;
    }

    private segmentIntersectsRect(
        x1: number, y1: number, x2: number, y2: number,
        left: number, top: number, right: number, bottom: number
    ): boolean {
        if (x1 >= left && x1 <= right && y1 >= top && y1 <= bottom) return true;
        if (x2 >= left && x2 <= right && y2 >= top && y2 <= bottom) return true;

        if (this.linesIntersect(x1, y1, x2, y2, left, top, right, top)) return true;
        if (this.linesIntersect(x1, y1, x2, y2, right, top, right, bottom)) return true;
        if (this.linesIntersect(x1, y1, x2, y2, left, bottom, right, bottom)) return true;
        if (this.linesIntersect(x1, y1, x2, y2, left, top, left, bottom)) return true;

        return false;
    }

    private linesIntersect(
        x1: number, y1: number, x2: number, y2: number,
        x3: number, y3: number, x4: number, y4: number
    ): boolean {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 0.001) return false;

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }

    private distanceToLine(card: FallingCard, start: { x: number; y: number }, end: { x: number; y: number }): number {
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
        if (this.lives <= 0) return;
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
            this.gameActive = false;
            this.time.delayedCall(500, () => {
                this.changeScene();
            });
        }
    }
}
