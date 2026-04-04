<script lang="ts">
  import { gameStore } from '$lib/stores/gameStore.svelte';
  import type { GameMode } from '$lib/types';

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

  function selectGame(mode: GameMode) {
    gameStore.setMode(mode);
  }
</script>

<div class="flex flex-col items-center w-full max-w-6xl mx-auto p-4 select-none">
  <!-- Header with Mascot (너비 확장 및 줄바꿈 방지) -->
  <div class="flex items-center justify-center gap-4 sm:gap-10 mb-12 mt-8 w-full">
    <img src="/cat.png" alt="cat" class="h-16 sm:h-24 w-auto object-contain drop-shadow-lg shrink-0" />
    
    <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black text-white drop-shadow-[0_6px_6px_rgba(0,0,0,0.5)] tracking-tighter whitespace-nowrap">
      지호의 산수 여행
    </h1>
    
    <img src="/pngfind.com-sad-pepe-png-72825.png" alt="characters" class="h-16 sm:h-24 w-auto object-contain drop-shadow-lg shrink-0" />
  </div>

  <!-- Game Grid -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 w-full max-w-4xl">
    {#each games as game}
      <button 
        onclick={() => selectGame(game.mode)}
        class="flex flex-col items-center justify-center aspect-square p-2 sm:p-4 bg-white border-[3px] border-deep-blue rounded-[24px] shadow-xl hover:bg-bright-text hover:scale-105 active:scale-95 transition-all group"
      >
        <div class="text-4xl sm:text-5xl mb-2 group-hover:scale-110 transition-transform">{game.icon}</div>
        <span class="font-black text-deep-blue text-lg sm:text-xl whitespace-nowrap">{game.title}</span>
      </button>
    {/each}
  </div>

  <!-- Footer Mascot & Exit -->
  <div class="mt-12 flex flex-col items-center gap-6 opacity-80 pb-8">
      <button 
        onclick={() => {
          if (confirm('공부를 정말 마칠까요?')) {
            window.close();
            // window.close()가 작동하지 않을 경우를 대비한 안내
            alert('태블릿의 홈 버튼을 눌러 앱을 닫아주세요. 다음에 또 만나요!');
          }
        }}
        class="bg-red-500 hover:bg-red-600 text-white font-black py-3 px-8 rounded-2xl shadow-lg border-b-4 border-red-800 transition-all active:scale-95 active:border-b-0"
      >
        공부 끝내기 🚪
      </button>

      <div class="flex flex-col items-center opacity-60">
          <img src="/—Pngtree—a squatting tabby cat_5803660.png" alt="tabby cat" class="w-32 h-32 object-contain" />
          <p class="text-white text-sm font-bold mt-2">© 2026 지호의 산수 여행</p>
      </div>
  </div>
</div>
