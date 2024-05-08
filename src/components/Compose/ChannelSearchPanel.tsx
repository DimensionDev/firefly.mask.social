import { Popover, Transition } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { Fragment, useState } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import RadioDisableNoIcon from '@/assets/radio.disable-no.svg';
import SearchIcon from '@/assets/search.svg';
import YesIcon from '@/assets/yes.svg';
import { Avatar } from '@/components/Avatar.js';
import { SearchInput } from '@/components/Search/SearchInput.js';
import { SOURCES_WITH_CHANNEL_SUPPORT } from '@/constants/channel.js';
import { classNames } from '@/helpers/classNames.js';
import { isSameChannel } from '@/helpers/isSameChannel.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useSearchChannels } from '@/hooks/useSearchChannel.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export function ChannelSearchPanel() {
    const [inputText, setInputText] = useState('');
    const { updateChannel } = useComposeStateStore();
    const { channel: selectedChannel } = useCompositePost();

    const { data, isLoading, isError } = useSearchChannels(inputText);

    const ListBox = isLoading ? (
        <div className="m-auto">
            <LoadingIcon className="animate-spin" width={24} height={24} />
        </div>
    ) : isError ? (
        <div className="m-auto">
            <Trans>Something went wrong. Please try again.</Trans>
        </div>
    ) : !data?.length ? (
        <div className="m-auto">
            <Trans>There is no data available for display.</Trans>
        </div>
    ) : (
        data?.map((channel) => {
            const isSelected = isSameChannel(channel, selectedChannel[channel.source]);
            return (
                <Fragment key={channel.id}>
                    <div
                        className="flex h-[32px] cursor-pointer items-center justify-between"
                        onClick={() => {
                            if (!isSelected) {
                                updateChannel(channel.source, channel);
                            }
                        }}
                    >
                        <div className="flex h-[24px] items-center gap-2">
                            <Avatar
                                className="mr-3 shrink-0 rounded-full border "
                                src={channel.imageUrl}
                                size={24}
                                alt={channel.name}
                            />
                            <span className={classNames('font-bold', isSelected ? 'text-main' : 'text-secondary')}>
                                {channel.name}
                            </span>
                        </div>
                        {isSelected ? (
                            <YesIcon width={40} height={40} className=" relative -right-[10px]" />
                        ) : (
                            <RadioDisableNoIcon width={20} height={20} className=" text-secondaryLine" />
                        )}
                    </div>
                </Fragment>
            );
        })
    );

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
            <Popover.Panel className=" absolute bottom-full right-0 flex w-[320px] -translate-y-3 flex-col gap-2 rounded-lg bg-bgModal p-3 text-[15px] shadow-popover dark:border dark:border-line dark:shadow-none">
                <div className="relative flex flex-grow items-center rounded-xl bg-lightBg px-3 text-main">
                    <SearchIcon width={18} height={18} className="shrink-0" />
                    <SearchInput
                        value={inputText}
                        onChange={(ev) => setInputText(ev.target.value)}
                        onClear={() => setInputText('')}
                    />
                </div>
                <div className="channel-list flex min-h-[392px] flex-col gap-2">{ListBox}</div>
            </Popover.Panel>
        </Transition>
    );
}
