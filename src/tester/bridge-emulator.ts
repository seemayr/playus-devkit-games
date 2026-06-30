export type TesterEvent = {
  type: string;
  direction: 'game-to-host';
  timestamp: number;
  payload: Record<string, unknown>;
  warning?: string;
};

type GameMessage = {
  source?: string;
  type?: string;
  timestamp?: number;
  [key: string]: unknown;
};

const GAME_EVENT_SOURCE = 'playus-devkit-game-event';

export class BridgeEmulator {
  private events: TesterEvent[] = [];
  private listeners: Array<(events: TesterEvent[]) => void> = [];
  private hasReady = false;
  private hasStarted = false;
  private hasFinished = false;
  private score: number | null = null;

  constructor() {
    window.addEventListener('message', this.handleMessage);
  }

  onChange(listener: (events: TesterEvent[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.events);

    return () => {
      this.listeners = this.listeners.filter((candidate) => candidate !== listener);
    };
  }

  clear() {
    this.events = [];
    this.hasReady = false;
    this.hasStarted = false;
    this.hasFinished = false;
    this.score = null;
    this.notify();
  }

  getState() {
    return {
      hasReady: this.hasReady,
      hasStarted: this.hasStarted,
      hasFinished: this.hasFinished,
      score: this.score,
    };
  }

  destroy() {
    window.removeEventListener('message', this.handleMessage);
    this.listeners = [];
  }

  private readonly handleMessage = (event: MessageEvent<GameMessage>) => {
    if (event.data?.source !== GAME_EVENT_SOURCE) return;

    const message = event.data;
    const type = message.type ?? 'unknown';
    const testerEvent: TesterEvent = {
      type,
      direction: 'game-to-host',
      timestamp: message.timestamp ?? Date.now(),
      payload: { ...message },
      warning: this.validateEvent(type, message),
    };

    this.events = [...this.events, testerEvent];
    this.notify();
  };

  private validateEvent(type: string, payload: Record<string, unknown>): string | undefined {
    if (type === 'ready') {
      if (this.hasReady) return 'ready() was sent more than once.';
      this.hasReady = true;
      return undefined;
    }

    if (type === 'gameStarted') {
      if (!this.hasReady) return 'started() was sent before ready().';
      if (this.hasStarted) return 'started() was sent more than once.';
      if (this.hasFinished) return 'started() was sent after finished().';
      this.hasStarted = true;
      return undefined;
    }

    if (type === 'scoreUpdate') {
      const score = Number(payload.score);
      if (!Number.isFinite(score)) return 'score() must send a finite number.';
      this.score = score;
      if (!this.hasReady) return 'score() was sent before ready().';
      if (this.hasFinished) return 'score() was sent after finished().';
      return undefined;
    }

    if (type === 'gameFinished') {
      const score = Number(payload.score);
      if (!Number.isFinite(score)) return 'finished() must send a finite final score.';
      this.score = score;
      if (!this.hasReady) return 'finished() was sent before ready().';
      if (this.hasFinished) return 'finished() was sent more than once.';
      this.hasFinished = true;
      return undefined;
    }

    if (type === 'error') {
      return undefined;
    }

    return undefined;
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.events);
    }
  }
}
