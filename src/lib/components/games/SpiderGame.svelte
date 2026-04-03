<script lang="ts">
  import { onMount } from 'svelte';
  import { gameStore } from '$lib/stores/gameStore.svelte';
  import Confetti from '../Confetti.svelte';

  interface SpiderWeb {
    target: number;
    slots: number[]; 
    isProvided: boolean[]; 
  }

  let webs = $state<SpiderWeb[]>([
    { target: 0, slots: [0, 0, 0, 0], isProvided: [true, false, false, true] },
    { target: 0, slots: [0, 0, 0, 0], isProvided: [true, false, false, true] }
  ]);

  let bank = $state<number[]>([]);
  let feedback = $state('');
  let isChecking = $state(false);
  let confettiRef: any = $state();
  
  let draggingValue = $state<number | null>(null);
  let draggingBankIndex = $state<number | null>(null);
  let errorSlot = $state<{wIdx: number, sIdx: number} | null>(null);
  let successSlot = $state<{wIdx: number, sIdx: number} | null>(null);
  let hoverSlot = $state<{wIdx: number, sIdx: number} | null>(null);

  const TOTAL_ROUNDS = 3;
  let round = $state(0);

  onMount(() => {
    nextQuestion();
  });

  function generateWeb(): SpiderWeb {
    const target = Math.floor(Math.random() * 7) + 4; 
    const val11 = Math.floor(Math.random() * (target - 1)) + 1;
    const val7 = Math.floor(Math.random() * (target - 1)) + 1;
    return {
      target,
      slots: [val11, 0, 0, val7],
      isProvided: [true, false, false, true]
    };
  }

  function nextQuestion() {
    if (round >= TOTAL_ROUNDS) {
      gameStore.updateProgress(TOTAL_ROUNDS, TOTAL_ROUNDS);
      return;
    }
    
    webs = [generateWeb(), generateWeb()];
    const answers: number[] = [];
    webs.forEach(web => {
      answers.push(web.target - web.slots[3]); 
      answers.push(web.target - web.slots[0]); 
    });

    bank = answers.sort(() => Math.random() - 0.5);
    feedback = '';
    isChecking = false;
    errorSlot = null;
    successSlot = null;
    hoverSlot = null;
    round += 1;
    gameStore.updateProgress(round - 1, TOTAL_ROUNDS);
  }

  function handleDragStart(num: number, index: number) {
    if (isChecking) return;
    draggingValue = num;
    draggingBankIndex = index;
  }

  function handleDragOver(e: DragEvent, wIdx: number, sIdx: number) {
    e.preventDefault();
    if (!isChecking && draggingValue !== null) {
      hoverSlot = { wIdx, sIdx };
    }
  }

  function handleDragLeave() {
    hoverSlot = null;
  }

  function handleDrop(webIndex: number, slotIndex: number) {
    if (isChecking || draggingValue === null || draggingBankIndex === null) {
      hoverSlot = null;
      return;
    }

    const web = webs[webIndex];
    let isCorrect = false;

    if (slotIndex === 1) { 
      isCorrect = (web.slots[3] + draggingValue === web.target);
    } else if (slotIndex === 2) { 
      isCorrect = (web.slots[0] + draggingValue === web.target);
    }

    if (isCorrect) {
      web.slots[slotIndex] = draggingValue;
      bank.splice(draggingBankIndex, 1);
      errorSlot = null;
      successSlot = { wIdx: webIndex, sIdx: slotIndex };
      setTimeout(() => {
        if (successSlot?.wIdx === webIndex && successSlot?.sIdx === slotIndex) {
          successSlot = null;
        }
      }, 600);
      checkWin();
    } else {
      errorSlot = { wIdx: webIndex, sIdx: slotIndex };
      setTimeout(() => {
        if (errorSlot?.wIdx === webIndex && errorSlot?.sIdx === slotIndex) {
          errorSlot = null;
        }
      }, 500);
    }

    draggingValue = null;
    draggingBankIndex = null;
    hoverSlot = null;
  }

  function handleSlotClick(webIndex: number, slotIndex: number) {
    if (isChecking || webs[webIndex].isProvided[slotIndex] || webs[webIndex].slots[slotIndex] === 0) return;
    
    const num = webs[webIndex].slots[slotIndex];
    webs[webIndex].slots[slotIndex] = 0;
    bank.push(num);
    bank = [...bank].sort(() => Math.random() - 0.5);
  }

  function checkWin() {
    const allFilled = webs.every(web => web.slots[1] !== 0 && web.slots[2] !== 0);
    if (!allFilled) return;

    isChecking = true;
    feedback = '우와! 모두 완성했어요! 🕷️✨';
    gameStore.addScore(50, true);
    confettiRef?.fire();
    setTimeout(nextQuestion, 2000);
  }
</script>

<Confetti bind:this={confettiRef} />

