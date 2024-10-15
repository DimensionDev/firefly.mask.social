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
import { SnapshotResults } from '@/components/Snapshot/SnapshotResults.js';
import { SnapshotStatus } from '@/components/Snapshot/SnapshotStatus.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { IS_APPLE, IS_SAFARI } from '@/constants/bowser.js';
import { Source, SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import type { SnapshotProposal } from '@/providers/types/Snapshot.js';

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

    return (
        <ClickableArea className="relative mt-[6px] flex flex-col gap-2 rounded-2xl border border-line bg-bg p-3 text-commonMain">
            <SnapshotStatus status={snapshot.ext_param.state} className="self-start" />
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
                            src={
                                snapshot.ext_param.displayInfo?.avatarUrl ||
                                getStampAvatarByProfileId(Source.Wallet, snapshot.author)
                            }
                            size={15}
                            alt={snapshot.ext_param.displayInfo?.ensHandle || snapshot.author}
                        />
                    </Link>
                    <Link
                        href={authorUrl}
                        onClick={(event) => event.stopPropagation()}
                        className="block truncate text-clip text-medium leading-5 text-secondary"
                    >
                        {snapshot.ext_param.displayInfo?.ensHandle || formatEthereumAddress(snapshot.author, 4)}
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
                    <Tab.Panels className="bg-white dark:bg-black">
                        <Tab.Panel className="rounded-b-xl bg-white p-4">
                            <SnapshotMarkup className="no-scrollbar max-h-[374px] overflow-auto text-sm leading-[18px] text-secondary">
                                {snapshot.body}
                            </SnapshotMarkup>
                        </Tab.Panel>
                        <Tab.Panel className="rounded-b-xl p-4">
                            <SnapshotResults
                                status={snapshot.ext_param.state}
                                choices={snapshot.ext_param.choices}
                                scores={snapshot.ext_param.scores}
                                symbol={snapshot.ext_param.symbol}
                                scoreTotal={snapshot.ext_param.scores_total}
                                id={snapshot.id}
                                votes={snapshot.ext_param.votes}
                            />
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </ClickableArea>
    );
}
