export type SoundId =
  | 'ball-hole'
  | 'game-info'
  | 'game-warning'
  | 'hit-analog'
  | 'jump'
  | 'knife-throw'
  | 'level-complete'
  | 'level-up'
  | 'negative-input'
  | 'piano1'
  | 'piano2'
  | 'piano3'
  | 'piano4'
  | 'pop-bubble'
  | 'pop-happy'
  | 'pop-sharp'
  | 'pop-multi-up'
  | 'pop-multi-down'
  | 'positive-input'
  | 'ring-down'
  | 'ring-up'
  | 'wall-hit-2'
  | 'wall-hit';

export type SoundPlayOptions = {
  volume?: number;
};

let audioContext: AudioContext | null = null;
const PARENT_EVENT_SOURCE = 'playus-devkit-game-event';

function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextCtor) return null;
    audioContext = new AudioContextCtor();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
}

function frequencyForSound(id: SoundId): number {
  if (id.includes('negative') || id.includes('warning') || id.includes('down')) return 180;
  if (id.includes('level') || id.includes('success') || id.includes('up')) return 640;
  if (id.startsWith('piano')) return 260 + Number(id.slice(-1)) * 80;
  return 420;
}

function postSoundEvent(soundId: SoundId, volume: number) {
  const event = {
    source: PARENT_EVENT_SOURCE,
    type: 'sound',
    soundId,
    volume,
    timestamp: Date.now(),
  };

  if (window.parent && window.parent !== window) {
    window.parent.postMessage(event, '*');
    return;
  }

  console.log('Playus sound event:', event);
}

class DevkitSound {
  async preload(_ids: SoundId | SoundId[]): Promise<void> {
    return Promise.resolve();
  }

  play(id: SoundId, options: SoundPlayOptions = {}) {
    postSoundEvent(id, options.volume ?? 1);

    const context = getAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const volume = Math.max(0, Math.min(1, options.volume ?? 0.22));

    oscillator.type = 'sine';
    oscillator.frequency.value = frequencyForSound(id);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.08);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.09);
  }
}

export const sound = new DevkitSound();
