import { Popover, Transition } from '@headlessui/react';
import { uniq } from 'lodash-es';
import { Fragment, useMemo } from 'react';

import { PostByItem } from '@/components/Compose/PostByItem.js';
import { SORTED_POLL_SOURCES, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { getCurrentPostImageLimits } from '@/helpers/getCurrentPostImageLimits.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

interface PostByProps {}

export function PostBy(props: PostByProps) {
    const { poll, availableSources, images } = useCompositePost();
    const { type } = useComposeStateStore();

    const postByDisabled = useMemo(() => {
        return SORTED_SOCIAL_SOURCES.map((source) => {
            if (poll && !SORTED_POLL_SOURCES.includes(source)) return true;
            // TODO: Check video limits

            const maxImageCount = getCurrentPostImageLimits(type, uniq([...availableSources, source]));
            return images.length > maxImageCount;
        });
    }, [availableSources, images, poll, type]);

    const content = (
        <div className="py-3">
            {SORTED_SOCIAL_SOURCES.map((source, index) => (
                <PostByItem key={source} source={source} disabled={postByDisabled[index]} />
            ))}
        </div>
    );

    const isMedium = useIsMedium();

    if (isMedium)
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
                <Popover.Panel className="no-scrollbar absolute bottom-full right-0 z-10 flex max-h-[275px] w-[280px] -translate-y-3 flex-col gap-2 overflow-y-auto rounded-lg bg-lightBottom text-medium shadow-popover dark:border dark:border-line dark:bg-darkBottom dark:shadow-none md:max-h-[370px]">
                    {content}
                </Popover.Panel>
            </Transition>
        );
    return content;
}
