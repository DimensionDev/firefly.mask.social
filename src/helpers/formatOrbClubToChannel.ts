import { Source } from '@/constants/enum.js';
import type { Club } from '@/providers/types/Orb.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export function formatOrbClubToChannel(club: Club): Channel {
    return {
        source: Source.Lens,
        id: club.handle,
        name: club.name,
        description: club.description,
        imageUrl: club.logo,
        url: '',
        parentUrl: '',
        followerCount: club.totalMembers,
        timestamp: 0,
        isMember: club.isMember,
        canJoin: club.isFreeToJoin,
        __original__: club,
    };
}
