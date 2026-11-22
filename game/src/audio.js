// Ember Pact — tiny synthesized sounds. No audio files, no network:
// short WebAudio blips for playing a card, taking damage and winning.

let ctx = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

function tone(freq, dur, type, gainValue, when = 0) {
  if (!ctx || muted) return;
  try {
    const start = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  } catch {
    // Audio is decoration; a failure never breaks the game.
  }
}

export function playSound(kind) {
  if (kind === 'card') {
    tone(520, 0.12, 'triangle', 0.12);
    tone(780, 0.1, 'triangle', 0.08, 0.05);
  } else if (kind === 'damage') {
    tone(180, 0.18, 'sawtooth', 0.1);
    tone(120, 0.22, 'sawtooth', 0.08, 0.06);
  } else if (kind === 'heal') {
    tone(660, 0.15, 'sine', 0.1);
    tone(880, 0.2, 'sine', 0.08, 0.08);
  } else if (kind === 'win') {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'triangle', 0.12, i * 0.12));
  } else if (kind === 'loss') {
    [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, 'sine', 0.1, i * 0.14));
  } else if (kind === 'click') {
    tone(440, 0.06, 'square', 0.05);
  }
}
