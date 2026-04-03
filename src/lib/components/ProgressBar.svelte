<script lang="ts">
  import { gameStore } from '$lib/stores/gameStore.svelte';
</script>

<div class="w-full max-w-lg mx-auto px-4 mt-2 mb-4">
  <div class="w-full h-4 bg-white/20 rounded-full overflow-hidden border border-white/10 shadow-inner">
    <div 
      class="h-full bg-success transition-all duration-500 ease-out shadow-[0_0_10px_rgba(74,175,80,0.5)]"
      style="width: {gameStore.progress}%"
    ></div>
  </div>
</div>
