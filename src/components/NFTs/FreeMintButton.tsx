'use client';

import { Trans } from '@lingui/macro';
import { useCallback } from 'react';
import { useAccount } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import WebsiteIcon from '@/assets/website.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { chains } from '@/configs/wagmiClient.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { useSponsorMintStatus } from '@/hooks/useSponsorMintStatus.js';
import { ConnectModalRef, FreeMintModalRef } from '@/modals/controls.js';
import type { NFTAsset } from '@/providers/types/Firefly.js';

interface FreeMintButtonProps extends Omit<ClickableButtonProps, 'ref'> {
    nft: NFTAsset;
}

function getButtonText(connected: boolean, isSupportedChain: boolean, mintStatus?: number) {
    if (!connected) {
        return <Trans>Connect Wallet</Trans>;
    }
    if (!isSupportedChain) {
        return <Trans>Unsupported Chain</Trans>;
    }

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
            return '';
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

    if (data?.mintStatus === 0) {
        return nft.externalUrl ? (
            <Link
                href={nft.externalUrl}
                target="_blank"
                className="flex h-8 w-full items-center justify-center gap-1.5 rounded-full border border-main text-sm font-bold text-main"
            >
                <WebsiteIcon width={20} height={20} />
                <Trans>View on Website</Trans>
            </Link>
        ) : null;
    }

    const isSupportedChain = chains.some((chain) => chain.id === data?.chainId);

    return (
        <div className="flex w-full items-center gap-3">
            <ClickableButton
                {...rest}
                className={classNames(
                    'flex h-8 flex-1 items-center justify-center rounded-full bg-main px-5 text-sm font-bold text-lightBottom',
                    className,
                )}
                disabled={isLoading || (!!data && data?.mintStatus > 2) || !isSupportedChain}
                onClick={handleClick}
            >
                {isLoading ? (
                    <LoadingIcon width={20} height={20} className="animate-spin" />
                ) : (
                    getButtonText(connected, isSupportedChain, data?.mintStatus)
                )}
            </ClickableButton>
            {nft.externalUrl ? (
                <Link
                    href={nft.externalUrl}
                    target="_blank"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-main text-main"
                >
                    <WebsiteIcon width={20} height={20} />
                </Link>
            ) : null}
        </div>
    );
}
