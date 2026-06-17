import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

/**
 * Composable untuk auto-logout saat user idle
 * Default timeout: 30 menit (atau dari localStorage idle_time)
 */
export function useIdleTimeout() {
  const router = useRouter();
  const isIdle = ref(false);
  let idleTimer = null;
  let checkInterval = null;
  let logOffTime = null;

  // Get idle time dari localStorage (dalam ms) atau default 30 menit
  const getIdleTime = () => {
    const stored = localStorage.getItem('idle_time');
    if (stored && !isNaN(stored)) {
      return parseInt(stored);
    }
    return 30 * 60 * 1000; // 30 menit default
  };

  const resetTimer = () => {
    const idleTime = getIdleTime();
    logOffTime = new Date();
    logOffTime.setMilliseconds(logOffTime.getMilliseconds() + idleTime);
  };

  const checkIdle = () => {
    const now = new Date();
    if (logOffTime && now > logOffTime) {
      isIdle.value = true;
      doLogout();
    }
  };

  const doLogout = () => {
    // Clear semua data
    localStorage.clear();
    // Stop intervals
    stopWatching();
    // Redirect ke login
    router.push('/login');
  };

  const startWatching = () => {
    resetTimer();
    // Cek setiap 5 detik
    checkInterval = setInterval(checkIdle, 5000);
    // Reset timer saat ada aktivitas
    document.addEventListener('click', resetTimer);
    document.addEventListener('keypress', resetTimer);
    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('scroll', resetTimer);
  };

  const stopWatching = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
    document.removeEventListener('click', resetTimer);
    document.removeEventListener('keypress', resetTimer);
    document.removeEventListener('mousemove', resetTimer);
    document.removeEventListener('scroll', resetTimer);
  };

  onMounted(() => {
    const token = localStorage.getItem('token');
    if (token) {
      startWatching();
    }
  });

  onUnmounted(() => {
    stopWatching();
  });

  return {
    isIdle,
    startWatching,
    stopWatching,
    resetTimer
  };
}
