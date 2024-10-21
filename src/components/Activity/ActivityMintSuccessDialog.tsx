'use client';

import { Trans } from '@lingui/macro';

import SuccessShieldIcon from '@/assets/success-shield.svg';
import { useActivityCompose } from '@/components/Activity/hooks/useActivityCompose.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Modal } from '@/components/Modal.js';
import { Popover } from '@/components/Popover.js';
import { Link } from '@/esm/Link.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

interface Props {
    open: boolean;
    onClose: () => void;
    hash?: string;
}

export function ActivityMintSuccessDialog({ open, onClose, hash }: Props) {
    const isMedium = useIsMedium();
    const [{ loading }, shareAndPost] = useActivityCompose();
    const content = (
        <div className="flex w-full flex-col items-center text-center">
            <SuccessShieldIcon className="mb-4 h-[64px] w-[64px] text-success" />
            <h3 className="text-lg font-semibold leading-6">
                <Trans>Mint Succeeded</Trans>
            </h3>
            <p className="mt-6 text-sm font-medium leading-6">
                <Trans>Your transaction will confirm shortly</Trans>
            </p>
            <Link
                href={`https://bscscan.com/tx/${hash}`}
                target="_blank"
                className="mt-2 text-sm font-bold leading-6 text-highlight"
            >
                <Trans>View Status</Trans>
            </Link>
            <button
                className="leading-12 relative mt-6 flex h-12 w-full items-center justify-center rounded-full bg-main text-center text-base font-bold text-primaryBottom disabled:opacity-60"
                onClick={shareAndPost}
                disabled={loading}
            >
                <Trans>Share and Post</Trans>
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
                <div className="pt-4">{content}</div>
            </Popover>
        );
    }

    return (
        <Modal open={open} onClose={onClose}>
            <div className="transform rounded-[12px] bg-primaryBottom transition-all">
                <div
                    className="relative inline-flex items-center justify-center gap-2 rounded-t-[12px] p-4 text-center md:h-[56px] md:w-[600px]"
                    style={{ background: 'var(--m-modal-title-bg)' }}
                >
                    <CloseButton onClick={onClose} className="absolute left-4 top-4" />
                </div>
                <div className="p-4">{content}</div>
            </div>
        </Modal>
    );
}
