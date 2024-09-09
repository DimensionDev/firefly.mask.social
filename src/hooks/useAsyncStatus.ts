import { AsyncStatus, type SocialSource } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { useProfileStoreAll } from '@/hooks/useProfileStore.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function useAsyncStatusAll(status = AsyncStatus.Pending) {
    const store = useProfileStoreAll();
    const asyncStatus = useGlobalState.use.asyncStatus();

    return SORTED_SOCIAL_SOURCES.some((x) => store[x].status === status || asyncStatus[x] === status);
}

export function useAsyncStatus(source: SocialSource, status = AsyncStatus.Pending) {
    const store = useProfileStoreAll();
    const asyncStatus = useGlobalState.use.asyncStatus();

    return store[source].status === status || asyncStatus[source] === status;
}
