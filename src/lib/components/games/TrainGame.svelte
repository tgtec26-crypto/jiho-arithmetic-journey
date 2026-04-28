<script lang="ts">
  import { onMount } from 'svelte';
  import { gameStore } from '$lib/stores/gameStore.svelte';
  import Confetti from '../Confetti.svelte';

  let nums = $state<number[]>([0, 0, 0]);
  let sum = $state(0);
  let options = $state<number[]>([]);
  
  let movementClass = $state<'train-hidden' | 'train-entering' | 'train-leaving' | 'train-stopped'>('train-hidden');
  let feedback = $state('');
  let isChecking = $state(false);
  let wrongCount = $state(0);
  let confettiRef: any = $state();

  const TOTAL_ROUNDS = 5;
  let round = $state(0);

  onMount(() => {
    startNewRound();
  });

  function startNewRound() {
    if (round >= TOTAL_ROUNDS) {
      gameStore.updateProgress(TOTAL_ROUNDS, TOTAL_ROUNDS);
      return;
    }
    
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    const n3 = Math.floor(Math.random() * 9) + 1;
    const total = n1 + n2 + n3;

    nums = [n1, n2, n3];
    sum = total;

    const pool = new Set<number>([total]);
    while (pool.size < 4) {
      const val = Math.max(1, total + (Math.floor(Math.random() * 7) - 3));
      pool.add(val);
    }
    options = Array.from(pool).sort(() => Math.random() - 0.5);

    feedback = '';
    isChecking = false;
    wrongCount = 0;
    
    movementClass = 'train-hidden';
    
    setTimeout(() => {
      movementClass = 'train-entering';
      setTimeout(() => {
        movementClass = 'train-stopped';
      }, 4000);
    }, 100);

    round += 1;
    gameStore.updateProgress(round - 1, TOTAL_ROUNDS);
  }

  function handleAnswer(choice: number) {
    if (isChecking) return;
    
    if (movementClass !== 'train-stopped') {
      feedback = '새마을호가 도착할 때까지 잠시만 기다려주세요! 🚂';
      setTimeout(() => { if (feedback.includes('기다려')) feedback = ''; }, 1500);
      return;
    }

    if (choice === sum) {
      isChecking = true;
      feedback = '정답! 새마을호 출발! 🚂💨';
      gameStore.addScore(30, true);
      confettiRef?.fire();
      
      setTimeout(() => {
        movementClass = 'train-leaving'; 
      }, 500);

      setTimeout(startNewRound, 4000);
    } else {
      wrongCount += 1;
      feedback = '음, 다시 한번 더해볼까요? 🧐';
      if (wrongCount === 2) {
        gameStore.subtractScore(10);
      }
      setTimeout(() => {
        if (feedback.includes('더해볼까요')) feedback = '';
      }, 1500);
    }
  }
</script>

<Confetti bind:this={confettiRef} />

<div class="flex flex-col items-center justify-between w-full h-[calc(100vh-140px)] max-w-6xl mx-auto px-4 py-1 select-none overflow-hidden">
  
  <div class="text-center mt-1 mb-0">
    <h2 class="text-4xl sm:text-5xl font-black text-white drop-shadow-lg tracking-tight">새마을호 더하기</h2>
    <p class="text-accent-yellow font-bold text-lg sm:text-xl mt-0.5 text-balance">새마을호에 실린 숫자를 더해보세요!</p>
  </div>

  <div class="relative w-full flex-grow flex flex-col items-center justify-center min-h-0 -translate-y-[30px] pointer-events-none">
    <div class="relative w-[118.8%] max-w-[1710px] flex flex-col items-center pointer-events-auto">
      <!-- 움직이는 부분: 기차 이미지 + 숫자 카드 -->
      <div class="relative w-full {movementClass}">
        <!-- 기차 이미지 (가로 기준, 찌그러짐 방지) -->
        <img src="/train.png" alt="새마을호" class="w-full h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]" />

        <!-- 숫자 카드 (기차 비율에 맞춰 배치) -->
        <div class="absolute inset-0 flex items-center justify-center gap-[5%] sm:gap-[7.5%]" style="margin-top: 3%;">
          {#each nums as num}
            <div class="w-[7.68%] aspect-square bg-white border-2 sm:border-4 border-[#003366] rounded-xl flex items-center justify-center text-xl sm:text-4xl font-black text-[#003366] shadow-xl animate-in zoom-in duration-700">
              {num}
            </div>
          {/each}
        </div>
      </div>

      <!-- 철길 (기차 바퀴 아래 밀착, 고정) -->
      <div class="w-[85%] h-6 sm:h-10 mt-[-7%] sm:mt-[-8%] relative z-0">
        <div class="absolute top-1/2 left-0 w-full h-10 bg-black/40 -translate-y-1/2 blur-lg"></div>
        <div class="absolute top-0 w-full h-2 bg-gradient-to-b from-[#999] via-[#eee] to-[#666] shadow-sm"></div>
        <div class="absolute bottom-0 w-full h-2 bg-gradient-to-b from-[#999] via-[#eee] to-[#666] shadow-sm"></div>
        <div class="w-full h-full flex justify-between px-2">
          {#each Array(35) as _}
            <div class="w-2 sm:w-3 h-full bg-[#3E2723] rounded-sm shadow-md border-x border-black"></div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <div class="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-4 px-4 mb-2 relative z-30">
    {#each options as option}
      <button onclick={() => handleAnswer(option)} disabled={isChecking}
        class="bg-white border-b-8 border-gray-300 rounded-[30px] py-5 text-3xl sm:text-5xl font-black text-deep-blue shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
        {option}
      </button>
    {/each}
  </div>

  {#if feedback}
    <div class="fixed bottom-32 left-1/2 -translate-x-1/2 text-3xl sm:text-5xl font-black text-white text-center animate-bounce drop-shadow-2xl z-50 pointer-events-none">{feedback}</div>
  {/if}
</div>

<style>
  .train-hidden { transform: translateX(150%); }

  /* 초저속 진입 연출 (4초) */
  .train-entering {
    animation: entering-slow-bounce 4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .train-stopped { transform: translateX(0); }

  .train-leaving {
    animation: leaving-move 3.5s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards;
  }

  @keyframes entering-slow-bounce {
    0% { transform: translateX(150%); }
    85% { transform: translateX(0); } /* 85% 지점까지 천천히 미끄러짐 */
    92% { transform: translateX(-10px); } /* 덜컥! 부드럽게 쏠림 */
    100% { transform: translateX(0); }
  }

  @keyframes leaving-move {
    from { transform: translateX(0); }
    to { transform: translateX(-150%); }
  }
</style>
