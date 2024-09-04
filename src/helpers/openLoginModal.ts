import { AsyncStatus, Source } from '@/constants/enum.js';
import { restoreCurrentAccounts } from '@/helpers/account.js';
import { resolveSocialSourceFromProfileSource } from '@/helpers/resolveSource.js';
import type { LoginModalOpenProps } from '@/modals/LoginModal/index.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

let controller: AbortController | null = null;

export async function openLoginModal(props: LoginModalOpenProps | void, signal?: AbortSignal) {
    controller?.abort();
    controller = new AbortController();

    const profileSource = props ? props.source : Source.Farcaster;

    console.log(`[LoginModal] open with source: ${profileSource}`);

    if (profileSource && profileSource !== Source.Firefly) {
        const source = resolveSocialSourceFromProfileSource(profileSource);

        try {
            useGlobalState.getState().setAsyncStatus(source, AsyncStatus.Pending);

            const confirmed = await restoreCurrentAccounts(signal ?? controller.signal);
            if (confirmed) return;
        } catch (error) {
            console.error(`[LoginModal] failed to restore current accounts`, error);

            // if any error occurs, we will just proceed with the login
        } finally {
            useGlobalState.getState().setAsyncStatus(source, AsyncStatus.Idle);
        }
    }
}
