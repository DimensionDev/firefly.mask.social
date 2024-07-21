import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { FIREFLY_STAMP_URL } from '@/constants/index.js';
import { safeUnreachable } from '@/helpers/controlFlow.js';

export function getStampAvatarByProfileId(source: Source, profileId: string) {
    switch (source) {
        case Source.Lens:
            return urlcat(FIREFLY_STAMP_URL, '/lens/:id', { id: profileId });
        case Source.Farcaster:
            return urlcat(FIREFLY_STAMP_URL, '/farcaster/:id', { id: profileId });
        case Source.Twitter:
            return '';
        case Source.Firefly:
            return '';
        case Source.Wallet:
        case Source.NFTs:
        case Source.Article:
            return urlcat(FIREFLY_STAMP_URL, '/:address', { address: profileId });
        default:
            safeUnreachable(source);
            return '';
    }
}
