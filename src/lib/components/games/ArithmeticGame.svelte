<script lang="ts">
  import { onMount } from 'svelte';
  import { gameStore } from '$lib/stores/gameStore.svelte';
  import { generateQuestion } from '$lib/utils/mathUtils';
  import type { Question } from '$lib/types';
  import Confetti from '../Confetti.svelte';

  let currentQuestion = $state<Question | null>(null);
  let feedback = $state<string>('');
  let isChecking = $state(false);
  let confettiRef: any = $state();

  const TOTAL_ROUNDS = 10;
  let round = $state(0);

  onMount(() => {
    nextQuestion();
  });

  function nextQuestion() {
    if (round >= TOTAL_ROUNDS) {
      gameStore.updateProgress(TOTAL_ROUNDS, TOTAL_ROUNDS);
      return;
    }
    currentQuestion = generateQuestion(gameStore.currentMode);
    feedback = '';
    isChecking = false;
    round += 1;
    gameStore.updateProgress(round - 1, TOTAL_ROUNDS);
  }

  function handleAnswer(choice: number) {
    if (isChecking || !currentQuestion) return;
    isChecking = true;

    if (choice === currentQuestion.answer) {
      feedback = '참 잘했어요! ✨';
      gameStore.addScore(10, true);
      confettiRef?.fire();
      setTimeout(nextQuestion, 1500);
    } else {
      feedback = '다시 한번 생각해봐요! 💪';
      gameStore.addScore(0, false);
      setTimeout(() => {
        isChecking = false;
        feedback = '';
      }, 1500);
    }
  }
</script>

<Confetti bind:this={confettiRef} />

{#if currentQuestion}
  <div class="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-xl border-b-8 border-deep-blue mx-4 transition-all">
    <div class="text-6xl font-black text-deep-blue mb-8 tracking-tighter flex items-center gap-4">
      <span>{currentQuestion.num1}</span>
      <span class="text-4xl text-accent-yellow">{currentQuestion.operator}</span>
      <span>{currentQuestion.num2}</span>
      <span class="text-4xl text-accent-yellow">=</span>
      <span class="text-accent-yellow">?</span>
    </div>

    <div class="grid grid-cols-2 gap-4 w-full max-w-sm">
      {#each currentQuestion.options as option}
        <button
          onclick={() => handleAnswer(option)}
          disabled={isChecking}
          class="bg-bright-text border-4 border-deep-blue rounded-2xl p-6 text-3xl font-bold text-deep-blue 
                 hover:bg-accent-yellow hover:scale-105 active:scale-95 transition-all
                 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {option}
        </button>
      {/each}
    </div>

    {#if feedback}
      <div class="mt-8 text-2xl font-bold text-deep-blue animate-bounce">
        {feedback}
      </div>
    {/if}
  </div>
{/if}
