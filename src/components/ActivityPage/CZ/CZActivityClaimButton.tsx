import { Trans } from '@lingui/macro';
import { type HTMLProps, useState } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';
import { useAccount } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import { CZActivityClaimSuccessDialog } from '@/components/ActivityPage/CZ/CZActivityClaimSuccessDialog.js';
import { classNames } from '@/helpers/classNames.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { CZActivity } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

interface Props extends HTMLProps<'button'> {
    level?: CZActivity.Level;
    alreadyClaimed?: boolean;
    canClaim?: boolean;
    isLoading?: boolean;
}

export function CZActivityClaimButton({ level, alreadyClaimed, canClaim, isLoading, className }: Props) {
    const disabled = isLoading || alreadyClaimed || !canClaim;
    const account = useAccount();
    const address = account.address; // TODO: and address from mobile
    const [open, setOpen] = useState(false);
    const [{ loading }, claim] = useAsyncFn(async () => {
        if (!disabled || !address) return;
        await fireflySessionHolder.fetch(urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet_transaction/mint/bnb/sbt'), {
            method: 'POST',
            body: JSON.stringify({
                walletAddress: address,
                claimPlatform: 'web',
            }),
        });
        setOpen(true);
    });

    return (
        <>
            <CZActivityClaimSuccessDialog open={open} onClose={() => setOpen(false)} />
            {level === CZActivity.Level.Lv2 && canClaim ? (
                <button
                    disabled={disabled || loading}
                    className={classNames(
                        'h-12 rounded-full bg-gradient-to-b from-[#ffeecc] to-[rgba(255,255,255,0)] p-[1px] text-sm font-bold leading-[48px] text-[#181a20]',
                        className,
                    )}
                    onClick={claim}
                >
                    <span className="block h-full w-full rounded-full bg-[#1f1f1f] px-[18px]">
                        <span className="bg-gradient-to-r from-[#ffeecc] to-[#ad9515] bg-clip-text text-transparent">
                            {isLoading ? (
                                <LoadingIcon className="animate-spin" width={16} height={16} />
                            ) : (
                                <Trans>Claim Premium</Trans>
                            )}
                        </span>
                    </span>
                </button>
            ) : (
                <button
                    type="button"
                    className={classNames(
                        'leading-12 text-md flex h-12 w-full items-center justify-center rounded-full bg-[#f4d008] font-bold text-black disabled:bg-white/70',
                        className,
                    )}
                    disabled={disabled || loading}
                    onClick={claim}
                >
                    {isLoading ? <LoadingIcon className="animate-spin" width={16} height={16} /> : <Trans>Claim</Trans>}
                </button>
            )}
        </>
    );
}
