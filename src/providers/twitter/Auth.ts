import { Source } from '@/constants/enum.js';
import { twitterSessionHolder } from '@/providers/twitter/SessionHolder.js';
import type { SessionPayload } from '@/providers/twitter/SessionPayload.js';
import type { Provider } from '@/providers/types/Auth.js';
import { type Profile, ProfileStatus } from '@/providers/types/SocialMedia.js';
import type { ResponseJSON } from '@/types/index.js';

class TwitterAuth implements Provider<SessionPayload> {
    async login(): Promise<SessionPayload | null> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<SessionPayload>>('/api/twitter/login', {
            method: 'POST',
        });
        if (!response.success) return null;
        return response.data;
    }

    async logout(): Promise<void> {
        await twitterSessionHolder.fetch<ResponseJSON<SessionPayload>>('/api/twitter/logout', {
            method: 'POST',
        });
    }

    async me(): Promise<Profile> {
        const response = await twitterSessionHolder.fetch<
            ResponseJSON<{
                id: string;
                name: string;
                username: string;
                profile_image_url: string;
            }>
        >('/api/twitter/me');
        if (!response.success) throw new Error('Failed to fetch user profile');

        return {
            profileId: response.data.id,
            profileSource: Source.Twitter,
            displayName: response.data.name,
            handle: response.data.username,
            fullHandle: response.data.username,
            pfp: '',
            followerCount: 0,
            followingCount: 0,
            status: ProfileStatus.Active,
            verified: true,
            source: Source.Twitter,
        };
    }
}

export const TwitterAuthProvider = new TwitterAuth();
