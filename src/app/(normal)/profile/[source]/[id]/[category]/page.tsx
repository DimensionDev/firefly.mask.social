import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Loading } from '@/components/Loading.js';
import { ProfilePageTimeline } from '@/components/Profile/ProfilePageTimeline.js';
import { KeyType, type ProfileCategory, type SocialSourceInURL } from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isSocialSourceInURL } from '@/helpers/isSocialSource.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { getProfileOGById } from '@/services/getProfileOGById.js';

interface Props {
    params: {
        id: string;
        category: ProfileCategory;
        source: SocialSourceInURL;
    };
}

const getProfileOGByIdRedis = memoizeWithRedis(getProfileOGById, {
    key: KeyType.GetProfileOGById,
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    if (isSocialSourceInURL(params.source)) {
        return getProfileOGByIdRedis(params.source, params.id);
    }
    return createSiteMetadata();
}

export default function Page({ params }: Props) {
    return (
        <Suspense fallback={<Loading />}>
            <ProfilePageTimeline
                category={params.category}
                identity={{ id: params.id, source: resolveSourceFromUrl(params.source) }}
            />
        </Suspense>
    );
}
