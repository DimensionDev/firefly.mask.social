import { Popover } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { compact } from 'lodash-es';
import { memo, useState } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { ChannelSearchPanel } from '@/components/Compose/ChannelSearchPanel.js';
import { Popover as PopoverModal } from '@/components/Popover.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

interface ActionProps {
    hasError: boolean;
}
export const ChooseChannelAction = memo(function ChooseChannelAction({ hasError }: ActionProps) {
    const isMedium = useIsMedium();
    const { channel } = useCompositePost();
    const [open, setOpen] = useState(false);

    const buttonContent = (
        <>
            <span className="text-medium font-bold">
                {compact(
                    SORTED_SOCIAL_SOURCES.filter((source) => !!channel[source]).map((source) => channel[source]?.name),
                ).join(',')}
            </span>
            {!hasError ? <ChevronRightIcon className="h-5 w-5" aria-hidden="true" /> : null}
        </>
    );

    if (isMedium)
        return (
            <Popover as="div" className="relative">
                {({ close }) => (
                    <>
                        <Popover.Button
                            className="flex cursor-pointer items-center gap-1 text-main focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={hasError}
                        >
                            {buttonContent}
                        </Popover.Button>
                        <ChannelSearchPanel onSelected={close} className="md:max-h-[192px]" />
                    </>
                )}
            </Popover>
        );

    return (
        <>
            <ClickableButton
                className="flex gap-1 text-main focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setOpen(true)}
            >
                {buttonContent}
            </ClickableButton>
            <PopoverModal open={open} onClose={() => setOpen(false)}>
                <ChannelSearchPanel onSelected={() => setOpen(false)} className="md:max-h-[192px]" />
            </PopoverModal>
        </>
    );
});
