'use client';

import { Trans } from '@lingui/macro';
import { useCallback } from 'react';
import { useAccount } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { useSponsorMintStatus } from '@/hooks/useSponsorMintStatus.js';
import { ConnectModalRef, FreeMintModalRef } from '@/modals/controls.js';
import type { NFTAsset } from '@/providers/types/Firefly.js';

interface FreeMintButtonProps extends Omit<ClickableButtonProps, 'ref'> {
    nft: NFTAsset;
}

function getButtonText(mintStatus: number) {
    switch (mintStatus) {
        case 1:
            return <Trans>Mint</Trans>;
        case 2:
            return <Trans>Mint Again</Trans>;
        case 3:
            return <Trans>Not Started</Trans>;
        case 4:
            return <Trans>Mint Ended</Trans>;
        case 5:
            return <Trans>Minted</Trans>;
        case 6:
            return <Trans>Sold Out</Trans>;
        default:
            return 'Test';
    }
}

export function FreeMintButton({ nft, className, ...rest }: FreeMintButtonProps) {
    const account = useAccount();
    const { isLoading, data } = useSponsorMintStatus(nft);

    const connected = !!account.address;

    const handleClick = useCallback(() => {
        if (!data) return;
        if (!connected) {
            ConnectModalRef.open();
            return;
        }
        FreeMintModalRef.open({ nft, mintParams: data });
    }, [connected, nft, data]);

    // if (data?.mintStatus === 0) return null;

    return (
        <ClickableButton
            {...rest}
            className={classNames(
                'flex h-8 items-center justify-center rounded-full bg-main px-5 text-sm font-bold text-lightBottom',
                className,
            )}
            disabled={isLoading || (!!data && data?.mintStatus > 2)}
            onClick={handleClick}
        >
            {isLoading ? (
                <LoadingIcon width={20} height={20} className="animate-spin" />
            ) : connected ? (
                data ? (
                    getButtonText(data.mintStatus)
                ) : null
            ) : (
                <Trans>Connect Wallet</Trans>
            )}
        </ClickableButton>
    );
}
