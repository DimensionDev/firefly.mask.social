'use client';

import { t } from '@lingui/macro';
import { Suspense, useMemo } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import { Info } from '@/components/Channel/Info.js';
import { PostList } from '@/components/Channel/PostList.js';
import { Title } from '@/components/Channel/Title.js';
import { Loading } from '@/components/Loading.js';
import { SITE_NAME } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface ChannelPageProps {
    channel: Channel;
}

export function ChannelPage({ channel }: ChannelPageProps) {
    const title = useMemo(() => {
        if (!channel) return SITE_NAME;
        const fragments = [channel.name];
        if (channel.id) fragments.push(`(/${channel.id})`);
        return createPageTitle(fragments.join(' '));
    }, [channel]);

    useDocumentTitle(title);
    useNavigatorTitle(t`Channel`);

    return (
        <div>
            <Title channel={channel} />

            <Info channel={channel} source={channel.source} />

            <hr className=" divider w-full border-line" />

            <Suspense fallback={<Loading />}>
                <PostList source={channel.source} channelId={channel.id} />
            </Suspense>
        </div>
    );
}
