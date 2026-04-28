<script lang="ts">
  import { onMount } from 'svelte';
  import { gameStore } from '$lib/stores/gameStore.svelte';
  import Confetti from '../Confetti.svelte';

  type MotorType = 'L' | 'M' | 'XL' | 'dr' | 'battery';

  interface MotorConfig {
    type: MotorType;
    img: string;
    label: string;
    border: string;
    bg: string;
    text: string;
    axleX: number;
    axleY: number;
  }

  const MOTORS: Record<MotorType, MotorConfig> = {
    L:       { type: 'L',       img: '/motor/L_motor.png',     label: 'L 모터',    border: '#1d4ed8', bg: '#dbeafe', text: '#1e3a8a', axleX: 20, axleY: 68 },
    M:       { type: 'M',       img: '/motor/m_motor.png',     label: 'M 모터',    border: '#b91c1c', bg: '#fee2e2', text: '#7f1d1d', axleX: 19, axleY: 67 },
    XL:      { type: 'XL',      img: '/motor/xl_motor.png',    label: 'XL 모터',   border: '#c2410c', bg: '#ffedd5', text: '#7c2d12', axleX: 20, axleY: 56 },
    dr:      { type: 'dr',      img: '/motor/dr_motor.png',    label: '조향 모터', border: '#15803d', bg: '#dcfce7', text: '#14532d', axleX: 19, axleY: 67 },
    battery: { type: 'battery', img: '/motor/batterypack.png', label: '배터리팩', border: '#a16207', bg: '#fef3c7', text: '#713f12', axleX: 60, axleY: 55 }
  };

  interface PlacedMotor {
    type: MotorType;
    number: number;
    left: number;
    top: number;
    width: number;
    cardSize: number;
    rotate: number;
  }

  let placed = $state<PlacedMotor[]>([]);
  let sum = $state(0);
  let options = $state<number[]>([]);
  let feedback = $state('');
  let isChecking = $state(false);
  let wrongCount = $state(0);
  let confettiRef: any = $state();
  let appearKey = $state(0);

  const TOTAL_ROUNDS = 5;
  let round = $state(0);

  onMount(() => {
    startNewRound();
  });

  function pickPositions(count: number): { left: number; top: number }[] {
    // 5 cols × 2 rows = 10 slots — pick `count` unique slots and add jitter
    const slots: { col: number; row: number }[] = [];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 5; c++) {
        slots.push({ col: c, row: r });
      }
    }
    slots.sort(() => Math.random() - 0.5);
    return slots.slice(0, count).map(({ col, row }) => {
      const baseLeft = (col + 0.5) * 20;       // 10 / 30 / 50 / 70 / 90
      const baseTop  = (row + 0.5) * 50;       // 25 / 75
      const jitterX = (Math.random() - 0.5) * 6;
      const jitterY = (Math.random() - 0.5) * 14;
      return {
        left: Math.max(10, Math.min(90, baseLeft + jitterX)),
        top:  Math.max(22, Math.min(78, baseTop  + jitterY))
      };
    });
  }

  function startNewRound() {
    if (round >= TOTAL_ROUNDS) {
      gameStore.updateProgress(TOTAL_ROUNDS, TOTAL_ROUNDS);
      return;
    }

    const motorTypes: MotorType[] = ['L', 'M', 'XL', 'dr', 'battery'];

    // 각 타입 1~2개씩 → 총 5~10개
    const picked: MotorType[] = [];
    for (const t of motorTypes) {
      const reps = Math.floor(Math.random() * 2) + 1; // 1 or 2
      for (let i = 0; i < reps; i++) picked.push(t);
    }
    picked.sort(() => Math.random() - 0.5);
    const count = picked.length;

    // 각 타입마다 서로 다른 숫자 (1~5 unique)
    const pool = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
    const numberByType: Record<MotorType, number> = {
      L:       pool[0],
      M:       pool[1],
      XL:      pool[2],
      dr:      pool[3],
      battery: pool[4]
    };

    const positions = pickPositions(count);
    // 개수에 따라 모터 크기 축소
    const motorWidth = count <= 5 ? 218 : count <= 7 ? 194 : 172;
    const cardSize = Math.round(motorWidth * 0.36);

    placed = picked.map((t, i) => ({
      type: t,
      number: numberByType[t],
      left: positions[i].left,
      top: positions[i].top,
      width: motorWidth,
      cardSize,
      rotate: (Math.random() - 0.5) * 10
    }));

    const total = placed.reduce((acc, m) => acc + m.number, 0);
    sum = total;

    const optionSet = new Set<number>([total]);
    while (optionSet.size < 4) {
      const delta = Math.floor(Math.random() * 11) - 5;
      const val = Math.max(1, total + delta);
      optionSet.add(val);
    }
    options = Array.from(optionSet).sort(() => Math.random() - 0.5);

    feedback = '';
    isChecking = false;
    wrongCount = 0;
    appearKey += 1;

    round += 1;
    gameStore.updateProgress(round - 1, TOTAL_ROUNDS);
  }

  function handleAnswer(choice: number) {
    if (isChecking) return;

    if (choice === sum) {
      isChecking = true;
      feedback = '정답! 모터 가동! ⚙️💨';
      gameStore.addScore(30, true);
      confettiRef?.fire();
      setTimeout(startNewRound, 2500);
    } else {
      wrongCount += 1;
      feedback = '음, 다시 한번 더해볼까요? 🧐';
      if (wrongCount === 2) {
        gameStore.subtractScore(10);
      }
      setTimeout(() => {
        if (feedback.includes('더해볼까요')) feedback = '';
      }, 1500);
    }
  }
