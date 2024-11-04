import urlcat from 'urlcat';

export async function recordDevelopmentAPI(url: string) {
    return fetch(urlcat('/api/settings/rootAPI', { url }), {
        method: 'POST',
    });
}
