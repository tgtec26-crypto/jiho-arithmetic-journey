export type GameMode = 
  | 'addition' 
  | 'subtraction' 
  | 'multiplication' 
  | 'division' 
  | 'spider' 
  | 'clock' 
  | 'compare' 
  | 'money'
  | 'train'
  | 'menu';

export interface Question {
  num1: number;
  num2: number;
  operator: string;
  answer: number;
  options: number[];
}

export interface IGameState {
  currentMode: GameMode;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  progress: number;
  isCompleted: boolean;
}

export interface SpiderState {
  target: number;
  bubbles: number[];
  filled: boolean[];
  lines: Array<{ x1: number; y1: number; x2: number; y2: number }>;
}

export interface ClockState {
  hour: number;
  minute: number;
  displayHour: number;
  displayMinute: number;
  options: string[];
}

export interface HistoryRecord {
  id: string;
  date: string;
  score: number;
  correctAnswers: number;
}
