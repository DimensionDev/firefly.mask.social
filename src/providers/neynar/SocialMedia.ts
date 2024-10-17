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
    type Friendship,
    type Notification,
    type Post,
    type Profile,
    type ProfileBadge,
    type ProfileEditable,
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
    get type() {
        return SessionType.Farcaster;
    }

    getFriendship(profileId: string): Promise<Friendship | null> {
        throw new NotImplementedError();
    }

    mirrorPost(postId: string, options?: { onMomoka?: boolean; authorId?: number }): Promise<string> {
        throw new NotImplementedError();
    }

    unmirrorPost(postId: string, authorId?: number): Promise<void> {
        throw new NotImplementedError();
    }

    quotePost(postId: string, post: Post): Promise<string> {
        throw new NotImplementedError();
    }

    collectPost(postId: string, collectionId?: string): Promise<void> {
        throw new NotImplementedError();
    }

    isFollowedByMe(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    isFollowingMe(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

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

    getHiddenComments(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    actPost(postId: string, options: unknown): Promise<void> {
        throw new NotImplementedError();
    }

    getLikedPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getRepliesPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    publishPost(post: Post): Promise<string> {
        throw new NotImplementedError();
    }

    upvotePost(postId: string): Promise<void> {
        throw new NotImplementedError();
    }

    unvotePost(postId: string): Promise<void> {
        throw new NotImplementedError();
    }

    getProfilesByAddress(address: string): Promise<Profile[]> {
        throw new NotImplementedError();
    }

    getProfileByHandle(handle: string): Promise<Profile> {
        throw new NotImplementedError();
    }

    getPostById(postId: string): Promise<Post> {
        throw new NotImplementedError();
    }

    getCommentsById(postId: string): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    discoverPosts(): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    discoverPostsById(profileId: string): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getPostsByProfileId(profileId: string): Promise<Pageable<Post>> {
        throw new NotImplementedError();
    }

    getPostsBeMentioned(profileId: string): Promise<Pageable<Post>> {
        throw new NotImplementedError();
    }

    getPostsLiked(profileId: string): Promise<Pageable<Post>> {
        throw new NotImplementedError();
    }

    getPostsReplies(profileId: string): Promise<Pageable<Post>> {
        throw new NotImplementedError();
    }

    getPostsByParentPostId(postId: string): Promise<Pageable<Post>> {
        throw new NotImplementedError();
    }

    getReactors(postId: string): Promise<Pageable<Profile>> {
        throw new NotImplementedError();
    }

    follow(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    unfollow(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    getFollowers(profileId: string): Promise<Pageable<Profile>> {
        throw new NotImplementedError();
    }

    getFollowings(profileId: string): Promise<Pageable<Profile>> {
        throw new NotImplementedError();
    }

    getMutualFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }

    getNotifications(): Promise<Pageable<Notification>> {
        throw new NotImplementedError();
    }

    getSuggestedFollows(): Promise<Pageable<Profile>> {
        throw new NotImplementedError();
    }

    searchPosts(q: string): Promise<Pageable<Post>> {
        throw new NotImplementedError();
    }

    getThreadByPostId(postId: string): Promise<Post[]> {
        throw new NotImplementedError();
    }

    blockProfile(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    unblockProfile(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    getBlockedProfiles(indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }

    blockChannel(channelId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    unblockChannel(channelId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    getBlockedChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new NotImplementedError();
    }

    getLikeReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }

    getRepostReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }

    getPostsQuoteOn(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    bookmark(postId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    unbookmark(postId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    getBookmarks(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    reportProfile(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    reportPost(post: Post): Promise<boolean> {
        throw new NotImplementedError();
    }

    updateProfile(profile: ProfileEditable): Promise<boolean> {
        throw new NotImplementedError();
    }

    getProfileBadges(profile: Profile): Promise<ProfileBadge[]> {
        throw new NotImplementedError();
    }

    async getProfileById(profileId: string): Promise<Profile> {
        const result = await this.getProfilesByIds([profileId]);
        const data = first(result);

        if (!data) throw new Error("Can't get the profile");
        return data;
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
}

export const NeynarSocialMediaProvider = new NeynarSocialMedia();
