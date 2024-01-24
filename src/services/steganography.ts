import {
    steganographyDecodeImage as decodeImage,
    steganographyEncodeImage as encodeImage,
    SteganographyPreset,
} from '@masknet/encryption';
import { encodeArrayBuffer } from '@masknet/kit';

import { fetchArrayBuffer } from '@/helpers/fetchArrayBuffer.js';

export async function steganographyEncodeImage(image: Blob | string, data: string | ArrayBuffer) {
    const blankImage = typeof image === 'string' ? await fetchArrayBuffer(image) : await image.arrayBuffer();
    const text = typeof data === 'string' ? data : encodeArrayBuffer(data);
    const secretImage = await encodeImage(blankImage, {
        data: text,
        password: 'mask',
        downloadImage: fetchArrayBuffer,
        preset: SteganographyPreset.Preset2023,
    });
    return new Blob([secretImage], { type: 'image/png' });
}

export async function steganographyDecodeImage(image: Blob | string) {
    return decodeImage(image, {
        downloadImage: fetchArrayBuffer,
        password: 'mask',
    });
}
