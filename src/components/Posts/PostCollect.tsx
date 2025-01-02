import { OpenActionModuleType } from '@lens-protocol/client';
import { t, Trans } from '@lingui/macro';
import { ZERO_ADDRESS } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { StatusCodes } from 'http-status-codes';
import { compact, first } from 'lodash-es';
import { useMemo } from 'react';
import { useAsyncFn } from 'react-use';
import type { Hex } from 'viem';
import { polygon } from 'viem/chains';
import { useAccount, useBalance } from 'wagmi';

import LinkIcon from '@/assets/link.svg';
import LoadingIcon from '@/assets/loading.svg';
import MirrorLargeIcon from '@/assets/mirror-large.svg';
import { Avatar } from '@/components/Avatar.js';
import { ChainGuardButton } from '@/components/ChainGuardButton.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Link } from '@/components/Link.js';
import { SuperFollow } from '@/components/Posts/SuperFollow.js';
import { Tooltip } from '@/components/Tooltip.js';
import { config } from '@/configs/wagmiClient.js';
import { Source } from '@/constants/enum.js';
import { FetchError } from '@/constants/error.js';
import { enqueueErrorMessage, enqueueMessageFromError, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { getTimeLeft } from '@/helpers/formatTimestamp.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useMirror } from '@/hooks/useMirror.js';
import { useSuperFollowModule } from '@/hooks/useSuperFollow.js';
import { useToggleFollow } from '@/hooks/useToggleFollow.js';
import { EVMExplorerResolver } from '@/mask/index.js';
import { DraggablePopoverRef, LoginModalRef, SuperFollowModalRef } from '@/modals/controls.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { getProfileById } from '@/services/getProfileById.js';

function formatTimeLeft(endTime: string) {
    const timeLeft = getTimeLeft(endTime);
    if (!timeLeft) return;
    const { days, hours, minutes, seconds } = timeLeft;
    if (days >= 1) return t`${days}d left`;
    if (hours >= 1) return t`${hours}h left`;
    if (minutes >= 1) return t`${minutes}m left`;
    return t`1m left`;
}

interface PostCollectProps {
    post: Post;
    onClose?: () => void;
}

export function PostCollect({ post, onClose }: PostCollectProps) {
    const isMedium = useIsMedium();
    const account = useAccount();
    const currentProfile = useCurrentProfile(Source.Lens);
    const collectModule = post.collectModule;
    const timeLeft = collectModule?.endsAt ? formatTimeLeft(collectModule?.endsAt) : undefined;

    const isSoldOut = collectModule?.collectLimit
        ? collectModule?.collectedCount >= collectModule?.collectLimit
        : false;

    const isTimeout = collectModule?.endsAt ? dayjs(collectModule?.endsAt).isBefore(dayjs()) : false;

    const verifiedAssetAddress =
        !!collectModule?.assetAddress && !isSameEthereumAddress(collectModule.assetAddress, ZERO_ADDRESS);

    const [followLoading, toggleFollow] = useToggleFollow(post.author);

    const { data: profile = null, isLoading: queryProfileLoading } = useQuery({
        queryKey: ['profile', post.source, post.author.profileId],
        queryFn: async () => {
            return getProfileById(post.source, post.author.handle);
        },
        retry(failureCount, error) {
            if (error instanceof FetchError && error.status === StatusCodes.FORBIDDEN) return false;
            return failureCount <= 3;
        },
    });

    const isFollowing = !!profile?.viewerContext?.following;

    const { followModule, loading: moduleLoading } = useSuperFollowModule(profile, isFollowing);

    const isSuperFollow = !isFollowing && !!followModule;

    const isLogin = useIsLogin(post.source);

    const {
        data: allowanceData,
        isLoading: allowanceLoading,
        refetch: refetchAllowanceData,
    } = useQuery({
        enabled: verifiedAssetAddress,
        queryKey: [
            'post',
            'collect',
            'allowedAmount',
            post.source,
            post.postId,
            collectModule?.contract.address,
            collectModule?.type,
        ],
        queryFn: async () => {
            if (post.source !== Source.Lens || !collectModule) return;

            if (!collectModule.assetAddress) return;

            const result = await LensSocialMediaProvider.queryApprovedModuleAllowanceData(
                collectModule.assetAddress,
                collectModule?.type as OpenActionModuleType,
            );

            return first(result);
        },
    });

    const allowed = allowanceData ? parseFloat(allowanceData?.allowance.value) > (collectModule?.amount ?? 0) : true;

    const { data: balanceData, isLoading: queryBalanceLoading } = useBalance({
        address: account.address,
        token: verifiedAssetAddress ? (collectModule?.assetAddress as Hex) : undefined,
    });

    const hasEnoughBalance =
        balanceData?.value && collectModule?.amount ? parseFloat(balanceData.formatted) >= collectModule.amount : true;

    const [{ loading: approveLoading }, handleApprove] = useAsyncFn(async () => {
        if (post.source !== Source.Lens || !allowanceData || !collectModule?.assetAddress) return;

        await LensSocialMediaProvider.approveModuleAllowance(
            allowanceData,
            Number.MAX_SAFE_INTEGER.toString(),
            collectModule.assetAddress,
        );

        await refetchAllowanceData();
    }, [post.source, allowanceData, collectModule?.assetAddress, refetchAllowanceData]);

    const [{ loading: collectLoading }, handleCollect] = useAsyncFn(async () => {
        try {
            if (!collectModule?.type) return;

            await LensSocialMediaProvider.actPost(post.postId, {
                type: collectModule.type as OpenActionModuleType,
                signRequire: !!collectModule.amount || collectModule.followerOnly,
            });
            enqueueSuccessMessage(t`Post collected successfully!`);

            onClose?.();
        } catch (error) {
            enqueueMessageFromError(error, t`Failed to collect post.`);
            throw error;
        }
    }, [collectModule, post.postId, onClose]);

    const [{ loading: mirrorLoading }, handleMirror] = useMirror(post);

    const action = useMemo(() => {
        const contractExploreUrl = collectModule?.contract.address
            ? (EVMExplorerResolver.addressLink(polygon.id, collectModule.contract.address) ?? '')
            : undefined;
        if (!isLogin) return <Trans>Login</Trans>;

        if (post.hasActed) {
            return (
                <>
                    <Trans>Collected</Trans>
                    {contractExploreUrl ? (
                        <Link className="ml-1" href={contractExploreUrl} target="_blank" rel="noreferrer noopener">
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
                        <Link className="ml-1" href={contractExploreUrl} target="_blank" rel="noreferrer noopener">
                            <LinkIcon width={18} height={18} />
                        </Link>
                    ) : null}
                </>
            );

        if (isTimeout)
            return (
                <>
                    <Trans>Time Out</Trans>
                    {contractExploreUrl ? (
                        <Link href={contractExploreUrl} target="_blank" rel="noreferrer noopener">
                            <LinkIcon width={18} height={18} />
                        </Link>
                    ) : null}
                </>
            );

        if (collectModule?.followerOnly && !profile?.viewerContext?.following) {
            return <Trans>Follow to Collect</Trans>;
        }

        if (!hasEnoughBalance) {
            return <Trans>Insufficient Balance</Trans>;
        }

        if (!allowed) {
            return <Trans>Allow Collect Module</Trans>;
        }

        if (collectModule?.amount && collectModule.currency) {
            return (
                <Trans>
                    Collect for {collectModule.amount} {collectModule.currency}
                </Trans>
            );
        }

        return <Trans>Free Collect</Trans>;
    }, [
        collectModule?.contract.address,
        collectModule?.amount,
        collectModule?.currency,
        collectModule?.followerOnly,
        post.hasActed,
        isLogin,
        isSoldOut,
        isTimeout,
        allowed,
        hasEnoughBalance,
        profile?.viewerContext?.following,
    ]);

    const [{ loading: clickLoading }, handleClick] = useAsyncFn(async () => {
        if (!isLogin) {
            if (post.source === Source.Lens) {
                getWalletClientRequired(config);
            }
            LoginModalRef.open({ source: post.source });
            return;
        }

        if (
            currentProfile?.ownedBy?.address &&
            !isSameEthereumAddress(currentProfile?.ownedBy?.address, account.address)
        ) {
            enqueueErrorMessage(
                t`The current connected wallet does not match, Please switch to ${formatEthereumAddress(currentProfile.ownedBy.address, 4)}`,
            );
            return;
        }

        if (collectModule?.followerOnly && !profile?.viewerContext?.following) {
            if (isSuperFollow && profile) {
                await (isMedium
                    ? SuperFollowModalRef.openAndWaitForClose({ profile })
                    : DraggablePopoverRef.openAndWaitForClose({
                          content: (
                              <SuperFollow
                                  profile={profile}
                                  showCloseButton={false}
                                  onClose={DraggablePopoverRef.close}
                              />
                          ),
                      }));

                return;
            }
            toggleFollow.mutate();

            return;
        }

        if (!allowed) {
            handleApprove();
            return;
        }

        handleCollect();
    }, [
        isLogin,
        currentProfile,
        account.address,
        collectModule?.followerOnly,
        profile,
        allowed,
        handleCollect,
        post.source,
        isSuperFollow,
        toggleFollow,
        isMedium,
        handleApprove,
    ]);

    const loading =
        followLoading ||
        allowanceLoading ||
        approveLoading ||
        collectLoading ||
        queryBalanceLoading ||
        queryProfileLoading ||
        clickLoading ||
        moduleLoading;

    const disabled = post.hasActed || isSoldOut || isTimeout || !hasEnoughBalance;

    return (
        <div className="overflow-x-hidden px-6 pb-6 max-md:px-0 max-md:pb-4">
            <div className="my-3 rounded-lg bg-lightBg px-3 py-2">
                <div className="flex items-center gap-2">
                    <Avatar src={post.author.pfp} size={20} alt={post.author.handle} />
                    <span className="overflow-hidden text-ellipsis text-medium font-bold leading-[24px] text-main">
                        {post.author.displayName}
                    </span>
                    <span className="text-medium leading-[24px] text-lightSecond">@{post.author.handle}</span>
                </div>
                <div className="line-clamp-2 text-left text-base leading-5 text-fourMain">
                    {post.metadata.content?.content}
                    {compact(
                        [
                            post.metadata.content?.attachments?.filter((x) => x.type === 'Image').length
                                ? '[Photo]'
                                : undefined,
                            post.metadata.content?.attachments?.filter((x) => x.type === 'Video').length
                                ? '[Video]'
                                : undefined,
                            post.metadata.content?.attachments?.filter((x) => x.type === 'Poll').length
                                ? '[Poll]'
                                : undefined,
                        ].join(''),
                    )}
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

                {timeLeft && !isTimeout ? (
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
                    <div className="font-bold text-main">
                        {collectModule?.amount && collectModule.currency
                            ? `${collectModule.amount} $${collectModule.currency}`
                            : t`Free`}
                    </div>
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

                {collectModule?.referralFee ? (
                    <Tooltip content={t`Mirror now to get 25% referral fee!`} placement="top">
                        <ClickableButton
                            disabled={mirrorLoading}
                            className="flex w-[86px] items-center justify-center gap-1 rounded-full border border-highlight py-2 text-[15px] font-bold leading-[20px] text-highlight"
                            onClick={async () => {
                                await handleMirror();
                                onClose?.();
                            }}
                        >
                            {!mirrorLoading ? (
                                <MirrorLargeIcon width={15} height={15} />
                            ) : (
                                <LoadingIcon className="animate-spin" width={15} height={15} />
                            )}
                            {collectModule.referralFee}%
                        </ClickableButton>
                    </Tooltip>
                ) : null}
            </div>
        </div>
    );
}
