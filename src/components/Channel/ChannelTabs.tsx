import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { memo, Suspense } from 'react';

import { ChannelTrending } from '@/components/Channel/ChannelTrending.js';
import { PostList } from '@/components/Channel/PostList.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Loading } from '@/components/Loading.js';
import { ChannelTabType } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { useStateWithSearchParams } from '@/hooks/useStateWithSearchParams.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface ChannelTabsProps {
    channel: Channel;
}

const ContentList = memo(function ContentList({ type, channel }: { type: ChannelTabType; channel: Channel }) {
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

export function ChannelTabs({ channel }: ChannelTabsProps) {
    const [currentTab, setCurrentTab] = useStateWithSearchParams<ChannelTabType>(
        'channel_tab',
        ChannelTabType.Recent,
    );

    return (
        <>
            <div className="scrollable-tab flex justify-evenly px-5">
                {[
                    {
                        type: ChannelTabType.Recent,
                        title: <Trans>Recent</Trans>,
                    },
                    {
                        type: ChannelTabType.Trending,
                        title: <Trans>Trending</Trans>,
                    },
                ].map(({ type, title }) => (
                    <div key={type} className="flex flex-col">
                        <ClickableButton
                            className={classNames(
                                'flex h-[55px] items-center px-[14px] font-extrabold transition-all',
                                currentTab === type ? 'text-main' : 'text-third hover:text-main',
                            )}
                            onClick={() => setCurrentTab(type)}
                        >
                            {title}
                        </ClickableButton>
                        <span
                            className={classNames(
                                'h-1 w-full rounded-full bg-fireflyBrand transition-all',
                                currentTab !== type ? 'hidden' : '',
                            )}
                        />
                    </div>
                ))}
            </div>

            <Suspense fallback={<Loading />}>
                <ContentList type={currentTab} channel={channel} />
            </Suspense>
        </>
    );
}
