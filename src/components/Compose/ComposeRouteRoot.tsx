import { Dialog } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { Outlet, rootRouteId, useMatch, useRouter } from '@tanstack/react-router';

import DraftIcon from '@/assets/draft.svg';
import LeftArrowIcon from '@/assets/left-arrow.svg';
import { CloseButton } from '@/components/CloseButton.js';
import { ComposeSend } from '@/components/Compose/ComposeSend.js';
import { Tooltip } from '@/components/Tooltip.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

export function ComposeRouteRoot() {
    const isMedium = useIsMedium();
    const { history, state } = useRouter();
    const { context } = useMatch({ from: rootRouteId });

    const pathname = history.location.pathname;

    const isDraft = pathname === '/draft';
    const isGif = pathname === '/gif';

    const modalTitle = [...state.matches].reverse().find((x) => x.context.title)?.context.title;

    return (
        <>
            <Dialog.Title as="h3" className="relative h-14 shrink-0 pt-safe">
                {isDraft || isGif ? (
                    <LeftArrowIcon
                        onClick={() => history.replace('/')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer text-fourMain"
                    />
                ) : (
                    <CloseButton
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-fourMain"
                        onClick={context.onClose}
                    />
                )}

                <span className="flex h-full w-full items-center justify-center gap-x-1 text-lg font-bold capitalize text-fourMain">
                    {modalTitle ?? <Trans>Compose</Trans>}
                    {!isMedium && !isDraft && !isGif ? (
                        <DraftIcon
                            width={18}
                            height={18}
                            className="cursor-pointer text-fourMain"
                            onClick={() => history.push('/draft')}
                        />
                    ) : null}
                </span>
                {isMedium && !isDraft && !isGif ? (
                    <Tooltip content={t`Drafts`} placement="top">
                        <DraftIcon
                            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-fourMain"
                            onClick={() => history.push('/draft')}
                        />
                    </Tooltip>
                ) : null}
                {isMedium || isDraft || isGif ? null : <ComposeSend />}
            </Dialog.Title>
            <Outlet />
        </>
    );
}
