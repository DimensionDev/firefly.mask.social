import type { StateSnapshot } from 'react-virtuoso';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { Source } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';

export function getCurrentSourceFromUrl() {
    if (typeof document === 'undefined') return Source.Farcaster;
    const searchParams = new URLSearchParams(location.search);
    const source = searchParams.get('source');
    if (!source) return Source.Farcaster;
    return resolveSourceFromUrl(source);
}
