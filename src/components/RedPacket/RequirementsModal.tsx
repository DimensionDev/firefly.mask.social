import { t, Trans } from '@lingui/macro';
import { getEnumAsArray } from '@masknet/kit';
import { useQueries } from '@tanstack/react-query';
import { sortBy } from 'lodash-es';
import { Fragment, useMemo } from 'react';

import AddUser from '@/assets/add-user.svg';
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
import { MentionLink } from '@/components/RedPacket/MentionLink.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveRedPacketPlatformType } from '@/helpers/resolveRedPacketPlatformType.js';
import { EVMExplorerResolver, NFTScanNonFungibleTokenEVM } from '@/mask/index.js';
import { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';
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

interface RequirementsModalProps {
    open: boolean;
    post: Post;
    claimStrategyStatus?: FireflyRedPacketAPI.ClaimStrategyStatus[];
    showResults: boolean;
    isVerifying: boolean;
    isClaiming: boolean;
    onClose: () => void;
    onVerifyAndClaim: () => void;
}
export function RequirementsModal({
    open,
    post,
    showResults,
    claimStrategyStatus,
    isVerifying,
    isClaiming,
    onClose,
    onVerifyAndClaim,
}: RequirementsModalProps) {
    const TitleMap = {
        like: t`Like`,
        repost: t`Repost`,
        quote: t`Repost`,
        comment: t`Comment`,
        collect: t`NFT holder`,
    };

    const requirements = useMemo(() => {
        const orders = getEnumAsArray(FireflyRedPacketAPI.StrategyType).map((x) => x.value);
        return sortBy(claimStrategyStatus, (x) => orders.indexOf(x.type as FireflyRedPacketAPI.StrategyType));
    }, [claimStrategyStatus]);

    return (
        <Modal open={open} onClose={onClose}>
            <div className="flex min-h-[344px] min-w-[476px] transform flex-col rounded-xl bg-primaryBottom transition-all">
                <div className="flex items-center justify-center gap-2 rounded-t-xl p-4">
                    <CloseButton
                        className="h-6 w-6 shrink-0"
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
                    {isVerifying && !requirements.length ? (
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
                                                'bg-bg': showResults && isVerifying,
                                                'bg-success/10 dark:bg-success/20':
                                                    showResults && !isVerifying && status.result,
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
                                            isVerifying && !status.result ? (
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

                            if (
                                status.type === FireflyRedPacketAPI.StrategyType.postReaction &&
                                typeof status.result === 'object'
                            ) {
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
                                                        'bg-bg': showResults && isVerifying,
                                                        'bg-success/10 dark:bg-success/20':
                                                            showResults && !isVerifying && condition.value,
                                                    },
                                                )}
                                                key={condition.key}
                                            >
                                                <Icon width={16} height={16} />
                                                <span className="flex flex-1 gap-1 truncate">
                                                    {TitleMap[condition.key]}
                                                </span>
                                                {showResults ? (
                                                    isVerifying && !condition.value ? (
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
                                                'bg-bg': showResults && isVerifying,
                                                'bg-success/10 dark:bg-success/20':
                                                    showResults && !isVerifying && status.result,
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
                                            isVerifying && !status.result ? (
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
                            onClick={onVerifyAndClaim}
                            loading={isClaiming || isVerifying}
                            disabled={isVerifying}
                        >
                            <Trans>Verify and Claim</Trans>
                        </ActionButton>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
}
