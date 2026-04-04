<script lang="ts">
  import confetti from 'canvas-confetti';
  import { onMount } from 'svelte';

  let audioFile: HTMLAudioElement;

  onMount(() => {
    // MP3 파일 미리 로드 및 볼륨 조절 (기존보다 작게)
    audioFile = new Audio('/sound.mp3');
    audioFile.volume = 0.4; 
  });

  // 사운드 B: Web Audio API 전자음 (볼륨 상향)
  function playSynthSound() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, now); // C5
      oscillator.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      oscillator.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5

      // 볼륨을 0.5로 상향하여 MP3와 균형을 맞춤
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.3);

      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch (e) {
      console.error('Synth sound failed:', e);
    }
  }

  export function fire() {
    if (Math.random() > 0.5) {
      if (audioFile) {
        audioFile.currentTime = 0;
        audioFile.play().catch(e => console.error('MP3 play failed:', e));
      }
    } else {
      playSynthSound();
    }

    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }
</script>
