'use client';

import { Trans } from '@lingui/macro';
import { useParams } from 'next/navigation.js';

import NotFound from '@/components/NotFound.js';
import { SearchType, type SocialSourceInURL, Source } from '@/constants/enum.js';
import { isSocialSourceInUrl } from '@/helpers/isSocialSource.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';

export default function ChannelNotFound() {
    const params = useParams<{ id: string; source: SocialSourceInURL }>();
    const id = decodeURIComponent(params.id);
    const socialSource = isSocialSourceInUrl(params.source) ? resolveSocialSource(params.source) : undefined;
    const isLens = socialSource === Source.Lens;

    return (
        <NotFound
            backText={isLens ? <Trans>Club</Trans> : <Trans>Channel</Trans>}
            text={
                isLens ? <Trans>Club {id} could not be found.</Trans> : <Trans>Channel {id} could not be found.</Trans>
            }
            search={{
                text: <Trans>Search {id}</Trans>,
                searchText: id,
                searchType: SearchType.Channels,
                source: socialSource,
            }}
        />
    );
}
