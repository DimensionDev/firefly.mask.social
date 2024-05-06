import { Popover, Transition } from '@headlessui/react';
import { last } from 'lodash-es';
import { Fragment } from 'react';

import RadioDisableNoIcon from '@/assets/radio.disable-no.svg';
import SearchIcon from '@/assets/search.svg';
import YesIcon from '@/assets/yes.svg';
import { Avatar } from '@/components/Avatar.js';
import { SearchInput } from '@/components/Search/SearchInput.js';
import { classNames } from '@/helpers/classNames.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface ChannelSearchPanelProps {
    channelList: Channel[];
    selectChannel: (channel: Channel) => void;
    selectedChannel: Channel | null;
    inputText: string;
    setInputText: (input: string) => void;
}

export function ChannelSearchPanel({
    channelList,
    selectChannel,
    selectedChannel,
    inputText,
    setInputText,
}: ChannelSearchPanelProps) {
    const isSmall = useIsSmall('max');
    return (
        <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0 translate-y-1"
        >
            <Popover.Panel className="absolute bottom-full right-0 flex w-[320px] -translate-y-3 flex-col gap-2 rounded-lg bg-bgModal p-3 text-[15px] shadow-popover dark:border dark:border-line dark:shadow-none ">
                <div className="relative flex flex-grow items-center rounded-xl px-3 text-main bg-gray-100">
                    <SearchIcon width={18} height={18} className="shrink-0" />
                    <SearchInput
                        value={inputText}
                        onChange={(ev) => setInputText(ev.target.value)}
                        onClear={() => setInputText('')}
                    />
                </div>
                <div className="channel-list flex flex-col gap-2">
                    {channelList.map((channel) => (
                        <Fragment key={channel.id}>
                            <div
                                className={'flex h-[32px] cursor-pointer items-center justify-between'}
                                onClick={() => {
                                    if (channel.id !== selectedChannel?.id) {
                                        selectChannel(channel);
                                    }
                                }}
                            >
                                <div className={'flex h-[24px] items-center gap-2'}>
                                    <Avatar
                                        className="mr-3 shrink-0 rounded-full border"
                                        src={channel.imageUrl}
                                        size={isSmall ? 24 : 24}
                                        alt={channel.name}
                                    />
                                    <span className={classNames(' font-bold text-main')}>{channel.name}</span>
                                </div>
                                {channel.id === selectedChannel?.id ? (
                                    <YesIcon width={40} height={40} className=" relative -right-[10px]" />
                                ) : (
                                    <RadioDisableNoIcon width={20} height={20} className=" text-secondaryLine" />
                                )}
                            </div>
                        </Fragment>
                    ))}
                </div>
            </Popover.Panel>
        </Transition>
    );
}
