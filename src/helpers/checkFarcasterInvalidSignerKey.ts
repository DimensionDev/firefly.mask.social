import { FarcasterSignType, Source } from '@/constants/enum.js';
import { FarcasterInvalidSignerKey } from '@/constants/error.js';
import { LoginModalRef } from '@/modals/controls.js';

export function checkFarcasterInvalidSignerKey(error: unknown) {
    if (error instanceof FarcasterInvalidSignerKey) {
        LoginModalRef.open({
            source: Source.Farcaster,
            options: {
                expectedSignType: FarcasterSignType.GrantPermission,
            },
        });
    }
}
