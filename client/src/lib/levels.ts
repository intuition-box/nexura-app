export interface LevelInfo {
  name: string;
  xp: number;
  index: number;
}

export const LEVELS = [
  { name: "Trail Initiate", xp: 1000 },
  { name: "Pathfinder", xp: 3000 },
  { name: "Scout of Lore", xp: 6000 },
  { name: "Relic Runner", xp: 10000 },
  { name: "Rune Raider", xp: 15000 },
  { name: "Vault Server", xp: 20000 },
  { name: "Crypt Diver", xp: 30000 },
  { name: "Temple Warden", xp: 40000 },
  { name: "Relic Master", xp: 50000 },
  { name: "Nexon Vanguard", xp: 65000 },
] as const;

export function getCurrentLevel(currentXp: number): LevelInfo {
  for (let i = 0; i < LEVELS.length; i++) {
    const next = LEVELS[i + 1];
    if (currentXp <= LEVELS[i].xp && (!next || currentXp < next.xp)) {
      return { ...LEVELS[i], index: i + 1 };
    }
  }
  return { ...LEVELS[LEVELS.length - 1], index: LEVELS.length };
}

export function getNextLevel(currentXp: number): LevelInfo | null {
  const current = getCurrentLevel(currentXp);
  const nextIdx = current.index;
  if (nextIdx >= LEVELS.length) return null;
  return { ...LEVELS[nextIdx], index: nextIdx + 1 };
}

export function getLevelProgress(currentXp: number): {
  current: LevelInfo;
  next: LevelInfo | null;
  progressPct: number;
  xpRemaining: number;
} {
  const current = getCurrentLevel(currentXp);
  const next = getNextLevel(currentXp);
  if (!next) {
    return { current, next: null, progressPct: 100, xpRemaining: 0 };
  }
  const floorXp = current.index === 1 ? 0 : LEVELS[current.index - 2].xp;
  const span = next.xp - floorXp;
  const inLevel = Math.max(0, currentXp - floorXp);
  const progressPct = Math.max(0, Math.min(100, Math.round((inLevel / span) * 100)));
  const xpRemaining = Math.max(0, next.xp - currentXp);
  return { current, next, progressPct, xpRemaining };
}
