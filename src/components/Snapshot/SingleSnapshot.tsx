import { Trans } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo } from 'react';

import VoteIcon from '@/assets/snapshot/vote.svg';
import { CollapsedContent } from '@/components/Posts/CollapsedContent.js';
import { SingleSnapshotHeader } from '@/components/Snapshot/SingleSnapshotHeader.js';
import { SnapshotBody } from '@/components/Snapshot/SnapshotBody.js';
import { SnapshotFallbackContent } from '@/components/Snapshot/SnapshotFallbackContent.js';
import { TextOverflowTooltip } from '@/components/TextOverflowTooltip.js';
import { formatSnapshotChoice } from '@/helpers/formatSnapshotChoice.js';
import type { SnapshotActivity } from '@/providers/snapshot/type.js';

interface SingleSnapshotProps {
    data: SnapshotActivity;
}

export const SingleSnapshot = memo<SingleSnapshotProps>(function SingleSnapshot({ data }) {
    const isMuted = data.author.isMuted;

    const label = data.proposal ? formatSnapshotChoice(data.choice, data.proposal.type, data.proposal.choices) : null;

    return (
        <motion.article
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={'border-b border-line bg-bottom px-3 py-2 hover:bg-bg max-md:px-4 max-md:py-3 md:px-4 md:py-3'}
        >
            <SingleSnapshotHeader data={data} />
            {isMuted ? (
                <CollapsedContent className="mt-2 pl-[52px]" authorMuted isQuote={false} />
            ) : (
                <div className="-mt-2 pl-[52px]">
                    <div className="flex items-center gap-1 text-medium">
                        <VoteIcon width={18} height={18} className="min-w-[18px]" />
                        <span className="shrink-0 whitespace-nowrap font-bold text-main">
                            <Trans>VOTED</Trans>
                        </span>
                        <TextOverflowTooltip
                            className="max-sm:block"
                            placement="top-start"
                            content={<Trans>{label} on a proposal</Trans>}
                        >
                            <span className="line-clamp-2 text-secondary">
                                <Trans>{label} on a proposal</Trans>
                            </span>
                        </TextOverflowTooltip>
                    </div>

                    {data.proposal ? (
                        <div>
                            <SnapshotBody activity={data} snapshot={data.proposal} />
                        </div>
                    ) : (
                        <SnapshotFallbackContent {...data.fallback_content} />
                    )}
                </div>
            )}
        </motion.article>
    );
});
