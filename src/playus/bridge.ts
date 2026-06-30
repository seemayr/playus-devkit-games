export type GameEventType =
  | 'ready'
  | 'gameStarted'
  | 'scoreUpdate'
  | 'gameFinished'
  | 'error'
  | 'haptic'
  | 'sound';

export type HapticPattern =
  | 'tap'
  | 'release'
  | 'soft'
  | 'startLoading'
  | 'success'
  | 'failed'
  | 'confetti';

export type GameError = {
  code: string;
  message: string;
};

type HostEvent = {
  type: GameEventType;
  gameId?: string;
  timestamp: number;
  [key: string]: unknown;
};

const PARENT_EVENT_SOURCE = 'playus-devkit-game-event';
const SCORE_DECIMAL_DIGITS = 7;
const SCORE_DECIMAL_FACTOR = 10 ** SCORE_DECIMAL_DIGITS;
const MAX_ROUNDABLE_SCORE = Number.MAX_SAFE_INTEGER / SCORE_DECIMAL_FACTOR;

function roundScore(score: number): number {
  if (!Number.isFinite(score)) return score;
  if (Math.abs(score) >= MAX_ROUNDABLE_SCORE) return score;

  const rounded =
    Math.sign(score) * Math.round(Math.abs(score) * SCORE_DECIMAL_FACTOR) / SCORE_DECIMAL_FACTOR;

  return Object.is(rounded, -0) ? 0 : rounded;
}

class PlayusBridge {
  private gameId?: string;

  configure(options: { gameId?: string } = {}) {
    this.gameId = options.gameId ?? this.gameId;
  }

  post(type: GameEventType, payload: Record<string, unknown> = {}): boolean {
    const event: HostEvent = {
      type,
      gameId: this.gameId,
      timestamp: Date.now(),
      ...payload,
    };

    let delivered = false;

    try {
      const ios = (window as any).webkit?.messageHandlers?.gameEvent;
      if (typeof ios?.postMessage === 'function') {
        ios.postMessage(event);
        delivered = true;
      }

      const android = (window as any).gameEvent;
      if (typeof android?.handleMessage === 'function') {
        android.handleMessage(JSON.stringify(event));
        delivered = true;
      }

      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ source: PARENT_EVENT_SOURCE, ...event }, '*');
        delivered = true;
      }
    } catch (error) {
      console.error('Playus bridge post failed:', error);
      return false;
    }

    if (!delivered) {
      console.log('Playus bridge event:', event);
    }

    return delivered;
  }

  readonly game = {
    ready: () => {
      this.post('ready');
    },
    started: () => {
      this.post('gameStarted');
    },
    score: (score: number) => {
      this.post('scoreUpdate', { score: roundScore(score) });
    },
    finished: (score: number) => {
      this.post('gameFinished', { score: roundScore(score) });
    },
    error: (error: GameError) => {
      this.post('error', error);
    },
  };

  readonly device = {
    haptic: (pattern: HapticPattern) => {
      this.post('haptic', { pattern });
    },
  };
}

export const playus = new PlayusBridge();
