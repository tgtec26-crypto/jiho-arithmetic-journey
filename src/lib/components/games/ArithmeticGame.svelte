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
  let wrongCount = $state(0); // 현재 문제에서의 오답 횟수 추적

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
    wrongCount = 0; // 오답 횟수 리셋
    round += 1;
    gameStore.updateProgress(round - 1, TOTAL_ROUNDS);
  }

  function handleAnswer(choice: number) {
    if (isChecking || !currentQuestion) return;

    if (choice === currentQuestion.answer) {
      isChecking = true;
      feedback = '참 잘했어요! ✨';
      gameStore.addScore(10, true);
      confettiRef?.fire();
      setTimeout(nextQuestion, 1500);
    } else {
      wrongCount += 1;
      feedback = '다시 한번 생각해봐요! 💪';
      
      // 두 번째 틀렸을 때만 10점 감점
      if (wrongCount === 2) {
        gameStore.subtractScore(10);
      }

      setTimeout(() => {
        feedback = '';
      }, 1500);
    }
  }
</script>

<Confetti bind:this={confettiRef} />

<!-- 레이아웃 최적화 컨테이너 -->
<div class="flex flex-col items-center justify-around w-full max-w-5xl mx-auto flex-grow min-h-[60vh] gap-6 py-4 select-none">
  
  {#if currentQuestion}
    <div class="flex flex-col items-center justify-center w-full bg-white rounded-[40px] shadow-2xl border-b-[12px] border-deep-blue p-10 transition-all">
      <!-- 수식 영역 (크기 확대) -->
      <div class="text-7xl sm:text-9xl font-black text-deep-blue mb-12 tracking-tighter flex items-center gap-6 sm:gap-10">
        <span>{currentQuestion.num1}</span>
        <span class="text-7xl sm:text-[9rem] text-[#E67E22]">{currentQuestion.operator}</span>
        <span>{currentQuestion.num2}</span>
        <span class="text-7xl sm:text-[9rem] text-[#E67E22]">=</span>
        <span class="text-[#E67E22]">?</span>
      </div>

      <!-- 정답 버튼 (1행 4열 가로 배치 최적화) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl">
        {#each currentQuestion.options as option}
          <button
            onclick={() => handleAnswer(option)}
            disabled={isChecking}
            class="bg-white border-b-8 border-gray-300 rounded-[30px] p-6 sm:p-8 text-4xl sm:text-6xl font-black text-deep-blue 
                   hover:bg-bright-text hover:scale-105 active:scale-95 transition-all
                   disabled:opacity-50 shadow-xl"
          >
            {option}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- 피드백 영역 -->
  <div class="h-16 flex items-center justify-center">
    {#if feedback}
      <div class="text-3xl sm:text-5xl font-black text-white text-center animate-bounce drop-shadow-lg">
        {feedback}
      </div>
    {/if}
  </div>
</div>

<style>
  button:disabled {
    cursor: default;
  }
</style>
