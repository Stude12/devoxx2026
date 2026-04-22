import * as Phaser from 'phaser';

export class SlashDetector {
    scene: Phaser.Scene;
    slashTrail: Array<{ x: number; y: number }> = [];
    minSlashLength: number = 20;
    maxTrailLength: number = 30;
    isSlashing: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.setupInput();
    }

    private setupInput() {
        this.scene.input.on('pointerdown', () => {
            this.isSlashing = true;
            this.slashTrail = [];
        });

        this.scene.input.on('pointerup', () => {
            this.isSlashing = false;
        });

        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isSlashing) {
                this.slashTrail.push({ x: pointer.x, y: pointer.y });
                
                if (this.slashTrail.length > this.maxTrailLength) {
                    this.slashTrail.shift();
                }
            }
        });
    }

    isValidSlash(): boolean {
        if (this.slashTrail.length < 2) return false;

        const start = this.slashTrail[0];
        const end = this.slashTrail[this.slashTrail.length - 1];
        const distance = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y);

        return distance >= this.minSlashLength;
    }

    getSlashLine(): { start: { x: number; y: number }; end: { x: number; y: number } } | null {
        if (this.slashTrail.length < 2) return null;

        return {
            start: this.slashTrail[0],
            end: this.slashTrail[this.slashTrail.length - 1]
        };
    }

    getSlashPoints(): Array<{ x: number; y: number }> {
        return [...this.slashTrail];
    }

    reset() {
        this.slashTrail = [];
        this.isSlashing = false;
    }
}
