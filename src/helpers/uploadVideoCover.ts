import { FileMimeType, SourceInURL } from '@/constants/enum.js';
import { generateVideoCover } from '@/helpers/generateVideoCover.js';
import { uploadToS3 } from '@/services/uploadToS3.js';
import type { MediaObject } from '@/types/compose.js';

export async function uploadVideoCover(media: MediaObject) {
    const covers = await generateVideoCover(media.file, 4);
    if (!covers.length) return;
    return await uploadToS3(new File([covers[1] ?? covers[0]], '', { type: FileMimeType.PNG }), SourceInURL.Lens);
}
