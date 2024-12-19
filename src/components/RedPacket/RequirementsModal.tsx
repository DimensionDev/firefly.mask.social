import { t, Trans } from '@lingui/macro';
import { getEnumAsArray } from '@masknet/kit';
import { useRedPacketConstants } from '@masknet/web3-shared-evm';
import { useQueries } from '@tanstack/react-query';
import { last, sortBy } from 'lodash-es';
import { Fragment, useMemo } from 'react';
import { useAsyncFn } from 'react-use';
import type { Address } from 'viem';
import { readContract } from 'wagmi/actions';

import AddUser from '@/assets/add-user.svg';
import CircleSuccessIcon from '@/assets/circle-success.svg';
import CloseSquareIcon from '@/assets/close-square.svg';
import Comment from '@/assets/comment-rp.svg';
import Like from '@/assets/like.svg';
import LoadingIcon from '@/assets/loader2.svg';
import Repost from '@/assets/repost.svg';
import NFTHolder from '@/assets/rp-nft-holder.svg';
import TickSquareIcon from '@/assets/tick-square.svg';
import { ActionButton } from '@/components/ActionButton.js';
import { CloseButton } from '@/components/IconButton.js';
import { Loading } from '@/components/Loading.js';
import { Modal } from '@/components/Modal.js';
import { queryClient } from '@/configs/queryClient.js';
import { config } from '@/configs/wagmiClient.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { formatBalance } from '@/helpers/formatBalance.js';
import { resolveRedPacketPlatformType } from '@/helpers/resolveRedPacketPlatformType.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { HappyRedPacketV4ABI } from '@/mask/bindings/constants.js';
import { EVMExplorerResolver, NFTScanNonFungibleTokenEVM } from '@/mask/bindings/index.js';
import { MentionLink } from '@/mask/plugins/red-packet/components/Requirements/MentionLink.js';
import { useClaimCallback } from '@/mask/plugins/red-packet/hooks/useClaimCallback.js';
import { useClaimStrategyStatus } from '@/mask/plugins/red-packet/hooks/useClaimStrategyStatus.js';
import { useCurrentClaimProfile } from '@/mask/plugins/red-packet/hooks/useCurrentClaimProfile.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';
import { FireflyRedPacketAPI, type RedPacketJSONPayload } from '@/providers/red-packet/types.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface NFTListProps {
    nfts: Array<{
        chainId: number;
        contractAddress: string;
        collectionName?: string;
    }>;
}
function NFTList({ nfts }: NFTListProps) {
    const queries = useQueries({
        queries: nfts.map((nft) => ({
            queryKey: ['nft-contract', nft.chainId, nft.contractAddress],
            queryFn: async () => {
                return NFTScanNonFungibleTokenEVM.getCollectionRaw(nft.contractAddress, {
                    chainId: nft.chainId,
                });
            },
        })),
    });
    return (
        <span className="mx-1">
            {queries.map((query, index) => {
                const { data } = query;
                const nft = nfts[index];
                if (!data) return <Fragment key={nft.chainId + nft.contractAddress}>{nft.collectionName}</Fragment>;
                const url = EVMExplorerResolver.addressLink(nft.chainId, nft.contractAddress);
                const name = nft.collectionName || data.name || data.symbol;
                return (
                    <Link key={index} href={url!} target="_blank">
                        {name}
                    </Link>
                );
            })}
        </span>
    );
}

function ResultIcon({ result }: { result: boolean }) {
    return result ? (
        <TickSquareIcon className="text-success" width={24} height={24} />
    ) : (
        <CloseSquareIcon width={24} height={24} />
    );
}

interface RequirementsModalProps {
    open: boolean;
    onClose: () => void;
    payload: RedPacketJSONPayload;
    post: Post;
    showResults: boolean;
}

const IconMap: Record<
    FireflyRedPacketAPI.PostReactionKind,
    React.FunctionComponent<React.SVGAttributes<SVGElement>>
> = {
    like: Like,
    repost: Repost,
    quote: Repost,
    comment: Comment,
    collect: NFTHolder,
};

export const TitleMap = {
    like: t`Like`,
    repost: t`Repost`,
    quote: t`Repost`,
    comment: t`Comment`,
    collect: t`NFT holder`,
};

