<script lang="ts">
  import { gameStore } from '$lib/stores/gameStore.svelte';
  
  function goHome() {
    gameStore.setMode('menu');
  }
</script>

<header class="flex justify-between items-center px-6 py-4 w-full bg-deep-blue/80 backdrop-blur-md sticky top-0 z-50">
  <button 
    onclick={goHome}
    class="flex items-center gap-2 group"
    aria-label="메뉴로 돌아가기"
  >
    <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-accent-yellow/30 transition-all">
      🏠
    </div>
    <div class="flex flex-col items-start leading-none">
      <span class="text-xs text-white/60 font-medium">HOME</span>
      <span class="text-xl font-bold text-white group-hover:text-accent-yellow transition-colors">지호의 산수 여행</span>
    </div>
  </button>
  
  <div class="flex items-center gap-4 bg-white/10 px-6 py-2.5 rounded-2xl border border-white/20 shadow-lg">
    <div class="flex flex-col items-end leading-none">
      <span class="text-[10px] text-white/50 font-bold uppercase tracking-widest">Total Score</span>
      <span class="text-2xl font-black text-accent-yellow tracking-wider tabular-nums">
        {gameStore.score.toLocaleString()}
      </span>
    </div>
    <div class="w-10 h-10 bg-accent-yellow/20 rounded-full flex items-center justify-center text-xl">
      ⭐
    </div>
  </div>
</header>

<style>
  /* Optional: Additional styles if Tailwind isn't enough */
</style>
