'use client';

import { t, Trans } from '@lingui/macro';
import { useCallback, useMemo } from 'react';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import WebsiteIcon from '@/assets/website.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { chains } from '@/configs/wagmiClient.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { useSponsorMintStatus } from '@/hooks/useSponsorMintStatus.js';
import { ConnectModalRef, FreeMintModalRef } from '@/modals/controls.js';

interface FreeMintButtonProps extends Omit<ClickableButtonProps, 'ref'> {
    showInDisabled?: boolean;
    contractAddress: string;
    tokenId: string;
    chainId: number;
    externalUrl?: string;
}

export function getMintButtonText(connected: boolean, isSupportedChain: boolean, mintStatus?: number) {
    if (!connected) {
        return t`Connect Wallet`;
    }
    if (!isSupportedChain) {
        return t`Unsupported Chain`;
    }

    switch (mintStatus) {
        case 1:
            return t`Mint`;
        case 2:
            return t`Mint Again`;
        case 3:
            return t`Not Started`;
        case 4:
            return t`Mint Ended`;
        case 5:
            return t`Minted`;
        case 6:
            return t`Sold Out`;
        default:
            return t`Unknow status`;
    }
}

export function FreeMintButton({
    contractAddress,
    tokenId,
    chainId,
    externalUrl,
    showInDisabled = true,
    className,
    ...rest
}: FreeMintButtonProps) {
    const account = useAccount();

    const mintTarget = useMemo(
        () => ({
            walletAddress: account.address || '',
            contractAddress: contractAddress || '',
            tokenId,
            chainId,
            buyCount: 1,
        }),
        [account.address, contractAddress, tokenId, chainId],
    );
    const { isLoading, isRefetching, data, refetch } = useSponsorMintStatus(mintTarget);

    const connected = !!account.address;
    const loading = isLoading || isRefetching;

    const handleClick = useCallback(() => {
        if (!data) return;
        if (!connected) {
            ConnectModalRef.open();
            return;
        }
        FreeMintModalRef.open({
            mintTarget: {
                ...mintTarget,
                walletAddress: account.address as Address,
            },
            mintParams: data,
            onSuccess: refetch,
        });
    }, [account.address, connected, mintTarget, data, refetch]);

    if (data?.mintStatus === 0) {
        return externalUrl ? (
            <Link
                href={externalUrl}
                target="_blank"
                className={classNames(
                    'flex h-8 items-center justify-center gap-1.5 rounded-full border border-main text-sm font-bold text-main',
                    className,
                )}
            >
                <WebsiteIcon width={20} height={20} />
                <Trans>View on Website</Trans>
            </Link>
        ) : null;
    }

    if (!showInDisabled && data?.mintStatus && ![1, 2].includes(data.mintStatus)) return null;

    const isSupportedChain = chains.some((chain) => chain.id === data?.chainId);

    return (
        <div className={classNames('flex items-center gap-3', className)}>
            <ClickableButton
                {...rest}
                className="flex h-8 flex-1 items-center justify-center rounded-full bg-main px-5 text-sm font-bold text-lightBottom"
                disabled={loading || (!!data && data?.mintStatus > 2) || !isSupportedChain}
                onClick={handleClick}
            >
                {loading ? (
                    <LoadingIcon width={20} height={20} className="animate-spin" />
                ) : (
                    getMintButtonText(connected, isSupportedChain, data?.mintStatus)
                )}
            </ClickableButton>
            {externalUrl ? (
                <Link
                    href={externalUrl}
                    target="_blank"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-main text-main"
                >
                    <WebsiteIcon width={20} height={20} />
                </Link>
            ) : null}
        </div>
    );
}