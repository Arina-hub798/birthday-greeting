
const surpriseButton = document.querySelector("#surpriseButton");
const secretSection = document.querySelector("#secretSection");
const celebrateButton = document.querySelector("#celebrateButton");

const musicButton = document.querySelector("#musicButton");
const musicIcon = document.querySelector("#musicIcon");
const musicLabel = document.querySelector("#musicLabel");

const canvas = document.querySelector("#confetti");
const ctx = canvas.getContext("2d");

let audioContext = null;
let musicTimer = null;
let musicOn = false;
let noteIndex = 0;
let activeNotes = [];
let particles = [];
let animationFrame = null;

const melody = [
  261.63, 329.63, 392.00, 329.63,
  293.66, 349.23, 440.00, 349.23,
  261.63, 329.63, 392.00, 523.25,
  440.00, 392.00, 329.63, 293.66
];

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Reveal the secret birthday message.
surpriseButton.addEventListener("click", () => {
  secretSection.hidden = false;

  secretSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  launchConfetti(100);
});

// Celebrate with a larger burst of confetti.
celebrateButton.addEventListener("click", () => {
  launchConfetti(180);

  celebrateButton.textContent = "Ще трішки магії! ✨";
});

// Create a soft synthesized melody with Web Audio.
function playNote(frequency) {
  if (!audioContext || audioContext.state !== "running") return;

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const volume = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, now);

  volume.gain.setValueAtTime(0.0001, now);
  volume.gain.exponentialRampToValueAtTime(0.055, now + 0.06);
  volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

  oscillator.connect(volume);
  volume.connect(audioContext.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.8);

  activeNotes.push({ oscillator, volume });
}

async function startMusic() {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    musicLabel.textContent = "Музика недоступна";
    return;
  }

  try {
    if (!audioContext || audioContext.state === "closed") {
      audioContext = new AudioContextClass();
    }

    await audioContext.resume();

    if (audioContext.state !== "running") {
      musicLabel.textContent = "Не вдалося ввімкнути";
      return;
    }

    musicOn = true;
    noteIndex = 0;

    musicButton.setAttribute("aria-pressed", "true");
    musicIcon.textContent = "♫";
    musicLabel.textContent = "Вимкнути музику";

    playNote(melody[noteIndex]);
    noteIndex = (noteIndex + 1) % melody.length;

    musicTimer = window.setInterval(() => {
      if (musicOn) {
        playNote(melody[noteIndex]);
        noteIndex = (noteIndex + 1) % melody.length;
      }
    }, 520);
  } catch (error) {
    musicLabel.textContent = "Не вдалося ввімкнути";
    console.error("Помилка відтворення аудіо:", error);
  }
}

async function stopMusic() {
  musicOn = false;

  if (musicTimer !== null) {
    clearInterval(musicTimer);
    musicTimer = null;
  }

  if (audioContext && audioContext.state !== "closed") {
    try {
      await audioContext.suspend();
    } catch (error) {
      console.error("Не вдалося призупинити музику:", error);
    }
  }

  musicButton.setAttribute("aria-pressed", "false");
  musicIcon.textContent = "♫";
  musicLabel.textContent = "Увімкнути музику";
}

musicButton.addEventListener("click", () => {
  if (musicOn) {
    stopMusic();
  } else {
    startMusic();
  }
});

// Confetti animation.
function launchConfetti(amount = 100) {
  const colors = [
    "#c6a8ff",
    "#f2a9d5",
    "#ffffff",
    "#9273ee",
    "#f4d8ff"
  ];

  for (let i = 0; i < amount; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * window.innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      size: 3 + Math.random() * 5,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.12,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 160 + Math.random() * 80
    });
  }

  if (!animationFrame) {
    animateConfetti();
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles = particles.filter(p => p.life > 0 && p.y < window.innerHeight + 30);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.012;
    p.rotation += p.spin;
    p.life--;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.min(1, p.life / 35);
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.8);
    ctx.restore();
  }

  if (particles.length > 0) {
    animationFrame = requestAnimationFrame(animateConfetti);
  } else {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    animationFrame = null;
  }
}

// A few floating hearts when the page first opens.
function createFloatingHeart() {
  const heart = document.createElement("span");

  heart.textContent = Math.random() > 0.5 ? "♡" : "♥";
  heart.setAttribute("aria-hidden", "true");

  Object.assign(heart.style, {
    position: "fixed",
    left: `${8 + Math.random() * 84}%`,
    bottom: "-30px",
    zIndex: "3",
    pointerEvents: "none",
    color: Math.random() > 0.5 ? "#f2a9d5" : "#b49aff",
    fontSize: `${12 + Math.random() * 18}px`,
    opacity: "0",
    transition: "transform 5s linear, opacity 1s ease"
  });

  document.body.appendChild(heart);

  requestAnimationFrame(() => {
    heart.style.opacity = "0.7";
    heart.style.transform =
      `translateY(-${window.innerHeight + 80}px) rotate(${Math.random() * 50 - 25}deg)`;
  });

  window.setTimeout(() => heart.remove(), 6000);
}

const heartInterval = window.setInterval(createFloatingHeart, 1600);
window.addEventListener("pagehide", () => {
  clearInterval(heartInterval);
  if (musicTimer !== null) clearInterval(musicTimer);
  if (animationFrame) cancelAnimationFrame(animationFrame);
  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
  }
});