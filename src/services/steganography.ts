import {
    steganographyDecodeImage as decodeImage,
    steganographyEncodeImage as encodeImage,
    SteganographyPreset,
} from '@masknet/encryption';

import { FileMimeType } from '@/constants/enum.js';
import { fetchArrayBuffer } from '@/helpers/fetchArrayBuffer.js';
import { fetchArrayBufferS3 } from '@/helpers/fetchArrayBufferS3.js';

export async function steganographyEncodeImage(
    image: Blob | string,
    data: Uint8Array | string,
    preset = SteganographyPreset.Preset2023_Firefly,
) {
    const blankImage = typeof image === 'string' ? await fetchArrayBuffer(image) : await image.arrayBuffer();
    const secretImage = await encodeImage(blankImage, {
        data,
        preset,
        password: 'mask',
        downloadImage: fetchArrayBuffer,
    });
    return new Blob([secretImage], { type: FileMimeType.PNG });
}

export async function steganographyDecodeImage(image: Blob | string) {
    return decodeImage(image, {
        password: 'mask',
        downloadImage: fetchArrayBufferS3,
    });
}
