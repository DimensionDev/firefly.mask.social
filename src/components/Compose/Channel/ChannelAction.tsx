import { Popover } from '@headlessui/react';
import { Trans, t } from '@lingui/macro';
import { BugAntIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ChannelPanel } from '@/components/Compose/Channel/ChannelPanel.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export type ChannelActionProps = {
    isRootPost: boolean;
    channelList: Channel[];
    channel: Channel;
    inputText: string;
    setInputText: (v: string) => void;
    updateChannel: (c: Channel) => void;
};
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
                        <ChannelPanel
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
