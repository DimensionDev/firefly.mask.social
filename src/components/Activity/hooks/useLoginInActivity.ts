import { t } from '@lingui/macro';
import { signIn } from 'next-auth/react';
import { useAsyncFn } from 'react-use';

import { enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { Platform, SupportedMethod } from '@/types/bridge.js';

export function useLoginInActivity() {
    const queryFireflyBridgeAuthorization = useFireflyBridgeAuthorization();
    return useAsyncFn(async () => {
        if (fireflyBridgeProvider.supported) {
            const result = await fireflyBridgeProvider.request(SupportedMethod.LOGIN, {
                platform: Platform.TWITTER,
            });
            await queryFireflyBridgeAuthorization.refetch();
            if (result) {
                enqueueSuccessMessage(t`Login X`);
            } else {
                enqueueSuccessMessage(t`Login X failed`);
            }
            return;
        }
        await signIn('twitter', {
            redirect: false,
        });
    });
}
