import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { createPageTitleV2 } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { resolveFireflyProfiles } from '@/helpers/resolveFireflyProfiles.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export async function getWalletProfileOG(addressOrEns: string) {
    const identity = { id: addressOrEns, source: Source.Wallet } as const;
    const profiles = await FireflySocialMediaProvider.getAllPlatformProfileByIdentity(identity);
    const { walletProfile } = resolveFireflyProfiles(identity, profiles);
    if (!walletProfile) return createSiteMetadata();
    const title = walletProfile.primary_ens
        ? createPageTitleV2(walletProfile.primary_ens)
        : createPageTitleV2(`${formatAddress(walletProfile.address, 4)}`);
    const description = walletProfile.address;
    const images = [getStampAvatarByProfileId(identity.source, identity.id)];
    return createSiteMetadata({
        title,
        description,
        openGraph: {
            type: 'profile',
            url: urlcat(SITE_URL, resolveProfileUrl(identity.source, identity.id)),
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
