import {
    steganographyDecodeImage as decodeImage,
    steganographyEncodeImage as encodeImage,
    SteganographyPreset,
} from '@masknet/encryption';

import { fetchArrayBuffer } from '@/helpers/fetchArrayBuffer.js';

export async function steganographyEncodeImage(
    image: Blob | string,
    data: Uint8Array | string,
    preset = SteganographyPreset.Preset2023,
) {
    const blankImage = typeof image === 'string' ? await fetchArrayBuffer(image) : await image.arrayBuffer();
    const secretImage = await encodeImage(blankImage, {
        data,
        preset,
        password: 'mask',
        downloadImage: fetchArrayBuffer,
    });
    return new Blob([secretImage], { type: 'image/png' });
}

export async function steganographyDecodeImage(image: Blob | string) {
    return decodeImage(image, {
        password: 'mask',
        downloadImage: fetchArrayBuffer,
    });
}