<!-- 갤럭시 탭 S6 최적화 레이아웃 컨테이너 -->
<div class="flex flex-col items-center justify-around w-full h-[calc(100vh-140px)] max-w-6xl mx-auto px-4 py-2 select-none overflow-hidden">
  
  <!-- 제목 (공간 절약을 위해 컴팩트하게) -->
  <div class="text-center">
      <h2 class="text-4xl sm:text-5xl font-black text-white drop-shadow-lg tracking-tight">거미 더하기</h2>
  </div>

  <!-- 거미줄 영역 (탭 화면 비율에 맞춰 자동 크기 조절) -->
  <div class="flex items-center justify-center gap-8 sm:gap-16 lg:gap-24 w-full flex-grow min-h-0">
    {#each webs as web, wIdx}
      <div class="relative w-[35vh] h-[35vh] max-w-[280px] max-h-[280px] sm:w-[40vh] sm:h-[40vh]">
        <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-50" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="white" stroke-width="1.2" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="white" stroke-width="1.2" />
          <line x1="18" y1="18" x2="82" y2="82" stroke="white" stroke-width="2.5" />
          <line x1="18" y1="82" x2="82" y2="18" stroke="white" stroke-width="2.5" />
        </svg>
        
        <!-- Target -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="w-[12vh] h-[12vh] max-w-[84px] max-h-[84px] bg-[#ffc299] border-4 border-white rounded-full flex items-center justify-center text-3xl sm:text-5xl font-black text-deep-blue shadow-xl z-10">
            {web.target}
          </div>
        </div>

        <!-- Slots -->
        {#each web.slots as slot, sIdx}
          {@const isProv = web.isProvided[sIdx]}
          {@const isError = errorSlot?.wIdx === wIdx && errorSlot?.sIdx === sIdx}
          {@const isSuccess = successSlot?.wIdx === wIdx && successSlot?.sIdx === sIdx}
          {@const isHover = hoverSlot?.wIdx === wIdx && hoverSlot?.sIdx === sIdx}
          {@const pos = [
            {t: '18%', l: '18%'}, // 11시
            {t: '18%', l: '82%'}, // 1시
            {t: '82%', l: '82%'}, // 5시
            {t: '82%', l: '18%'}  // 7시
          ][sIdx]}
          
          {#if isProv}
            <div class="absolute w-[8vh] h-[8vh] max-w-[60px] max-h-[60px] bg-[#fffbbd] border-4 border-white rounded-full flex items-center justify-center font-black text-xl sm:text-3xl text-deep-blue shadow-lg pointer-events-none"
              style="top: {pos.t}; left: {pos.l}; transform: translate(-50%, -50%);">
              {slot}
            </div>
          {:else}
            <div 
              role="button"
              tabindex="0"
              ondragover={(e) => handleDragOver(e, wIdx, sIdx)}
              ondrop={() => handleDrop(wIdx, sIdx)}
              ondragleave={handleDragLeave}
              onclick={() => handleSlotClick(wIdx, sIdx)}
              onkeydown={(e) => e.key === 'Enter' && handleSlotClick(wIdx, sIdx)}
              class="absolute w-[12vh] h-[12vh] max-w-[90px] max-h-[90px] flex items-center justify-center z-20 cursor-pointer outline-none group"
              style="top: {pos.t}; left: {pos.l}; transform: translate(-50%, -50%);"
            >
              <div class="w-[8vh] h-[8vh] max-w-[60px] max-h-[60px] rounded-full flex items-center justify-center font-black text-xl sm:text-3xl transition-all shadow-md
                     {slot ? 'bg-white text-deep-blue border-4 border-white' : 'bg-white/10 text-transparent border-4 border-dashed border-white/40'}
                     {isError ? 'shake-error' : ''}
                     {isSuccess ? 'pop-success' : ''}
                     {isHover && !slot ? 'bg-white/40 border-solid scale-110' : ''}
                     {!slot && !isChecking ? 'group-hover:bg-white/20' : ''}">
                {slot || '?'}
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {/each}
  </div>

  <!-- Number Bank (탭 하단 공간에 맞춰 여유있게 배치) -->
  <div class="w-full max-w-2xl bg-white/10 p-4 sm:p-6 rounded-[40px] border-4 border-white/20 backdrop-blur-md shadow-2xl mb-4">
      <div class="flex justify-center gap-6 sm:gap-12">
          {#each bank as num, i}
              <div 
                draggable="true"
                ondragstart={() => handleDragStart(num, i)}
                class="w-[8vh] h-[8vh] max-w-[65px] max-h-[65px] sm:w-[10vh] sm:h-[10vh] sm:max-w-[80px] sm:max-h-[80px] bg-white border-b-8 border-gray-300 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-black text-deep-blue shadow-xl cursor-grab active:cursor-grabbing hover:scale-110 transition-all"
              >
                  {num}
              </div>
          {/each}
      </div>
  </div>

  {#if feedback}
    <div class="fixed bottom-32 left-1/2 -translate-x-1/2 text-3xl sm:text-5xl font-black text-white text-center animate-bounce drop-shadow-2xl z-50 pointer-events-none">
      {feedback}
    </div>
  {/if}
</div>

<style>
  .shake-error {
    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
    border-color: #FF4D4D !important;
    background-color: #FF4D4D !important;
    color: white !important;
  }

  .pop-success {
    animation: pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
  }

  @keyframes shake {
    10%, 90% { transform: scale(1) translate(-2px, 0); }
    20%, 80% { transform: scale(1) translate(2px, 0); }
    30%, 50%, 70% { transform: scale(1) translate(-4px, 0); }
    40%, 60% { transform: scale(1) translate(4px, 0); }
  }

  @keyframes pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
</style>
