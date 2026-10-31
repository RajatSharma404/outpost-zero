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
  playPriorityAlarm(1);
}

/** Procedural Web Audio alarm by ISA-101 priority (1=Critical, 2=Warning, 3=Advisory) */
export function playPriorityAlarm(priority: 1 | 2 | 3) {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (priority === 1) {
      // Priority 1: High urgency alternating pulse
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.1);
      osc.frequency.setValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (priority === 2) {
      // Priority 2: Warning two-tone chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587, now);
      osc.frequency.setValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } else {
      // Priority 3: Advisory gentle ping
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch {
    // Fail silently
  }
}
