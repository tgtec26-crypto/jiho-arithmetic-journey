import { describe, it, expect } from 'vitest';
import { generateQuestion } from '../../utils/mathUtils';

describe('mathUtils', () => {
  it('should generate correct addition questions', () => {
    const q = generateQuestion('addition');
    expect(q.operator).toBe('+');
    expect(q.num1 + q.num2).toBe(q.answer);
    expect(q.options).toContain(q.answer);
    expect(q.options.length).toBe(4);
  });

  it('should generate correct subtraction questions', () => {
    const q = generateQuestion('subtraction');
    expect(q.operator).toBe('-');
    expect(q.num1 - q.num2).toBe(q.answer);
    expect(q.answer).toBeGreaterThanOrEqual(0);
  });

  it('should generate correct multiplication questions', () => {
    const q = generateQuestion('multiplication');
    expect(q.operator).toBe('×');
    expect(q.num1 * q.num2).toBe(q.answer);
  });

  it('should generate correct division questions', () => {
    const q = generateQuestion('division');
    expect(q.operator).toBe('÷');
    expect(q.num1 / q.num2).toBe(q.answer);
    expect(q.num1 % q.num2).toBe(0);
  });
});
