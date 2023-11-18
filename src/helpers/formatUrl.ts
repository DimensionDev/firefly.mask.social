/**
 * Strip a url, truncate it to a given max length and add ellipsis if truncated.
 *
 * @param url url to truncate
 * @param maxLength number of characters to truncate to
 * @returns truncated url
 */
export const formatUrl = (url: string, maxLength: number): string => {
    if (!URL.canParse(url)) return '';
    const strippedUrl = new URL(url).host;

    if (strippedUrl.length > maxLength) {
        return strippedUrl.substring(0, maxLength - 1) + '…';
    }
    return strippedUrl;
};
