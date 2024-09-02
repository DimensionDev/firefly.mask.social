import { OpenActionModuleType } from '@lens-protocol/client';
import { t, Trans } from '@lingui/macro';
import { EVMExplorerResolver } from '@masknet/web3-providers';
import { ZERO_ADDRESS } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';
import { sendTransaction } from '@wagmi/core';
import dayjs from 'dayjs';
import { StatusCodes } from 'http-status-codes';
import { first, multiply } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { useAsyncFn } from 'react-use';
import { polygon } from 'viem/chains';
import { useAccount, useBalance } from 'wagmi';

import LinkIcon from '@/assets/link.svg';
import LoadingIcon from '@/assets/loading.svg';
import MirrorLargeIcon from '@/assets/mirror-large.svg';
import { Avatar } from '@/components/Avatar.js';
import { ChainGuardButton } from '@/components/ChainGuardButton.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { config } from '@/configs/wagmiClient.js';
import { Source } from '@/constants/enum.js';
import { FetchError } from '@/constants/error.js';
import { Link } from '@/esm/Link.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { formatTimeLeft } from '@/helpers/formatTimestamp.js';
import { getAllowanceModule } from '@/helpers/getAllowanceModule.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { isSameAddress } from '@/helpers/isSameAddress.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useMirror } from '@/hooks/useMirror.js';
import { useToggleFollow } from '@/hooks/useToggleFollow.js';
import { LoginModalRef } from '@/modals/controls.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { getProfileById } from '@/services/getProfileById.js';

interface PostCollectProps {
    post: Post;
    callback?: () => void;
}

