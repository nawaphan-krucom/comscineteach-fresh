import { calculateSimilarity, highlightMatches } from '../components/utils/searchUtils';

describe('searchUtils', () => {
  test('calculateSimilarity returns higher score for similar strings', () => {
    const sim = calculateSimilarity('kitten', 'sitting');
    expect(sim).toBeGreaterThan(0);
    const sim2 = calculateSimilarity('apple', 'apple');
    expect(sim2).toBeCloseTo(1, 5);
  });

  test('highlightMatches wraps exact substring with <mark>', () => {
    const out = highlightMatches('Hello world', 'world', false);
    expect(out).toContain('<mark>world</mark>');
  });

  test('highlightMatches escapes HTML in input', () => {
    const out = highlightMatches('<b>bold</b> text', 'bold', false);
    expect(out).toContain('&lt;b&gt;');
    expect(out).toContain('<mark>bold</mark>');
  });
});