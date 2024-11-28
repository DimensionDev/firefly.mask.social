import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { resolveFireflyBridgePlatformFromSocialSource } from '@/components/Activity/helpers/resolveFireflyBridgePlatformFromSocialSource.js';
import { useActivityConnections } from '@/components/Activity/hooks/useActivityConnections.js';
import { type SocialSource } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { LoginModalRef } from '@/modals/controls.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { captureActivityLoginEvent } from '@/providers/telemetry/captureActivityEvent.js';
import { SupportedMethod } from '@/types/bridge.js';

export function useLoginInActivity() {
    const queryFireflyBridgeAuthorization = useFireflyBridgeAuthorization();
    const { refetch } = useActivityConnections();
    return useAsyncFn(async (source: SocialSource) => {
        if (fireflyBridgeProvider.supported) {
            try {
                const result = await fireflyBridgeProvider.request(SupportedMethod.LOGIN, {
                    platform: resolveFireflyBridgePlatformFromSocialSource(source),
                });
                await queryFireflyBridgeAuthorization.refetch();
                if (result === 'true') {
                    captureActivityLoginEvent(source);
                    enqueueSuccessMessage(t`Login ${resolveSourceName(source)} successfully.`);
                } else {
                    enqueueErrorMessage(t`Failed to login.`);
                }
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login.`), { error });
                throw error;
            }
            await refetch();
            return;
        }
        await LoginModalRef.openAndWaitForClose({
            source,
        });
    });
}
