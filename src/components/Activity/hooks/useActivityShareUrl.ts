import { createLookupTableResolver } from '@masknet/shared-base';
import urlcat from 'urlcat';

import { useActivityCurrentAccountHandle } from '@/components/Activity/hooks/useActivityCurrentAccountHandle.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { SITE_URL } from '@/constants/index.js';
import { ReferralAccountPlatform, resolveActivityUrl } from '@/helpers/resolveActivityUrl.js';

const resolveReferralAccountPlatformFromSocialSource = createLookupTableResolver<SocialSource, ReferralAccountPlatform>(
    {
        [Source.Twitter]: ReferralAccountPlatform.X,
        [Source.Farcaster]: ReferralAccountPlatform.Farcaster,
        [Source.Lens]: ReferralAccountPlatform.Lens,
    },
    (source) => {
        throw new UnreachableError('social source', source);
    },
);

export function useActivityShareUrl(name: string) {
    let source: SocialSource = Source.Twitter;
    switch (name) {
        case 'hlbl':
            source = Source.Twitter;
            break;
        case 'elex24':
            source = Source.Twitter;
            break;
        case 'frensgiving':
            source = Source.Farcaster;
            break;
    }
    const handle = useActivityCurrentAccountHandle(source);
    return urlcat(
        SITE_URL,
        resolveActivityUrl(name, {
            referralCode: handle,
            platform: resolveReferralAccountPlatformFromSocialSource(source),
        }),
    );
}
