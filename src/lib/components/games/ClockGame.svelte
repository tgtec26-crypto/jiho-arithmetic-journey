<script lang="ts">
  import { onMount } from 'svelte';
  import { gameStore } from '$lib/stores/gameStore.svelte';
  import type { ClockState } from '$lib/types';
  import Confetti from '../Confetti.svelte';

  let clockData = $state<ClockState>({
    hour: 0,
    minute: 0,
    displayHour: 0,
    displayMinute: 0,
    options: []
  });

  // 누적 각도 관리를 위한 상태
  let hourAngle = $state(0);
  let minuteAngle = $state(0);

  let feedback = $state('');
  let isChecking = $state(false);
  let confettiRef: any = $state();
  const TOTAL_ROUNDS = 5;
  let round = $state(0);

  onMount(() => {
    nextQuestion();
  });

  function nextQuestion() {
    if (round >= TOTAL_ROUNDS) {
      gameStore.updateProgress(TOTAL_ROUNDS, TOTAL_ROUNDS);
      return;
    }
    
    const h = Math.floor(Math.random() * 12) + 1;
    const m = Math.floor(Math.random() * 12) * 5; 
    
    const correctStr = `${h}시 ${m === 0 ? '정각' : m + '분'}`;
    const options = new Set<string>([correctStr]);
    
    while (options.size < 4) {
      const rh = Math.floor(Math.random() * 12) + 1;
      const rm = Math.floor(Math.random() * 12) * 5;
      options.add(`${rh}시 ${rm === 0 ? '정각' : rm + '분'}`);
    }

    const targetMinBase = (m / 60) * 360;
    const targetHourBase = ((h % 12) / 12) * 360 + (m / 60) * 30;

    minuteAngle = minuteAngle + (targetMinBase - (minuteAngle % 360) + 360) % 360;
    hourAngle = hourAngle + (targetHourBase - (hourAngle % 360) + 360) % 360;

    clockData = {
      hour: h,
      minute: m,
      displayHour: h,
      displayMinute: m,
      options: Array.from(options).sort(() => Math.random() - 0.5)
    };
    
    feedback = '';
    isChecking = false;
    round += 1;
    gameStore.updateProgress(round - 1, TOTAL_ROUNDS);
  }

  function handleAnswer(choice: string) {
    if (isChecking) return;
    const correctStr = `${clockData.hour}시 ${clockData.minute === 0 ? '정각' : clockData.minute + '분'}`;
    isChecking = true;

    if (choice === correctStr) {
      feedback = '정답이에요! 시계를 잘 보네요! ⏰';
      gameStore.addScore(20, true);
      confettiRef?.fire();
      setTimeout(nextQuestion, 1500);
    } else {
      feedback = '시계 바늘을 다시 봐볼까요? 🧐';
      gameStore.addScore(0, false);
      setTimeout(() => {
        isChecking = false;
        feedback = '';
      }, 1500);
    }
  }
</script>

<Confetti bind:this={confettiRef} />

<!-- 간격 동일 조정을 위한 컨테이너 -->
<div class="flex flex-col items-center justify-around w-full max-w-4xl mx-auto flex-grow min-h-[60vh] gap-8 py-4">
  
  <!-- Clock Visual -->
  <div class="relative w-[35vh] h-[35vh] max-w-[280px] max-h-[280px] sm:w-72 sm:h-72 bg-white rounded-full border-8 border-deep-blue shadow-2xl flex items-center justify-center shrink-0">
    {#each Array(12) as _, i}
      <div 
        class="absolute w-full h-full text-center"
        style="transform: rotate({(i + 1) * 30}deg)"
      >
        <span 
          class="inline-block mt-2 font-black text-deep-blue text-xl sm:text-2xl"
          style="transform: rotate({-(i + 1) * 30}deg)"
        >
          {i + 1}
        </span>
      </div>
    {/each}

    <!-- Hands -->
    <div 
      class="absolute w-2.5 h-[30%] bg-deep-blue rounded-full origin-bottom bottom-1/2 transition-transform duration-1000 ease-out z-10"
      style="transform: rotate({hourAngle}deg)"
    ></div>
    <div 
      class="absolute w-1.5 h-[45%] bg-error rounded-full origin-bottom bottom-1/2 transition-transform duration-1000 ease-out z-20"
      style="transform: rotate({minuteAngle}deg)"
    ></div>
    
    <div class="absolute w-5 h-5 bg-deep-blue rounded-full z-30 shadow-md"></div>
  </div>

  <!-- Options (1행 4열 배치) -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full px-4 shrink-0">
    {#each clockData.options as option}
      <button
        onclick={() => handleAnswer(option)}
        disabled={isChecking}
        class="bg-white border-b-8 border-gray-300 rounded-3xl py-5 px-1 text-xl sm:text-2xl font-black text-deep-blue 
               hover:bg-accent-yellow hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-xl whitespace-nowrap"
      >
        {option}
      </button>
    {/each}
  </div>

  <!-- Feedback Area (공간 고정) -->
  <div class="h-12 flex items-center justify-center">
    {#if feedback}
      <div class="text-2xl sm:text-3xl font-black text-white text-center animate-bounce drop-shadow-lg">
        {feedback}
      </div>
    {/if}
  </div>
</div>
