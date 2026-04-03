<script lang="ts">
  import { gameStore } from '$lib/stores/gameStore.svelte';
  
  function goHome() {
    gameStore.setMode('menu');
  }
</script>

<header class="flex justify-between items-center px-4 py-4 w-full max-w-lg mx-auto bg-deep-blue">
  <button 
    onclick={goHome}
    class="flex items-center gap-2 text-bright-text font-bold hover:text-accent-yellow transition-colors"
    aria-label="메뉴로 돌아가기"
  >
    <span class="text-2xl">🏠</span>
    <span class="hidden sm:inline">처음으로</span>
  </button>
  
  <div class="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/20">
    <span class="text-accent-yellow text-xl">⭐</span>
    <span class="text-xl font-black text-white tracking-wider tabular-nums">
      {gameStore.score}
    </span>
  </div>
</header>

<style>
  /* Optional: Additional styles if Tailwind isn't enough */
</style>
