<script lang="ts">
  import { gameStore } from '$lib/stores/gameStore.svelte';
  import type { GameMode } from '$lib/types';
  import HistoryModal from './HistoryModal.svelte';
  import SuccessModal from './SuccessModal.svelte';

  const games = [
    { mode: 'addition' as GameMode, icon: '+' },
    { mode: 'subtraction' as GameMode, icon: '−' },
    { mode: 'multiplication' as GameMode, icon: '×' },
    { mode: 'division' as GameMode, icon: '÷' },
    { mode: 'spider' as GameMode, icon: '🕷️' },
    { mode: 'clock' as GameMode, icon: '⏰' },
    { mode: 'compare' as GameMode, icon: '⚖️' },
    { mode: 'money' as GameMode, icon: '💰' },
    { mode: 'train' as GameMode, icon: '🚂' },
    { mode: 'ktx' as GameMode, icon: '🚅' },
    { mode: 'itx' as GameMode, icon: '🚆' },
    { mode: 'fraction' as GameMode, icon: '🍕' },
    { mode: 'motor' as GameMode, icon: '⚙️' }
  ];

  let showHistory = $state(false);
  let showSuccess = $state(false);
  let lastSavedScore = $state(0);

  function selectGame(mode: GameMode) {
    gameStore.setMode(mode);
  }

  function handleSaveRecord() {
    const score = gameStore.saveCurrentRecord();
    if (score > 0) {
      lastSavedScore = score;
      showSuccess = true;
    } else {
      alert('먼저 공부를 해서 점수를 얻어볼까요? 😊');
    }
  }
</script>

<div class="flex flex-col items-center w-full max-w-6xl mx-auto p-4 select-none min-h-screen">
  <!-- Header -->
  <div class="flex items-center justify-center gap-4 sm:gap-10 mb-8 mt-6 w-full">
    <img src="/cat.png" alt="cat" class="h-16 sm:h-24 w-auto object-contain drop-shadow-lg shrink-0" />
    <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black text-white drop-shadow-[0_6px_6px_rgba(0,0,0,0.5)] tracking-tighter whitespace-nowrap">
      지호의 산수 여행
    </h1>
    <img src="/pngfind.com-sad-pepe-png-72825.png" alt="characters" class="h-16 sm:h-24 w-auto object-contain drop-shadow-lg shrink-0" />
  </div>

  <!-- Squircle App Grid (6 columns, half gap) -->
  <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 w-full max-w-4xl px-4">
    {#each games as game}
      <button 
        onclick={() => selectGame(game.mode)}
        class="group relative flex flex-col items-center transition-all duration-200 active:scale-90"
      >
        <!-- 진짜 스쿼클 (곡률 22%로 팽팽하게 조정) -->
        <div class="squircle w-full aspect-square bg-[#4D96FF] flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all overflow-hidden">
          <!-- 기호/이모지 120% 확대 (사칙연산 기호만 독립적으로 위로 10px 이동) -->
          <div class="
            {['+', '−', '×', '÷'].includes(game.icon) ? 'text-white text-8xl sm:text-[7rem] translate-y-[-10px]' : 'text-7xl sm:text-[6rem]'} 
            font-black leading-[0] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 drop-shadow-md
          ">
            {game.icon}
          </div>
        </div>
      </button>
    {/each}
  </div>

  <!-- Footer -->
  <div class="mt-10 flex flex-col items-center gap-6 opacity-95 pb-12 w-full max-w-md">
      <div class="flex gap-4 w-full">
        <button 
          onclick={handleSaveRecord}
          class="flex-grow bg-blue-500/90 backdrop-blur-sm text-white font-black py-4 px-4 rounded-[2rem] shadow-xl border-b-4 border-blue-800 transition-all active:scale-95 active:border-b-0"
        >
          기록 남기기 ✍️
        </button>
        <button 
          onclick={() => showHistory = true}
          class="flex-grow bg-purple-500/90 backdrop-blur-sm text-white font-black py-4 px-4 rounded-[2rem] shadow-xl border-b-4 border-purple-800 transition-all active:scale-95 active:border-b-0"
        >
          기록 보기 📜
        </button>
      </div>

      <div class="flex flex-col items-center opacity-60 mt-4">
          <p class="text-white text-sm font-bold mt-2">© 2026 지호의 산수 여행</p>
      </div>
  </div>
</div>

{#if showHistory}
  <HistoryModal onClose={() => showHistory = false} />
{/if}

{#if showSuccess}
  <SuccessModal score={lastSavedScore} onClose={() => showSuccess = false} />
{/if}

<style>
  /* 이미지와 가장 흡사한 팽팽한 Squircle 구현 */
  .squircle {
    border-radius: 22% / 22%; /* 팽팽한 곡선 비율 */
    position: relative;
    border-top: 1px solid rgba(255,255,255,0.3); /* 아주 미세한 상단 라인만 남김 */
  }

  /* 모든 잔상 및 반투명미지 효과 제거 */
  .squircle::after, .squircle::before {
    display: none !important;
  }
</style>
