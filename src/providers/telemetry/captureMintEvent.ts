import { resolveCurrentFireflyAccountId } from '@/helpers/resolveFireflyProfileId.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import { EventId, type Events } from '@/providers/types/Telemetry.js';

export function captureMintNFTEvent(
    parameters: Omit<Events[EventId.MINT_NFT_SUCCESS]['parameters'], 'firefly_account_id'>,
) {
    return runInSafeAsync(async () => {
        const accountId = await resolveCurrentFireflyAccountId();
        return TelemetryProvider.captureEvent(EventId.MINT_NFT_SUCCESS, {
            ...parameters,
            firefly_account_id: accountId,
        });
    });
}

export function captureCollectArticleEvent(
    parameters: Omit<Events[EventId.COLLECT_ARTICLE_SUCCESS]['parameters'], 'firefly_account_id'>,
) {
    return runInSafeAsync(async () => {
        const accountId = await resolveCurrentFireflyAccountId();
        return TelemetryProvider.captureEvent(EventId.COLLECT_ARTICLE_SUCCESS, {
            ...parameters,
            firefly_account_id: accountId,
        });
    });
}
