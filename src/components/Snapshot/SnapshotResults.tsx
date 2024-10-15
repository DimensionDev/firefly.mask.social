import { Trans } from '@lingui/macro';
import { memo, Suspense } from 'react';

import { SnapshotVotesList } from '@/components/Snapshot/SnapshotVotesList.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { formatPercentage } from '@/helpers/formatPercentage.js';
import { SnapshotState } from '@/providers/types/Snapshot.js';
import { Loading } from '@/components/Loading.js';
import { Tooltip } from '@/components/Tooltip.js';

interface SnapshotResultsProps {
    status: SnapshotState;
    choices: string[];
    scores: number[];
    symbol: string;
    scoreTotal: number;
    id: string;
    votes: number;
}

export const SnapshotResults = memo<SnapshotResultsProps>(function SnapshotResults({
    status,
    choices,
    scores,
    symbol,
    scoreTotal,
    id,
    votes,
}) {
    return (
        <div>
            <div className="text-base font-bold">
                {status === SnapshotState.Closed ? <Trans>Results</Trans> : <Trans>Current Results</Trans>}
            </div>
            <div className="bg-lightRebrandingBg mt-2 flex flex-col gap-2 rounded-lg p-4">
                {choices.map((choice, index) => {
                    const score = scores[index];
                    return (
                        <div key={index}>
                            <div className="flex items-center justify-between">
                                <Tooltip placement="top" content={choice}>
                                    <div className="overflow-hidden overflow-ellipsis whitespace-nowrap">{choice}</div>
                                </Tooltip>
                                <div className="flex gap-1">
                                    <span>{nFormatter(score)}</span>
                                    <span>{symbol}</span>
                                    <span>{formatPercentage(score / scoreTotal)}</span>
                                </div>
                            </div>
                            <div className="bg-bg03 mt-2 h-2 w-full rounded">
                                <div
                                    className="h-full rounded bg-lightHighlight"
                                    style={{
                                        width: `${((score / scoreTotal) * 100)
                                            .toFixed(2)
                                            .replace(/(\.\d*?)0+$/, '$1')
                                            .replace(/\.$/, '')}%`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mb-2 mt-4 flex gap-1 text-base font-bold">
                <Trans>Votes</Trans>
                <span className="text-secondary">({votes.toLocaleString('en-US')})</span>
            </div>

            <Suspense fallback={<Loading className="max-h-[138px] !min-h-[138px]" />}>
                <SnapshotVotesList id={id} />
            </Suspense>
        </div>
    );
});
