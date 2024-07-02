/**
 * Returns an array of URLs found in the specified text.
 *
 * @param text The text to get URLs from.
 * @returns An array of URLs.
 */
export function removeUrlAtEnd(url: string, content: string): string {
    if (url && content) {
        content = content.trimEnd();
        const indexOfUrl = content.indexOf(url);
        if (indexOfUrl === content.length - url.length) {
            return content?.replace(url, '');
        } else {
            return content;
        }
    } else {
        return content ?? '';
    }
}
