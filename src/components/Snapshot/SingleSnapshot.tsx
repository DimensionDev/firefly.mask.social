import { motion } from 'framer-motion';
import { memo } from 'react';

import VoteIcon from '@/assets/snapshot/vote.svg';
import { SingleSnapshotHeader } from '@/components/Snapshot/SingleSnapshotHeader.js';
import { classNames } from '@/helpers/classNames.js';
import type { SnapshotActivity } from '@/providers/snapshot/type.js';
import { CollapsedContent } from '@/components/Posts/CollapsedContent.js';
import { Trans } from '@lingui/macro';
import { formatSnapshotChoice } from '@/helpers/formatSnapshotChoice.js';
import { SnapshotBody } from '@/components/Snapshot/SnapshotBody.js';

interface SingleSnapshotProps {
    data: SnapshotActivity;
}

export const SingleSnapshot = memo<SingleSnapshotProps>(function SingleSnapshot({ data }) {
    const isMuted = data.author.isMuted;

    const label = data.proposal ? formatSnapshotChoice(data.choice, data.proposal.type, data.proposal.choices) : null;

    console.log(data.proposal, label);
    return (
        <motion.article
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={classNames(
                'border-b border-line bg-bottom px-3 py-2 hover:bg-bg max-md:px-4 max-md:py-3 md:px-4 md:py-3',
                {
                    'cursor-pointer': !isMuted,
                },
            )}
        >
            <SingleSnapshotHeader data={data} />
            {isMuted ? (
                <CollapsedContent className="mt-2 pl-[52px]" authorMuted isQuote={false} />
            ) : (
                <div className="-mt-2 pl-[52px]">
                    <div className="flex items-center gap-1 text-medium">
                        <VoteIcon width={18} height={18} />
                        <span className="font-bold text-main">
                            <Trans>VOTED</Trans>
                        </span>
                        <span className="text-secondary">
                            <Trans>{label} on a proposal</Trans>
                        </span>
                    </div>

                    {data.proposal ? (
                        <div>
                            <SnapshotBody snapshot={data.proposal} />
                        </div>
                    ) : null}
                </div>
            )}
        </motion.article>
    );
});
