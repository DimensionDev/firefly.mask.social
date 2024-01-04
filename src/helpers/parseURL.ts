/**
 * Parses the input URL string and returns a URL object.
 * If the input URL is invalid, it tries prepending "https://" and parses again.
 * Returns null if the URL is still invalid after the modification.
 *
 * @param {string} url - The URL string to be parsed.
 * @returns {URL | null} - The parsed URL object or null if parsing fails.
 */
export function parseURL(url: string) {
    if (URL.canParse(url)) return new URL(url);
    if (URL.canParse(`https://${url}`)) return new URL(`https://${url}`);
    return null;
}
