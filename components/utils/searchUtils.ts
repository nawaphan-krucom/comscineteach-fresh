export function calculateSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  // Very small similarity heuristic: longest common substring ratio
  const A = a.toLowerCase();
  const B = b.toLowerCase();
  let best = 0;
  for (let i = 0; i < A.length; i++) {
    for (let j = i + 1; j <= A.length; j++) {
      const sub = A.slice(i, j);
      if (sub && B.includes(sub)) best = Math.max(best, sub.length);
    }
  }
  return best / Math.max(A.length, B.length || 1);
}

export function highlightMatches(text: string, query: string, fuzzyEnabled?: boolean, fuzzyThreshold?: number): string {
  if (!query) return text;
  // If fuzzy matching requested, we currently fall back to simple substring highlighting.
  try {
    const pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(pattern, 'gi');
    return text.replace(re, (m) => `<<${m}>>`);
  } catch {
    return text;
  }
}

export default { calculateSimilarity, highlightMatches };
