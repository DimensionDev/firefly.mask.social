import { safeUnreachable } from '@masknet/kit';
import { memo } from 'react';

import { ChannelTrending } from '@/components/Channel/ChannelTrending.js';
import { PostList } from '@/components/Channel/PostList.js';
import { ChannelTabType } from '@/constants/enum.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export const ChannelContentList = memo(function ChannelContentList({
    type,
    channel,
}: {
    type: ChannelTabType;
    channel: Channel;
}) {
    switch (type) {
        case ChannelTabType.Trending:
            return <ChannelTrending source={channel.source} channel={channel} />;
        case ChannelTabType.Recent:
            return <PostList source={channel.source} channel={channel} />;
        default:
            safeUnreachable(type);
            return null;
    }
});
