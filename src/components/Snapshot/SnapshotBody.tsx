import { Tab } from '@headlessui/react';
import { t } from '@lingui/macro';
import { useState } from 'react';
import urlcat from 'urlcat';

import SnapshotIcon from '@/assets/snapshot.svg';
import { Avatar } from '@/components/Avatar.js';
import { ClickableArea } from '@/components/ClickableArea.js';
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
import { IS_APPLE, IS_SAFARI } from '@/constants/bowser.js';
import { Source, SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { stopPropagation } from '@/helpers/stopEvent.js';
import { type SnapshotProposal, SnapshotState } from '@/providers/types/Snapshot.js';

interface Props {
    snapshot: SnapshotProposal;
}

export function SnapshotBody({ snapshot }: Props) {
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

    const [currentTabIndex, setCurrentTabIndex] = useState(0);

    const { choices, type, state, displayInfo, scores, symbol, scores_total, votes } = snapshot.ext_param;

    const disabled = state === SnapshotState.Pending;

    return (
        <ClickableArea className="relative mt-[6px] flex flex-col gap-2 rounded-2xl border border-line bg-bg p-3 text-commonMain">
            <SnapshotStatus status={state} className="self-start" />
            <h1
                className={classNames('line-clamp-2 text-left text-[18px] font-bold leading-[20px]', {
                    'max-h-[40px]': IS_SAFARI && IS_APPLE,
                })}
            >
                {snapshot.title}
            </h1>
            <div className="flex items-center justify-between pb-[10px]">
                <div className="flex items-center gap-2">
                    <Link href={authorUrl} className="z-[1]">
                        <Avatar
                            className="h-[15px] w-[15px]"
                            src={displayInfo?.avatarUrl || getStampAvatarByProfileId(Source.Wallet, snapshot.author)}
                            size={15}
                            alt={displayInfo?.ensHandle || snapshot.author}
                        />
                    </Link>
                    <Link
                        href={authorUrl}
                        onClick={stopPropagation}
                        className="block truncate text-clip text-medium leading-5 text-secondary"
                    >
                        {displayInfo?.ensHandle || formatEthereumAddress(snapshot.author, 4)}
                    </Link>
                    <Time
                        dateTime={snapshot.created * 1000}
                        className="whitespace-nowrap text-medium text-xs leading-4 text-secondary"
                    >
                        <TimestampFormatter time={snapshot.created * 1000} />
                    </Time>
                    <SnapshotIcon width={15} height={15} />
                </div>
                <SnapshotActions link={snapshot.link} />
            </div>

            <div>
                <Tab.Group selectedIndex={currentTabIndex} onChange={setCurrentTabIndex}>
                    <Tab.List className="flex w-full rounded-t-xl bg-none">
                        {tabs.map((x, i) => (
                            <Tab
                                className={classNames(
                                    'flex-1 rounded-t-xl px-4 py-2 text-base font-bold leading-5 outline-none',
                                    {
                                        'text-secondary': currentTabIndex !== i,
                                        'bg-white text-main dark:bg-black': currentTabIndex === i,
                                    },
                                )}
                                key={x.value}
                            >
                                {x.label}
                            </Tab>
                        ))}
                    </Tab.List>
                    <Tab.Panels className="rounded-b-xl bg-white p-4">
                        <Tab.Panel>
                            <SnapshotMarkup className="no-scrollbar max-h-[374px] overflow-auto text-sm leading-[18px] text-secondary">
                                {snapshot.body}
                            </SnapshotMarkup>
                        </Tab.Panel>
                        <Tab.Panel>
                            <SnapshotResults
                                status={state}
                                choices={choices}
                                scores={scores}
                                symbol={symbol}
                                scoreTotal={scores_total}
                                id={snapshot.id}
                                votes={votes}
                            />
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>
            {state !== SnapshotState.Closed ? (
                <>
                    {type === 'single-choice' || type === 'basic' ? (
                        <SnapshotSingleChoices choices={choices} disabled={disabled} />
                    ) : null}
                    {type === 'approval' ? (
                        <SnapshotApprovalChoices choices={snapshot.ext_param.choices} disabled={disabled} />
                    ) : null}
                    {type === 'quadratic' || type === 'weighted' ? (
                        <SnapshotQuadraticChoices choices={choices} disabled={disabled} />
                    ) : null}
                    {type === 'ranked-choice' ? <SnapshotRankChoices choices={choices} disabled={disabled} /> : null}
                </>
            ) : null}
        </ClickableArea>
    );
}
