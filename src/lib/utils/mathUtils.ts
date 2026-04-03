import type { Question, GameMode } from '../types';

export function generateQuestion(mode: GameMode): Question {
  let num1 = 0;
  let num2 = 0;
  let operator = '+';
  let answer = 0;

  switch (mode) {
    case 'addition':
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      operator = '+';
      answer = num1 + num2;
      break;
    case 'subtraction':
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * num1) + 1;
      operator = '-';
      answer = num1 - num2;
      break;
    case 'multiplication':
      num1 = Math.floor(Math.random() * 9) + 2;
      num2 = Math.floor(Math.random() * 9) + 1;
      operator = '×';
      answer = num1 * num2;
      break;
    case 'division':
      num2 = Math.floor(Math.random() * 8) + 2;
      answer = Math.floor(Math.random() * 9) + 1;
      num1 = num2 * answer;
      operator = '÷';
      break;
  }

  const options = generateOptions(answer);
  return { num1, num2, operator, answer, options };
}

function generateOptions(answer: number): number[] {
  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const opt = answer + offset;
    if (opt >= 0) options.add(opt);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
}
