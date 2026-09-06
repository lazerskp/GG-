/**
 * Pure YouTube ID extraction and normalization utility.
 * Safe for both React Server Components / server-only modules and Client Components.
 */
export function extractCleanYouTubeId(rawId: string): string {
  if (!rawId || typeof rawId !== 'string') return '';
  const trimmed = rawId.trim();
  // 1. YouTube URL matching (youtu.be, watch?v=, embed/)
  const urlMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([A-Za-z0-9_-]{11})/
  );
  if (urlMatch && urlMatch[1]) return urlMatch[1];
  // 2. Direct 11-char YouTube Video ID
  const directMatch = trimmed.match(/^[A-Za-z0-9_-]{11}$/);
  if (directMatch) return directMatch[0];
  return trimmed;
}
