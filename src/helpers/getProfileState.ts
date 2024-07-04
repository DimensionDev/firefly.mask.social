import { type ProfileSource, Source } from '@/constants/enum.js';
import {
    useFarcasterStateStore,
    useFireflyStateStore,
    useLensStateStore,
    useTwitterStateStore,
} from '@/store/useProfileStore.js';

export function getProfileState(source: ProfileSource) {
    const store = {
        [Source.Farcaster]: useFarcasterStateStore,
        [Source.Lens]: useLensStateStore,
        [Source.Twitter]: useTwitterStateStore,
        [Source.Firefly]: useFireflyStateStore,
    }[source];

    return store.getState();
}
