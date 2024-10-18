import { SingleSnapshot } from '@/components/Snapshot/SingleSnapshot.js';
import type { SnapshotActivity } from '@/providers/snapshot/type.js';

export function getSnapshotItemContent(index: number, snapshot: SnapshotActivity) {
    return <SingleSnapshot data={snapshot} />;
}
