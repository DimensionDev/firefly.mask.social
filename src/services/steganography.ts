import { encodeArrayBuffer } from '@masknet/kit';
import {
    AlgorithmVersion,
    decode,
    DEFAULT_MASK,
    encode,
    type EncodeOptions,
    GrayscaleAlgorithm,
    TransformAlgorithm,
} from '@masknet/stego-js';

import { fetchBlob } from '@/helpers/fetchBlob.js';
import { getImageDimension } from '@/helpers/getImageDimension.js';

const libV2AlgrDefaults: Omit<EncodeOptions, 'text'> = {
    size: 8,
    narrow: 0,
    copies: 3,
    tolerance: 400,
    exhaustPixels: false,
    cropEdgePixels: false,
    fakeMaskPixels: false,
    grayscaleAlgorithm: GrayscaleAlgorithm.NONE,
    transformAlgorithm: TransformAlgorithm.FFT2D,
    version: AlgorithmVersion.V2,
};

export enum SteganographyPreset {
    Preset2023 = '2023',
    Preset202312 = '2023-12',
}

const PRESET_SETTINGS: Record<
    SteganographyPreset,
    {
        preset: SteganographyPreset;
        description: string;
        mask: string | null;
        payload: string;
        width: number;
        height: number;
        options: Omit<EncodeOptions, 'text'>;
    }
> = {
    [SteganographyPreset.Preset2023]: {
        preset: SteganographyPreset.Preset2023,
        description: 'the preset mask network used for payload V37',
        mask: null,
        width: 1200,
        height: 671,
        payload: '/image/payload-2023.png',
        options: libV2AlgrDefaults,
    },
    [SteganographyPreset.Preset202312]: {
        preset: SteganographyPreset.Preset202312,
        description: 'the preset mask network used for payload V37',
        mask: null,
        width: 960,
        height: 672,
        payload: '/image/payload-202312.png',
        options: libV2AlgrDefaults,
    },
};

export async function steganographyEncodeImage(data: string | ArrayBuffer, preset = SteganographyPreset.Preset202312) {
    const settings = PRESET_SETTINGS[preset];
    if (!settings) throw new Error('Failed to create preset.');

    const blankImage = await fetchBlob(settings.payload).then((x) => x.arrayBuffer());
    const maskImage = settings.mask
        ? await fetchBlob(settings.mask).then((x) => x.arrayBuffer())
        : new Uint8Array(DEFAULT_MASK);
    const text = typeof data === 'string' ? data : encodeArrayBuffer(data);

    const secretImage = new Uint8Array(
        await encode(blankImage, maskImage, {
            ...settings.options,
            text,
            pass: 'mask',
        }),
    );
    return new Blob([secretImage], { type: 'image/png' });
}

export async function steganographyDecodeImage(image: Blob) {
    const dimension = await getImageDimension(image);
    const settings = Object.values(PRESET_SETTINGS).find(
        (x) => x.width === dimension.width && x.height === dimension.height,
    );
    if (!settings) return null;

    const secretImage = image instanceof Blob ? await image.arrayBuffer() : image;
    const maskImage = settings.mask
        ? await fetchBlob(settings.mask).then((x) => x.arrayBuffer())
        : new Uint8Array(DEFAULT_MASK);
    const result = await decode(secretImage, maskImage, {
        ...settings.options,
        pass: 'mask',
    });
    return [result, settings.preset] as const;
}
