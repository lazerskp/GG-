/**
 * Format a YYYY-MM-DD date into an editorial publication string
 * e.g. "SATURDAY, SEPTEMBER 5, 2026"
 * Safe for both Client and Server Components.
 */
export function formatEditorialDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dateObj = new Date(Date.UTC(year, month, day));
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }).toUpperCase();
    }
  } catch {
    // Fallback if parsing fails
  }
  return dateStr.toUpperCase();
}
