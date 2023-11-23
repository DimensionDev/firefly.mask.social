/**
 * Strip a url, truncate it to a given max length and add ellipsis if truncated.
 *
 * @param url url to truncate
 * @param maxLength number of characters to truncate to
 * @returns truncated url
 */
export function formatUrl(url: string, maxLength: number): string {
    const strippedUrl = url.replace(/^(http|https):\/\//, '').replace(/^www\./, '');

    if (strippedUrl.length > maxLength) {
        return strippedUrl.substring(0, maxLength - 1) + '…';
    }
    return strippedUrl;
}
