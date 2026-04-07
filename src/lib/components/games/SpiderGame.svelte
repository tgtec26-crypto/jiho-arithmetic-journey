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
  
  // Drag State
  let draggingValue = $state<number | null>(null);
  let draggingBankIndex = $state<number | null>(null);
  let touchActive = $state(false);
  let touchPos = $state({ x: 0, y: 0 });
  
  let errorSlot = $state<{wIdx: number, sIdx: number} | null>(null);
  let successSlot = $state<{wIdx: number, sIdx: number} | null>(null);
  let hoverSlot = $state<{wIdx: number, sIdx: number} | null>(null);
  let wrongCount = $state(0);

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
    wrongCount = 0;
    round += 1;
    gameStore.updateProgress(round - 1, TOTAL_ROUNDS);
  }

  // --- Native Drag Handlers ---
  function handleDragStart(num: number, index: number) {
    if (isChecking) return;
    draggingValue = num;
    draggingBankIndex = index;
  }

  function handleDragOver(e: DragEvent | TouchEvent, wIdx: number, sIdx: number) {
    if (e instanceof DragEvent) e.preventDefault();
    if (!isChecking && draggingValue !== null) {
      hoverSlot = { wIdx, sIdx };
    }
  }

  function handleDrop(webIndex: number, slotIndex: number) {
    if (isChecking || draggingValue === null || draggingBankIndex === null) {
      hoverSlot = null;
      return;
    }
    processDrop(webIndex, slotIndex);
  }

  // --- Touch Handlers ---
  function handleTouchStart(e: TouchEvent, num: number, index: number) {
    if (isChecking) return;
    draggingValue = num;
    draggingBankIndex = index;
    touchActive = true;
    updateTouchPos(e);
  }

  function handleTouchMove(e: TouchEvent) {
    if (!touchActive || draggingValue === null) return;
    e.preventDefault(); // Prevent scroll while dragging
    updateTouchPos(e);

    // Find if touching a slot
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const slotEl = target?.closest('[data-slot]');
    
    if (slotEl) {
      const wIdx = parseInt(slotEl.getAttribute('data-widx') || '-1');
      const sIdx = parseInt(slotEl.getAttribute('data-sidx') || '-1');
      if (wIdx !== -1 && sIdx !== -1) {
        hoverSlot = { wIdx, sIdx };
      } else {
        hoverSlot = null;
      }
    } else {
      hoverSlot = null;
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (!touchActive || draggingValue === null || draggingBankIndex === null) return;
    
    if (hoverSlot) {
      processDrop(hoverSlot.wIdx, hoverSlot.sIdx);
    }

    touchActive = false;
    draggingValue = null;
    draggingBankIndex = null;
    hoverSlot = null;
  }

  function updateTouchPos(e: TouchEvent) {
    const touch = e.touches[0];
    touchPos = { x: touch.clientX, y: touch.clientY };
  }

  // --- Core Game Logic ---
  function processDrop(webIndex: number, slotIndex: number) {
    const web = webs[webIndex];
    let isCorrect = false;

    if (slotIndex === 1) { 
      isCorrect = (web.slots[3] + draggingValue! === web.target);
    } else if (slotIndex === 2) { 
      isCorrect = (web.slots[0] + draggingValue! === web.target);
    }

    if (isCorrect) {
      web.slots[slotIndex] = draggingValue!;
      bank.splice(draggingBankIndex!, 1);
      errorSlot = null;
      successSlot = { wIdx: webIndex, sIdx: slotIndex };
      setTimeout(() => {
        if (successSlot?.wIdx === webIndex && successSlot?.sIdx === slotIndex) {
          successSlot = null;
        }
      }, 600);
      checkWin();
    } else {
      wrongCount += 1;
      errorSlot = { wIdx: webIndex, sIdx: slotIndex };
      if (wrongCount === 2) {
        gameStore.subtractScore(10);
      }
      setTimeout(() => {
        if (errorSlot?.wIdx === webIndex && errorSlot?.sIdx === slotIndex) {
          errorSlot = null;
        }
      }, 500);
    }
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

<!-- 메인 컨테이너: h-[calc(100vh-160px)] 정도로 조절하여 스크롤 방지 -->
<div class="flex flex-col items-center justify-between w-full h-[calc(100vh-140px)] max-w-6xl mx-auto px-4 py-1 select-none overflow-hidden touch-none">
  
  <div class="text-center py-1">
      <h2 class="text-3xl sm:text-4xl font-black text-white drop-shadow-lg tracking-tight">거미 더하기</h2>
  </div>

  <div class="flex items-center justify-center gap-4 sm:gap-12 lg:gap-20 w-full flex-grow min-h-0">
    {#each webs as web, wIdx}
      <div class="relative w-[30vh] h-[30vh] max-w-[240px] max-h-[240px] sm:w-[35vh] sm:h-[35vh]">
        <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="white" stroke-width="1.2" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="white" stroke-width="1.2" />
          <line x1="18" y1="18" x2="82" y2="82" stroke="white" stroke-width="2.5" />
          <line x1="18" y1="82" x2="82" y2="18" stroke="white" stroke-width="2.5" />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="w-[10vh] h-[10vh] max-w-[70px] max-h-[70px] bg-[#ffc299] border-4 border-white rounded-full flex items-center justify-center text-3xl sm:text-4xl font-black text-deep-blue shadow-xl z-10">
            {web.target}
          </div>
        </div>
        {#each web.slots as slot, sIdx}
          {@const isProv = web.isProvided[sIdx]}
          {@const isError = errorSlot?.wIdx === wIdx && errorSlot?.sIdx === sIdx}
          {@const isSuccess = successSlot?.wIdx === wIdx && successSlot?.sIdx === sIdx}
          {@const isHover = hoverSlot?.wIdx === wIdx && hoverSlot?.sIdx === sIdx}
          {@const pos = [{t: '18%', l: '18%'}, {t: '18%', l: '82%'}, {t: '82%', l: '82%'}, {t: '82%', l: '18%'}][sIdx]}
          
          {#if isProv}
            <div class="absolute w-[7vh] h-[7vh] max-w-[50px] max-h-[50px] bg-[#fffbbd] border-4 border-white rounded-full flex items-center justify-center font-black text-lg sm:text-2xl text-deep-blue shadow-lg pointer-events-none"
              style="top: {pos.t}; left: {pos.l}; transform: translate(-50%, -50%);">{slot}</div>
          {:else}
            <div role="button" tabindex="0" 
              data-slot="true" data-widx={wIdx} data-sidx={sIdx}
              ondragover={(e) => handleDragOver(e, wIdx, sIdx)} 
              ondrop={() => handleDrop(wIdx, sIdx)} 
              ondragleave={() => hoverSlot = null} 
              onclick={() => handleSlotClick(wIdx, sIdx)}
              class="absolute w-[10vh] h-[10vh] max-w-[75px] max-h-[75px] flex items-center justify-center z-20 cursor-pointer outline-none group"
              style="top: {pos.t}; left: {pos.l}; transform: translate(-50%, -50%);">
              <div class="w-[7vh] h-[7vh] max-w-[50px] max-h-[50px] rounded-full flex items-center justify-center font-black text-lg sm:text-2xl transition-all shadow-md
                     {slot ? 'bg-white text-deep-blue border-4 border-white' : 'bg-white/10 text-transparent border-4 border-dashed border-white/40'}
                     {isError ? 'shake-error' : ''} {isSuccess ? 'pop-success' : ''} {isHover && !slot ? 'bg-white/40 border-solid scale-110' : ''}
                     {!slot && !isChecking ? 'group-hover:bg-white/20' : ''}">{slot || '?'}</div>
            </div>
          {/if}
        {/each}
      </div>
    {/each}
  </div>

  <div class="w-full max-w-xl bg-white/10 p-3 sm:p-4 rounded-[30px] border-4 border-white/20 backdrop-blur-md shadow-2xl mb-2">
      <div class="flex justify-center gap-4 sm:gap-8">
          {#each bank as num, i}
              <div draggable="true" 
                onkeydown={(e) => e.key === 'Enter' && handleDragStart(num, i)}
                ondragstart={() => handleDragStart(num, i)}
                ontouchstart={(e) => handleTouchStart(e, num, i)}
                ontouchmove={handleTouchMove}
                ontouchend={handleTouchEnd}
                class="w-[7vh] h-[7vh] max-w-[55px] max-h-[55px] sm:w-[9vh] sm:h-[9vh] sm:max-w-[70px] sm:max-h-[70px] bg-white border-b-8 border-gray-300 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-black text-deep-blue shadow-xl cursor-grab active:cursor-grabbing hover:scale-110 transition-all select-none touch-none">
                  {num}</div>
          {/each}
      </div>
  </div>

  {#if feedback}
    <div class="fixed bottom-24 left-1/2 -translate-x-1/2 text-2xl sm:text-4xl font-black text-white text-center animate-bounce drop-shadow-2xl z-50 pointer-events-none">{feedback}</div>
  {/if}

  <!-- 터치 드래그 시 따라다니는 고스트 요소 -->
  {#if touchActive && draggingValue !== null}
    <div class="fixed pointer-events-none z-[100] w-[9vh] h-[9vh] max-w-[70px] max-h-[70px] bg-white/90 border-4 border-white rounded-full flex items-center justify-center text-3xl font-black text-deep-blue shadow-2xl"
      style="left: {touchPos.x}px; top: {touchPos.y}px; transform: translate(-50%, -100%) scale(1.1);">
      {draggingValue}
    </div>
  {/if}
</div>

<style>
  .shake-error { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; border-color: #FF4D4D !important; background-color: #FF4D4D !important; color: white !important; }
  .pop-success { animation: pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; box-shadow: 0 0 30px rgba(255, 255, 255, 0.8); }
  @keyframes shake { 10%, 90% { transform: scale(1) translate(-2px, 0); } 20%, 80% { transform: scale(1) translate(2px, 0); } 30%, 50%, 70% { transform: scale(1) translate(-4px, 0); } 40%, 60% { transform: scale(1) translate(4px, 0); } }
  @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
  
  /* 터치 중 스크롤 방지 */
  :global(body.touch-dragging) {
    overflow: hidden !important;
    overscroll-behavior: none;
  }
</style>
