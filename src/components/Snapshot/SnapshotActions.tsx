import { ShareAction } from '@/components/Actions/ShareAction.js';
import { memo } from 'react';

interface SnapshotActionsProps {
    link: string;
}

export const SnapshotActions = memo<SnapshotActionsProps>(function SnapshotActions({ link }) {
    return (
        <div className="flex items-center justify-end">
            <ShareAction link={link} />
        </div>
    );
});
