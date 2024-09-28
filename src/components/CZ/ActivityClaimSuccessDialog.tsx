'use client';

import { t, Trans } from '@lingui/macro';
import React from 'react';

import { useActivityCheckResponse } from '@/components/CZ/useActivityCheckResponse.js';
import { Popover } from '@/components/Popover.js';
import { Image } from '@/esm/Image.js';
import { Link } from '@/esm/Link.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { Level } from '@/providers/types/CZ.js';
import { SupportedMethod } from '@/types/bridge.js';

interface Props {
    open: boolean;
    onClose: () => void;
    hash?: string;
}

export function ActivityClaimSuccessDialog({ open, onClose, hash }: Props) {
    return (
        <Popover open={open} onClose={onClose} backdropClassName="!bg-[rgba(245,245,245,0.3)]">
            <div className="relative z-10 w-full rounded-[12px] bg-black pt-4 text-white">
                <ActivityClaimSuccessContent hash={hash} />
            </div>
        </Popover>
    );
}

export function ActivityClaimSuccessContent({ onClose, hash }: { onClose?: () => void; hash?: string }) {
    const { data } = useActivityCheckResponse();
    return (
        <div className="relative z-10 flex w-full flex-col items-center space-y-6 text-center">
            <Image
                src={data?.level === Level.Lv2 ? '/image/activity/cz/premium-nft.png' : '/image/activity/cz/nft.png'}
                width={162}
                height={162}
                alt="cz-nft"
            />
            <div className="space-y-1.5 text-[15px] font-normal leading-[18px]">
                <p className="text-xl font-bold leading-[18px]">
                    <Trans>Congratulation!</Trans>
                </p>
                <Link href={`https://bscscan.com/tx/${hash}`} target="_blank" className="text-[#AC9DF6] underline">
                    <Trans>View transaction on Explorer</Trans>
                </Link>
            </div>
            <div className="grid w-full grid-cols-1 gap-2">
                <button
                    className="h-10 rounded-full bg-white text-[15px] font-bold leading-10 text-[#181A20]"
                    onClick={() => {
                        onClose?.();
                        const text = t`Just claimed the "Welcome back 🎉 to CZ" collectible from @thefireflyapp! 

Claim yours at firefly.social when you follow @cz_binance on X.

#CZ #FireflySocial`;
                        if (fireflyBridgeProvider.supported) {
                            return fireflyBridgeProvider.request(SupportedMethod.COMPOSE, {
                                text,
                            });
                        }

                        ComposeModalRef.open({
                            type: 'compose',
                            chars: [text],
                        });
                    }}
                >
                    <Trans>Share in a Post</Trans>
                </button>
            </div>
        </div>
    );
}
