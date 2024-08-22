import { type SocialSource, type SocialSourceInURL, Source, SourceInURL, WalletSource } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
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

export const resolveSourceFromSessionType = createLookupTableResolver<SessionType, Source>(
    {
        [SessionType.Farcaster]: Source.Farcaster,
        [SessionType.Lens]: Source.Lens,
        [SessionType.Twitter]: Source.Twitter,
        [SessionType.Wallet]: Source.Wallet,
        [SessionType.Firefly]: Source.Firefly,
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
        [SessionType.Wallet]: Source.Farcaster,
        // not correct in some situations
        [SessionType.Firefly]: Source.Farcaster,
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
    },
    (walletSource) => {
        throw new UnreachableError('WalletSource', walletSource);
    },
);
