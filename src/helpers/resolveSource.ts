import { createLookupTableResolver } from '@masknet/shared-base';

import { type SocialSource, type SocialSourceInURL, Source, SourceInURL } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export const resolveSource = createLookupTableResolver<SourceInURL, Source>(
    {
        [SourceInURL.Farcaster]: Source.Farcaster,
        [SourceInURL.Lens]: Source.Lens,
        [SourceInURL.Twitter]: Source.Twitter,
        [SourceInURL.Firefly]: Source.Firefly,
        [SourceInURL.Article]: Source.Article,
        [SourceInURL.Wallet]: Source.Wallet,
        [SourceInURL.NFTs]: Source.NFTs,
    },
    (sourceInUrl) => {
        throw new UnreachableError('sourceInUrl', sourceInUrl);
    },
);

export const resolveSourceFromUrl = (source: SourceInURL | string) => {
    try {
        return resolveSource(source as SourceInURL);
    } catch {
        return Source.Farcaster;
    }
};

export const resolveSocialSource = createLookupTableResolver<SocialSourceInURL, SocialSource>(
    {
        [SourceInURL.Farcaster]: Source.Farcaster,
        [SourceInURL.Lens]: Source.Lens,
        [SourceInURL.Twitter]: Source.Twitter,
    },
    (sourceInUrl) => {
        throw new UnreachableError('sourceInUrl', sourceInUrl);
    },
);

export const resolveSocialSourceFromSessionType = createLookupTableResolver<SessionType, SocialSource>(
    {
        [SessionType.Farcaster]: Source.Farcaster,
        [SessionType.Lens]: Source.Lens,
        [SessionType.Twitter]: Source.Twitter,
        // not correct in some situations
        [SessionType.Firefly]: Source.Farcaster,
    },
    (sessionType) => {
        throw new UnreachableError('sessionType', sessionType);
    },
);

export const resolveFireflyPlatform = resolveSourceInURL;
