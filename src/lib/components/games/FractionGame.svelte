<script lang="ts">
  import { onMount } from 'svelte';
  import { gameStore } from '$lib/stores/gameStore.svelte';
  import Confetti from '../Confetti.svelte';

  let numerator = $state(1);   // 분자
  let denominator = $state(2); // 분모
  let options = $state<string[]>([]);
  let feedback = $state('');
  let isChecking = $state(false);
  let errorIdx = $state<number | null>(null);
  let confettiRef: any = $state();
  
  const TOTAL_ROUNDS = 5;
  let round = $state(0);

  onMount(() => {
    gameStore.resetSession(); // 세션 초기화 추가
    nextQuestion();
  });

  function generateQuestion() {
    // 2~8 사이의 분모 랜덤 선택
    denominator = Math.floor(Math.random() * 7) + 2;
    // 분모보다 작은 분자 랜덤 선택
    numerator = Math.floor(Math.random() * (denominator - 1)) + 1;

    // 보기 생성
    const correct = `${numerator}/${denominator}`;
    const wrongSet = new Set<string>();
    
    let safetyCounter = 0;
    while (wrongSet.size < 2 && safetyCounter < 50) {
      const d = Math.floor(Math.random() * 7) + 2;
      const n = Math.floor(Math.random() * (d - 1)) + 1;
      const w = `${n}/${d}`;
      if (w !== correct) wrongSet.add(w);
      safetyCounter++;
    }

    options = [correct, ...Array.from(wrongSet)].sort(() => Math.random() - 0.5);
  }

  function nextQuestion() {
    if (round >= TOTAL_ROUNDS) {
      gameStore.updateProgress(TOTAL_ROUNDS, TOTAL_ROUNDS);
      return;
    }
    
    generateQuestion();
    feedback = '';
    isChecking = false;
    errorIdx = null;
    round += 1;
    // updateProgress 호출 전 현재 진행 상태 명시
    gameStore.updateProgress(round - 1, TOTAL_ROUNDS);
  }

  function handleChoice(choice: string, idx: number) {
    if (isChecking) return;
    
    if (choice === `${numerator}/${denominator}`) {
      isChecking = true;
      feedback = '맛있는 피자 조각 찾기 성공! 🍕✨';
      gameStore.addScore(20, true);
      confettiRef?.fire();
      setTimeout(nextQuestion, 2000);
    } else {
      errorIdx = idx;
      feedback = '다시 한번 세어볼까요? 🧐';
      setTimeout(() => {
        errorIdx = null;
        feedback = '';
      }, 800);
    }
  }

  // SVG 조각 그리기 위한 좌표 계산
  function getSlicePath(index: number, total: number) {
    const radius = 100;
    const center = 100;
    const startAngle = (index * 2 * Math.PI) / total - Math.PI / 2;
    const endAngle = ((index + 1) * 2 * Math.PI) / total - Math.PI / 2;
    
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);
    
    const largeArcFlag = 0;
    
    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  }
</script>

<Confetti bind:this={confettiRef} />

<div class="flex flex-col items-center justify-between w-full max-w-4xl mx-auto flex-grow h-full py-2 select-none">
  
  <div class="text-center mb-2">
    <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-white drop-shadow-lg tracking-tight">
      색칠된 부분은 피자의 몇 분의 몇일까요?
    </h2>
  </div>

  <!-- Pizza Visual -->
  <div class="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72">
    <svg viewBox="0 0 200 200" class="w-full h-full drop-shadow-2xl">
      <!-- 배경 원 (피자 도우) -->
      <circle cx="100" cy="100" r="98" fill="#F59E0B" stroke="#B45309" stroke-width="4" />
      
      <!-- 조각들 -->
      {#each Array(denominator) as _, i}
        <path 
          d={getSlicePath(i, denominator)} 
          fill={i < numerator ? '#EF4444' : '#FFFBEB'} 
          stroke="#B45309" 
          stroke-width="2"
          class="transition-all duration-500"
        />
        <!-- 피자 토핑 표현 (색칠된 부분만) -->
        {#if i < numerator}
          <circle cx={100 + 60 * Math.cos((i + 0.5) * 2 * Math.PI / denominator - Math.PI / 2)} 
                  cy={100 + 60 * Math.sin((i + 0.5) * 2 * Math.PI / denominator - Math.PI / 2)} 
                  r="8" fill="#B91C1C" opacity="0.6" />
        {/if}
      {/each}
      
      <!-- 중앙 포인트 -->
      <circle cx="100" cy="100" r="4" fill="#B45309" />
    </svg>
  </div>

  <!-- Options -->
  <div class="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-xl px-4 mt-4">
    {#each options as option, i}
      <button 
        onclick={() => handleChoice(option, i)}
        disabled={isChecking}
        class="group relative bg-white rounded-[1.5rem] p-4 sm:p-6 flex flex-col items-center justify-center transition-all duration-200 active:scale-90 shadow-xl border-b-6 border-gray-200
               {errorIdx === i ? 'bg-red-100 border-red-400 shake-error' : ''} 
               {isChecking && option === `${numerator}/${denominator}` ? 'bg-green-100 border-green-400 scale-105' : ''}"
      >
        <div class="flex flex-col items-center font-black text-3xl sm:text-5xl text-deep-blue leading-tight">
          <span class="border-b-3 border-deep-blue px-2">{option.split('/')[0]}</span>
          <span class="px-2">{option.split('/')[1]}</span>
        </div>
      </button>
    {/each}
  </div>

  <!-- Feedback Area -->
  <div class="h-12 flex items-center justify-center mt-4">
    {#if feedback}
      <div class="text-xl sm:text-2xl font-black text-white text-center animate-bounce drop-shadow-lg">
        {feedback}
      </div>
    {/if}
  </div>
</div>

<style>
  button:disabled { cursor: default; }
  .shake-error { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
  
  @keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
  }
</style>
