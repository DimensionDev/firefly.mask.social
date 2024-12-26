'use client';

import { t, Trans } from '@lingui/macro';
import { useMemo } from 'react';
import { useAsyncFn } from 'react-use';
import type { Address } from 'viem';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import WebsiteIcon from '@/assets/website-circle.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { chains } from '@/configs/wagmiClient.js';
import { MintStatus } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { useSponsorMintStatus } from '@/hooks/useSponsorMintStatus.js';
import { ConnectModalRef, FreeMintModalRef } from '@/modals/controls.js';

interface FreeMintButtonProps extends Omit<ClickableButtonProps, 'ref'> {
    contractAddress: string;
    tokenId: string;
    chainId: number;
    externalUrl?: string;
}

export function getMintButtonText(connected: boolean, isSupportedChain: boolean, mintStatus?: MintStatus) {
    if (!connected) {
        return t`Connect Wallet`;
    }
    if (!isSupportedChain) {
        return t`Unsupported Chain`;
    }

    switch (mintStatus) {
        case MintStatus.Mintable:
            return t`Mint`;
        case MintStatus.MintAgain:
            return t`Mint Again`;
        case MintStatus.NotStarted:
            return t`Not Started`;
        case MintStatus.Ended:
            return t`Mint Ended`;
        case MintStatus.Minted:
            return t`Minted`;
        case MintStatus.SoldOut:
            return t`Sold Out`;
        default:
            return t`Unknown status`;
    }
}

export function FreeMintButton({
    contractAddress,
    tokenId,
    chainId,
    externalUrl,
    className,
    ...rest
}: FreeMintButtonProps) {
    const account = useAccount();
    const currentChainId = useChainId();
    const { switchChainAsync } = useSwitchChain();

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
    const [{ loading: handlerLoading }, handleClick] = useAsyncFn(async () => {
        if (!data) return;
        if (!connected) {
            ConnectModalRef.open();
            return;
        }
        if (currentChainId !== data.chainId) {
            await switchChainAsync({ chainId: data.chainId });
        }
        FreeMintModalRef.open({
            mintTarget: {
                ...mintTarget,
                walletAddress: account.address as Address,
            },
            mintParams: data,
            onSuccess: refetch,
        });
    }, [account.address, connected, mintTarget, data, currentChainId, refetch, switchChainAsync]);

    if (data?.mintStatus === MintStatus.NotSupported) {
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

    const isSupportedChain = chains.some((chain) => chain.id === data?.chainId);
    const loading = isLoading || isRefetching || handlerLoading;

    return (
        <div className={classNames('flex items-center gap-3', className)}>
            <ClickableButton
                {...rest}
                className="flex h-8 flex-1 items-center justify-center rounded-full bg-main px-5 text-sm font-bold text-lightBottom dark:text-darkBottom"
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
