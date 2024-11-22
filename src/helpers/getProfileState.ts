import { type ProfileSource, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import {
    useFarcasterStateStore,
    useFireflyStateStore,
    useLensStateStore,
    useThirdPartyStateStore,
    useTwitterStateStore,
} from '@/store/useProfileStore.js';

export function getProfileState(source: ProfileSource) {
    const store = {
        [Source.Farcaster]: useFarcasterStateStore,
        [Source.Lens]: useLensStateStore,
        [Source.Twitter]: useTwitterStateStore,
        [Source.Firefly]: useFireflyStateStore,
        [Source.Google]: useThirdPartyStateStore,
        [Source.Apple]: useThirdPartyStateStore,
        [Source.Telegram]: useThirdPartyStateStore,
    }[source];

    return store.getState();
}

export function getProfileSessionsAll() {
    return SORTED_SOCIAL_SOURCES.flatMap((x) => getProfileState(x).accounts.map((x) => x.session));
}
