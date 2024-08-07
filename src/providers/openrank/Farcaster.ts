import urlcat from 'urlcat';

import { env } from '@/constants/env.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import type { PostForYouByAuthorship, TopProfile } from '@/providers/openrank/types.js';

class OpenRank {
    getTopProfiles(options?: { offset?: number; limit?: number }) {
        const url = urlcat(env.external.NEXT_PUBLIC_FARCASTER_OPENRANK_URL, '/scores/global/engagement/rankings', {
            offset: options?.offset,
            limit: options?.limit,
        });
        return fetchJSON<{ result: TopProfile[] }>(url, {
            method: 'GET',
        });
    }

    forYouByAuthorship(options?: { offset?: number; limit?: number }) {
        return farcasterSessionHolder.withSession(async (session) => {
            if (!session?.profileId) return [];
            const url = urlcat(
                env.external.NEXT_PUBLIC_FARCASTER_OPENRANK_URL,
                `/casts/personalized/recent/${session.profileId}`,
                {
                    offset: options?.offset,
                    limit: options?.limit,
                },
            );
            const { result } = await fetchJSON<{ result: PostForYouByAuthorship[] }>(url, {
                method: 'GET',
            });
            return result;
        });
    }
}

export const FarcasterOpenRankProvider = new OpenRank();
