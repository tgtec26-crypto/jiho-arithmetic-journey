<script lang="ts">
  import { gameStore } from '$lib/stores/gameStore.svelte';
  import { onMount } from 'svelte';
  import confetti from 'canvas-confetti';

  function goHome() {
    gameStore.setMode('menu');
  }

  function replay() {
    // 현재 모드를 유지한 채 세션 상태만 초기화
    gameStore.resetSession();
  }

  onMount(() => {
    // Grand celebration
    const end = Date.now() + 3 * 1000;
    const colors = ['#ffcc00', '#003366', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  });
</script>

<div class="flex flex-col items-center justify-center p-8 bg-white rounded-[40px] shadow-2xl border-b-[12px] border-deep-blue mx-4 text-center relative max-w-sm w-full animate-in fade-in zoom-in duration-500">
  <div class="text-6xl mb-6">🏆</div>
  <h2 class="text-4xl font-black text-deep-blue mb-4">참 잘했어요!</h2>
  
  <div class="bg-bright-text px-6 py-4 rounded-2xl mb-8 w-full">
    <p class="text-deep-blue/60 font-bold text-lg mb-1">최종 점수</p>
    <p class="text-5xl font-black text-deep-blue tracking-wider tabular-nums">{gameStore.score}점</p>
  </div>

  <div class="flex flex-col gap-4 w-full">
    <button 
      onclick={replay}
      class="w-full bg-success border-4 border-deep-blue rounded-2xl py-4 text-2xl font-black text-white hover:scale-105 active:scale-95 transition-all shadow-lg"
    >
      한 번 더 하기 🔄
    </button>

    <button 
      onclick={goHome}
      class="w-full bg-accent-yellow border-4 border-deep-blue rounded-2xl py-4 text-2xl font-black text-deep-blue hover:scale-105 active:scale-95 transition-all shadow-lg"
    >
      다른 공부하러 가기 🏠
    </button>
  </div>
</div>
