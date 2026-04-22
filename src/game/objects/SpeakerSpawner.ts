import * as Phaser from 'phaser';
import { SPEAKERS, CARD_DIMENSIONS } from '../types/Speaker';
import { TRAP_ITEMS } from '../types/TrapItem';
import { SpeakerCard } from './SpeakerCard';
import { TrapCard } from './TrapCard';

export type FallingCard = SpeakerCard | TrapCard;

export class SpeakerSpawner {
    scene: Phaser.Scene;
    activeCards: FallingCard[] = [];
    spawnInterval: number = 1400;
    spawnTimer: number = 0;
    spawnRateIncrease: number = 0;
    cardsSpawned: number = 0;
    trapsSpawned: number = 0;
    maxDifficulty: number = 700;
    elapsedTime: number = 0;
    trapChance: number = 0.12; // 12% base chance

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /** Scale factor based on current score: 1.0 → 0.5 as score increases */
    getScaleFactor(): number {
        const gameScene = this.scene as any;
        const score = gameScene.score || 0;
        // Shrink from 1.0 to 0.5 over 5000 points
        return Math.max(0.5, 1 - (score / 10000));
    }

    update(delta: number) {
        this.elapsedTime += delta;
        this.spawnTimer += delta;

        // Progressive difficulty: Every 15 seconds, spawn faster
        const difficultyStage = Math.floor(this.elapsedTime / 15000);
        this.spawnRateIncrease = Math.min(700, difficultyStage * 50);

        const currentInterval = Math.max(this.maxDifficulty, this.spawnInterval - this.spawnRateIncrease);

        if (this.spawnTimer >= currentInterval) {
            this.spawnItem();
            this.spawnTimer = 0;
        }

        // Check for missed cards
        for (let i = this.activeCards.length - 1; i >= 0; i--) {
            const card = this.activeCards[i];
            if (card.isDestroyed || !card.active || !card.scene) {
                this.activeCards.splice(i, 1);
            } else if (card.isMissed()) {
                const isTrap = 'isTrap' in card && card.isTrap;
                card.destroy();
                this.activeCards.splice(i, 1);
                // Only emit card-missed for speaker cards, not traps
                if (!isTrap) {
                    this.scene.events.emit('card-missed');
                }
            }
        }
    }

    private spawnItem() {
        // Trap chance increases with difficulty (12% → 25% max)
        const difficultyStage = Math.floor(this.elapsedTime / 15000);
        const currentTrapChance = Math.min(0.25, this.trapChance + difficultyStage * 0.02);

        if (Math.random() < currentTrapChance) {
            this.spawnTrap();
        } else {
            this.spawnSpeaker();
        }
    }

    private spawnSpeaker() {
        const randomSpeaker = Phaser.Utils.Array.GetRandom(SPEAKERS);
        const dims = CARD_DIMENSIONS[randomSpeaker.size];
        const scaleFactor = this.getScaleFactor();
        const margin = (dims.width * scaleFactor) / 2 + 20;
        const x = Phaser.Math.Between(margin, this.scene.scale.width - margin);
        const y = -dims.height / 2;

        const card = new SpeakerCard(this.scene, x, y, randomSpeaker, scaleFactor);
        
        const sizeSpeedBonus = randomSpeaker.size === 'small' ? 1.3 : randomSpeaker.size === 'large' ? 0.8 : 1;
        const speedMultiplier = (1 + (this.elapsedTime / 60000)) * sizeSpeedBonus;
        card.body!.setVelocityY(150 * speedMultiplier);
        
        this.activeCards.push(card);
        this.cardsSpawned++;
    }

    private spawnTrap() {
        const randomTrap = Phaser.Utils.Array.GetRandom(TRAP_ITEMS);
        const scaleFactor = this.getScaleFactor();
        const margin = (60 * scaleFactor) + 20;
        const x = Phaser.Math.Between(margin, this.scene.scale.width - margin);
        const y = -70;

        const trap = new TrapCard(this.scene, x, y, randomTrap, scaleFactor);

        // Traps fall a bit slower to give time to recognize
        const speedMultiplier = (1 + (this.elapsedTime / 60000)) * 0.85;
        trap.body!.setVelocityY(130 * speedMultiplier);

        this.activeCards.push(trap);
        this.trapsSpawned++;
    }

    getActiveCards(): FallingCard[] {
        return this.activeCards;
    }

    getStats() {
        return {
            cardsSpawned: this.cardsSpawned,
            trapsSpawned: this.trapsSpawned,
            cardsActive: this.activeCards.length,
            currentInterval: Math.max(this.maxDifficulty, this.spawnInterval - this.spawnRateIncrease),
            elapsedTime: Math.floor(this.elapsedTime / 1000)
        };
    }

    destroy() {
        this.activeCards.forEach(card => card.destroy());
        this.activeCards = [];
    }
}

