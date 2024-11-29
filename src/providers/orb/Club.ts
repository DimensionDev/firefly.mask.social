import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { FetchClubsResponse } from '@/providers/types/Orb.js';

class OrbClub {
    async fetchClubs(options: {
        query?: string;
        club_handle?: string;
        profile_id?: string;
        limit?: number;
        skip?: number;
    }) {
        const response = await fetchJSON<FetchClubsResponse>('/api/club/query', {
            method: 'POST',
            body: JSON.stringify(options),
        });

        return response.success ? response.data : null;
    }
}

export const OrbClubProvider = new OrbClub();
