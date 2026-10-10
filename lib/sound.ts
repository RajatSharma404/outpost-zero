/**
 * Optional Web Audio API synthesizer for mission events.
 * Muted by default. No external audio files or dependencies.
 */

let audioCtx: AudioContext | null = null;
let isMuted = true;

export function initAudio() {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem('outpost_zero_muted');
  isMuted = stored === null ? true : stored === 'true';
}

export function toggleAudio(): boolean {
  isMuted = !isMuted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('outpost_zero_muted', String(isMuted));
  }
  return isMuted;
}

export function getAudioMuted(): boolean {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('outpost_zero_muted');
    if (stored !== null) return stored === 'true';
  }
  return isMuted;
}

function getContext(): AudioContext | null {
  if (isMuted || typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Soft high telemetry beep for event arrival */
export function playEventBeep() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Fail silently
  }
}

/** Low dual-tone alarm for critical alerts */
export function playAlarmTone() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Fail silently
  }
}
