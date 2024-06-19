import { type SocialSource, Source } from '@/constants/enum.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import {
    useFarcasterStateStore,
    useFireflyStateStore,
    useLensStateStore,
    useTwitterStateStore,
} from '@/store/useProfileStore.js';

export function getProfileStateBySocialSource(source: SocialSource) {
    const store = {
        [Source.Farcaster]: useFarcasterStateStore,
        [Source.Lens]: useLensStateStore,
        [Source.Twitter]: useTwitterStateStore,
    }[source];

    return store.getState();
}

export function getProfileStateBySessionType(type: SessionType) {
    const store = {
        [SessionType.Farcaster]: useFarcasterStateStore,
        [SessionType.Lens]: useLensStateStore,
        [SessionType.Twitter]: useTwitterStateStore,
        [SessionType.Firefly]: useFireflyStateStore,
    }[type];

    return store.getState();
}
