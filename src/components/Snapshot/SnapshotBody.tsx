import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { produce } from 'immer';
import { isArray, isEqual, isNumber, isObject, isUndefined, sum, values } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';
import type { Hex } from 'viem';
import { useAccount, useEnsName } from 'wagmi';

import SnapshotIcon from '@/assets/snapshot.svg';
import { Avatar } from '@/components/Avatar.js';
import { ChainGuardButton } from '@/components/ChainGuardButton.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Link } from '@/components/Link.js';
import { SnapshotMarkup } from '@/components/Markup/SnapshotMarkup.js';
import { Time } from '@/components/Semantic/Time.js';
import { SnapshotActions } from '@/components/Snapshot/SnapshotActions.js';
import { SnapshotApprovalChoices } from '@/components/Snapshot/SnapshotApprovalChoices.js';
import { SnapshotQuadraticChoices } from '@/components/Snapshot/SnapshotQuadraticChoices.js';
import { SnapshotRankChoices } from '@/components/Snapshot/SnapshotRankChoices.js';
import { SnapshotResults } from '@/components/Snapshot/SnapshotResults.js';
import { SnapshotSingleChoices } from '@/components/Snapshot/SnapshotSingleChoices.js';
import { SnapshotStatus } from '@/components/Snapshot/SnapshotStatus.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { queryClient } from '@/configs/queryClient.js';
import { IS_APPLE, IS_SAFARI } from '@/constants/bowser.js';
import { SnapshotState, SourceInURL } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueMessageFromError } from '@/helpers/enqueueMessage.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { formatSnapshotChoice } from '@/helpers/formatSnapshotChoice.js';
import { stopPropagation } from '@/helpers/stopEvent.js';
import { ComposeModalRef, ConfirmModalRef } from '@/modals/controls.js';
import { Snapshot } from '@/providers/snapshot/index.js';
import type { SnapshotActivity, SnapshotChoice, SnapshotProposal } from '@/providers/snapshot/type.js';

interface Props {
    activity?: SnapshotActivity;
    snapshot: SnapshotProposal;
    link?: string;
    postId?: string;
}

