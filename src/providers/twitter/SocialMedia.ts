import type { Pageable, PageIndicator } from '@masknet/shared-base';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import {
    type Notification,
    type Post,
    type Profile,
    type Provider,
    type Reaction,
    SessionType,
} from '@/providers/types/SocialMedia.js';
import type { ResponseJSON } from '@/types/index.js';

// @ts-ignore
class TwitterSocialMedia implements Provider {
    get type() {
        return SessionType.Twitter;
    }

    /**
     * Creates a session for the current user.
     */
    async createSessionForMe(): Promise<TwitterSession> {
        const response = await fetchJSON<
            ResponseJSON<{
                id: string;
            }>
        >('/api/twitter/me');

        console.log('DEBUG: create session for me')
        console.log(response);

        if (!response.success) throw new Error('Failed to fetch user profile');

        return new TwitterSession(
            response.data.id,
            '', // the access token maintained by the server
            Date.now(),
            Date.now(),
        );
    }

    follow(profileId: string): Promise<void> {
        throw new Error('Not implemented');
    }

    unfollow(profileId: string): Promise<void> {
        throw new Error('Not implemented');
    }

    discoverPosts(indicator?: PageIndicator | undefined): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    discoverPostsById(
        profileId: string,
        indicator?: PageIndicator | undefined,
    ): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    getNotifications(indicator?: PageIndicator | undefined): Promise<Pageable<Notification, PageIndicator>> {
        throw new Error('Not implemented');
    }

    getPostById(postId: string): Promise<Post> {
        throw new Error('Not implemented');
    }

    getProfileById(profileId: string): Promise<Profile> {
        throw new Error('Not implemented');
    }

    getProfileByHandle(handle: string): Promise<Profile> {
        throw new Error('Not implemented');
    }

    getCollectedPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    getCommentsById(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    getThreadByPostId(postId: string): Promise<Post[]> {
        throw new Error('Not implemented');
    }

    upvotePost(postId: string): Promise<Reaction> {
        throw new Error('Not implemented');
    }

    unvotePost(postId: string): Promise<void> {
        throw new Error('Not implemented');
    }

    searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    searchProfiles(q: string, indicator?: PageIndicator | undefined): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Not implemented');
    }
}

export const TwitterSocialMediaProvider = new TwitterSocialMedia();
