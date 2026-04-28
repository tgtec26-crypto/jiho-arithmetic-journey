<script lang="ts">
  import { onMount } from 'svelte';
  import { gameStore } from '$lib/stores/gameStore.svelte';
  import Confetti from '../Confetti.svelte';

  let nums = $state<number[]>([0, 0, 0]);
  let sum = $state(0);
  let options = $state<number[]>([]);
  
  let movementClass = $state<'itx-hidden' | 'itx-entering' | 'itx-leaving' | 'itx-stopped'>('itx-hidden');
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
    
    movementClass = 'itx-hidden';
    
    setTimeout(() => {
      movementClass = 'itx-entering';
      setTimeout(() => {
        movementClass = 'itx-stopped';
      }, 3000);
    }, 100);

    round += 1;
    gameStore.updateProgress(round - 1, TOTAL_ROUNDS);
  }

  function handleAnswer(choice: number) {
    if (isChecking) return;
    
    if (movementClass !== 'itx-stopped') {
      feedback = 'ITX가 도착할 때까지 잠시만 기다려주세요! 🚆';
      setTimeout(() => { if (feedback.includes('기다려')) feedback = ''; }, 1500);
      return;
    }

    if (choice === sum) {
      isChecking = true;
      feedback = '정답! ITX-청춘 출발! 🚆💨';
      gameStore.addScore(30, true);
      confettiRef?.fire();
      
      setTimeout(() => {
        movementClass = 'itx-leaving'; 
      }, 500);

      setTimeout(startNewRound, 3500);
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
    <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white drop-shadow-lg tracking-tight">ITX 청춘 더하기</h2>
    <p class="text-accent-yellow font-bold text-lg sm:text-xl mt-0.5 text-balance">ITX-청춘에 실린 숫자를 더해보세요!</p>
  </div>

  <div class="relative w-full flex-grow flex flex-col items-center justify-center min-h-0 -translate-y-[60px] pointer-events-none">
    <div class="relative w-[100%] max-w-[1320px] flex flex-col items-center pointer-events-auto">
      <!-- 움직이는 부분: 기차 이미지 + 숫자 카드 -->
      <div class="relative w-full {movementClass}">
        <!-- ITX 기차 이미지 -->
        <img src="/itx.png" alt="ITX-청춘" class="w-full h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]" />

        <!-- 숫자 카드 (기차 몸체 위치에 맞춰 15px 상단으로 조정) -->
        <div class="absolute inset-0 flex items-center justify-center gap-[5%] sm:gap-[7.5%] translate-y-[5px]" style="margin-top: 3%;">
          {#each nums as num}
            <div class="w-[10.2%] aspect-square bg-white border-2 sm:border-4 border-[#006400] rounded-xl flex items-center justify-center text-3xl sm:text-5xl font-black text-[#006400] shadow-xl animate-in zoom-in duration-700">
              {num}
            </div>
          {/each}
        </div>
      </div>

      <!-- 철길 (기차 바퀴 위치에 맞춰 30px 하단으로 이동, 고정) -->
      <div class="w-[110%] h-6 sm:h-10 mt-[-2%] sm:mt-[-3%] relative z-0 translate-y-[30px]">
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
        class="bg-white border-b-8 border-gray-300 rounded-[30px] py-4 text-3xl sm:text-5xl font-black text-deep-blue shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
        {option}
      </button>
    {/each}
  </div>

  {#if feedback}
    <div class="fixed bottom-32 left-1/2 -translate-x-1/2 text-3xl sm:text-5xl font-black text-white text-center animate-bounce drop-shadow-2xl z-50 pointer-events-none">{feedback}</div>
  {/if}
</div>

<style>
  .itx-hidden { transform: translateX(150%); }

  .itx-entering {
    animation: entering-move 3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .itx-stopped { transform: translateX(0); }

  .itx-leaving {
    animation: leaving-move 3s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards;
  }

  @keyframes entering-move {
    0% { transform: translateX(150%); }
    100% { transform: translateX(0); }
  }

  @keyframes leaving-move {
    from { transform: translateX(0); }
    to { transform: translateX(-150%); }
  }
</style>