export function PostCollect({ post, callback }: PostCollectProps) {
    const account = useAccount();
    const collectModule = post.collectModule;
    const timeLeft = collectModule?.endsAt ? formatTimeLeft(collectModule?.endsAt) : undefined;
    const cost = collectModule?.usdPrice
        ? multiply(Number(collectModule?.usdPrice), Number(collectModule?.amount)).toFixed(2)
        : undefined;

    const isSoldOut = post.collectModule?.collectLimit
        ? post.collectModule?.collectedCount >= post.collectModule?.collectLimit
        : false;

    const isTimeOut = collectModule?.endsAt ? dayjs(collectModule?.endsAt).isBefore(dayjs()) : false;

    const verifiedAssetAddress = !isSameAddress(post.collectModule?.assetAddress, ZERO_ADDRESS);

    const [followLoading, toggleFollow] = useToggleFollow(post.author);

    const { data: profile = null, isLoading: queryProfileLoading } = useQuery({
        queryKey: ['profile', post.source, post.author.handle],
        queryFn: async () => {
            return getProfileById(post.source, post.author.handle);
        },
        retry(failureCount, error) {
            if (error instanceof FetchError && error.status === StatusCodes.FORBIDDEN) return false;
            return failureCount <= 3;
        },
    });

    const isLogin = useIsLogin(post.source);

    const { data: allowanceData, isLoading: allowanceLoading } = useQuery({
        enabled: verifiedAssetAddress,
        queryKey: [
            'post',
            'collect',
            'allowedAmount',
            post.source,
            post.postId,
            post.collectModule?.contract.address,
            post.collectModule?.type,
        ],
        queryFn: async () => {
            if (post.source !== Source.Lens || !post.collectModule) return;

            if (!post.collectModule.assetAddress) return;

            const result = await LensSocialMediaProvider.queryApprovedModuleAllowanceData(
                post.collectModule?.type as OpenActionModuleType,
                post.collectModule.assetAddress,
            );

            return first(result);
        },
    });

    const allowed = allowanceData
        ? parseFloat(allowanceData?.allowance.value) > (post.collectModule?.amount ?? 0)
        : true;

    const { data: balanceData, isLoading: queryBalanceLoading } = useBalance({
        address: account.address,
        token: verifiedAssetAddress ? (post.collectModule?.assetAddress as `0x${string}`) : undefined,
    });

    const hasEnoughBalance =
        balanceData?.value && post.collectModule?.amount
            ? parseFloat(balanceData.formatted) >= post.collectModule.amount
            : true;

    const [{ loading: approveLoading }, handleApprove] = useAsyncFn(async () => {
        if (post.source !== Source.Lens || !allowanceData || !post.collectModule?.assetAddress) return;

        await getWalletClientRequired(config, { chainId: polygon.id });

        const isUnknownModule = allowanceData?.moduleName === OpenActionModuleType.UnknownOpenActionModule;

        const result = await LensSocialMediaProvider.generateModuleAllowanceRequest(
            {
                currency: post.collectModule.assetAddress,
                value: '0',
            },
            {
                [isUnknownModule ? 'unknownOpenActionModule' : getAllowanceModule(allowanceData.moduleName).field]:
                    isUnknownModule ? allowanceData.moduleContract.address : allowanceData.moduleName,
            },
        );

        return sendTransaction(config, {
            data: result.data as `0x${string}`,
            to: result.to as `0x${string}`,
            account: result.from as `0x${string}`,
        });
    }, [post, allowanceData]);

    const [{ loading: collectLoading }, handleCollect] = useAsyncFn(async () => {
        try {
            if (!post.collectModule?.type) return;
            const provider = resolveSocialMediaProvider(post.source);

            await provider.actPost(post.postId, {
                type: post.collectModule.type as OpenActionModuleType,
                signRequire: !!post.collectModule.amount || post.collectModule.followerOnly,
            });
            enqueueSuccessMessage(t`Post collected successfully!`);

            callback?.();
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to collect post.`), { error });
            throw error;
        }
    }, [post, callback]);

    const [{ loading: mirrorLoading }, handleMirror] = useMirror(post);

    const loading =
        followLoading ||
        allowanceLoading ||
        approveLoading ||
        collectLoading ||
        queryBalanceLoading ||
        queryProfileLoading;
    const disabled = post.hasActed || isSoldOut || isTimeOut || !hasEnoughBalance;

    const action = useMemo(() => {
        const contractExploreUrl = post.collectModule?.contract.address
            ? EVMExplorerResolver.addressLink(polygon.id, post.collectModule.contract.address) ?? ''
            : undefined;
        if (!isLogin) return <Trans>Login</Trans>;

        if (post.hasActed) {
            return (
                <>
                    <Trans>Collected</Trans>
                    {contractExploreUrl ? (
                        <Link
                            className="ml-1"
                            href={EVMExplorerResolver.addressLink(polygon.id, contractExploreUrl) ?? ''}
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            <LinkIcon width={18} height={18} />
                        </Link>
                    ) : null}
                </>
            );
        }

        if (isSoldOut)
            return (
                <>
                    <Trans>Sold Out</Trans>
                    {contractExploreUrl ? (
                        <Link
                            className="ml-1"
                            href={EVMExplorerResolver.addressLink(polygon.id, contractExploreUrl) ?? ''}
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            <LinkIcon width={18} height={18} />
                        </Link>
                    ) : null}
                </>
            );

        if (isTimeOut)
            return (
                <>
                    <Trans>Time Out</Trans>
                    {contractExploreUrl ? (
                        <Link
                            href={EVMExplorerResolver.addressLink(polygon.id, contractExploreUrl) ?? ''}
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            <LinkIcon width={18} height={18} />
                        </Link>
                    ) : null}
                </>
            );

        if (!allowed) {
            return <Trans>Allow Collect Module</Trans>;
        }

        if (!hasEnoughBalance) {
            return <Trans>Insufficient Balance</Trans>;
        }

        if (post.collectModule?.amount && post.collectModule.currency) {
            return (
                <Trans>
                    Collect for {post.collectModule.amount} {post.collectModule.currency}
                </Trans>
            );
        }

        if (post.collectModule?.followerOnly && !profile?.viewerContext?.following) {
            return <Trans>Follow to Collect</Trans>;
        }

        return <Trans>Free Collect</Trans>;
    }, [
        post.collectModule?.contract.address,
        post.collectModule?.amount,
        post.collectModule?.currency,
        post.collectModule?.followerOnly,
        post.hasActed,
        isLogin,
        isSoldOut,
        isTimeOut,
        allowed,
        hasEnoughBalance,
        profile?.viewerContext?.following,
    ]);

    const handleClick = useCallback(async () => {
        if (disabled) return;
        if (!isLogin) {
            if (post.source === Source.Lens) {
                getWalletClientRequired(config);
            }
            LoginModalRef.open({ source: post.source });
            return;
        }

        if (!allowed) {
            handleApprove();
            return;
        }

        if (post.collectModule?.followerOnly && !profile?.viewerContext?.following) {
            toggleFollow.mutate();
            return;
        }

        handleCollect();
    }, [
        disabled,
        isLogin,
        allowed,
        post.collectModule?.followerOnly,
        profile?.viewerContext?.following,
        post.source,
        handleCollect,
        handleApprove,
        toggleFollow,
    ]);

    return (
        <div className="overflow-x-hidden px-6 pb-6 max-md:px-0 max-md:pb-4">
            <div className="my-3 rounded-lg bg-lightBg px-3 py-2">
                <div className="flex items-center gap-2">
                    <Avatar src={post.author.pfp} size={20} alt={post.author.handle} />
                    <span className="text-medium leading-[24px] text-lightSecond">{post.author.handle}</span>
                </div>
                <div className="line-clamp-2 text-left text-base font-bold leading-5 text-fourMain">
                    {post.metadata.content?.content}
                </div>
            </div>

            <div className="flex items-center justify-center gap-7 text-sm leading-[22px]">
                <div className="flex flex-col items-center">
                    <div className="font-bold text-main">
                        <span>{collectModule?.collectedCount}</span>
                        {collectModule?.collectLimit ? <span>/ {collectModule.collectLimit}</span> : null}
                    </div>
                    <div className="text-second">
                        <Trans>Collected</Trans>
                    </div>
                </div>

                {timeLeft && !isTimeOut ? (
                    <div className="flex flex-col items-center">
                        <div className="font-bold text-main">{timeLeft}</div>
                        <div className="text-second">
                            <Trans>Time Limit</Trans>
                        </div>
                    </div>
                ) : null}

                <div className="flex flex-col items-center">
                    <div className="font-bold text-main">
                        {collectModule?.followerOnly ? t`Followers` : t`Everyone`}
                    </div>
                    <div className="text-second">
                        <Trans>Exclusivity</Trans>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="font-bold text-main">{cost ? `≈ $${cost}` : t`Free`}</div>
                    <div className="text-second">
                        <Trans>Cost</Trans>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex gap-2 max-md:mt-4">
                <ChainGuardButton
                    targetChainId={polygon.id}
                    className="w-full"
                    loading={loading}
                    disabled={disabled}
                    onClick={handleClick}
                >
                    {action}
                </ChainGuardButton>

                {post.collectModule?.referralFee ? (
                    <ClickableButton
                        disabled={mirrorLoading}
                        className="flex w-[86px] items-center justify-center gap-1 rounded-full border border-highlight py-2 text-[15px] font-bold leading-[20px] text-highlight"
                        onClick={async () => {
                            await handleMirror();
                            callback?.();
                        }}
                    >
                        {!mirrorLoading ? (
                            <MirrorLargeIcon width={15} height={15} />
                        ) : (
                            <LoadingIcon className="animate-spin" width={15} height={15} />
                        )}
                        {post.collectModule.referralFee}%
                    </ClickableButton>
                ) : null}
            </div>
        </div>
    );
}
