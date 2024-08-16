import { Source, WalletSource } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';

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
