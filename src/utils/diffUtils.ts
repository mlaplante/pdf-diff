import { diffWords, diffLines } from 'diff';

export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export interface PageDiff {
  pageNumber: number;
  parts: DiffPart[];
  hasChanges: boolean;
}

/**
 * Computes a word-level diff between two texts.
 * Uses the diff library to identify added, removed, and unchanged words.
 * 
 * @param oldText - The original text to compare
 * @param newText - The modified text to compare
 * @returns An array of diff parts with added/removed flags
 * 
 * @example
 * ```ts
 * const diff = computeTextDiff("Hello world", "Hello there");
 * // Returns parts showing "Hello" unchanged, "world" removed, "there" added
 * ```
 */
export function computeTextDiff(oldText: string, newText: string): DiffPart[] {
  return diffWords(oldText, newText);
}

/**
 * Computes a line-level diff between two texts.
 * Useful for comparing structured documents where line breaks are meaningful.
 * 
 * @param oldText - The original text to compare
 * @param newText - The modified text to compare
 * @returns An array of diff parts with added/removed flags
 */
export function computeLineDiff(oldText: string, newText: string): DiffPart[] {
  return diffLines(oldText, newText);
}

/**
 * Filters diff parts to only include additions.
 * 
 * @param parts - Array of diff parts
 * @returns Only the parts that were added
 */
export function filterAdditionsOnly(parts: DiffPart[]): DiffPart[] {
  return parts.filter(part => part.added);
}

/**
 * Filters diff parts to only include removals.
 * 
 * @param parts - Array of diff parts
 * @returns Only the parts that were removed
 */
export function filterRemovalsOnly(parts: DiffPart[]): DiffPart[] {
  return parts.filter(part => part.removed);
}

/**
 * Checks if a diff contains any changes (additions or removals).
 * 
 * @param parts - Array of diff parts
 * @returns true if any changes exist, false if all parts are unchanged
 */
export function hasChanges(parts: DiffPart[]): boolean {
  return parts.some(part => part.added || part.removed);
}

export interface DiffStats {
  additions: number;
  deletions: number;
  unchanged: number;
  totalChanges: number;
  changePercentage: number;
}

/**
 * Computes statistics about a diff.
 * Counts words in additions, deletions, and unchanged portions,
 * then calculates the percentage of changed content.
 * 
 * @param parts - Array of diff parts to analyze
 * @returns Statistics object with word counts and change percentage
 * 
 * @example
 * ```ts
 * const stats = computeStats(diffParts);
 * console.log(`${stats.changePercentage.toFixed(1)}% changed`);
 * ```
 */
export function computeStats(parts: DiffPart[]): DiffStats {
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  parts.forEach(part => {
    const wordCount = part.value.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (part.added) {
      additions += wordCount;
    } else if (part.removed) {
      deletions += wordCount;
    } else {
      unchanged += wordCount;
    }
  });

  const totalChanges = additions + deletions;
  const totalWords = additions + deletions + unchanged;
  const changePercentage = totalWords > 0 ? (totalChanges / totalWords) * 100 : 0;

  return { 
    additions, 
    deletions, 
    unchanged, 
    totalChanges,
    changePercentage 
  };
}

/**
 * Combines multiple DiffStats objects into a single aggregated result.
 * Useful for computing overall statistics across multiple pages.
 * 
 * @param statsArray - Array of DiffStats to combine
 * @returns Combined statistics with recalculated change percentage
 */
export function combineStats(statsArray: DiffStats[]): DiffStats {
  const combined = statsArray.reduce((acc, stats) => ({
    additions: acc.additions + stats.additions,
    deletions: acc.deletions + stats.deletions,
    unchanged: acc.unchanged + stats.unchanged,
    totalChanges: acc.totalChanges + stats.totalChanges,
    changePercentage: 0
  }), {
    additions: 0,
    deletions: 0,
    unchanged: 0,
    totalChanges: 0,
    changePercentage: 0
  });

  const totalWords = combined.additions + combined.deletions + combined.unchanged;
  combined.changePercentage = totalWords > 0 ? (combined.totalChanges / totalWords) * 100 : 0;
  
  return combined;
}
