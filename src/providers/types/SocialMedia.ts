import type { BookmarkType, FireflyPlatform, RestrictionType, SocialSource } from '@/constants/enum.js';
import type { Pageable, PageIndicator } from '@/helpers/pageable.js';
import type { Poll } from '@/providers/types/Poll.js';

export enum SessionType {
    Twitter = 'Twitter',
    Lens = 'Lens',
    Farcaster = 'Farcaster',
    Firefly = 'Firefly',
}

export enum NetworkType {
    Ethereum = 'Ethereum',
}

export enum ReactionType {
    Upvote = 'Upvote', // aka. like
}

export enum NotificationType {
    Reaction = 'reaction',
    Comment = 'comment',
    Mirror = 'mirror',
    Quote = 'quote',
    Follow = 'follow',
    Mention = 'mention',
    Act = 'act',
}

export enum ProfileStatus {
    Active = 'active',
    Inactive = 'inactive',
}

export interface Reaction {
    reactionId: string;
    type: ReactionType;
    /** time in milliseconds */
    timestamp: number;
}

export interface Tag {
    tagId: string;
    label: string;
}

export interface Profile {
    /** fid for Farcaster, twitter id for Twitter */
    profileId: string;
    displayName: string;
    handle: string;
    fullHandle: string;
    pfp: string;
    bio?: string;
    address?: string;
    followerCount: number;
    followingCount: number;
    status: ProfileStatus;
    tags?: Tag[];
    verified: boolean;
    signless?: boolean;
    viewerContext?: {
        following?: boolean;
        followedBy?: boolean;
        blocking?: boolean;
    };
    ownedBy?: {
        networkType: NetworkType;
        address: string;
    };
    source: SocialSource;
    // Farcaster only
    isPowerUser?: boolean;
    website?: string;
    location?: string;
}

export type ProfileEditable = Partial<Pick<Profile, 'pfp' | 'bio' | 'location' | 'website' | 'displayName'>>;

export interface MediaObject {
    title?: string;
    mimeType?: string;
    // for twitter media_id
    id?: string;
    url: string;
}

export interface Attachment {
    type: 'Image' | 'Video' | 'Audio' | 'Poll' | 'AnimatedGif' | 'Unknown';
    uri: string;
    coverUri?: string;
    artist?: string;
    title?: string;
}

export type PostType = 'Post' | 'Comment' | 'Quote' | 'Mirror';

export interface Post {
    /**
     * For Farcaster, it's hash of the cast.
     * For Lens, it's id of the publication, which is different from post id.
     * TODO id for Twitter
     */
    publicationId: string;
    type?: PostType;
    /** It's `hash` for Farcaster */
    postId: string;
    parentPostId?: string;
    parentAuthor?: Profile;
    /** time in milliseconds */
    timestamp?: number;
    author: Profile;
    reporter?: Profile;
    mediaObjects?: MediaObject[];
    permalink?: string;
    parentPermalink?: string;
    isHidden?: boolean;
    isEncrypted?: boolean;
    isEncryptedByMask?: boolean;
    restriction?: RestrictionType;
    metadata: {
        locale: string;
        description?: string;
        content: {
            content?: string;
            /**
             * The primary asset of the post.
             */
            asset?: Attachment;
            /**
             * The full list of attachments of the post. (must include the primary asset)
             */
            attachments?: Attachment[];
            /**
             * The oembed url at the bottom of the post.
             */
            oembedUrl?: string;
            /**
             * The full list of oembed urls of the post.
             */
            oembedUrls?: string[];
        } | null;
        contentURI?: string;
    };
    stats?: {
        comments: number;
        mirrors: number;
        quotes?: number;
        /** Like count */
        reactions: number;
        bookmarks?: number;
        countOpenActions?: number;
    };
    mirrors?: Profile[];
    reactions?: Profile[];
    canComment?: boolean;
    canMirror?: boolean;
    canAct?: boolean;
    mentions?: Profile[];
    hasMirrored?: boolean;
    hasLiked?: boolean;
    hasActed?: boolean;
    hasQuoted?: boolean;
    hasBookmarked?: boolean;
    source: SocialSource;
    isThread?: boolean;

