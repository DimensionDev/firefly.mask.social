import type { Metadata } from 'next';
import { notFound } from 'next/navigation.js';

import SuggestedFollowUsersList from '@/components/SuggestedFollows/SuggestedFollowUsersList.js';
import { type SocialSourceInURL, Source } from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';

interface Props {
    searchParams: { source: SocialSourceInURL };
}

export async function generateMetadata(): Promise<Metadata> {
    return createSiteMetadata();
}

export default function TrendingUsers(props: Props) {
    if (isBotRequest()) return null;

    const source = resolveSocialSource(props.searchParams.source);

    if (source !== Source.Farcaster && source !== Source.Lens) {
        notFound();
    }

    return <SuggestedFollowUsersList source={source} />;
}
