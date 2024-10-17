import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import type { SnapshotActivity } from '@/providers/snapshot/type.js';
import { type FireflySnapshotActivity, WatchType } from '@/providers/types/Firefly.js';

export function formatSnapshotActivityFromFirefly(snapshot: FireflySnapshotActivity): SnapshotActivity {
    const authorId = snapshot.owner;

    return {
        author: {
            id: authorId,
            handle: snapshot.displayInfo.ensHandle,
            avatar: snapshot.displayInfo.avatarUrl,
            isFollowing: snapshot.followingSources.some(
                (x) => x.type === WatchType.Wallet && isSameEthereumAddress(x.walletAddress, authorId),
            ),
            isMuted: false,
        },
        choice: snapshot.metadata.choice,
        type: snapshot.type,
        id: snapshot.id,
        timestamp: parseInt(snapshot.timestamp) * 1000,
        hash: snapshot.hash,
        related_urls: snapshot.related_urls,
        proposal_id: snapshot.metadata.proposal_id,
        hasBookmarked: snapshot.has_bookmarked,
    };
}
