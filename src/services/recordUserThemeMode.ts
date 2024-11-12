import urlcat from 'urlcat';

export async function recordUserThemeMode(rootClass: string) {
    return fetch(urlcat('/api/settings/theme', { root_class: rootClass }), {
        method: 'POST',
    });
}
