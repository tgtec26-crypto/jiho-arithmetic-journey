import type { GameMode, IGameState, HistoryRecord } from '../types';
import { browser } from '$app/environment';

class GameStore {
    #state = $state<IGameState>({
        currentMode: 'menu',
        score: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        progress: 0,
        isCompleted: false
    });

    #history = $state<HistoryRecord[]>([]);

    constructor() {
        if (browser) {
            const savedScore = localStorage.getItem('jiho_score');
            const savedCorrect = localStorage.getItem('jiho_correct');
            const savedHistory = localStorage.getItem('jiho_history');

            if (savedScore) this.#state.score = parseInt(savedScore);
            if (savedCorrect) this.#state.correctAnswers = parseInt(savedCorrect);
            if (savedHistory) this.#history = JSON.parse(savedHistory);
        }
    }

    // Getters
    get currentMode() { return this.#state.currentMode; }
    get score() { return this.#state.score; }
    get totalQuestions() { return this.#state.totalQuestions; }
    get correctAnswers() { return this.#state.correctAnswers; }
    get progress() { return this.#state.progress; }
    get isCompleted() { return this.#state.isCompleted; }
    get history() { return this.#history; }

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

    subtractScore(points: number) {
        this.#state.score = Math.max(0, this.#state.score - points);
        if (browser) {
            localStorage.setItem('jiho_score', this.#state.score.toString());
        }
    }

    // 새로운 학습 기록 저장
    saveCurrentRecord(): number {
        if (this.#state.score === 0) return 0; // 0점은 기록하지 않음

        const now = new Date();
        const dateStr = `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;
        
        const currentScore = this.#state.score;
        const newRecord: HistoryRecord = {
            id: Date.now().toString(),
            date: dateStr,
            score: currentScore,
            correctAnswers: this.#state.correctAnswers
        };

        this.#history = [newRecord, ...this.#history].slice(0, 50); 
        
        if (browser) {
            localStorage.setItem('jiho_history', JSON.stringify(this.#history));
        }
        
        // 기록 저장 후 점수 리셋
        this.#state.score = 0;
        this.#state.correctAnswers = 0;
        if (browser) {
            localStorage.setItem('jiho_score', '0');
            localStorage.setItem('jiho_correct', '0');
        }
        
        return currentScore;
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

    clearHistory() {
        if (confirm('모든 기록을 삭제할까요?')) {
            this.#history = [];
            if (browser) localStorage.removeItem('jiho_history');
        }
    }
}

export const gameStore = new GameStore();
