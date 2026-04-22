import * as Phaser from 'phaser';

export class SlashDetector {
    scene: Phaser.Scene;
    slashTrail: Array<{ x: number; y: number }> = [];
    minSlashLength: number = 20;
    maxTrailLength: number = 50;
    isSlashing: boolean = false;
    slashReady: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.setupInput();
    }

    private setupInput() {
        this.scene.input.on('pointerdown', () => {
            this.isSlashing = true;
            this.slashReady = false;
            this.slashTrail = [];
        });

        this.scene.input.on('pointerup', () => {
            this.endSlash();
        });

        // End slash when cursor leaves the game canvas
        this.scene.game.canvas.addEventListener('pointerleave', () => {
            if (this.isSlashing) {
                this.endSlash();
            }
        });

        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isSlashing && pointer.isDown) {
                this.slashTrail.push({ x: pointer.x, y: pointer.y });
                
                if (this.slashTrail.length > this.maxTrailLength) {
                    this.slashTrail.shift();
                }
            }
        });
    }

    private endSlash() {
        if (this.isSlashing && this.slashTrail.length >= 2) {
            this.slashReady = true;
        }
        this.isSlashing = false;
    }

    hasSlashReady(): boolean {
        return this.slashReady && this.isValidSlash();
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

    getSlashSegments(): Array<{ start: { x: number; y: number }; end: { x: number; y: number } }> {
        const segments: Array<{ start: { x: number; y: number }; end: { x: number; y: number } }> = [];
        for (let i = 0; i < this.slashTrail.length - 1; i++) {
            segments.push({
                start: this.slashTrail[i],
                end: this.slashTrail[i + 1]
            });
        }
        return segments;
    }

    getSlashPoints(): Array<{ x: number; y: number }> {
        return [...this.slashTrail];
    }

    reset() {
        this.slashTrail = [];
        this.isSlashing = false;
        this.slashReady = false;
    }
}
