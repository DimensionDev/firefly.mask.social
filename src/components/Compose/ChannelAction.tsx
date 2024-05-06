import { Popover } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';

import { ChannelSearchPanel } from '@/components/Compose/ChannelSearchPanel.js';
import type { SocialPlatform } from '@/constants/enum.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export interface ChannelActionProps {
    isRootPost: boolean;
    channelList: Channel[];
    channel: Channel;
    inputText: string;
    queryResult: ReturnType<typeof useQuery>;
    setInputText: (input: string) => void;
    updateChannel: (channel: Channel) => void;
    source: SocialPlatform;
}
export function ChannelAction({
    isRootPost,
    channelList,
    channel,
    queryResult,
    inputText,
    setInputText,
    updateChannel,
    source,
}: ChannelActionProps) {
    return (
        <div className=" flex h-9 items-center justify-between pb-safe">
            <span className=" text-[15px] text-secondary">
                <Trans>{resolveSourceName(source)} channel</Trans>
            </span>
            <Popover as="div" className="relative">
                {(_) => (
                    <>
                        <Popover.Button
                            className=" flex cursor-pointer gap-1 text-main focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!isRootPost}
                        >
                            <span className=" text-[15px] font-bold">{channel.name}</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                        </Popover.Button>
                        <ChannelSearchPanel
                            inputText={inputText}
                            queryResult={queryResult}
                            setInputText={setInputText}
                            channelList={channelList}
                            selectChannel={updateChannel}
                            selectedChannel={channel}
                        />
                    </>
                )}
            </Popover>
        </div>
    );
}
