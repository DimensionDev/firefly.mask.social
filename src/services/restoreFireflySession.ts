import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { NotAllowedError, TimeoutError, UnreachableError } from '@/constants/error.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { resolveSessionHolder } from '@/helpers/resolveSessionHolder.js';
import { FAKE_SIGNER_REQUEST_TOKEN, FarcasterSession } from '@/providers/farcaster/Session.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import type { FarcasterLoginResponse, LensLoginResponse, TwitterLoginResponse } from '@/providers/types/Firefly.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import { settings } from '@/settings/index.js';

/**
 * Restore firefly session from a lens or farcaster session.
 * @param session
 * @param signal
 * @returns
 */
export async function restoreFireflySession(session: Session, signal?: AbortSignal) {
    switch (session.type) {
        case SessionType.Lens: {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v3/auth/lens/login');
            const response = await fetchJSON<LensLoginResponse>(url, {
                method: 'POST',
                body: JSON.stringify({
                    accessToken: session.token,
                }),
                signal,
            });
            const data = resolveFireflyResponseData(response);
            return new FireflySession(data.accountId, data.accessToken, session);
        }
        case SessionType.Farcaster: {
            if (FarcasterSession.isCustodyWallet(session)) throw new NotAllowedError('Custody wallet is not allowed.');

            const isGrantByPermission = FarcasterSession.isGrantByPermission(session, true);
            const isRelayService = FarcasterSession.isRelayService(session);
            if (!isGrantByPermission && !isRelayService) throw new NotAllowedError('Invalid farcaster session.');

            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v3/auth/farcaster/login');
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: isGrantByPermission ? session.signerRequestToken : undefined,
                    channelToken: isRelayService ? session.channelToken : undefined,
                }),
                signal,
            });

            const json: FarcasterLoginResponse = await response.json();
            if (!response.ok && json.error?.includes('Farcaster login timed out')) throw new TimeoutError();

            const data = resolveFireflyResponseData(json);
            if (data.fid && data.accountId && data.accessToken) {
                // overwrite the profile id and signer token
                const farcasterSession = session as FarcasterSession;
                farcasterSession.profileId = `${data.fid}`;
                if (data.farcaster_signer_private_key) {
                    farcasterSession.signerRequestToken = FAKE_SIGNER_REQUEST_TOKEN;
                    farcasterSession.token = data.farcaster_signer_private_key;
                } else {
                    console.warn(`[restore firefly session] No farcaster signer keys found in the response.`);
                }

                return new FireflySession(data.accountId, data.accessToken, session);
            }
            throw new Error('Failed to restore firefly session.');
        }
        case SessionType.Twitter: {
            // encrypt twitter session
            const encrypted = await fetchJSON<string>('/api/twitter/auth', {
                method: 'POST',
                signal,
            });

            console.log('DEBUG: restoreFireflySession - encrypted');
            console.log({
                encrypted,
            });

            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v3/auth/exchange/twitter');
            const response = await fetchJSON<TwitterLoginResponse>(url, {
                method: 'POST',
                body: JSON.stringify({
                    data: encrypted,
                }),
                signal,
            });

            console.log('DEBUG: response');
            console.log({
                response,
            });

            const data = resolveFireflyResponseData(response);
            return new FireflySession(data.accountId, data.accessToken, session);
        }
        case SessionType.Firefly:
            throw new NotAllowedError('Firefly session is not allowed.');
        default:
            safeUnreachable(session.type);
            throw new UnreachableError('session type', session.type);
    }
}

/**
 * Restore firefly session from all social sources.
 * @returns
 */
export async function restoreFireflySessionAll() {
    for (const source of SORTED_SOCIAL_SOURCES) {
        // we don't support twitter for now
        if (source === Source.Twitter) continue;

        const holder = resolveSessionHolder(source);
        if (!holder?.session) continue;

        const fireflySession = await restoreFireflySession(holder.session);
        if (!fireflySession) continue;

        return fireflySession;
    }
    return null;
}
