export function getTwitterProfileHandleFromUrl(url: string) {
    const twitterDomain = 'https://twitter.com/';
    const xDomain = 'https://x.com/';
    if (url.startsWith(twitterDomain)) return url.substring(twitterDomain.length);
    if (url.startsWith(xDomain)) return url.substring(xDomain.length);
    return null;
}
