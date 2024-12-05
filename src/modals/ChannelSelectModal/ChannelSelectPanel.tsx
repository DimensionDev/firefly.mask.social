import { t, Trans } from '@lingui/macro';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';

import LinkIcon from '@/assets/link-square.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ElementAnchor } from '@/components/ElementAnchor.js';
import { Loading } from '@/components/Loading.js';
import { SearchContentPanel } from '@/components/Search/SearchContentPanel.js';
import { Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

const renderChannel = (channel: Channel) => {
    return (
        <ClickableButton
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 font-bold text-lightMain"
            enablePropagate
        >
            <div className="flex items-center gap-x-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    alt={channel.name}
                    src={channel.imageUrl}
                    className="h-8 w-8 rounded-full object-contain"
                    height={24}
                    width={24}
                />
                <div className="text-left">
                    <span>{channel.name}</span>
                    <br />
                    <span className="text-[13px] text-lightSecond">{t`${channel.followerCount} items`}</span>
                </div>
            </div>
            <a href={channel.url} target="_blank" className="ml-1 inline-block" onClick={(e) => e.stopPropagation()}>
                <LinkIcon className="h-3 w-3" />
            </a>
        </ClickableButton>
    );
};

export interface ChannelSelectPanelProps {
    source: Source.Lens | Source.Farcaster;
    onSelect(channel: Channel): void;
    isSelected?(channel: Channel): boolean;
}

export function ChannelSelectPanel({ source, onSelect, isSelected }: ChannelSelectPanelProps) {
    const [keyword, setKeyword] = useState('');
    const provider = resolveSocialMediaProvider(source);
    const {
        data: channels = EMPTY_LIST,
        isLoading,
        isFetching,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: ['search-channels', source, keyword],
        queryFn: ({ pageParam }) => provider.searchChannels(keyword, pageParam),
        initialPageParam: undefined as any,
        getNextPageParam: (lastPage) => lastPage.nextIndicator,
        select: (data) => data.pages.flatMap((x) => x.data),
    });
    return (
        <SearchContentPanel<Channel>
            isLoading={isLoading}
            placeholder={t`Search by name or symbol`}
            showFilter={false}
            keyword={keyword}
            onSearch={setKeyword}
            data={channels}
            itemRenderer={renderChannel}
            onSelected={onSelect}
            listKey={(channel) => channel.id}
            isSelected={isSelected}
        >
            {hasNextPage ? (
                <ElementAnchor className="h-8 flex-shrink-0 flex-grow-0" callback={() => fetchNextPage()}>
                    {isFetching ? <Loading className="text-main" /> : null}
                </ElementAnchor>
            ) : (
                <p className="flex-shrink-0 flex-grow-0 py-2 text-center text-xs text-second">
                    <Trans>No more data available.</Trans>
                </p>
            )}
        </SearchContentPanel>
    );
}
