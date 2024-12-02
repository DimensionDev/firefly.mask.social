import { fetchJSON } from '@/helpers/fetchJSON.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import type { FetchClubsResponse, JoinClubResponse, LeaveClubResponse } from '@/providers/types/Orb.js';

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

    async joinClub(clubId: string) {
        const lensToken = await lensSessionHolder.sdk.authentication.getIdentityToken();
        if (lensToken.isFailure()) {
            throw lensToken.error;
        }
        const response = await fetchJSON<JoinClubResponse>('/api/club/join', {
            method: 'POST',
            body: JSON.stringify({ id: clubId }),
            headers: {
                'X-Lens-Identity-Token': lensToken.unwrap(),
            },
        });

        return response.data.added ?? false;
    }

    async leaveClub(clubId: string) {
        const lensToken = await lensSessionHolder.sdk.authentication.getIdentityToken();
        if (lensToken.isFailure()) {
            throw lensToken.error;
        }
        const response = await fetchJSON<LeaveClubResponse>('/api/club/leave', {
            method: 'POST',
            body: JSON.stringify({ id: clubId }),
            headers: {
                'X-Lens-Identity-Token': lensToken.unwrap(),
            },
        });

        return !!response.data.profileId && !!response.data.profileId;
    }
}

export const OrbClubProvider = new OrbClub();
