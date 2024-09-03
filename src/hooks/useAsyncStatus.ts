import { AsyncStatus, type SocialSource } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { useProfileStoreAll } from '@/hooks/useProfileStore.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function useAsyncStatusAll() {
    const store = useProfileStoreAll();
    const { asyncStatus } = useGlobalState();

    return SORTED_SOCIAL_SOURCES.some(
        (x) => store[x].status === AsyncStatus.Pending || asyncStatus[x] === AsyncStatus.Pending,
    );
}

export function useAsyncStatus(source: SocialSource) {
    const store = useProfileStoreAll();
    const { asyncStatus } = useGlobalState();

    return store[source].status === AsyncStatus.Pending || asyncStatus[source] === AsyncStatus.Pending;
}
