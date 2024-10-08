import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { createPageTitleOG } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { getWalletProfileByAddressOrEns } from '@/services/getWalletProfileByAddressOrEns.js';

export async function createMetadataWalletProfile(addressOrEns: string) {
    const walletProfile = await getWalletProfileByAddressOrEns(addressOrEns, false);
    if (!walletProfile) return createSiteMetadata();

    const title = walletProfile.primary_ens
        ? createPageTitleOG(walletProfile.primary_ens)
        : createPageTitleOG(`${formatAddress(walletProfile.address, 4)}`);
    const description = walletProfile.address;
    const images = [getStampAvatarByProfileId(Source.Wallet, addressOrEns)];

    return createSiteMetadata({
        title,
        description,
        openGraph: {
            type: 'profile',
            url: urlcat(SITE_URL, resolveProfileUrl(Source.Wallet, addressOrEns)),
            title,
            description,
            images,
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images,
        },
    });
}
