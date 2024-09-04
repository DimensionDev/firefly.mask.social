import { FarcasterSignType, Source } from '@/constants/enum.js';
import { FarcasterInvalidSignerKey } from '@/constants/error.js';
import { openLoginModal } from '@/helpers/openLoginModal.js';

export function checkFarcasterInvalidSignerKey(error: unknown) {
    if (error instanceof FarcasterInvalidSignerKey) {
        openLoginModal({
            source: Source.Farcaster,
            options: {
                expectedSignType: FarcasterSignType.GrantPermission,
            },
        });
    }
}
