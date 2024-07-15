import { fetchSquashed } from '@/helpers/fetchSquashed.js';

export async function resolveFirstAvailableUrl(urls: string[], timeout = 10 * 1000) {
    for (const url of urls) {
        const response = await fetchSquashed(url, {
            method: 'GET',
            signal: AbortSignal.timeout(timeout),
        });
        if (response.ok) return url;
        continue;
    }
    return;
}
