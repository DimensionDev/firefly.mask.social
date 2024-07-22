export function fixUrlProtocol(url: string) {
    return url.startsWith('http') ? url : `https://${url}`;
}
