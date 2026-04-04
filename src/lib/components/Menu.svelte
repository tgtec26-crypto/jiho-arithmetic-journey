<script lang="ts">
  import { gameStore } from '$lib/stores/gameStore.svelte';
  import type { GameMode } from '$lib/types';
  import HistoryModal from './HistoryModal.svelte';

  const games = [
    { mode: 'addition' as GameMode, title: '더하기', icon: '➕', color: 'bg-blue-400' },
    { mode: 'subtraction' as GameMode, title: '빼기', icon: '➖', color: 'bg-red-400' },
    { mode: 'multiplication' as GameMode, title: '곱하기', icon: '✖️', color: 'bg-yellow-400' },
    { mode: 'division' as GameMode, title: '나누기', icon: '➗', color: 'bg-green-400' },
    { mode: 'spider' as GameMode, title: '거미 더하기', icon: '🕷️', color: 'bg-purple-400' },
    { mode: 'clock' as GameMode, title: '시계 읽기', icon: '⏰', color: 'bg-pink-400' },
    { mode: 'compare' as GameMode, title: '크기 비교', icon: '⚖️', color: 'bg-indigo-400' },
    { mode: 'money' as GameMode, title: '돈 세기', icon: '💰', color: 'bg-orange-400' }
  ];

  let showHistory = $state(false);

  function selectGame(mode: GameMode) {
    gameStore.setMode(mode);
  }
</script>

<div class="flex flex-col items-center w-full max-w-6xl mx-auto p-4 select-none">
  <!-- Header with Mascot -->
  <div class="flex items-center justify-center gap-4 sm:gap-10 mb-8 mt-6 w-full">
    <img src="/cat.png" alt="cat" class="h-16 sm:h-24 w-auto object-contain drop-shadow-lg shrink-0" />
    
    <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black text-white drop-shadow-[0_6px_6px_rgba(0,0,0,0.5)] tracking-tighter whitespace-nowrap">
      지호의 산수 여행
    </h1>
    
    <img src="/pngfind.com-sad-pepe-png-72825.png" alt="characters" class="h-16 sm:h-24 w-auto object-contain drop-shadow-lg shrink-0" />
  </div>

  <!-- Game Grid -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl">
    {#each games as game}
      <button 
        onclick={() => selectGame(game.mode)}
        class="flex flex-col items-center justify-center py-4 sm:py-6 px-2 bg-white border-[3px] border-deep-blue rounded-[24px] shadow-xl hover:bg-bright-text hover:scale-105 active:scale-95 transition-all group"
      >
        <div class="text-4xl sm:text-5xl mb-2 group-hover:scale-125 transition-transform">{game.icon}</div>
        <span class="font-black text-deep-blue text-lg sm:text-xl whitespace-nowrap">{game.title}</span>
      </button>
    {/each}
  </div>

  <!-- Footer Controls & Mascot -->
  <div class="mt-8 flex flex-col items-center gap-6 opacity-90 pb-8 w-full max-w-md">
      
      <!-- 학습 기록 관리 버튼 그룹 -->
      <div class="flex gap-4 w-full">
        <button 
          onclick={() => gameStore.saveCurrentRecord()}
          class="flex-grow bg-blue-500 hover:bg-blue-600 text-white font-black py-4 px-4 rounded-2xl shadow-lg border-b-4 border-blue-800 transition-all active:scale-95 active:border-b-0"
        >
          기록 남기기 ✍️
        </button>
        <button 
          onclick={() => showHistory = true}
          class="flex-grow bg-purple-500 hover:bg-purple-600 text-white font-black py-4 px-4 rounded-2xl shadow-lg border-b-4 border-purple-800 transition-all active:scale-95 active:border-b-0"
        >
          기록 보기 📜
        </button>
      </div>

      <div class="flex flex-col items-center opacity-60 mt-2">
          <p class="text-white text-sm font-bold mt-2">© 2026 지호의 산수 여행</p>
      </div>
  </div>
</div>

{#if showHistory}
  <HistoryModal onClose={() => showHistory = false} />
{/if}
