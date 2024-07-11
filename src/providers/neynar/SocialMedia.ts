import { first } from 'lodash-es';
import urlcat from 'urlcat';

import { env } from '@/constants/env.js';
import { NotImplementedError } from '@/constants/error.js';
import { EMPTY_LIST, NEYNAR_URL, NOT_DEPEND_HUBBLE_KEY } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatChannelFromFirefly } from '@/helpers/formatFarcasterChannelFromFirefly.js';
import { formatFarcasterProfileFromNeynar } from '@/helpers/formatFarcasterProfileFromNeynar.js';
import { createIndicator, createPageable, type Pageable, type PageIndicator } from '@/helpers/pageable.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import type { Channel as FireflyChannel } from '@/providers/types/Firefly.js';
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
        api_key: NOT_DEPEND_HUBBLE_KEY,
    };

    if (env.internal.HUBBLE_TOKEN) {
        headers.api_key = env.internal.HUBBLE_TOKEN;
    } else if (env.external.NEXT_PUBLIC_HUBBLE_TOKEN) {
        headers.api_key = env.external.NEXT_PUBLIC_HUBBLE_TOKEN;
    } else {
        throw new Error('token not found.');
    }

    return fetchJSON(url, {
        ...options,
        headers,
    });
}

class NeynarSocialMedia implements Provider {
    mirrorPost?:
        | ((
              postId: string,
              options?: { onMomoka?: boolean | undefined; authorId?: number | undefined } | undefined,
          ) => Promise<string>)
        | undefined;
    unmirrorPost?: ((postId: string, authorId?: number | undefined) => Promise<void>) | undefined;
    quotePost?: ((postId: string, post: Post) => Promise<string>) | undefined;
    collectPost?: ((postId: string, collectionId?: string | undefined) => Promise<void>) | undefined;
    isFollowedByMe?: ((profileId: string) => Promise<boolean>) | undefined;
    isFollowingMe?: ((profileId: string) => Promise<boolean>) | undefined;
    commentPost(postId: string, post: Post): Promise<string> {
        throw new NotImplementedError();
    }

    deletePost(postId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    getChannelById(channelId: string): Promise<Channel> {
        throw new NotImplementedError();
    }

    getChannelByHandle(channelHandle: string): Promise<Channel> {
        throw new NotImplementedError();
    }

    getChannelsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new NotImplementedError();
    }

    discoverChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new NotImplementedError();
    }

    getPostsByChannelId(channelId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getPostsByChannelHandle(channelHandle: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    searchChannels(q: string, indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new NotImplementedError();
    }

    async getLikedPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    async getRepliesPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    get type() {
        return SessionType.Farcaster;
    }

    async publishPost(post: Post): Promise<string> {
        throw new NotImplementedError();
    }

    async upvotePost(postId: string): Promise<void> {
        throw new NotImplementedError();
    }

    async unvotePost(postId: string) {
        throw new NotImplementedError();
    }

    async getProfilesByAddress(address: string): Promise<Profile[]> {
        throw new NotImplementedError();
    }

    async getProfileById(profileId: string): Promise<Profile> {
        const result = await this.getProfilesByIds([profileId]);
        const data = first(result);

        if (!data) throw new Error("Can't get the profile");
        return data;
    }

    async getProfileByHandle(handle: string): Promise<Profile> {
        throw new NotImplementedError();
    }

    async getPostById(postId: string): Promise<Post> {
        throw new NotImplementedError();
    }

    async getCommentsById(postId: string): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    async discoverPosts(): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    async discoverPostsById(profileId: string): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    async getPostsByProfileId(profileId: string): Promise<Pageable<Post>> {
        throw new NotImplementedError();
    }

    async getPostsBeMentioned(profileId: string): Promise<Pageable<Post>> {
        throw new NotImplementedError();
    }

    async getPostsLiked(profileId: string): Promise<Pageable<Post>> {
        throw new NotImplementedError();
    }

    async getPostsReplies(profileId: string): Promise<Pageable<Post>> {
        throw new NotImplementedError();
    }

    async getPostsByParentPostId(postId: string): Promise<Pageable<Post>> {
        throw new NotImplementedError();
    }

    async getReactors(postId: string): Promise<Pageable<Profile>> {
        throw new NotImplementedError();
    }

    async follow(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    async unfollow(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    async getFollowers(profileId: string): Promise<Pageable<Profile>> {
        throw new NotImplementedError();
    }

    async getFollowings(profileId: string): Promise<Pageable<Profile>> {
        throw new NotImplementedError();
    }

    async getNotifications(): Promise<Pageable<Notification>> {
        throw new NotImplementedError();
    }

    async getSuggestedFollows(): Promise<Pageable<Profile>> {
        throw new NotImplementedError();
    }

    async searchPosts(q: string): Promise<Pageable<Post>> {
        throw new NotImplementedError();
    }

    async getThreadByPostId(postId: string): Promise<Post[]> {
        throw new NotImplementedError();
    }

    async getProfilesByIds(ids: string[]) {
        if (!ids.length) return EMPTY_LIST;

        return farcasterSessionHolder.withSession(async (session) => {
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

    async getChannelsByIds(ids: string[]): Promise<Channel[]> {
        if (!ids.length) return EMPTY_LIST;

        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(NEYNAR_URL, '/v2/farcaster/channel/bulk', {
                ids: ids.join(','),
                viewer_fid: session?.profileId,
            });

            const data = await fetchNeynarJSON<{ channels: FireflyChannel[] }>(url, {
                method: 'GET',
            });

            return data.channels.map(formatChannelFromFirefly);
        });
    }

    async searchProfiles(q: string, indicator?: PageIndicator) {
        return farcasterSessionHolder.withSession(async (session) => {
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
    async blockProfile(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }
    async unblockProfile(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }
    async getBlockedProfiles(indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }
    async blockChannel(channelId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    async unblockChannel(channelId: string): Promise<boolean> {
        throw new NotImplementedError();
    }
    async getBlockedChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new NotImplementedError();
    }
    async getLikeReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }
    async getRepostReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }

    async getPostsQuoteOn(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }
    async bookmark(postId: string): Promise<boolean> {
        throw new NotImplementedError();
    }
    async unbookmark(postId: string): Promise<boolean> {
        throw new NotImplementedError();
    }
    async getBookmarks(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }
    async reportProfile(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }
    async reportPost(post: Post): Promise<boolean> {
        throw new NotImplementedError();
    }
}

export const NeynarSocialMediaProvider = new NeynarSocialMedia();
