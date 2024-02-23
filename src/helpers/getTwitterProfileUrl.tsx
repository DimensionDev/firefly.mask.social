import urlcat from 'urlcat';

export function getTwitterProfileUrl(handle: string) {
    if (!handle) return '';
    return urlcat('https://twitter.com/:handle', { handle });
}