export function RequirementsModal({ open, onClose, payload, post, showResults }: RequirementsModalProps) {
    const { account } = useChainContext();

    const { data, isLoading, isFetching, refetch } = useClaimStrategyStatus(payload, post.source, () => {
        enqueueErrorMessage(t`Oops... Network issue. Please try again`);
    });
    const { data: currentClaimProfile } = useCurrentClaimProfile(post.source);
    const requirements = useMemo(() => {
        const orders = getEnumAsArray(FireflyRedPacketAPI.StrategyType).map((x) => x.value);
        return sortBy(data?.data.claimStrategyStatus, (x) =>
            orders.indexOf(x.type as FireflyRedPacketAPI.StrategyType),
        );
    }, [data?.data.claimStrategyStatus]);

    const [{ loading: claimLoading }, claimCallback] = useClaimCallback(account, payload, post.source);

    const { HAPPY_RED_PACKET_ADDRESS_V4: redpacketContractAddress } = useRedPacketConstants(payload.chainId);

    const [{ loading }, handleClick] = useAsyncFn(async () => {
        const { data } = await refetch();
        if (!data?.data.canClaim) {
            enqueueErrorMessage(t`Oops... Not all the requirements have been meet`);
            return;
        }

        const hash = await claimCallback();
        if (hash && currentClaimProfile?.profileId && currentClaimProfile.handle) {
            await FireflyRedPacket.finishClaiming(
                payload.rpid,
                currentClaimProfile.platform,
                currentClaimProfile.profileId,
                currentClaimProfile?.handle,
                hash,
            );
        }

        await queryClient.refetchQueries({
            queryKey: ['red-packet', 'claim', payload.rpid],
        });

        const availability = (await readContract(config, {
            abi: HappyRedPacketV4ABI,
            functionName: 'check_availability',
            address: redpacketContractAddress as Address,
            args: [payload.rpid],
            account: account as Address,
        })) as [string, bigint, bigint, bigint, boolean, bigint];

        const claimed_amount = last(availability) as bigint;

        const amount = formatBalance(claimed_amount.toString(), payload.token?.decimals, { significant: 2 });
        ConfirmModalRef.open({
            title: t`Lucky Drop`,
            content: (
                <div className="flex h-[276px] w-[388px] flex-col items-center">
                    <CircleSuccessIcon width={90} height={90} />
                    <div className="mt-3 text-xl font-bold leading-6 text-success">
                        <Trans>Congratulations!</Trans>
                    </div>
                    <div className="mt-10 text-base font-bold leading-5 text-main">
                        <Trans>
                            Your claimed {amount} {payload.token?.symbol}.
                        </Trans>
                    </div>
                </div>
            ),
            modalClass: 'md:w-auto',
            enableConfirmButton: true,
            variant: 'normal',
            confirmButtonText: t`Share`,
        });

        enqueueSuccessMessage(t`Claimed lucky drop with ${amount} ${payload.token?.symbol} successfully`);
        onClose();
    }, [claimCallback, currentClaimProfile]);

    return (
        <Modal open={open} onClose={onClose}>
            <div className="flex min-h-[344px] min-w-[476px] transform flex-col rounded-xl bg-primaryBottom transition-all">
                <div className="flex items-center justify-center gap-2 rounded-t-xl p-4">
                    <CloseButton
                        onClick={() => {
                            onClose();
                        }}
                    />
                    <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                        <Trans>Requirements</Trans>
                    </div>
                    <div className="relative h-6 w-6" />
                </div>
                <div className="flex flex-1 flex-col gap-2 rounded-b-xl bg-primaryBottom px-6 pb-4 pt-6">
                    {isLoading && !requirements.length ? (
                        <Loading className="!min-h-[200px]" />
                    ) : (
                        requirements.flatMap((status) => {
                            if (status.type === FireflyRedPacketAPI.StrategyType.profileFollow) {
                                const payloads = status.payload.filter(
                                    (x) => x.platform === resolveRedPacketPlatformType(post.source),
                                );

                                return (
                                    <div
                                        className={classNames(
                                            'flex items-center gap-x-[10px] rounded-lg px-2 py-4 text-base leading-[18px]',
                                            {
                                                'bg-bg': showResults && isFetching,
                                                'bg-success/10 dark:bg-success/20':
                                                    showResults && !isFetching && status.result,
                                            },
                                        )}
                                        key={FireflyRedPacketAPI.StrategyType.profileFollow}
                                    >
                                        <AddUser width={16} height={16} />
                                        <span className="flex flex-1 gap-1 truncate">
                                            <Trans>Follow</Trans>
                                            {payloads.map((x) => {
                                                return <MentionLink key={x.profileId} {...x} />;
                                            })}
                                        </span>

                                        {showResults ? (
                                            isFetching && !status.result ? (
                                                <LoadingIcon
                                                    className="animate-spin text-secondary"
                                                    width={24}
                                                    height={24}
                                                />
                                            ) : (
                                                <ResultIcon result={status.result} />
                                            )
                                        ) : null}
                                    </div>
                                );
                            }

                            if (status.type === FireflyRedPacketAPI.StrategyType.postReaction) {
                                const conditions = status.result.conditions.filter((x) => x.key !== 'collect');
                                const hasRepost = !!conditions.find(
                                    (x) => (x.key === 'quote' || x.key === 'repost') && x.value,
                                );

                                let hasRepostCondition = false;
                                return conditions
                                    .reduce((arr: typeof conditions, condition) => {
                                        if (condition.key === 'quote' || condition.key === 'repost') {
                                            if (hasRepostCondition) return arr;
                                            hasRepostCondition = true;
                                            return [
                                                ...arr,
                                                { ...condition, key: 'repost', value: hasRepost },
                                            ] as typeof conditions;
                                        }
                                        return [...arr, condition];
                                    }, [])
                                    .map((condition) => {
                                        const Icon = IconMap[condition.key];

                                        return (
                                            <div
                                                className={classNames(
                                                    'flex items-center gap-x-[10px] rounded-lg px-2 py-4 text-base leading-[18px]',
                                                    {
                                                        'bg-bg': showResults && isFetching,
                                                        'bg-success/10 dark:bg-success/20':
                                                            showResults && !isFetching && condition.value,
                                                    },
                                                )}
                                                key={condition.key}
                                            >
                                                <Icon width={16} height={16} />
                                                <span className="flex flex-1 gap-1 truncate">
                                                    {TitleMap[condition.key]}
                                                </span>
                                                {showResults ? (
                                                    isFetching && !condition.value ? (
                                                        <LoadingIcon
                                                            className="animate-spin text-secondary"
                                                            width={24}
                                                            height={24}
                                                        />
                                                    ) : (
                                                        <ResultIcon result={condition.value} />
                                                    )
                                                ) : null}
                                            </div>
                                        );
                                    });
                            }

                            if (status.type === 'nftOwned') {
                                return (
                                    <div
                                        className={classNames(
                                            'flex items-center gap-x-[10px] rounded-lg px-2 py-4 text-base leading-[18px]',
                                            {
                                                'bg-bg': showResults && isFetching,
                                                'bg-success/10 dark:bg-success/20':
                                                    showResults && !isFetching && status.result,
                                            },
                                        )}
                                        key={status.type}
                                    >
                                        <NFTHolder width={16} height={16} />
                                        <span className="flex flex-1 gap-1 truncate">
                                            <Trans>
                                                NFT Holder of <NFTList nfts={status.payload} />
                                            </Trans>
                                        </span>
                                        {showResults ? (
                                            isFetching && !status.result ? (
                                                <LoadingIcon
                                                    className="animate-spin text-secondary"
                                                    width={24}
                                                    height={24}
                                                />
                                            ) : (
                                                <ResultIcon result={status.result} />
                                            )
                                        ) : null}
                                    </div>
                                );
                            }

                            return null;
                        })
                    )}
                    <div className="flex-grow" />
                    {showResults ? (
                        <ActionButton
                            className="w-full flex-none"
                            onClick={handleClick}
                            loading={loading || claimLoading}
                            disabled={isFetching}
                        >
                            <Trans>Verify and Claim</Trans>
                        </ActionButton>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
}
