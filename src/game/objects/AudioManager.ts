import * as Phaser from 'phaser';

export class AudioManager {
    scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    playSlash() {
        this.playSound('slash', 0.5);
    }

    playCombo() {
        this.playSound('combo', 0.3);
    }

    playMiss() {
        this.playSound('miss', 0.6);
    }

    playTrapHit() {
        this.playSound('trap', 0.7);
    }

    playGameOver() {
        this.playSound('gameover', 0.7);
    }

    private playSound(name: string, volume: number) {
        // Create a simple beep using Web Audio API as a fallback
        try {
            const audioContext = this.scene.sys.game.device.audio;
            if (audioContext && typeof window !== 'undefined') {
                this.synthesizeBeep(name, volume);
            }
        } catch (e) {
            // Silently fail if audio is not available
        }
    }

    private synthesizeBeep(type: string, volume: number) {
        try {
            const audioContext = new (window as any).AudioContext?.() || new (window as any).webkitAudioContext?.();
            if (!audioContext) return;

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            switch (type) {
                case 'slash':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
                    break;
                case 'combo':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.05);
                    break;
                case 'miss':
                    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
                    break;
                case 'trap':
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.15);
                    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    break;
                case 'gameover':
                    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
                    break;
            }

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Audio synthesis not available
        }
    }
}
