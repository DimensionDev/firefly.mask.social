import type { ProfileMetadata } from '@lens-protocol/metadata';

import { SourceInURL } from '@/constants/enum.js';
import { uploadToS3 } from '@/services/uploadToS3.js';

export function uploadLensMetadataToS3(profile: ProfileMetadata) {
    const content = JSON.stringify(profile);
    const file = new File([content], 'lens-profile-metadata.json', {
        type: 'application/json',
    });
    return uploadToS3(file, SourceInURL.Lens);
}
