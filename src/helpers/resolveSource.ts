import {
    type ProfileSource,
    type SocialSource,
    type SocialSourceInURL,
    Source,
    SourceInURL,
    WalletSource,
} from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import type { Profile as FireflyProfile } from '@/providers/types/Firefly.js';
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
        [SourceInURL.Snapshot]: Source.Snapshot,
        [SourceInURL.Polymarket]: Source.Polymarket,
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

export const resolveSourceFromUrlNoFallback = (source?: SourceInURL | string | null) => {
    try {
        return resolveSource(source as SourceInURL);
    } catch {
        return null;
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

export const resolveSocialSourceFromProfileSource = createLookupTableResolver<ProfileSource, SocialSource>(
    {
        [Source.Farcaster]: Source.Farcaster,
        [Source.Lens]: Source.Lens,
        [Source.Twitter]: Source.Twitter,
        [Source.Firefly]: Source.Farcaster,
        [Source.Telegram]: Source.Farcaster,
        [Source.Apple]: Source.Farcaster,
        [Source.Google]: Source.Farcaster,
    },
    (source) => {
        throw new UnreachableError('profile source', source);
    },
);

export const resolveSourceFromSessionType = createLookupTableResolver<SessionType, Source>(
    {
        [SessionType.Farcaster]: Source.Farcaster,
        [SessionType.Lens]: Source.Lens,
        [SessionType.Twitter]: Source.Twitter,
        [SessionType.Firefly]: Source.Firefly,
        [SessionType.Apple]: Source.Firefly,
        [SessionType.Google]: Source.Firefly,
        [SessionType.Telegram]: Source.Firefly,
    },
    (sessionType) => {
        throw new UnreachableError('sessionType', sessionType);
    },
);

export const resolveSocialSourceFromSessionType = createLookupTableResolver<SessionType, SocialSource>(
    {
        [SessionType.Farcaster]: Source.Farcaster,
        [SessionType.Lens]: Source.Lens,
        [SessionType.Twitter]: Source.Twitter,
        // not correct in some situations
        [SessionType.Firefly]: Source.Farcaster,
        [SessionType.Apple]: Source.Farcaster,
        [SessionType.Google]: Source.Farcaster,
        [SessionType.Telegram]: Source.Farcaster,
    },
    (sessionType) => {
        throw new UnreachableError('sessionType', sessionType);
    },
);

export const resolveSourceFromWalletSource = createLookupTableResolver<WalletSource, Source>(
    {
        [WalletSource.Farcaster]: Source.Farcaster,
        [WalletSource.Lens]: Source.Lens,
        [WalletSource.LensContract]: Source.Lens,
        [WalletSource.Twitter]: Source.Twitter,
        [WalletSource.Firefly]: Source.Firefly,
        [WalletSource.Article]: Source.Article,
        [WalletSource.Wallet]: Source.Wallet,
        [WalletSource.NFTs]: Source.NFTs,
        [WalletSource.Particle]: Source.Farcaster,
    },
    (walletSource) => {
        throw new UnreachableError('WalletSource', walletSource);
    },
);

export function resolveSocialSourceFromFireflyPlatform(platform: FireflyProfile['platform']): SocialSource {
    return narrowToSocialSource(resolveSource(platform));
}
