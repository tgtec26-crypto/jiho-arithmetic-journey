<script lang="ts">
  import { onMount } from 'svelte';
  import { gameStore } from '$lib/stores/gameStore.svelte';
  import Confetti from '../Confetti.svelte';

  interface ComparisonPair {
    num1: number;
    num2: number;
    sum: number;
  }

  let leftPair = $state<ComparisonPair>({ num1: 0, num2: 0, sum: 0 });
  let rightPair = $state<ComparisonPair>({ num1: 0, num2: 0, sum: 0 });
  
  let isLarger = $state(true);
  let feedback = $state('');
  let isChecking = $state(false);
  let showSums = $state(false);
  let tilt = $state(0); 
  let targetIdx = $state(0);
  let errorIdx = $state<number | null>(null); 
  let wrongCount = $state(0);
  let confettiRef: any = $state();
  
  const TOTAL_ROUNDS = 5;
  let round = $state(0);

  onMount(() => {
    nextQuestion();
  });

  function generatePair(): ComparisonPair {
    const n1 = Math.floor(Math.random() * 15) + 1;
    const n2 = Math.floor(Math.random() * 15) + 1;
    return { num1: n1, num2: n2, sum: n1 + n2 };
  }

  function nextQuestion() {
    if (round >= TOTAL_ROUNDS) {
      gameStore.updateProgress(TOTAL_ROUNDS, TOTAL_ROUNDS);
      return;
    }
    
    isLarger = Math.random() > 0.3;
    
    let attempts = 0;
    while (attempts < 100) {
      leftPair = generatePair();
      rightPair = generatePair();
      const diff = Math.abs(leftPair.sum - rightPair.sum);
      if (diff >= 1 && diff <= 8) break;
      attempts++;
    }

    targetIdx = isLarger 
      ? (leftPair.sum > rightPair.sum ? 0 : 1) 
      : (leftPair.sum < rightPair.sum ? 0 : 1);

    feedback = '';
    isChecking = false;
    showSums = false;
    tilt = 0;
    errorIdx = null;
    wrongCount = 0;
    round += 1;
    gameStore.updateProgress(round - 1, TOTAL_ROUNDS);
  }

  function handleChoice(idx: number) {
    if (isChecking) return;
    
    if (idx === targetIdx) {
      isChecking = true;
      showSums = true;
      errorIdx = null;
      
      const isLeftHeavier = leftPair.sum > rightPair.sum;
      tilt = isLeftHeavier ? -12 : 12;

      feedback = isLarger ? '정답! 덧셈 천재 지호! 🐘' : '작은 수도 척척! 대단해요! 🐭';
      gameStore.addScore(20, true);
      confettiRef?.fire();
      setTimeout(nextQuestion, 2500);
    } else {
      errorIdx = idx;
      wrongCount += 1;
      feedback = '다시 한번 더해볼까요? 🧐';
      if (wrongCount === 2) {
        gameStore.subtractScore(10);
      }
      setTimeout(() => {
        errorIdx = null;
        feedback = '';
      }, 800);
    }
  }
</script>

<Confetti bind:this={confettiRef} />

