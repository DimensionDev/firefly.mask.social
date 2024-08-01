import { Dialog } from '@headlessui/react';
import { t } from '@lingui/macro';
import { rootRouteId, useMatch } from '@tanstack/react-router';

import LeftArrowIcon from '@/assets/left-arrow.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { router, TipsRoutePath } from '@/components/Tips/TipsModalRouter.js';
import { Tooltip } from '@/components/Tooltip.js';

interface TipsModalHeaderProps {
    title?: string;
    back?: boolean;
}

export function TipsModalHeader({ title, back = false }: TipsModalHeaderProps) {
    const { context } = useMatch({ from: rootRouteId });

    return (
        <Dialog.Title as="h3" className="relative mb-6 shrink-0 pt-safe">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-fourMain">
                {back ? (
                    <Tooltip placement="top" content={t`Back`}>
                        <ClickableButton onClick={() => router.navigate({ to: TipsRoutePath.TIPS, replace: true })}>
                            <LeftArrowIcon width={24} height={24} />
                        </ClickableButton>
                    </Tooltip>
                ) : (
                    <CloseButton onClick={context.onClose} />
                )}
            </span>
            <span className="text-lg font-bold leading-[22px]">{title || t`Tips`}</span>
        </Dialog.Title>
    );
}