</script>

<Confetti bind:this={confettiRef} />

<div class="motor-stage flex flex-col items-center justify-between w-full h-[calc(100vh-140px)] max-w-6xl mx-auto px-4 py-1 select-none overflow-hidden">

  <div class="text-center mt-1 mb-0 relative z-10">
    <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white drop-shadow-lg tracking-tight">모터 더하기</h2>
    <p class="text-accent-yellow font-bold text-lg sm:text-xl mt-0.5" style="word-break: keep-all; overflow-wrap: break-word;">레고 모터에 적힌 숫자를 모두 더해보세요!</p>
  </div>

  <div class="relative w-full flex-grow z-10">
    {#key appearKey}
      {#each placed as m, i (i)}
        {@const cfg = MOTORS[m.type]}
        <div
          class="absolute motor-card-wrap"
          style="left: {m.left}%; top: {m.top}%; width: {m.width}px; transform: translate(-50%, -50%) rotate({m.rotate}deg); animation-delay: {i * 120}ms;"
        >
          <div class="relative w-full">
            <img
              src={cfg.img}
              alt={cfg.label}
              draggable="false"
              class="w-full h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] pointer-events-none"
            />

            <div
              class="absolute"
              style="left: {cfg.axleX}%; top: {cfg.axleY}%; transform: translate(-50%, -50%) rotate({-m.rotate}deg);"
            >
              <div
                class="number-disk rounded-full flex items-center justify-center font-black shadow-2xl"
                style="background: {cfg.bg}; color: {cfg.text}; border-color: {cfg.border}; width: {m.cardSize}px; height: {m.cardSize}px; font-size: {Math.round(m.cardSize * 0.6)}px;"
              >
                {m.number}
              </div>
            </div>
          </div>
        </div>
      {/each}
    {/key}
  </div>

  <div class="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-4 px-4 mb-2 relative z-30">
    {#each options as option}
      <button
        onclick={() => handleAnswer(option)}
        disabled={isChecking}
        class="bg-white border-b-8 border-gray-300 rounded-[30px] py-4 text-3xl sm:text-5xl font-black text-deep-blue shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
      >
        {option}
      </button>
    {/each}
  </div>

  {#if feedback}
    <div class="fixed bottom-32 left-1/2 -translate-x-1/2 text-3xl sm:text-5xl font-black text-white text-center animate-bounce drop-shadow-2xl z-50 pointer-events-none" style="word-break: keep-all;">{feedback}</div>
  {/if}
</div>

<style>
  .motor-stage {
    position: relative;
    isolation: isolate;
  }
  .motor-stage::before {
    content: '';
    position: absolute;
    inset: -10px;
    background-image: url('/motor/lego.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: blur(3px) saturate(1.05);
    opacity: 0.3;
    z-index: 0;
    pointer-events: none;
  }
  .motor-stage::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.25) 100%);
    z-index: 0;
    pointer-events: none;
  }

  .motor-card-wrap {
    opacity: 0;
    animation: motor-pop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .number-disk {
    border-width: 4px;
    border-style: solid;
  }

  @keyframes motor-pop {
    0% { opacity: 0; scale: 0.4; }
    60% { scale: 1.08; }
    100% { opacity: 1; scale: 1; }
  }
</style>
