<script lang="ts">
  import { gameStore } from '$lib/stores/gameStore.svelte';
  import { fade, fly } from 'svelte/transition';

  interface Props {
    onClose: () => void;
  }
  let { onClose }: Props = $props();
</script>

<div 
  class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
  transition:fade={{ duration: 200 }}
>
  <div 
    class="bg-white rounded-[40px] shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden border-b-[12px] border-deep-blue"
    transition:fly={{ y: 50, duration: 300 }}
  >
    <!-- Header -->
    <div class="bg-deep-blue p-6 text-center relative">
      <h2 class="text-3xl font-black text-white">학습 기록 📜</h2>
      <button 
        onclick={onClose}
        class="absolute right-6 top-1/2 -translate-y-1/2 text-white text-3xl hover:scale-110 transition-transform"
      >
        ✕
      </button>
    </div>

    <!-- Content -->
    <div class="flex-grow overflow-y-auto p-6 space-y-4">
      {#if gameStore.history.length === 0}
        <div class="flex flex-col items-center justify-center py-12 text-gray-400 italic">
          <span class="text-6xl mb-4">✍️</span>
          <p>아직 기록이 없어요.<br>공부를 시작해볼까요?</p>
        </div>
      {:else}
        {#each gameStore.history as record}
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 shadow-sm hover:border-accent-yellow transition-colors">
            <div class="flex flex-col">
              <span class="text-xs text-gray-400 font-bold">{record.date}</span>
              <span class="text-xl font-black text-deep-blue mt-1">⭐ {record.score}점</span>
            </div>
            <div class="bg-accent-yellow/20 px-3 py-1 rounded-full">
              <span class="text-deep-blue font-black text-sm">정답 {record.correctAnswers}개</span>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <!-- Footer -->
    <div class="p-6 bg-gray-50 flex gap-3">
      <button 
        onclick={() => gameStore.clearHistory()}
        class="flex-grow bg-gray-200 text-gray-600 font-black py-3 rounded-2xl hover:bg-red-100 hover:text-red-600 transition-colors"
      >
        기록 지우기
      </button>
      <button 
        onclick={onClose}
        class="flex-grow bg-deep-blue text-white font-black py-3 rounded-2xl hover:brightness-110 transition-all"
      >
        닫기
      </button>
    </div>
  </div>
</div>
