import type { Metadata } from 'next';

import { ProfileCategoryPage } from '@/app/(normal)/profile/[source]/[id]/pages/ProfileCategoryPage.js';
import { KeyType, type ProfileCategory, type SocialSourceInURL } from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isSocialSourceInURL } from '@/helpers/isSocialSource.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
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

export default function Page() {
    return <ProfileCategoryPage />;
}
