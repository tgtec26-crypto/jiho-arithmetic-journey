<script lang="ts">
  import { fade, scale, fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import confetti from 'canvas-confetti';

  interface Props {
    score: number;
    onClose: () => void;
  }
  let { score, onClose }: Props = $props();

  // 화려한 박수/축하 효과음 (Web Audio API)
  function playFanfare() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 박수 소리 시뮬레이션 (White noise 기반 노이즈 필터링)
      const bufferSize = audioCtx.sampleRate * 1.5;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, audioCtx.currentTime);

      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      // 경쾌한 화음 추가
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((f, i) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, audioCtx.currentTime + i * 0.05);
        g.gain.setValueAtTime(0, audioCtx.currentTime);
        g.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.1 + i * 0.05);
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.0);
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.5);
      });

      noise.start();
      noise.stop(audioCtx.currentTime + 1.5);
    } catch (e) {
      console.error('Fanfare failed:', e);
    }
  }

  onMount(() => {
    playFanfare();
    // 무지개 폭죽
    const end = Date.now() + 2 * 1000;
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee']
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  });
</script>

<div 
  class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-900/80 backdrop-blur-md"
  transition:fade
>
  <div 
    class="bg-white rounded-[50px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-lg p-10 text-center border-b-[15px] border-deep-blue relative overflow-hidden"
    transition:scale={{ start: 0.8, duration: 400 }}
  >
    <!-- 배경 장식 -->
    <div class="absolute -top-10 -left-10 w-40 h-40 bg-accent-yellow/20 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

    <div class="relative z-10">
      <div class="text-8xl mb-6 animate-bounce">👏</div>
      
      <h2 class="text-5xl font-black text-deep-blue mb-4 tracking-tighter">참 잘했어요!</h2>
      <p class="text-2xl font-bold text-gray-500 mb-8">오늘 지호가 기록한 점수는</p>
      
      <div class="bg-bright-text py-6 rounded-[30px] mb-10 shadow-inner inline-block px-12 border-4 border-dashed border-accent-yellow">
        <span class="text-7xl font-black text-deep-blue tracking-widest">{score}</span>
        <span class="text-3xl font-black text-gray-400 ml-2">점</span>
      </div>

      <p class="text-xl font-black text-purple-600 mb-10 leading-relaxed">
        매일매일 성장하는 지호를 응원해!<br>
        최고의 산수 박사가 될 거야! ✨
      </p>

      <button 
        onclick={onClose}
        class="w-full bg-success hover:bg-green-600 text-white font-black py-5 rounded-3xl text-3xl shadow-xl hover:scale-105 active:scale-95 transition-all border-b-8 border-green-800"
      >
        확인! 고마워요 👍
      </button>
    </div>
  </div>
</div>
