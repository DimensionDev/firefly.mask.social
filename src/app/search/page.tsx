'use client';

import { useGlobalState } from '@/store/useGlobalStore.js';
import { useSearchStore } from '@/store/useSearchStore.js';

export default function Page() {
    const { searchText, searchType } = useSearchStore();
    const { currentSocialPlatform } = useGlobalState();
    return (
        <h2>
            {JSON.stringify(
                {
                    searchText,
                    searchType,
                    currentSocialPlatform,
                },
                null,
                2,
            )}
        </h2>
    );
}
