import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useAsyncFn } from 'react-use';

import { resolveFireflyBridgePlatformFromSocialSource } from '@/components/Activity/helpers/resolveFireflyBridgePlatformFromSocialSource.js';
import { useCaptureActivityEvent } from '@/components/Activity/hooks/useCaptureActivityEvent.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { LoginModalRef } from '@/modals/controls.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { EventId } from '@/providers/types/Telemetry.js';
import { SupportedMethod } from '@/types/bridge.js';

export function useLoginInActivity() {
    const queryFireflyBridgeAuthorization = useFireflyBridgeAuthorization();
    const captureActivityEvent = useCaptureActivityEvent();
    return useAsyncFn(async (source: SocialSource) => {
        function captureEvent() {
            switch (source) {
                case Source.Twitter:
                    captureActivityEvent(EventId.EVENT_X_LOG_IN_SUCCESS, {});
                    break;
                case Source.Farcaster:
                    captureActivityEvent(EventId.EVENT_FARCASTER_LOG_IN_SUCCESS, {});
                    break;
                case Source.Lens:
                    captureActivityEvent(EventId.EVENT_LENS_LOG_IN_SUCCESS, {});
                    break;
                default:
                    safeUnreachable(source);
                    return;
            }
        }
        if (fireflyBridgeProvider.supported) {
            try {
                const result = await fireflyBridgeProvider.request(SupportedMethod.LOGIN, {
                    platform: resolveFireflyBridgePlatformFromSocialSource(source),
                });
                await queryFireflyBridgeAuthorization.refetch();
                if (result === 'true') {
                    captureEvent();
                    enqueueSuccessMessage(t`Login ${resolveSourceName(source)} successfully.`);
                } else {
                    enqueueErrorMessage(t`Failed to login.`);
                }
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login.`), { error });
                throw error;
            }
            return;
        }
        captureEvent();
        LoginModalRef.open({
            source,
        });
    });
}
