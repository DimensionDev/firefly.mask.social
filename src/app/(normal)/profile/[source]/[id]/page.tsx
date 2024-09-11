import type { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation.js';

import {
    KeyType,
    SocialProfileCategory,
    type SocialSource,
    SourceInURL,
    WalletProfileCategory,
} from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { isSocialSourceInURL } from '@/helpers/isSocialSource.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSource, resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { getProfileOGById } from '@/services/getProfileOGById.js';

const getProfileOGByIdRedis = memoizeWithRedis(getProfileOGById, {
    key: KeyType.GetProfileOGById,
});

interface Props {
    params: {
        id: string;
        source: SourceInURL;
    };
    searchParams: { source?: SourceInURL; profile_tab?: SocialProfileCategory; wallet_tab?: WalletProfileCategory };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    if (isSocialSourceInURL(params.source)) {
        return getProfileOGByIdRedis(params.source, params.id);
    }
    return createSiteMetadata();
}

export default function Page({ params, searchParams }: Props) {
    if (isBotRequest()) return null;
    if (!isSocialSourceInURL(params.source as SourceInURL) && params.source !== SourceInURL.Wallet) {
        const source = resolveSourceFromUrl(searchParams.source ?? '') as SocialSource;
        return redirect(resolveProfileUrl(source, params.source));
    }
    return redirect(
        resolveProfileUrl(
            resolveSource(params.source) as SocialSource,
            params.id,
            params.source === SourceInURL.Wallet ? searchParams.wallet_tab : searchParams.profile_tab,
        ),
        RedirectType.replace,
    );
}
