import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';

import { PostByItem } from '@/components/Compose/PostByItem.js';
import { SORTED_POLL_SOURCES, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';

interface PostByProps {}

export function PostBy(props: PostByProps) {
    const { poll } = useCompositePost();

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
            <Popover.Panel className=" absolute bottom-full right-0 flex w-[280px] -translate-y-3 flex-col gap-2 rounded-lg bg-bgModal p-3 text-[15px] shadow-popover  dark:border dark:border-line dark:shadow-none">
                {SORTED_SOCIAL_SOURCES.map((source) => (
                    <PostByItem
                        key={source}
                        source={source}
                        disabled={poll ? !SORTED_POLL_SOURCES.includes(source) : false}
                    />
                ))}
            </Popover.Panel>
        </Transition>
    );
}
