'use client';

import { Trans } from '@lingui/macro';

import SuccessShieldIcon from '@/assets/success-shield.svg';
import { useActivityCompose } from '@/components/Activity/hooks/useActivityCompose.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Modal } from '@/components/Modal.js';
import { Popover } from '@/components/Popover.js';
import type { Chars } from '@/helpers/chars.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

interface Props {
    open: boolean;
    onClose: () => void;
    shareContent: Chars;
    claimType?: string;
}

export function ActivityNormalSuccessDialog({ claimType, shareContent, open, onClose }: Props) {
    const isMedium = useIsMedium();
    const shareAndPost = useActivityCompose();

    const content = (
        <div className="flex w-full flex-col items-center text-center">
            <button
                className="leading-12 relative mt-6 flex h-12 w-full items-center justify-center rounded-full bg-main text-center text-base font-bold text-primaryBottom disabled:opacity-60"
                onClick={() => {
                    if (claimType) {
                        const url = parseUrl(window.location.href);
                        if (url) {
                            url.searchParams.set('claim-type', claimType);
                            window.history.replaceState({}, '', url.href);
                        }
                    }
                    shareAndPost(shareContent);
                    onClose();
                }}
            >
                <Trans>Share in a Post</Trans>
            </button>
        </div>
    );

    if (!isMedium) {
        return (
            <Popover
                open={open}
                onClose={onClose}
                DialogPanelProps={{
                    className: '!p-4',
                }}
            >
                <div className="flex w-full flex-col items-center pt-4 text-center">
                    <SuccessShieldIcon className="mb-4 h-[64px] w-[64px] text-success" />
                    <h3 className="text-lg font-semibold leading-6">
                        <Trans>Success!</Trans>
                    </h3>
                    {content}
                </div>
            </Popover>
        );
    }

    return (
        <Modal open={open} onClose={onClose}>
            <div className="w-[485px] transform rounded-[12px] bg-primaryBottom transition-all">
                <div className="relative inline-flex w-full items-center justify-center gap-2 rounded-t-[12px] p-4 text-center md:h-[56px]">
                    <CloseButton onClick={onClose} className="absolute right-4 top-4" />
                    <div className="text-lg font-bold leading-6 text-main">
                        <Trans>Success!</Trans>
                    </div>
                </div>
                <div className="flex w-full flex-col items-center">
                    <SuccessShieldIcon className="h-[64px] w-[64px] text-success" />
                    <div className="px-4 pb-4">{content}</div>
                </div>
            </div>
        </Modal>
    );
}