    /**
     * Sometimes we need to render a thread, and we currently support up to three level.
     * root
     * |
     * commentOn
     * |
     * post
     *
     * As shown above, `root` represents the start of the thread.
     * the current post itself represents the end of the thread.
     * and `commentOn` represents the post to which the current post is a reply.
     */
    commentOn?: Post;
    root?: Post;
    quoteOn?: Post;
    comments?: Post[];
    embedPosts?: Post[];
    channel?: Channel;
    poll?: Poll;
    /**
     * Lens only
     * To mirror a post on momoka, need to invoke with the client method mirrorOnMomoka
     */
    momoka?: {
        proof: string;
    };
    /**
     * Lens only
     * If the current post type is Comment, this field is the first comment in this comment list.
     */
    firstComment?: Post;
    /**
     * Farcaster Only
     * Used to add a post to the corresponding channel, like 'firefly-garden'
     */
    parentChannelKey?: string;
    /**
     * Farcaster Only
     * Used to add a post to the corresponding channel, like channel
     */
    parentChannelUrl?: string;

    /**
     * Farcaster Only
     * The API of Firefly will return a "threads" field indicating that this is a thread post.
     * The "threads" contains the second and third levels of threads.
     */
    threads?: Post[];
    sendFrom?: {
        displayName?: string;
        name?: string;
    };
    __original__?: unknown;
}

export interface Comment {
    commentId: string;
    /** time in milliseconds */
    timestamp: number;
    author: Profile;
    for: Post;
    profilesMentioned?: Profile[];
    hashTagsMentioned?: string[];
}

export interface Collection {
    collectionId: string;
    posts: Post[];
}

export interface BaseNotification {
    notificationId: string;
    source: SocialSource;
    /** time in milliseconds */
    timestamp?: number;
}

export interface MirrorNotification extends BaseNotification {
    type: NotificationType.Mirror;
    mirrors: Profile[];
    post?: Post | null;
}

export interface QuoteNotification extends BaseNotification {
    type: NotificationType.Quote;
    quote: Post;
    post: Post;
}

export interface ReactionNotification extends BaseNotification {
    type: NotificationType.Reaction;
    reactors: Profile[];
    post?: Post | null;
}

export interface CommentNotification extends BaseNotification {
    type: NotificationType.Comment;
    comment?: Post | null;
    post?: Post | null;
}

export interface FollowNotification extends BaseNotification {
    type: NotificationType.Follow;
    followers: Profile[];
}

export interface MentionNotification extends BaseNotification {
    type: NotificationType.Mention;
    post?: Post | null;
}

export interface ActedNotification extends BaseNotification {
    type: NotificationType.Act;
    post: Post;
    actions: Profile[];
}

export type Notification =
    | MirrorNotification
    | QuoteNotification
    | ReactionNotification
    | CommentNotification
    | FollowNotification
    | MentionNotification
    | ActedNotification;

export interface Channel {
    source: SocialSource;
    id: string;
    name: string;
    description?: string;
    imageUrl: string;
    url: string;
    parentUrl: string;
    followerCount: number;
    mutualFollowerCount?: number;
    /** time in milliseconds */
    timestamp: number;
    lead?: Profile;
    hosts?: Profile[];
    blocked?: boolean;
    __original__?: unknown;
}

export interface Provider {
    type: SessionType;

    /**
     * Publishes a post.
     *
     * @param post The post to be published.
     * @returns A promise that resolves to post id.
     */
    publishPost: (post: Post) => Promise<string>;

    /**
     * Delete a post with the specified post ID.
     *
     * @param postId The ID of the post to delete.
     * @returns
     */
    deletePost: (postId: string) => Promise<boolean>;

    /**
     * Mirrors a post with the specified post ID.
     *
     * @param postId The ID of the post to mirror.
     * @param options {
     *   onMomoka: If the post is created on Momoka. Lens only
     *   authorId: The id of the cast author. Farcaster only
     * }
     * @returns A promise that resolves to post id.
     */
    mirrorPost?: (
        postId: string,
        options?: {
            onMomoka?: boolean;
            authorId?: number;
        },
    ) => Promise<string>;

