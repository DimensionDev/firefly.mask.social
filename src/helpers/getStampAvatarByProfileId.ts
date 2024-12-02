import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { FIREFLY_STAMP_URL } from '@/constants/index.js';

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
        case Source.DAOs:
        case Source.Polymarket:
            return urlcat(FIREFLY_STAMP_URL, '/:address', { address: profileId });
        case Source.Telegram:
        case Source.Google:
        case Source.Apple:
            return '';
        default:
            safeUnreachable(source);
            return '';
    }
}
