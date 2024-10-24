'use client';

import { Trans } from '@lingui/macro';

import { useActivityCheckResponse } from '@/components/CZ/useActivityCheckResponse.js';
import { Popover } from '@/components/Popover.js';
import { IS_IOS } from '@/constants/bowser.js';
import { SourceInURL } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { Link } from '@/esm/Link.js';
import { CHAR_TAG } from '@/helpers/chars.js';
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
        <Popover
            open={open}
            onClose={onClose}
            DialogPanelProps={{
                className: '!bg-black border-none',
            }}
            controlClassName="!bg-white"
            backdropClassName="!bg-[rgba(245,245,245,0.3)]"
        >
            <div className="relative z-10 w-full rounded-[12px] bg-black pt-4 text-white">
                <ActivityClaimSuccessContent hash={hash} />
            </div>
        </Popover>
    );
}

export function ActivityClaimSuccessContent({ onClose, hash }: { onClose?: () => void; hash?: string }) {
    const { data } = useActivityCheckResponse();
    const showExplorerLink = !(fireflyBridgeProvider.supported && IS_IOS);

    return (
        <div className="relative z-10 flex w-full flex-col items-center space-y-6 text-center">
            <Image
                src={data?.level === Level.Lv2 ? '/image/activity/cz/premium-nft.png' : '/image/activity/cz/nft.png'}
                width={162}
                height={162}
                alt="cz-nft"
            />
            <div className="text-[15px] font-normal leading-[18px]">
                <p className="mb-4 text-xl font-bold leading-[18px]">
                    <Trans>Congratulation!</Trans>
                </p>
                <div className="h-[18px]">
                    {showExplorerLink ? (
                        <Link
                            href={`https://bscscan.com/tx/${hash}`}
                            target="_blank"
                            className="z-10 text-[#AC9DF6] underline"
                        >
                            <Trans>View transaction on Explorer</Trans>
                        </Link>
                    ) : null}
                </div>
            </div>
            <div className="grid w-full grid-cols-1 gap-2">
                <button
                    className="h-10 rounded-full bg-white text-[15px] font-bold leading-10 text-[#181A20]"
                    onClick={() => {
                        onClose?.();
                        const text = `Just claimed the "Welcome back 🎉 to CZ" collectible from @thefireflyapp !\n\nIf you followed https://x.com/cz_binance on X before Sept 21, you're eligible to claim yours at https://cz.firefly.social .\n\n`;
                        if (fireflyBridgeProvider.supported) {
                            return fireflyBridgeProvider.request(SupportedMethod.COMPOSE, {
                                text,
                                activity: '',
                                mentions: [],
                            });
                        }

                        ComposeModalRef.open({
                            type: 'compose',
                            chars: [
                                `Just claimed the "Welcome back 🎉 to CZ" collectible from `,
                                {
                                    tag: CHAR_TAG.MENTION,
                                    visible: true,
                                    content: `@thefireflyapp`,
                                    profiles: [
                                        {
                                            platform_id: '1583361564479889408',
                                            platform: SourceInURL.Twitter,
                                            handle: 'thefireflyapp',
                                            name: 'thefireflyapp',
                                            hit: true,
                                            score: 0,
                                        },
                                        {
                                            platform_id: '16823',
                                            platform: SourceInURL.Farcaster,
                                            handle: 'fireflyapp',
                                            name: 'Firefly App',
                                            hit: true,
                                            score: 0,
                                        },
                                        {
                                            platform_id: '0x01b000',
                                            platform: SourceInURL.Lens,
                                            handle: 'fireflyapp',
                                            name: 'fireflyapp',
                                            hit: true,
                                            score: 0,
                                        },
                                    ],
                                },
                                `!\n\nIf you followed `,
                                {
                                    tag: CHAR_TAG.MENTION,
                                    visible: true,
                                    content: '@cz_binance',
                                    profiles: [
                                        {
                                            platform_id: '902926941413453824',
                                            platform: SourceInURL.Twitter,
                                            handle: 'cz_binance',
                                            name: 'cz_binance',
                                            hit: true,
                                            score: 0,
                                        },
                                    ],
                                },
                                ` on X before Sept 21, you're eligible to claim yours at https://cz.firefly.social . \n\n`,
                                '#CZ #FireflySocial',
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
