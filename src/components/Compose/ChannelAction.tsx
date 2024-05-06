import { Popover } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Trans } from '@lingui/macro';

import { ChannelSearchPanel } from '@/components/Compose/ChannelSearchPanel.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export interface ChannelActionProps {
    isRootPost: boolean;
    channelList: Channel[];
    channel: Channel;
    inputText: string;
    setInputText: (input: string) => void;
    updateChannel: (channel: Channel) => void;
}
export function ChannelAction({
    isRootPost,
    channelList,
    channel,
    inputText,
    setInputText,
    updateChannel,
}: ChannelActionProps) {
    return (
        <div className=" flex h-9 items-center justify-between pb-safe">
            <span className=" text-[15px] text-secondary">
                <Trans>Farcaster channel</Trans>
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
                            setInputText={setInputText}
                            channelList={channelList}
                            selectChannel={(c) => {
                                updateChannel(c);
                            }}
                            selectedChannel={channel}
                        />
                    </>
                )}
            </Popover>
        </div>
    );
}
