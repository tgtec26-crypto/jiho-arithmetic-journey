<script lang="ts">
  import confetti from 'canvas-confetti';

  // 가벼운 정답 효과음 재생 (Web Audio API 활용 - 파일 불필요)
  function playSuccessSound() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      // 경쾌한 "도-미-솔" 느낌의 짧은 음색
      const now = audioCtx.currentTime;
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, now); // C5 (도)
      oscillator.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5 (미)
      oscillator.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5 (솔)

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.3);

      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch (e) {
      console.error('Audio playback failed:', e);
    }
  }

  export function fire() {
    // 소리 재생
    playSuccessSound();

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
