import { AdvertisementType } from '@/constants/enum.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { Advertisement } from '@/types/advertisement.js';

export async function downloadAdvertisement(jsonUrl: string) {
    const res = await fetchJSON<{ advertisements: Advertisement[] }>(jsonUrl);

    const advertisements = res?.advertisements ?? [];

    return Array.isArray(advertisements) ? advertisements : [];
}

export async function jsonToFile(jsonData: Advertisement[], fileName: string) {
    if (!jsonData.length) {
        throw new Error('Empty advertisement data');
    }

    return new File(
        [
            JSON.stringify({
                advertisements: jsonData,
            }),
        ],
        fileName,
        { type: 'application/json' },
    );
}

export async function clearS3Cache(path: string) {
    await fetchJSON(`/api/s3?path=${path}`, {
        method: 'DELETE',
    });
}

export function validateAdvertisement(advertisement: Advertisement) {
    if ((advertisement.sort !== 0 && !advertisement.sort) || !advertisement.image) {
        return false;
    }

    if (advertisement.type === AdvertisementType.Function && !advertisement.function) {
        return false;
    }

    if (advertisement.type === AdvertisementType.Link && !advertisement.link) {
        return false;
    }

    return true;
}
