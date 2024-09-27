'use client';

import { t, Trans } from '@lingui/macro';
import React from 'react';

import { CloseButton } from '@/components/CloseButton.js';
import { useActivityCheckResponse } from '@/components/CZ/useActivityCheckResponse.js';
import { Modal } from '@/components/Modal.js';
import { Image } from '@/esm/Image.js';
import { enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { Level } from '@/providers/types/CZ.js';

interface Props {
    open: boolean;
    onClose: () => void;
}

export function ActivityClaimSuccessDialog({ open, onClose }: Props) {
    return (
        <Modal open={open} onClose={onClose} disableScrollLock={false} backdropClassName="!bg-[rgba(245,245,245,0.3)]">
            <div className="relative z-10 w-[calc(100%-40px)] max-w-[485px] rounded-[12px] bg-black p-6 text-white">
                <Image
                    src="/image/activity/cz/background.webp"
                    alt="background"
                    width={1500}
                    height={1000}
                    className="pointer-events-none absolute left-0 top-0 h-full w-full rounded-[12px] object-cover"
                />
                <div className="relative z-10 flex h-6 w-full items-center justify-center pb-6">
                    <h3 className="font-bold">
                        <Trans>Congratulation!</Trans>
                    </h3>
                    <CloseButton
                        className="absolute right-0 top-0 h-6 w-6 !p-0 hover:!bg-white/10"
                        iconClassName="!text-white"
                        onClick={onClose}
                    />
                </div>
                <ActivityClaimSuccessContent />
            </div>
        </Modal>
    );
}

export function ActivityClaimSuccessContent({ onClose }: { onClose?: () => void }) {
    const { data } = useActivityCheckResponse();
    return (
        <div className="relative z-10 flex w-full flex-col items-center space-y-6">
            <Image
                src={data?.level === Level.Lv2 ? '/image/activity/cz/premium-nft.png' : '/image/activity/cz/nft.png'}
                width={162}
                height={162}
                alt="cz-nft"
            />
            <div className="space-y-1.5 text-[15px] font-normal leading-[18px]">
                <p className="text-xl font-bold leading-[18px]">
                    <Trans>Success!</Trans>
                </p>
                <p className="text-[#AC9DF6] underline">
                    <Trans>View transaction on Explorer</Trans>
                </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2">
                <button
                    className="h-10 rounded-full border border-current text-[15px] font-bold leading-10"
                    onClick={() => {
                        enqueueSuccessMessage(t`Copied`);
                    }}
                >
                    <Trans>Copy Link</Trans>
                </button>
                <button
                    className="h-10 rounded-full bg-white text-[15px] font-bold leading-10 text-[#181A20]"
                    onClick={() => {
                        onClose?.();
                        ComposeModalRef.open({
                            type: 'compose',
                            chars: [
                                t`Just claimed the "@handle" welcome back 🎉 to CZ” from @thefireflyapp! 

Claim yours at firefly.social when you follow @cz_binance. 

#CZ #FireflySocial`,
                            ],
                        });
                    }}
                >
                    <Trans>Share in a Post</Trans>
                </button>
            </div>
        </div>
    );
}
