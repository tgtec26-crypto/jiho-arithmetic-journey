<script lang="ts">
  import confetti from 'canvas-confetti';
  import { onMount } from 'svelte';

  let audio: HTMLAudioElement;

  onMount(() => {
    // 효과음 미리 로드
    audio = new Audio('/sound.mp3');
  });

  export function fire() {
    // 소리 재생
    if (audio) {
      audio.currentTime = 0; // 처음부터 재생
      audio.play().catch(e => console.error('Audio play failed:', e));
    }

    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }
</script>
