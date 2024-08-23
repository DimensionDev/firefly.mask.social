import { Dialog } from '@headlessui/react';
import { t } from '@lingui/macro';
import { rootRouteId, useMatch } from '@tanstack/react-router';

import LeftArrowIcon from '@/assets/left-arrow.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { router, TipsRoutePath } from '@/components/Tips/TipsModalRouter.js';
import { Tooltip } from '@/components/Tooltip.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';

interface TipsModalHeaderProps {
    title?: string;
    back?: boolean;
}

export function TipsModalHeader({ title, back = false }: TipsModalHeaderProps) {
    const { context } = useMatch({ from: rootRouteId });
    const isSmall = useIsSmall('max');

    return (
        <Dialog.Title as="h3" className="relative mb-6 flex shrink-0 justify-center text-center pt-safe">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-fourMain">
                {back ? (
                    <Tooltip placement="top" content={t`Back`}>
                        <ClickableButton onClick={() => router.navigate({ to: TipsRoutePath.TIPS, replace: true })}>
                            <LeftArrowIcon width={24} height={24} />
                        </ClickableButton>
                    </Tooltip>
                ) : !isSmall ? (
                    <CloseButton onClick={context.onClose} />
                ) : null}
            </span>
            <span className="max-w-full truncate text-lg font-bold leading-[22px] sm:max-w-[calc(100%-70px)]">
                {title || t`Tips`}
            </span>
        </Dialog.Title>
    );
}
