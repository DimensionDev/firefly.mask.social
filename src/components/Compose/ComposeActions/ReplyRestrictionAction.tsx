import { Popover } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { memo, useState } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { ReplyRestriction } from '@/components/Compose/ReplyRestriction.js';
import { ReplyRestrictionText } from '@/components/Compose/ReplyRestrictionText.js';
import { Popover as PopoverModal } from '@/components/Popover.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

interface ActionProps {
    hasError: boolean;
}
export const ReplyRestrictionAction = memo(function ReplyRestrictionAction({ hasError }: ActionProps) {
    const isMedium = useIsMedium();

    const post = useCompositePost();
    const { updateRestriction } = useComposeStateStore();
    const { restriction, availableSources } = post;

    const disabled = hasError || availableSources.length > 1;
    const [open, setOpen] = useState(false);

    const buttonContent = (
        <>
            <span className="text-medium font-bold">
                <ReplyRestrictionText type={restriction} />
            </span>
            {!disabled ? <ChevronRightIcon className="h-5 w-5" aria-hidden="true" /> : null}
        </>
    );

    if (isMedium) {
        return (
            <Popover as="div" className="relative">
                <Popover.Button
                    className="flex cursor-pointer gap-1 text-main focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={hasError}
                >
                    {buttonContent}
                </Popover.Button>
                <ReplyRestriction restriction={restriction} setRestriction={updateRestriction} />
            </Popover>
        );
    }
    return (
        <>
            <ClickableButton
                className="flex gap-1 text-main focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setOpen(true)}
                disabled={disabled}
            >
                {buttonContent}
            </ClickableButton>
            <PopoverModal open={open} onClose={() => setOpen(false)}>
                <ReplyRestriction restriction={restriction} setRestriction={updateRestriction} />
            </PopoverModal>
        </>
    );
});
