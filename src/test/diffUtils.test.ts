import { describe, it, expect } from 'vitest';
import {
  computeTextDiff,
  computeLineDiff,
  filterAdditionsOnly,
  filterRemovalsOnly,
  hasChanges,
  computeStats,
  combineStats,
  type DiffPart,
} from '../utils/diffUtils';

describe('diffUtils', () => {
  describe('computeTextDiff', () => {
    it('should identify added words', () => {
      const result = computeTextDiff('Hello', 'Hello World');
      // Should have unchanged part and added part
      expect(result.some(part => part.added === true)).toBe(true);
      expect(result.some(part => !part.added && !part.removed)).toBe(true);
    });

    it('should identify removed words', () => {
      const result = computeTextDiff('Hello World', 'Hello');
      expect(result.some(part => part.removed)).toBe(true);
    });

    it('should handle identical text', () => {
      const result = computeTextDiff('Same text', 'Same text');
      expect(result).toHaveLength(1);
      expect(result[0].added).toBeFalsy();
      expect(result[0].removed).toBeFalsy();
    });
  });

  describe('computeLineDiff', () => {
    it('should identify added lines', () => {
      const oldText = 'Line 1\nLine 2';
      const newText = 'Line 1\nLine 2\nLine 3';
      const result = computeLineDiff(oldText, newText);
      expect(result.some(part => part.added)).toBe(true);
    });

    it('should identify removed lines', () => {
      const oldText = 'Line 1\nLine 2\nLine 3';
      const newText = 'Line 1\nLine 2';
      const result = computeLineDiff(oldText, newText);
      expect(result.some(part => part.removed)).toBe(true);
    });
  });

  describe('filterAdditionsOnly', () => {
    it('should return only added parts', () => {
      const parts: DiffPart[] = [
        { value: 'kept', added: false, removed: false },
        { value: 'added', added: true },
        { value: 'removed', removed: true },
      ];
      const result = filterAdditionsOnly(parts);
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe('added');
    });

    it('should return empty array if no additions', () => {
      const parts: DiffPart[] = [
        { value: 'kept' },
        { value: 'removed', removed: true },
      ];
      const result = filterAdditionsOnly(parts);
      expect(result).toHaveLength(0);
    });
  });

  describe('filterRemovalsOnly', () => {
    it('should return only removed parts', () => {
      const parts: DiffPart[] = [
        { value: 'kept' },
        { value: 'added', added: true },
        { value: 'removed', removed: true },
      ];
      const result = filterRemovalsOnly(parts);
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe('removed');
    });
  });

  describe('hasChanges', () => {
    it('should return true when there are additions', () => {
      const parts: DiffPart[] = [
        { value: 'kept' },
        { value: 'added', added: true },
      ];
      expect(hasChanges(parts)).toBe(true);
    });

    it('should return true when there are removals', () => {
      const parts: DiffPart[] = [
        { value: 'kept' },
        { value: 'removed', removed: true },
      ];
      expect(hasChanges(parts)).toBe(true);
    });

    it('should return false when no changes', () => {
      const parts: DiffPart[] = [{ value: 'kept' }];
      expect(hasChanges(parts)).toBe(false);
    });
  });

  describe('computeStats', () => {
    it('should correctly count additions', () => {
      const parts: DiffPart[] = [
        { value: 'one two', added: true },
      ];
      const stats = computeStats(parts);
      expect(stats.additions).toBe(2);
      expect(stats.deletions).toBe(0);
      expect(stats.unchanged).toBe(0);
    });

    it('should correctly count deletions', () => {
      const parts: DiffPart[] = [
        { value: 'one two three', removed: true },
      ];
      const stats = computeStats(parts);
      expect(stats.additions).toBe(0);
      expect(stats.deletions).toBe(3);
      expect(stats.unchanged).toBe(0);
    });

    it('should correctly count unchanged words', () => {
      const parts: DiffPart[] = [
        { value: 'one two three' },
      ];
      const stats = computeStats(parts);
      expect(stats.unchanged).toBe(3);
    });

    it('should calculate change percentage', () => {
      const parts: DiffPart[] = [
        { value: 'unchanged' }, // 1 word
        { value: 'added', added: true }, // 1 word
        { value: 'removed', removed: true }, // 1 word
      ];
      const stats = computeStats(parts);
      expect(stats.totalChanges).toBe(2);
      expect(stats.changePercentage).toBeCloseTo(66.67, 1);
    });

    it('should handle empty parts', () => {
      const stats = computeStats([]);
      expect(stats.additions).toBe(0);
      expect(stats.deletions).toBe(0);
      expect(stats.unchanged).toBe(0);
      expect(stats.changePercentage).toBe(0);
    });
  });

  describe('combineStats', () => {
    it('should combine multiple stats correctly', () => {
      const statsArray = [
        { additions: 5, deletions: 2, unchanged: 10, totalChanges: 7, changePercentage: 0 },
        { additions: 3, deletions: 1, unchanged: 5, totalChanges: 4, changePercentage: 0 },
      ];
      const combined = combineStats(statsArray);
      expect(combined.additions).toBe(8);
      expect(combined.deletions).toBe(3);
      expect(combined.unchanged).toBe(15);
      expect(combined.totalChanges).toBe(11);
      expect(combined.changePercentage).toBeCloseTo(42.31, 1);
    });

    it('should handle empty array', () => {
      const combined = combineStats([]);
      expect(combined.additions).toBe(0);
      expect(combined.deletions).toBe(0);
      expect(combined.changePercentage).toBe(0);
    });
  });
});
