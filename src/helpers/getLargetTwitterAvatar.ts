export function getLargetTwitterAvatar(url: string) {
    if (!url.includes('pbs.twimg.com')) return url;
    return url.replace(/_normal(\.\w+)$/, '_400x400$1');
}
