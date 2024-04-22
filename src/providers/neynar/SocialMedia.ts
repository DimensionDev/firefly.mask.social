import { createIndicator, createPageable, EMPTY_LIST, type Pageable, type PageIndicator } from '@masknet/shared-base';
import { first } from 'lodash-es';
import urlcat from 'urlcat';

import { farcasterClient } from '@/configs/farcasterClient.js';
import { env } from '@/constants/env.js';
import { NEYNAR_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatFarcasterProfileFromNeynar } from '@/helpers/formatFarcasterProfileFromNeynar.js';
import type { Profile as NeynarProfile } from '@/providers/types/Neynar.js';
import {
    type Channel,
    type Notification,
    type Post,
    type Profile,
    type Provider,
    SessionType,
} from '@/providers/types/SocialMedia.js';

function fetchNeynarJSON<T>(url: string, options: RequestInit): Promise<T> {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (env.HUBBLE_TOKEN) {
        // @ts-ignore - api_key is not in the type definition
        headers.api_key = env.HUBBLE_TOKEN;
    } else if (env.NEXT_PUBLIC_HUBBLE_TOKEN) {
        // @ts-ignore - api_key is not in the type definition
        headers.api_key = env.NEXT_PUBLIC_HUBBLE_TOKEN;
    }

    return fetchJSON(url, {
        ...options,
        headers,
    });
}

class NeynarSocialMedia implements Provider {
    commentPost(postId: string, post: Post): Promise<string> {
        throw new Error('Method not implemented.');
    }

    getChannelById(channelId: string): Promise<Channel> {
        throw new Error('Method not implemented.');
    }

    getChannelByHandle(channelHandle: string): Promise<Channel> {
        throw new Error('Method not implemented.');
    }

    getChannelsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    discoverChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsByChannelId(channelId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsByChannelHandle(channelHandle: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    searchChannels(q: string, indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    get type() {
        return SessionType.Farcaster;
    }

    async publishPost(post: Post): Promise<string> {
        throw new Error('Method not implemented.');
    }

    async upvotePost(postId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async unvotePost(postId: string) {
        throw new Error('Method not implemented.');
    }

    async getProfilesByAddress(address: string): Promise<Profile[]> {
        throw new Error('Method not implemented.');
    }

    async getProfileById(profileId: string): Promise<Profile> {
        const result = await this.getProfilesByIds([profileId]);
        const data = first(result);

        if (!data) throw new Error("Can't get the profile");
        return data;
    }

    async getProfileByHandle(handle: string): Promise<Profile> {
        throw new Error('Method not implemented.');
    }

    async getPostById(postId: string): Promise<Post> {
        throw new Error('Method not implemented.');
    }

    async getCommentsById(postId: string): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async discoverPosts(): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async discoverPostsById(profileId: string): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async getPostsByProfileId(profileId: string): Promise<Pageable<Post>> {
        throw new Error('Method not implemented.');
    }

    async getPostsBeMentioned(profileId: string): Promise<Pageable<Post>> {
        throw new Error('Method not implemented.');
    }

    async getPostsLiked(profileId: string): Promise<Pageable<Post>> {
        throw new Error('Method not implemented.');
    }

    async getPostsReplies(profileId: string): Promise<Pageable<Post>> {
        throw new Error('Method not implemented.');
    }

    async getPostsByParentPostId(postId: string): Promise<Pageable<Post>> {
        throw new Error('Method not implemented.');
    }

    async getReactors(postId: string): Promise<Pageable<Profile>> {
        throw new Error('Method not implemented.');
    }

    async follow(profileId: string) {
        throw new Error('Method not implemented.');
    }

    async unfollow(profileId: string) {
        throw new Error('Method not implemented.');
    }

    async getFollowers(profileId: string): Promise<Pageable<Profile>> {
        throw new Error('Method not implemented.');
    }

    async getFollowings(profileId: string): Promise<Pageable<Profile>> {
        throw new Error('Method not implemented.');
    }

    async getNotifications(): Promise<Pageable<Notification>> {
        throw new Error('Method not implemented.');
    }

    async getSuggestedFollows(): Promise<Pageable<Profile>> {
        throw new Error('Method not implemented.');
    }

    async searchPosts(q: string): Promise<Pageable<Post>> {
        throw new Error('Method not implemented.');
    }

    async getThreadByPostId(postId: string): Promise<Post[]> {
        throw new Error('Method not implemented.');
    }

    async getProfilesByIds(ids: string[]) {
        if (!ids.length) return EMPTY_LIST;

        return farcasterClient.withSession(async (session) => {
            const url = urlcat(NEYNAR_URL, '/v2/farcaster/user/bulk', {
                fids: ids.join(','),
                viewer_fid: session?.profileId,
            });

            const data = await fetchNeynarJSON<{ users: NeynarProfile[] }>(url, {
                method: 'GET',
            });

            return data.users.map(formatFarcasterProfileFromNeynar);
        });
    }

    async searchProfiles(q: string, indicator?: PageIndicator) {
        return farcasterClient.withSession(async (session) => {
            const url = urlcat(NEYNAR_URL, '/v2/farcaster/user/search', {
                q,
                viewer_fid: session?.profileId || 0,
            });

            const data = await fetchNeynarJSON<{ result: { users: NeynarProfile[] } }>(url, {
                method: 'GET',
            });

            const result = data.result.users.map(formatFarcasterProfileFromNeynar);
            return createPageable(result, createIndicator(indicator));
        });
    }
}

export const NeynarSocialMediaProvider = new NeynarSocialMedia();
