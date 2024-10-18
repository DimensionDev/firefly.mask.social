import { memo } from 'react';

import { Bookmark } from '@/components/Actions/Bookmark.js';
import { ShareAction } from '@/components/Actions/ShareAction.js';
import { useToggleSnapshotBookmark } from '@/hooks/useToggleSnapshotBookmark.js';
import type { SnapshotActivity } from '@/providers/snapshot/type.js';

interface SnapshotActionsProps {
    activity?: SnapshotActivity;
    link: string;
}

export const SnapshotActions = memo<SnapshotActionsProps>(function SnapshotActions({ link, activity }) {
    const mutation = useToggleSnapshotBookmark();

    return (
        <div className="flex items-center justify-end">
            {activity ? (
                <Bookmark
                    hiddenCount
                    hasBookmarked={activity?.hasBookmarked}
                    onClick={() => mutation.mutate(activity)}
                />
            ) : null}
            <ShareAction link={link} />
        </div>
    );
});
