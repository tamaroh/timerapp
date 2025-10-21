(() => {
  const PRESETS = [
    { label: "30 sec", seconds: 30 },
    { label: "1 min", seconds: 60 },
    { label: "2 min", seconds: 120 },
    { label: "3 min", seconds: 180 },
    { label: "5 min", seconds: 300 },
  ];

  const refs = {
    display: document.getElementById("time-display"),
    presetContainer: document.querySelector(".preset-buttons"),
    startButton: document.getElementById("start-btn"),
    pauseButton: document.getElementById("pause-btn"),
    resetButton: document.getElementById("reset-btn"),
    statusText: document.getElementById("status-text"),
  };

  let timerState = {
    totalSeconds: 0,
    remainingSeconds: 0,
    countdownId: null,
    activePreset: null,
    isRunning: false,
  };

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function renderPresets() {
    const fragment = document.createDocumentFragment();

    PRESETS.forEach((preset) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn preset";
      button.textContent = preset.label;
      button.dataset.seconds = preset.seconds;
      button.addEventListener("click", () => selectPreset(preset, button));
      fragment.appendChild(button);
    });

    refs.presetContainer.appendChild(fragment);
  }

  function selectPreset(preset, buttonElement) {
    clearCountdown();
    timerState = {
      totalSeconds: preset.seconds,
      remainingSeconds: preset.seconds,
      countdownId: null,
      activePreset: buttonElement,
      isRunning: false,
    };

    updateDisplay(timerState.remainingSeconds);
    updateButtons({ hasPreset: true, isRunning: false });
    highlightActivePreset(buttonElement);
    refs.statusText.textContent = `Ready: ${preset.label}`;
  }

  function highlightActivePreset(buttonElement) {
    const buttons = refs.presetContainer.querySelectorAll(".btn.preset");
    buttons.forEach((btn) => btn.classList.toggle("active", btn === buttonElement));
  }

  function updateDisplay(seconds) {
    refs.display.textContent = formatTime(seconds);
  }

  function updateButtons({ hasPreset, isRunning }) {
    refs.startButton.disabled = !hasPreset || isRunning;
    refs.pauseButton.disabled = !isRunning;
    refs.resetButton.disabled = !hasPreset;
  }

  function clearCountdown() {
    if (timerState.countdownId) {
      clearInterval(timerState.countdownId);
      timerState.countdownId = null;
    }
  }

  function startTimer() {
    if (!timerState.totalSeconds || timerState.isRunning) return;

    const endTime = Date.now() + timerState.remainingSeconds * 1000;
    timerState.isRunning = true;
    updateButtons({ hasPreset: true, isRunning: true });
    refs.statusText.textContent = "Running";

    tick();

    timerState.countdownId = setInterval(() => {
      timerState.remainingSeconds = Math.max(
        0,
        Math.round((endTime - Date.now()) / 1000)
      );
      tick();

      if (timerState.remainingSeconds === 0) {
        clearCountdown();
        timerState.isRunning = false;
        updateButtons({ hasPreset: true, isRunning: false });
        refs.statusText.textContent = "Done";
        playAlarm();
      }
    }, 200);
  }

  function pauseTimer() {
    if (!timerState.isRunning) return;
    clearCountdown();
    timerState.isRunning = false;
    updateButtons({ hasPreset: true, isRunning: false });
    refs.statusText.textContent = "Paused";
  }

  function resetTimer() {
    clearCountdown();
    timerState.remainingSeconds = timerState.totalSeconds;
    timerState.isRunning = false;
    updateDisplay(timerState.remainingSeconds || 0);
    updateButtons({ hasPreset: Boolean(timerState.totalSeconds), isRunning: false });
    refs.statusText.textContent = timerState.totalSeconds ? "Reset" : "";
    if (timerState.activePreset) {
      highlightActivePreset(timerState.activePreset);
    }
  }

  function tick() {
    updateDisplay(timerState.remainingSeconds);
  }

  function playAlarm() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const duration = 1.2; // seconds
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + duration);

      gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.4, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (error) {
      console.error("Alarm failed", error);
    }
  }

  function setupActions() {
    refs.startButton.addEventListener("click", startTimer);
    refs.pauseButton.addEventListener("click", pauseTimer);
    refs.resetButton.addEventListener("click", resetTimer);
  }

  function bootstrap() {
    renderPresets();
    setupActions();
    updateDisplay(0);
    updateButtons({ hasPreset: false, isRunning: false });
  }

  bootstrap();
})();
