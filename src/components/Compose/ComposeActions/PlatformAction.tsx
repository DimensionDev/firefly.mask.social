import { Popover } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { memo, useState } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { PostBy } from '@/components/Compose/PostBy.js';
import { Popover as PopoverModal } from '@/components/Popover.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

interface ActionProps {
    hasError: boolean;
}

export const PlatformAction = memo(function PlatformAction({ hasError }: ActionProps) {
    const post = useCompositePost();
    const { type } = useComposeStateStore();
    const { availableSources, parentPost } = post;
    const currentProfileAll = useCurrentProfileAll();

    const [open, setOpen] = useState(false);
    const isMedium = useIsMedium();

    const buttonContent = (
        <>
            <span className="flex items-center gap-x-1 font-bold">
                {availableSources
                    .filter((x) => !!currentProfileAll[x] && SORTED_SOCIAL_SOURCES.includes(x))
                    .map((y) => (
                        <SocialSourceIcon key={y} source={y} size={20} />
                    ))}
            </span>
            {type === 'compose' && !hasError ? <ChevronRightIcon className="h-5 w-5" aria-hidden="true" /> : null}
        </>
    );

    const disabled = availableSources.some((x) => !!parentPost[x]) || hasError;

    if (isMedium)
        return (
            <Popover as="div" className="relative">
                <Popover.Button
                    className="flex cursor-pointer gap-1 text-main focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={disabled}
                >
                    {buttonContent}
                </Popover.Button>
                <PostBy />
            </Popover>
        );

    return (
        <>
            <ClickableButton
                className="flex gap-1 text-main focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setOpen(true)}
                disabled={disabled}
            >
                {buttonContent}
            </ClickableButton>
            <PopoverModal open={open} onClose={() => setOpen(false)} DialogPanelProps={{ className: 'px-0' }}>
                <PostBy />
            </PopoverModal>
        </>
    );
});
