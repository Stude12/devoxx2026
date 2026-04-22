import * as Phaser from 'phaser';
import { SPEAKERS, CARD_DIMENSIONS } from '../types/Speaker';
import { SpeakerCard } from './SpeakerCard';

export class SpeakerSpawner {
    scene: Phaser.Scene;
    activeCards: SpeakerCard[] = [];
    spawnInterval: number = 1400; // Start slower for fun
    spawnTimer: number = 0;
    spawnRateIncrease: number = 0;
    cardsSpawned: number = 0;
    maxDifficulty: number = 700; // Minimum spawn interval
    elapsedTime: number = 0;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    update(delta: number) {
        this.elapsedTime += delta;
        this.spawnTimer += delta;

        // Progressive difficulty: Every 15 seconds, spawn faster
        const difficultyStage = Math.floor(this.elapsedTime / 15000);
        this.spawnRateIncrease = Math.min(700, difficultyStage * 50);

        const currentInterval = Math.max(this.maxDifficulty, this.spawnInterval - this.spawnRateIncrease);

        if (this.spawnTimer >= currentInterval) {
            this.spawn();
            this.spawnTimer = 0;
        }

        // Check for missed cards
        for (let i = this.activeCards.length - 1; i >= 0; i--) {
            const card = this.activeCards[i];
            if (card.isDestroyed || !card.active || !card.scene) {
                this.activeCards.splice(i, 1);
            } else if (card.isMissed()) {
                card.destroy();
                this.activeCards.splice(i, 1);
                this.scene.events.emit('card-missed');
            }
        }
    }

    private spawn() {
        const randomSpeaker = Phaser.Utils.Array.GetRandom(SPEAKERS);
        const dims = CARD_DIMENSIONS[randomSpeaker.size];
        const margin = dims.width / 2 + 20;
        const x = Phaser.Math.Between(margin, this.scene.scale.width - margin);
        const y = -dims.height / 2;

        const card = new SpeakerCard(this.scene, x, y, randomSpeaker);
        
        // Smaller cards fall faster (harder to hit)
        const sizeSpeedBonus = randomSpeaker.size === 'small' ? 1.3 : randomSpeaker.size === 'large' ? 0.8 : 1;
        const speedMultiplier = (1 + (this.elapsedTime / 60000)) * sizeSpeedBonus;
        card.body!.setVelocityY(150 * speedMultiplier);
        
        this.activeCards.push(card);
        this.cardsSpawned++;
    }

    getActiveCards(): SpeakerCard[] {
        return this.activeCards;
    }

    getStats() {
        return {
            cardsSpawned: this.cardsSpawned,
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

