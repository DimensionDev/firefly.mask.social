export function fixUrlProtocol(url: string) {
    if (url.match(/^https?:\/\//)) {
        return url;
    }
    return `https://${url}`;
}
