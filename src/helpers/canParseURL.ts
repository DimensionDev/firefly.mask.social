export function canParseURL(url: string) {
    try {
        return URL.canParse(url);
    } catch {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}
