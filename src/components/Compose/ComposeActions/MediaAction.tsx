import { Popover } from '@headlessui/react';
import { t } from '@lingui/macro';
import { memo, useState } from 'react';

import GalleryIcon from '@/assets/gallery.svg';
import { Media } from '@/components/Compose/Media.js';
import { Popover as PopoverModal } from '@/components/Popover.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { getCurrentPostImageLimits } from '@/helpers/getCurrentPostImageLimits.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export const MediaAction = memo(function MediaAction() {
    const isMedium = useIsMedium();
    const post = useCompositePost();
    const { availableSources, images, video, poll } = post;
    const { type } = useComposeStateStore();
    const maxImageCount = getCurrentPostImageLimits(type, availableSources);
    const mediaDisabled = !!video || images.length >= maxImageCount || !!poll;
    const [open, setOpen] = useState(false);

    const buttonContent = (
        <Tooltip content={t`Media`} placement="top" disabled={mediaDisabled}>
            <GalleryIcon
                className={classNames('text-main', mediaDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}
                width={24}
                height={24}
            />
        </Tooltip>
    );
    if (isMedium)
        return (
            <Popover as="div" className="relative">
                {({ close }) => (
                    <>
                        <Popover.Button className="flex cursor-pointer gap-1 text-main focus:outline-none">
                            {buttonContent}
                        </Popover.Button>

                        {!mediaDisabled ? <Media close={close} /> : null}
                    </>
                )}
            </Popover>
        );
    return (
        <>
            <button onClick={() => setOpen(true)}>{buttonContent}</button>
            <PopoverModal open={open} onClose={() => setOpen(false)} DialogPanelProps={{ className: 'px-0' }}>
                {!mediaDisabled ? <Media close={() => setOpen(false)} /> : null}
            </PopoverModal>
        </>
    );
});
