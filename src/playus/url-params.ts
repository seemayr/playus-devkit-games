export function getUrlParam(name: string): string | null {
  try {
    const hash = window.location.hash.substring(1);
    const fromHash = new URLSearchParams(hash).get(name);
    if (fromHash) return fromHash;
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

export function getGameSeed(options?: { includePlayContext?: boolean }): string | undefined {
  const groupgame = getUrlParam('groupgame');
  if (!groupgame) return undefined;

  if (options?.includePlayContext === false) return groupgame;

  const playcontext = getUrlParam('playcontext');
  return `${groupgame}.${playcontext ?? ''}`;
}