    unmirrorPost?: (postId: string, authorId?: number) => Promise<void>;

    /**
     * Quotes a post with the specified post ID and an introduction.
     *
     * @param postId The ID of the post to quote.
     * @param post The introduction post for the quote.
     * @returns A promise that resolves to post id.
     */
    quotePost?: (postId: string, post: Post) => Promise<string>;

    /**
     * Comments on a post with the specified post ID and comment text.
     *
     * @param postId The ID of the post to comment on.
     * @param post The comment post.
     * @returns A promise that resolves to comment id.
     */
    commentPost: (postId: string, post: Post) => Promise<string>;

    /**
     * Collects a post with the specified post ID.
     *
     * @param postId The ID of the post to collect.
     * @param collectionId The ID of the collection to collect the post to.
     * @returns A promise that resolves to void.
     */
    collectPost?: (postId: string, collectionId?: string) => Promise<void>;

    /**
     * Upvotes a post with the specified post ID.
     *
     * @param postId The ID of the post to upvote.
     * @returns A promise that resolves to a Reaction object.
     */
    upvotePost: (postId: string) => Promise<void>;

    /**
     * Removes an upvote from a post with the specified post ID.
     *
     * @param postId The ID of the post to remove the upvote from.
     * @returns A promise that resolves to void.
     */
    unvotePost: (postId: string) => Promise<void>;

    /**
     *
     * @param address EVM address
     * @returns A promise that resolves to Profiles array by address.
     */
    getProfilesByAddress: (address: string) => Promise<Profile[]>;

    /**
     * @params ids Array of profile id
     */
    getProfilesByIds?: (ids: string[]) => Promise<Profile[]>;

    /**
     * @params ids Array of channel id
     * @returns A promise that resolves to Channels array by ids.
     */
    getChannelsByIds?: (ids: string[]) => Promise<Channel[]>;

    /**
     * Retrieves a user's profile by their profile ID.
     *
     * @param profileId The ID of the user's profile.
     * @returns A promise that resolves to a Profile object.
     */
    getProfileById: (profileId: string) => Promise<Profile>;

    /**
     * Retrieves a user's profile by their handle.
     *
     * @param handle The handle of the user's profile.
     * @returns
     */
    getProfileByHandle: (handle: string) => Promise<Profile>;

    /**
     * Retrieves a post by its post ID.
     * (This api must be implemented for cross posting to work properly.)
     *
     * @param postId The ID of the post to retrieve.
     * @returns A promise that resolves to a Post object.
     */
    getPostById: (postId: string) => Promise<Post>;

    /**
     * Retrieves a channel by its channel ID.
     * @param channelId
     * @returns
     */
    getChannelById: (channelId: string) => Promise<Channel>;

    /**
     * Retrieves a channel by its channel handle.
     * @param channelHandle
     * @returns
     */
    getChannelByHandle: (channelHandle: string) => Promise<Channel>;

    /**
     * Retrieves user's attended channels by profile ID.
     * @param profileId
     * @returns
     */
    getChannelsByProfileId: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Channel, PageIndicator>>;

    /**
     * Retrieves comments by post ID.
     * @param postId The ID of the post to retrieve.
     * @returns A promise that resolves to Comments list.
     */
    getCommentsById: (postId: string, indicator?: PageIndicator) => Promise<Pageable<Post, PageIndicator>>;

