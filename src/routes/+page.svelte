<script lang="ts">
  import { onMount } from 'svelte';
  import { gameStore } from '$lib/stores/gameStore.svelte';
  import Header from '$lib/components/Header.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import Menu from '$lib/components/Menu.svelte';
  import ResultScreen from '$lib/components/ResultScreen.svelte';
  
  // Games
  import ArithmeticGame from '$lib/components/games/ArithmeticGame.svelte';
  import ClockGame from '$lib/components/games/ClockGame.svelte';
  import CompareGame from '$lib/components/games/CompareGame.svelte';
  import SpiderGame from '$lib/components/games/SpiderGame.svelte';
  import MoneyGame from '$lib/components/games/MoneyGame.svelte';
  import TrainGame from '$lib/components/games/TrainGame.svelte';

  // Computed values for current game view
  const isMenu = $derived(gameStore.currentMode === 'menu');
  const isCompleted = $derived(gameStore.isCompleted);

  // 브라우저 히스토리 관리
  onMount(() => {
    if (!history.state) {
      history.replaceState({ mode: 'menu' }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.mode) {
        gameStore.setMode(event.state.mode);
      } else {
        gameStore.setMode('menu');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  });

  $effect(() => {
    const mode = gameStore.currentMode;
    if (history.state?.mode !== mode) {
      history.pushState({ mode }, '', `#${mode}`);
    }
  });
</script>

<main class="flex flex-col min-h-screen pb-4">
  {#if isMenu}
    <div class="mt-4">
      <Menu />
    </div>
  {:else if isCompleted}
    <div class="flex-grow flex items-center justify-center pt-4">
      <ResultScreen />
    </div>
  {:else}
    <Header />
    <ProgressBar />
    
    <div class="flex-grow flex flex-col items-center justify-center">
      {#if ['addition', 'subtraction', 'multiplication', 'division'].includes(gameStore.currentMode)}
        <ArithmeticGame />
      {:else if gameStore.currentMode === 'clock'}
        <ClockGame />
      {:else if gameStore.currentMode === 'compare'}
        <CompareGame />
      {:else if gameStore.currentMode === 'spider'}
        <SpiderGame />
      {:else if gameStore.currentMode === 'money'}
        <MoneyGame />
      {:else if gameStore.currentMode === 'train'}
        <TrainGame />
      {/if}
    </div>
  {/if}
</main>

<style>
  :global(body) {
    background-color: var(--color-deep-blue);
    background-image: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 30px 30px;
  }
</style>