export function SnapshotBody({ snapshot, link, postId, activity }: Props) {
    const { choices, type, state, scores, symbol, scores_total, votes, space, author } = snapshot;

    const [currentTabIndex, setCurrentTabIndex] = useState(0);
    const [selectedChoices = snapshot.currentUserChoice, setSelectedChoices] = useState<SnapshotChoice | undefined>(
        snapshot.currentUserChoice,
    );

    const isVoted =
        !isUndefined(selectedChoices) &&
        !isUndefined(snapshot.currentUserChoice) &&
        isEqual(snapshot.currentUserChoice, selectedChoices);

    const account = useAccount();

    const authorUrl = urlcat('/profile/:address', {
        address: snapshot.author,
        source: SourceInURL.Wallet,
    });

    const tabs = [
        {
            label: t`Proposal`,
            value: 'proposal',
        },
        {
            label: t`Votes`,
            value: 'votes',
        },
    ] as const;

    const { data: vp, isLoading: queryVpLoading } = useQuery({
        queryKey: [
            'snapshot',
            account.address,
            snapshot.network,
            snapshot.strategies,
            snapshot.snapshot,
            snapshot.space.id,
        ],
        queryFn: async () => {
            if (!account.address) return 0;
            const { vp } = await Snapshot.getVotePower(
                account.address,
                snapshot.network,
                snapshot.strategies,
                snapshot.snapshot,
                snapshot.space.id,
                false,
            );

            return vp;
        },
    });

    const ensHandle = useEnsName({ address: author as Hex });

    const isPending = state === SnapshotState.Pending;
    const isNotEnoughVp = vp === 0 && !queryVpLoading;

    const disabled = useMemo(() => {
        if (!selectedChoices || (isArray(selectedChoices) && !selectedChoices?.length) || isNotEnoughVp) return true;

        if (type === 'approval' && isArray(selectedChoices) && !selectedChoices.length) return true;

        if (
            (type === 'quadratic' || type === 'weighted') &&
            isObject(selectedChoices) &&
            sum(values(selectedChoices)) === 0
        )
            return true;

        if (type === 'ranked-choice' && isArray(selectedChoices) && selectedChoices.length !== choices.length)
            return true;

        return false;
    }, [type, selectedChoices, choices, isNotEnoughVp]);

    const [, handleVote] = useAsyncFn(async () => {
        try {
            if (!account.address || disabled || !selectedChoices) return;

            const result = await Snapshot.vote({
                from: account.address,
                space: snapshot.space.id,
                proposal: snapshot.id,
                type: snapshot.type,
                choice: selectedChoices,
                privacy: snapshot.privacy,
                app: 'snapshot',
                reason: '',
            });

            if (!result) return;

            const confirmed = await ConfirmModalRef.openAndWaitForClose({
                title: t`Your vote is in!`,
                content: (
                    <div className="mb-2 text-center text-[15px] leading-[18px] text-secondary">
                        <Trans>
                            Create a post to tell everyone about your participation. Votes can be changed while the
                            proposal is active.
                        </Trans>
                    </div>
                ),
                contentClass: 'pt-0',
                modalClass: '!max-w-[388px] !w-[388px]',
                variant: 'secondary',
                enableConfirmButton: true,
                confirmButtonText: t`Create a Post`,
            });

            if (confirmed) {
                ComposeModalRef.open({
                    type: 'compose',
                    chars: [
                        // eslint-disable-next-line no-irregular-whitespace
                        t`🙌  Just voted “${formatSnapshotChoice(selectedChoices, type, choices)}” on “${snapshot.title}”`,
                        `\n\n${snapshot.link}`,
                    ],
                });
            }

            if (link && postId) {
                queryClient.refetchQueries({
                    queryKey: ['post-embed', link, postId],
                });
            }
            queryClient.setQueriesData<{
                pages: Array<{ data: SnapshotActivity[] }>;
            }>(
                {
                    queryKey: ['snapshots', account.address],
                },
                (old) => {
                    if (!old) return old;

                    return produce(old, (draft) => {
                        draft.pages.forEach((page) => {
                            page.data.forEach((oldData) => {
                                if (oldData.proposal_id === activity?.proposal_id && oldData.proposal) {
                                    oldData.proposal.currentUserChoice = selectedChoices;
                                }
                            });
                        });
                    });
                },
            );
        } catch (error) {
            enqueueMessageFromError(error, t`Failed to vote.`);
            throw error;
        }
    }, [
        account.address,
        disabled,
        selectedChoices,
        snapshot.space.id,
        snapshot.id,
        snapshot.type,
        snapshot.privacy,
        snapshot.title,
        snapshot.link,
        link,
        postId,
        type,
        choices,
        activity?.proposal_id,
    ]);

    const handleChange = useCallback((value?: SnapshotChoice) => {
        if (!isUndefined(value)) {
            setSelectedChoices(value);
        }
    }, []);

    return (
        <div className="link-preview">
            <ClickableArea className="relative mt-[6px] flex flex-col gap-2 rounded-2xl border border-line bg-bg p-3 text-left text-commonMain">
                <SnapshotStatus status={state} className="self-start" />
                <h1
                    className={classNames('line-clamp-2 text-left text-[20px] font-bold leading-[22px]', {
                        'max-h-[40px]': IS_SAFARI && IS_APPLE,
                    })}
                >
                    {snapshot.title}
                </h1>
                <div>
                    <div className="flex items-center gap-2 max-md:flex md:hidden">
                        <Link href={authorUrl} className="z-[1]">
                            <Avatar
                                className="h-[15px] w-[15px]"
                                src={`https://cdn.stamp.fyi/space/s:${space.id}?s=40`}
                                size={15}
                                alt={space.name || space.id}
                            />
                        </Link>
                        <Link
                            href={authorUrl}
                            onClick={stopPropagation}
                            className="block truncate text-clip text-medium leading-5 text-secondary"
                        >
                            <Trans>
                                <strong>{space.name}</strong> by{' '}
                                <strong>{ensHandle.data || formatEthereumAddress(snapshot.author, 4)}</strong>
                            </Trans>
                        </Link>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-1 items-center gap-2 truncate">
                            <div className="hidden items-center gap-2 md:flex">
                                <Link href={authorUrl} className="z-[1]">
                                    <Avatar
                                        className="h-[15px] w-[15px]"
                                        src={`https://cdn.stamp.fyi/space/s:${space.id}?s=40`}
                                        size={15}
                                        alt={space.name || space.id}
                                    />
                                </Link>
                                <Link
                                    href={authorUrl}
                                    onClick={stopPropagation}
                                    className="block truncate text-clip text-medium leading-5 text-secondary"
                                >
                                    <Trans>
                                        <strong>{space.name}</strong> by{' '}
                                        <strong>{ensHandle.data || formatEthereumAddress(snapshot.author, 4)}</strong>
                                    </Trans>
                                </Link>
                            </div>
                            <Time
                                dateTime={snapshot.created * 1000}
                                className="truncate whitespace-nowrap text-medium leading-4 text-secondary"
                            >
                                <TimestampFormatter time={snapshot.created * 1000} />
                            </Time>
                            ·
                            <SnapshotIcon width={15} height={15} />
                        </div>
                        <SnapshotActions activity={activity} link={Snapshot.getProposalLink(snapshot)} />
                    </div>
                </div>

                <div>
                    <TabGroup selectedIndex={currentTabIndex} onChange={setCurrentTabIndex}>
                        <TabList className="flex w-full rounded-t-xl bg-none">
                            {tabs.map((x, i) => (
                                <Tab
                                    className={classNames(
                                        'flex-1 rounded-t-xl px-4 py-2 text-base font-bold leading-5 outline-none',
                                        {
                                            'text-secondary': currentTabIndex !== i,
                                            'bg-white text-main': currentTabIndex === i,
                                        },
                                    )}
                                    key={x.value}
                                >
                                    {x.label}
                                </Tab>
                            ))}
                        </TabList>
                        <TabPanels className="rounded-b-xl bg-white p-4">
                            <TabPanel>
                                <SnapshotMarkup className="no-scrollbar overflow-auto text-sm leading-[18px] text-secondary max-md:h-[270px] md:h-[374px]">
                                    {snapshot.body}
                                </SnapshotMarkup>
                            </TabPanel>
                            <TabPanel>
                                <SnapshotResults
                                    status={state}
                                    choices={choices}
                                    scores={scores}
                                    symbol={symbol}
                                    scoreTotal={scores_total}
                                    id={snapshot.id}
                                    votes={votes}
                                />
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </div>
                {state === SnapshotState.Active || state === SnapshotState.Pending ? (
                    <>
                        {type === 'single-choice' || type === 'basic' ? (
                            <SnapshotSingleChoices
                                value={
                                    !isUndefined(selectedChoices) && isNumber(selectedChoices)
                                        ? selectedChoices
                                        : undefined
                                }
                                choices={choices}
                                disabled={isPending}
                                onChange={handleChange}
                            />
                        ) : null}
                        {type === 'approval' ? (
                            <SnapshotApprovalChoices
                                value={
                                    !isUndefined(selectedChoices) && isArray(selectedChoices)
                                        ? selectedChoices
                                        : undefined
                                }
                                choices={snapshot.choices}
                                disabled={isPending}
                                onChange={handleChange}
                            />
                        ) : null}
                        {type === 'quadratic' || type === 'weighted' ? (
                            <SnapshotQuadraticChoices
                                value={
                                    !isUndefined(selectedChoices) &&
                                    !isArray(selectedChoices) &&
                                    isObject(selectedChoices)
                                        ? selectedChoices
                                        : undefined
                                }
                                choices={choices}
                                disabled={isPending}
                                onChange={handleChange}
                            />
                        ) : null}
                        {type === 'ranked-choice' ? (
                            <SnapshotRankChoices
                                value={
                                    !isUndefined(selectedChoices) && isArray(selectedChoices)
                                        ? selectedChoices
                                        : undefined
                                }
                                choices={choices}
                                disabled={isPending}
                                onChange={handleChange}
                            />
                        ) : null}
                        <ChainGuardButton
                            className="w-full"
                            variant={isVoted || isNotEnoughVp ? 'secondary' : 'primary'}
                            disabled={disabled || isVoted}
                            loading={queryVpLoading}
                            onClick={handleVote}
                        >
                            {isVoted ? (
                                <Trans>Voted</Trans>
                            ) : isNotEnoughVp ? (
                                <Trans>No voting power</Trans>
                            ) : (
                                <Trans>Vote</Trans>
                            )}
                        </ChainGuardButton>
                    </>
                ) : null}
            </ClickableArea>
        </div>
    );
}