    /**
     * Retrieves recent posts in reverse chronological order.
     *
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Post objects.
     */
    discoverPosts: (indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     * Retrieves trending channels.
     * @param indicator
     * @returns
     */
    discoverChannels: (indicator?: PageIndicator) => Promise<Pageable<Channel>>;

    /**
     * Retrieves recent post by a specific profile id.
     * @param profileId The ID of the profile.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Post objects.
     */
    discoverPostsById: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     * Retrieves posts by a specific profile ID.
     *
     * @param profileId The ID of the profile.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Post objects.
     */
    getPostsByProfileId: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     * Retrieves liked posts by a specific profile ID.
     * @param profileId The ID of the profile.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Post objects.
     */
    getLikedPostsByProfileId: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     *  Retrieves replies posts by a specific profile ID.
     * @param profileId The ID of the profile.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Post objects.
     */
    getRepliesPostsByProfileId: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     * Retrieves posts in a specific channel by ID.
     * @param channelId
     * @param indicator
     * @returns
     */
    getPostsByChannelId: (channelId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     * Retrieves posts in a specific channel by handle.
     * @param channelHandle
     * @param indicator
     * @returns
     */
    getPostsByChannelHandle: (channelHandle: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     * Retrieves posts where a user is mentioned by their profile ID.
     *
     * @param profileId The ID of the user's profile.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Post objects.
     */
    getPostsBeMentioned: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     * Retrieves posts that a user has liked.
     *
     * @param profileId The ID of the user's profile.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Post objects.
     */
    getPostsLiked: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     * Retrieves posts that are replied by user.
     *
     * @param profileId The ID of the user's profile.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Post objects.
     */
    getPostsReplies: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     * Retrieves posts with a specific parent post ID.
     *
     * @param postId The ID of the parent post.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Post objects.
     */
    getPostsByParentPostId: (postId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     * Retrieves reactors (users who reacted to a post) by post ID.
     *
     * @param postId The ID of the post.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Profile objects.
     */
    getReactors: (postId: string, indicator?: PageIndicator) => Promise<Pageable<Profile>>;

    /**
     * Allows the current logged user to follow another user by specifying their profile ID.
     *
     * @param profileId The ID of the user to follow.
     */
    follow: (profileId: string) => Promise<boolean>;

    /**
     * Allows the current logged user to unfollow another user by specifying their profile ID.
     *
     * @param profileId The ID of the user to unfollow.
     */
    unfollow: (profileId: string) => Promise<boolean>;

    /**
     * Retrieves followers of a user by their profile ID.
     *
     * @param profileId The ID of the user's profile.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Profile objects.
     */
    getFollowers: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Profile>>;

    /**
     * Retrieves users followed by a user by their profile ID.
     *
     * @param profileId The ID of the user's profile.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Profile objects.
     */
    getFollowings: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Profile>>;

    getMutualFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>>;

    /**
     * Checks if a user is followed by the current logged user by specifying their profile ID.
     *
     * @param profileId The ID of the user's profile to check.
     * @returns A promise that resolves to a boolean.
     */
    isFollowedByMe?: (profileId: string) => Promise<boolean>;

    /**
     * Checks if a user is following the current logged user by specifying their profile ID.
     *
     * @param profileId The ID of the user's profile to check.
     * @returns A promise that resolves to a boolean.
     */
    isFollowingMe?: (profileId: string) => Promise<boolean>;

    /**
     * Retrieves notifications.
     *
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Notification objects.
     */
    getNotifications: (indicator?: PageIndicator) => Promise<Pageable<Notification>>;

    /**
     * Retrieves suggested user profiles to follow.
     *
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Profile objects.
     */
    getSuggestedFollows: (indicator?: PageIndicator) => Promise<Pageable<Profile>>;

    /**
     * Search profiles.
     * @param indicator
     * @returns
     */
    searchProfiles: (q: string, indicator?: PageIndicator) => Promise<Pageable<Profile>>;

    /**
     * Search posts.
     * @param indicator
     * @returns
     */
    searchPosts: (q: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     * Search channels.
     * @param indicator
     * @returns
     */
    searchChannels: (q: string, indicator?: PageIndicator) => Promise<Pageable<Channel>>;

    /**
     * Retrieves posts associated with a thread using the root post id.
     * @param postId
     * @param localPost
     */
    getThreadByPostId: (postId: string, localPost?: Post) => Promise<Post[]>;

    /**
     * Retrieve profiles who liked the specified post.
     * @param postId
     * @param indicator
     * @returns
     */
    getLikeReactors: (postId: string, indicator?: PageIndicator) => Promise<Pageable<Profile, PageIndicator>>;

    /**
     * Retrieve profiles who re-posted the specified post.
     * @param postId
     * @param indicator
     * @returns
     */
    getRepostReactors: (postId: string, indicator?: PageIndicator) => Promise<Pageable<Profile, PageIndicator>>;

    /**
     * Retrieve posts that quote on the specified post.
     * @param postId
     * @param indicator
     * @returns
     */
    getPostsQuoteOn: (postId: string, indicator?: PageIndicator) => Promise<Pageable<Post, PageIndicator>>;

    /**
     * Save a post to bookmarks.
     *
     * @param postId
     * @param platform - farcaster only
     * @param profileId - farcaster only
     * @param postType - farcaster only
     */
    bookmark: (
        postId: string,
        platform?: FireflyPlatform,
        profileId?: string,
        postType?: BookmarkType,
    ) => Promise<boolean>;

    /**
     * Remove a post from bookmarks.
     * @param postId
     * @returns
     */
    unbookmark: (postId: string) => Promise<boolean>;

    /**
     * Get bookmarks
     * @param indicator
     * @returns
     */
    getBookmarks: (indicator?: PageIndicator) => Promise<Pageable<Post, PageIndicator>>;

    /**
     * Block a wallet address.
     * @param address
     * @param networkType
     * @returns
     */
    blockWallet?: (address: string, networkType?: NetworkType) => Promise<boolean>;

    /**
     * Unblock a wallet address.
     * @param address
     * @param networkType
     * @returns
     */
    unblockWallet?: (address: string, networkType?: NetworkType) => Promise<boolean>;

    /**
     * Retrieves wallet addresses that the current logged user has blocked.
     * @param indicator
     * @returns
     */
    getBlockedWallets?: (indicator?: PageIndicator) => Promise<Pageable<Profile, PageIndicator>>;

    /**
     * Watch activities related to the specified address.
     * @param address
     * @param networkType default to EVM
     */
    watchWallet?: (address: string, networkType?: NetworkType) => Promise<boolean>;
    /**
     * Unwatch activities related to the specified address.
     * @param address
     * @param networkType default to EVM
     */
    unwatchWallet?: (address: string, networkType?: NetworkType) => Promise<boolean>;

    /**
     * Block a profile.
     * @param profileId
     * @returns
     */
    blockProfile?: (profileId: string) => Promise<boolean>;

    /**
     * Unblock a profile.
     * @param profileId
     * @returns
     */
    unblockProfile?: (profileId: string) => Promise<boolean>;

    /**
     * Retrieves profiles that the current logged user has blocked.
     * @param indicator
     * @returns
     */
    getBlockedProfiles?: (indicator?: PageIndicator) => Promise<Pageable<Profile, PageIndicator>>;

    /**
     * Block a channel.
     * @param channelId
     * @returns
     */
    blockChannel?: (channelId: string) => Promise<boolean>;

    /**
     * Unblock a profile.
     * @param profileId
     * @returns
     */
    unblockChannel?: (channelId: string) => Promise<boolean>;

    /**
     * Retrieves channels that the current logged user has blocked.
     * @param indicator
     * @returns
     */
    getBlockedChannels?: (indicator?: PageIndicator) => Promise<Pageable<Channel, PageIndicator>>;

    /**
     * Report spam or inappropriate profile content.
     * @param profileId
     * @returns
     */
    reportProfile?: (profileId: string) => Promise<boolean>;

    /**
     * Report spam or inappropriate post content.
     */
    reportPost?: (post: Post) => Promise<boolean>;

    /**
     * Report spam or inappropriate channel content.
     */
    reportChannel?: (channelId: string) => Promise<boolean>;

    /**
     * Get trending posts in the channel.
     */
    getChannelTrendingPosts?: (channel: Channel, indicator?: PageIndicator) => Promise<Pageable<Post, PageIndicator>>;

    /**
     * Get for you posts
     */
    getForYouPosts?: (indicator?: PageIndicator) => Promise<Pageable<Post, PageIndicator>>;

    /**
     * Get recent feed posts
     */
    getRecentPosts?: (indicator?: PageIndicator) => Promise<Pageable<Post, PageIndicator>>;

    /**
     * Update profile
     */
    updateProfile: (profile: ProfileEditable) => Promise<boolean>;
}
