export function fixUrlProtocol(u: string) {
    return u.startsWith('http') ? u : `https://${u}`;
}
