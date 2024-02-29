export function canParseURL(url: string) {
    if (typeof URL.canParse === 'function') return URL.canParse(url);
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}
