import type { GameMode, IGameState } from '../types';
import { browser } from '$app/environment';

class GameStore {
    // Svelte 5 Runes for reactive state
    #state = $state<IGameState>({
        currentMode: 'menu',
        score: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        progress: 0,
        isCompleted: false
    });

    constructor() {
        if (browser) {
            const savedScore = localStorage.getItem('jiho_score');
            const savedCorrect = localStorage.getItem('jiho_correct');
            if (savedScore) this.#state.score = parseInt(savedScore);
            if (savedCorrect) this.#state.correctAnswers = parseInt(savedCorrect);
        }
    }

    // Getters
    get currentMode() { return this.#state.currentMode; }
    get score() { return this.#state.score; }
    get totalQuestions() { return this.#state.totalQuestions; }
    get correctAnswers() { return this.#state.correctAnswers; }
    get progress() { return this.#state.progress; }
    get isCompleted() { return this.#state.isCompleted; }

    // Actions
    setMode(mode: GameMode) {
        this.#state.currentMode = mode;
        this.#state.progress = 0;
        this.#state.isCompleted = false;
        this.#state.totalQuestions = 0;
    }

    addScore(points: number, isCorrect: boolean) {
        this.#state.score += points;
        if (isCorrect) {
            this.#state.correctAnswers += 1;
        }
        this.#state.totalQuestions += 1;
        
        if (browser) {
            localStorage.setItem('jiho_score', this.#state.score.toString());
            localStorage.setItem('jiho_correct', this.#state.correctAnswers.toString());
        }
    }

    updateProgress(current: number, total: number) {
        this.#state.progress = (current / total) * 100;
        if (current >= total) {
            this.#state.isCompleted = true;
        }
    }

    resetSession() {
        this.#state.totalQuestions = 0;
        this.#state.progress = 0;
        this.#state.isCompleted = false;
    }

    resetAll() {
        this.#state.score = 0;
        this.#state.correctAnswers = 0;
        this.#state.totalQuestions = 0;
        this.#state.progress = 0;
        this.#state.isCompleted = false;
        if (browser) {
            localStorage.removeItem('jiho_score');
            localStorage.removeItem('jiho_correct');
        }
    }
}

export const gameStore = new GameStore();
