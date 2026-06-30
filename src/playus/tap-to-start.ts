export type TapToStartMode = 'dismiss-only' | 'pass-first-input';

export type TapToStartOverlay = {
  show: () => void;
  hide: () => void;
  destroy: () => void;
};

type TapToStartOptions = {
  parent?: HTMLElement;
  text?: string;
  mode?: TapToStartMode;
  onStart: (event: PointerEvent) => void;
};

export function createTapToStartOverlay(options: TapToStartOptions): TapToStartOverlay {
  const parent = options.parent ?? document.body;
  const mode = options.mode ?? 'dismiss-only';
  const root = document.createElement('div');
  const label = document.createElement('div');

  root.className = 'playus-tap-start';
  root.style.pointerEvents = mode === 'dismiss-only' ? 'auto' : 'none';

  label.className = 'playus-tap-start__label';
  label.textContent = options.text ?? 'Tap to start';
  label.style.pointerEvents = mode === 'dismiss-only' ? 'auto' : 'none';

  root.appendChild(label);
  parent.appendChild(root);

  function handlePointerDown(event: PointerEvent) {
    hide();
    options.onStart(event);
  }

  function show() {
    root.hidden = false;
  }

  function hide() {
    root.hidden = true;
    parent.removeEventListener('pointerdown', handlePointerDown, true);
    root.removeEventListener('pointerdown', handlePointerDown);
  }

  function destroy() {
    hide();
    root.remove();
  }

  if (mode === 'dismiss-only') {
    root.addEventListener('pointerdown', handlePointerDown);
  } else {
    parent.addEventListener('pointerdown', handlePointerDown, true);
  }

  return { show, hide, destroy };
}
