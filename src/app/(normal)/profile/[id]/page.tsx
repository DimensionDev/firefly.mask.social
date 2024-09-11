import type { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation.js';

import { KeyType, ProfileTabType, type SocialSource, SourceInURL, WalletProfileTabType } from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { isSocialSourceInURL } from '@/helpers/isSocialSource.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSource } from '@/helpers/resolveSource.js';
import { getProfileOGById } from '@/services/getProfileOGById.js';

const getProfileOGByIdRedis = memoizeWithRedis(getProfileOGById, {
    key: KeyType.GetProfileOGById,
});

interface Props {
    params: {
        id: string;
    };
    searchParams: { source: SourceInURL; profile_tab?: ProfileTabType; wallet_tab?: WalletProfileTabType };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    if (isSocialSourceInURL(searchParams.source)) {
        return getProfileOGByIdRedis(searchParams.source, params.id);
    }
    return createSiteMetadata();
}

export default function Page({ params, searchParams }: Props) {
    if (isBotRequest()) return null;
    return redirect(
        resolveProfileUrl(
            resolveSource(searchParams.source) as SocialSource,
            params.id,
            searchParams.source === SourceInURL.Wallet ? searchParams.wallet_tab : searchParams.profile_tab,
        ),
        RedirectType.replace,
    );
}
