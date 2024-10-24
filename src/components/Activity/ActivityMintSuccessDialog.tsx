'use client';

import { Trans } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';

import SuccessShieldIcon from '@/assets/success-shield.svg';
import { useActivityCompose } from '@/components/Activity/hooks/useActivityCompose.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Modal } from '@/components/Modal.js';
import { Popover } from '@/components/Popover.js';
import { Link } from '@/esm/Link.js';
import { resolveExplorerLink } from '@/helpers/resolveExplorerLink.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

interface Props {
    open: boolean;
    onClose: () => void;
    hash?: string;
    chainId?: ChainId;
}

export function ActivityMintSuccessDialog({ open, onClose, hash, chainId }: Props) {
    const isMedium = useIsMedium();
    const [{ loading }, shareAndPost] = useActivityCompose();

    const content = (
        <div className="flex w-full flex-col items-center text-center">
            <p className="mt-6 text-sm font-medium leading-6">
                <Trans>Your transaction will confirm shortly</Trans>
            </p>
            {chainId && hash ? (
                <Link
                    href={resolveExplorerLink(chainId, hash, 'tx')!}
                    target="_blank"
                    className="mt-2 text-sm font-bold leading-6 text-highlight"
                >
                    <Trans>View on Explorer</Trans>
                </Link>
            ) : null}
            <button
                className="leading-12 relative mt-6 flex h-12 w-full items-center justify-center rounded-full bg-main text-center text-base font-bold text-primaryBottom disabled:opacity-60"
                onClick={shareAndPost}
                disabled={loading}
            >
                <Trans>Share in Post</Trans>
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
                        <Trans>Succeeded!</Trans>
                    </h3>
                    {content}
                </div>
            </Popover>
        );
    }

    return (
        <Modal open={open} onClose={onClose}>
            <div className="transform rounded-[12px] bg-primaryBottom transition-all">
                <div className="relative inline-flex items-center justify-center gap-2 rounded-t-[12px] p-4 text-center md:h-[56px] md:w-[600px]">
                    <CloseButton onClick={onClose} className="absolute left-4 top-4" />
                    <div className="text-lg font-bold leading-6 text-main">
                        <Trans>Succeeded!</Trans>
                    </div>
                </div>
                <div className="px-4 pb-4">{content}</div>
            </div>
        </Modal>
    );
}
