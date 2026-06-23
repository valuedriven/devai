/**
 * Generates a URL-safe slug from a string.
 * Converts to lowercase, removes special characters, and replaces spaces with hyphens.
 */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Replace & with 'and'
      .replace(/&/g, 'and')
      // Replace non-alphanumeric with hyphens
      .replace(/[^a-z0-9]+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '')
  );
}

/**
 * Normalizes a name for case-insensitive uniqueness comparison.
 * Converts to lowercase and trims whitespace.
 */
export function normalizeName(name: string): string {
  return name.toLowerCase().trim();
}
