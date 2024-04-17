'use client';

import { t } from '@lingui/macro';
import { useMemo } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import { ContentTabs } from '@/components/Channel/ContentTabs.js';
import { Info } from '@/components/Channel/Info.js';
import { Title } from '@/components/Channel/Title.js';
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

            <ContentTabs source={channel.source} channelId={channel.id} />
        </div>
    );
}