<div class="flex flex-col items-center justify-around w-full max-w-4xl mx-auto flex-grow min-h-[75vh] py-4 select-none">
  
  <div class="text-center mb-2">
    <h2 class="text-3xl sm:text-4xl font-black text-white drop-shadow-lg tracking-tight">
      {isLarger ? "두 수를 더한 값이 큰 것을 찾아보세요!" : "두 수를 더한 값이 작은 것을 찾아보세요!"}
    </h2>
  </div>

  <div class="scale-area relative w-full h-[500px] flex flex-col items-center justify-end overflow-visible">
    <div class="scale-pillar absolute top-[100px] left-1/2 -translate-x-1/2 w-8 h-[350px] bg-[#8D6E63] rounded-full shadow-lg z-10">
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[220px] h-10 bg-[#5D4037] rounded-t-2xl shadow-xl"></div>
    </div>

    <div 
      class="absolute top-[60px] left-1/2 w-[450px] sm:w-[600px] h-10 transition-transform duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] z-20 origin-center"
      style="transform: translateX(-50%) rotate({tilt}deg)"
    >
      <div class="absolute top-1/2 left-0 w-full h-4 bg-[#A1887F] rounded-full -translate-y-1/2 shadow-md z-20"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-[#FFD700] border-4 border-[#8D6E63] rounded-full shadow-md z-40"></div>

      <div class="absolute left-6 top-5 w-[150px] flex flex-col items-center transition-transform duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] origin-top z-10"
           style="transform: translateX(-50%) rotate({-tilt}deg)">
        <div class="w-0.5 h-20 bg-[#9E9E9E]"></div>
        <button onclick={() => handleChoice(0)} disabled={isChecking} class="flex flex-col items-center group {errorIdx === 0 ? 'shake-error' : ''}">
          <div class="w-20 h-20 sm:w-24 sm:h-24 bg-white border-4 border-white rounded-[25px] flex items-center justify-center text-4xl font-black text-deep-blue shadow-xl transition-all
                      {errorIdx === 0 ? 'error-bg' : ''} {isChecking && targetIdx === 0 ? 'success-bg' : ''}">
            {leftPair.num1}
          </div>
          <div class="w-0.5 h-6 bg-[#9E9E9E]"></div>
          <div class="w-20 h-20 sm:w-24 sm:h-24 bg-white border-4 border-white rounded-[25px] flex items-center justify-center text-4xl font-black text-deep-blue shadow-xl transition-all
                      {errorIdx === 0 ? 'error-bg' : ''} {isChecking && targetIdx === 0 ? 'success-bg' : ''}">
            {leftPair.num2}
          </div>
          {#if showSums}
            <div class="mt-4 bg-error text-white px-6 py-2 rounded-full text-3xl font-black shadow-lg animate-in zoom-in">{leftPair.sum}</div>
          {/if}
        </button>
      </div>

      <div class="absolute right-6 top-5 w-[150px] flex flex-col items-center transition-transform duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] origin-top z-10"
           style="transform: translateX(50%) rotate({-tilt}deg)">
        <div class="w-0.5 h-20 bg-[#9E9E9E]"></div>
        <button onclick={() => handleChoice(1)} disabled={isChecking} class="flex flex-col items-center group {errorIdx === 1 ? 'shake-error' : ''}">
          <div class="w-20 h-20 sm:w-24 sm:h-24 bg-white border-4 border-white rounded-[25px] flex items-center justify-center text-4xl font-black text-deep-blue shadow-xl transition-all
                      {errorIdx === 1 ? 'error-bg' : ''} {isChecking && targetIdx === 1 ? 'success-bg' : ''}">
            {rightPair.num1}
          </div>
          <div class="w-0.5 h-6 bg-[#9E9E9E]"></div>
          <div class="w-20 h-20 sm:w-24 sm:h-24 bg-white border-4 border-white rounded-[25px] flex items-center justify-center text-4xl font-black text-deep-blue shadow-xl transition-all
                      {errorIdx === 1 ? 'error-bg' : ''} {isChecking && targetIdx === 1 ? 'success-bg' : ''}">
            {rightPair.num2}
          </div>
          {#if showSums}
            <div class="mt-4 bg-error text-white px-6 py-2 rounded-full text-3xl font-black shadow-lg animate-in zoom-in">{rightPair.sum}</div>
          {/if}
        </button>
      </div>
    </div>
  </div>

  <div class="h-16 flex items-center justify-center mt-12">
    {#if feedback}
      <div class="text-2xl sm:text-4xl font-black text-white text-center animate-bounce drop-shadow-lg">{feedback}</div>
    {/if}
  </div>
</div>

<style>
  button:disabled { cursor: default; }
  .shake-error { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
  .error-bg { background-color: #FEE2E2 !important; border-color: #EF4444 !important; color: #991B1B !important; }
  .success-bg { background-color: #F0FDF4 !important; border-color: #22C55E !important; }
  @keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
  }
</style>
