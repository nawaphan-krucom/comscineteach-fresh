function levenshtein(a: string, b: string): number {
  const A = a || '';
  const B = b || '';
  const la = A.length;
  const lb = B.length;
  if (la === 0) return lb;
  if (lb === 0) return la;
  const dp: number[][] = Array.from({ length: la + 1 }, () => new Array(lb + 1).fill(0));
  for (let i = 0; i <= la; i++) dp[i][0] = i;
  for (let j = 0; j <= lb; j++) dp[0][j] = j;
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = A[i - 1].toLowerCase() === B[j - 1].toLowerCase() ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[la][lb];
}

export function calculateSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  const dist = levenshtein(a, b);
  const sim = Math.max(0, (maxLen - dist) / maxLen);
  return sim;
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function highlightMatches(text: string, query: string, fuzzyEnabled = false, fuzzyThreshold = 0.6): string {
  if (!query) return escapeHtml(text);
  const escapedText = escapeHtml(text);
  const tokens = String(query).trim().split(/\s+/).filter(Boolean);
  if (!fuzzyEnabled) {
    // simple substring highlighter (case-insensitive)
    const pattern = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const re = new RegExp(pattern, 'gi');
    return escapedText.replace(re, (m) => `<mark>${m}</mark>`);
  }

  // fuzzy: highlight token only when similarity is above threshold with sliding window
  let out = escapedText;
  for (const t of tokens) {
    const q = t.toLowerCase();
    const len = q.length;
    if (len === 0) continue;
    // naive sliding window to find best matching substring
    let bestIndex = -1;
    let bestScore = 0;
    for (let i = 0; i <= out.length - len; i++) {
      const substr = out.slice(i, i + len).replace(/<[^>]+>/g, '');
      const score = calculateSimilarity(substr.toLowerCase(), q);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }
    if (bestScore >= fuzzyThreshold && bestIndex >= 0) {
      // inject mark for the first occurrence only (safe replacement)
      const before = out.slice(0, bestIndex);
      const match = out.slice(bestIndex, bestIndex + len);
      const after = out.slice(bestIndex + len);
      out = `${before}<mark>${match}</mark>${after}`;
    }
  }
  return out;
}

export default { calculateSimilarity, highlightMatches };
