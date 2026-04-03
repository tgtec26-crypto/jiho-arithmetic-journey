<script lang="ts">
  import { onMount } from 'svelte';
  import { gameStore } from '$lib/stores/gameStore.svelte';
  import Confetti from '../Confetti.svelte';

  interface CoinData {
    value: number;
    class: string;
  }

  let displayedCoins = $state<CoinData[]>([]);
  let targetAmount = $state(0);
  let options = $state<number[]>([]);
  let feedback = $state('');
  let isChecking = $state(false);
  let confettiRef: any = $state();
  
  const TOTAL_ROUNDS = 5;
  let round = $state(0);

  onMount(() => {
    nextQuestion();
  });

  function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function nextQuestion() {
    if (round >= TOTAL_ROUNDS) {
      gameStore.updateProgress(TOTAL_ROUNDS, TOTAL_ROUNDS);
      return;
    }
    
    const coins = [500, 100, 50, 10];
    const coinClasses = ['coin-500', 'coin-100', 'coin-50', 'coin-10'];
    const counts = [rand(0, 1), rand(1, 4), rand(0, 3), rand(0, 5)];
    
    let sum = 0;
    const tempCoins: CoinData[] = [];
    
    counts.forEach((count, i) => {
      for (let c = 0; c < count; c++) {
        tempCoins.push({ value: coins[i], class: coinClasses[i] });
        sum += coins[i];
      }
    });

    displayedCoins = tempCoins.sort(() => Math.random() - 0.5);
    targetAmount = sum;

    const pool = new Set<number>([sum]);
    while (pool.size < 3) {
      const offset = (rand(-2, 2) || 1) * 10;
      const val = Math.max(10, sum + offset);
      if (val !== sum) pool.add(val);
    }
    options = Array.from(pool).sort(() => Math.random() - 0.5);

    feedback = '';
    isChecking = false;
    round += 1;
    gameStore.updateProgress(round - 1, TOTAL_ROUNDS);
  }

  function handleAnswer(choice: number) {
    if (isChecking) return;
    
    if (choice === targetAmount) {
      isChecking = true;
      feedback = '금고가 가득 찼어요! 저축왕 지호! 💰✨';
      gameStore.addScore(20, true);
      confettiRef?.fire();
      setTimeout(nextQuestion, 1500);
    } else {
      feedback = '금액이 조금 틀린 것 같아요! 💸';
      gameStore.addScore(0, false);
      setTimeout(() => {
        feedback = '';
      }, 1000);
    }
  }
</script>

<Confetti bind:this={confettiRef} />

<div class="flex flex-col items-center justify-around w-full max-w-4xl mx-auto flex-grow min-h-[75vh] py-4 select-none">
  
  <h2 class="text-3xl sm:text-5xl font-black text-white drop-shadow-lg tracking-tight mb-4 text-center">
    금고에 얼마가 들었을까요?
  </h2>

  <!-- 열린 금고(Safe Box) 디자인 -->
  <div class="relative w-full max-w-2xl mt-8">
    <!-- 금고 외벽 -->
    <div class="absolute inset-0 bg-[#455A64] rounded-[50px] transform -skew-x-2 -translate-y-4 shadow-2xl border-r-[15px] border-b-[15px] border-[#263238]"></div>
    
    <!-- 금고 내부 (어두운 색상으로 동전과 대비) -->
    <div class="relative w-full min-h-[280px] bg-gradient-to-br from-[#1a2a3a] to-[#2c3e50] rounded-[40px] p-10 flex flex-wrap justify-center items-center gap-4 shadow-inner border-4 border-[#37474F] overflow-hidden">
      <!-- 장식: 금고 경첩 느낌 -->
      <div class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-24 bg-[#90A4AE] rounded-full opacity-30"></div>
      
      {#each displayedCoins as coin}
        <div class="coin {coin.class} flex flex-col items-center justify-center font-black shadow-[0_5px_15px_rgba(0,0,0,0.4)] animate-in fade-in zoom-in duration-500 hover:scale-110 transition-transform">
          <span>{coin.value}</span>
          <span class="text-[0.6rem] mt-[-2px]">원</span>
        </div>
      {/each}
    </div>

    <!-- 금고 문 (옆에 살짝 열려있는 느낌) -->
    <div class="absolute -left-12 top-0 w-16 h-full bg-[#546E7A] rounded-l-3xl border-r-8 border-[#37474F] shadow-lg opacity-80 hidden lg:block"></div>
  </div>

  <!-- 보기 선택지 (황금색 입체 버튼) -->
  <div class="flex justify-center gap-4 sm:gap-8 w-full px-4 mt-12">
    {#each options as option}
      <button 
        onclick={() => handleAnswer(option)}
        disabled={isChecking}
        class="min-w-[110px] sm:min-w-[160px] bg-gradient-to-b from-[#FFD54F] to-[#FFB300] border-b-8 border-[#E67E22] rounded-[2rem] py-5 px-4 text-2xl sm:text-4xl font-black text-[#4E342E] shadow-2xl hover:brightness-110 active:scale-95 active:border-b-4 transition-all disabled:opacity-50"
      >
        {option}원
      </button>
    {/each}
  </div>

  <!-- Feedback Area -->
  <div class="h-16 flex items-center justify-center">
    {#if feedback}
      <div class="text-2xl sm:text-4xl font-black text-white text-center animate-bounce drop-shadow-2xl">
        {feedback}
      </div>
    {/if}
  </div>
</div>

<style>
  .coin {
    border-radius: 50%;
    border: 3px solid rgba(255,255,255,0.2);
    position: relative;
    user-select: none;
  }

  /* 동전 그래디언트 강화 (금고 안에서 반짝이도록) */
  .coin-500 { 
    background: radial-gradient(circle at 30% 30%, #FFFFFF, #B0B0B0); 
    width: 85px; height: 85px; font-size: 1.4rem; color: #333; 
  }
  .coin-100 { 
    background: radial-gradient(circle at 30% 30%, #F5F5F5, #9E9E9E); 
    width: 75px; height: 75px; font-size: 1.2rem; color: #444; 
  }
  .coin-50 { 
    background: radial-gradient(circle at 30% 30%, #EEEEEE, #888888); 
    width: 65px; height: 65px; font-size: 1.1rem; color: #555; 
  }
  .coin-10 { 
    background: radial-gradient(circle at 30% 30%, #FFCC80, #A67041); 
    width: 60px; height: 60px; font-size: 1rem; color: #4E342E; border-color: #8C5A2B; 
  }

  @media (min-width: 640px) {
    .coin-500 { width: 105px; height: 105px; font-size: 1.7rem; }
    .coin-100 { width: 95px; height: 90px; font-size: 1.5rem; }
    .coin-50 { width: 85px; height: 80px; font-size: 1.3rem; }
    .coin-10 { width: 75px; height: 70px; font-size: 1.2rem; }
  }
</style>
