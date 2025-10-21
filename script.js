(() => {
  const PRESETS = [
    { label: "30 sec", seconds: 30 },
    { label: "1 min", seconds: 60 },
    { label: "2 min", seconds: 120 },
    { label: "3 min", seconds: 180 },
    { label: "5 min", seconds: 300 },
  ];

  const refs = {
    app: document.querySelector(".app"),
    display: document.getElementById("time-display"),
    presetContainer: document.querySelector(".preset-buttons"),
    startButton: document.getElementById("start-btn"),
    stopButton: document.getElementById("stop-btn"),
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
  let audioCtx = null;

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
    setRunningUI(false);
    highlightActivePreset(buttonElement);
    refs.statusText.textContent = `Ready: ${preset.label}`;
  }

  function setRunningUI(isRunning) {
    refs.app?.classList.toggle("is-running", isRunning);
  }

  function ensureAudioContext() {
    if (audioCtx) {
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch((error) => {
          console.error("Audio resume failed", error);
        });
      }
      return audioCtx;
    }

    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.error("Audio context unavailable", error);
    }

    return audioCtx;
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
    refs.stopButton.disabled = !isRunning;
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

    ensureAudioContext();

    const endTime = Date.now() + timerState.remainingSeconds * 1000;
    timerState.isRunning = true;
    updateButtons({ hasPreset: true, isRunning: true });
    setRunningUI(true);
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
        setRunningUI(false);
        refs.statusText.textContent = "Done";
        playAlarm();
      }
    }, 200);
  }

  function stopTimer() {
    if (!timerState.isRunning) return;
    clearCountdown();
    timerState.isRunning = false;
    updateButtons({ hasPreset: Boolean(timerState.totalSeconds), isRunning: false });
    setRunningUI(false);
    refs.statusText.textContent = "Stopped";
  }

  function resetTimer() {
    clearCountdown();
    timerState.remainingSeconds = timerState.totalSeconds;
    timerState.isRunning = false;
    updateDisplay(timerState.remainingSeconds || 0);
    updateButtons({ hasPreset: Boolean(timerState.totalSeconds), isRunning: false });
    setRunningUI(false);
    refs.statusText.textContent = timerState.totalSeconds ? "Reset" : "";
    if (timerState.activePreset) {
      highlightActivePreset(timerState.activePreset);
    }
  }

  function tick() {
    updateDisplay(timerState.remainingSeconds);
  }

  function playAlarm() {
    const context = ensureAudioContext();
    if (!context) return;

    try {
      const duration = 1.6;
      const now = context.currentTime;

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(880, now);
      oscillator.frequency.setValueAtTime(660, now + 0.4);
      oscillator.frequency.setValueAtTime(990, now + 0.8);
      oscillator.frequency.setValueAtTime(440, now + 1.2);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.5, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.35, now + 0.6);
      gainNode.gain.setValueAtTime(0.35, now + 0.9);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (error) {
      console.error("Alarm failed", error);
    }
  }

  function setupActions() {
    refs.startButton.addEventListener("click", startTimer);
    refs.stopButton.addEventListener("click", stopTimer);
    refs.resetButton.addEventListener("click", resetTimer);
  }

  function bootstrap() {
    renderPresets();
    setupActions();
    updateDisplay(0);
    updateButtons({ hasPreset: false, isRunning: false });
    setRunningUI(false);
  }

  bootstrap();
})();
