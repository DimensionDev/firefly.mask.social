import { PageIndicator, Pageable } from '@/helpers/createPageable';
import { Session } from '@/providers/types/Session';

export enum Type {
    Twitter = 'Twitter',
    Farcaster = 'Farcaster',
    Warpcast = 'Warpcast',
    Lens = 'Lens',
}

export enum MimeType {
    AUDIO_WAV = 'audio/wav',
    AUDIO_MPEG = 'audio/mpeg',
    AUDIO_OGG = 'audio/ogg',
    AUDIO_MP4 = 'audio/mp4',
    AUDIO_AAC = 'audio/aac',
    AUDIO_WEBM = 'audio/webm',
    AUDIO_FLAC = 'audio/flac',

    VIDEO_WEBM = 'video/webm',
    VIDEO_MP4 = 'video/mp4',
    VIDEO_M4V = 'video/x-m4v',
    VIDEO_OGV = 'video/ogv',
    VIDEO_QUICKTIME = 'video/quicktime',
    VIDEO_MPEG = 'video/mpeg',
    VIDEO_OGG = 'video/ogg',

    IMAGE_GIF = 'image/gif',
    IMAGE_JPEG = 'image/jpeg',
    IMAGE_PNG = 'image/png',
    IMAGE_TIFF = 'image/tiff',
    IMAGE_BMP = 'image/x-ms-bmp',
    IMAGE_SVG = 'image/svg+xml',
    IMAGE_WEBP = 'image/webp',
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
}

export enum ProfileStatus {
    Active = 'active',
    Inactive = 'inactive',
}

export interface Reaction {
    reactionId: string;
    type: ReactionType;
    timestamp: number;
}

export interface Tag {
    tagId: string;
    label: string;
}

export interface Profile {
    profileId: string;
    nickname: string;
    displayName: string;
    pfp: string;
    bio?: string;
    address?: string;
    followerCount: number;
    followingCount: number;
    status: ProfileStatus;
    tags?: Tag[];
    verified: boolean;
    viewerContext?: {
        following: boolean;
        followedBy: boolean;
    };
    ownedBy?: {
        networkType: NetworkType;
        address: string;
    };
}

export interface MediaObject {
    title?: string;
    url: string;
    mimeType: string;
}

export interface Post {
    postId: string;
    parentPostId?: string;
    parentAuthor?: Profile;
    timestamp: number;
    author: Profile;
    embedPosts?: Post[];
    mediaObjects?: MediaObject[];
    permalink?: string;
    parentPermalink?: string;
    isHidden?: boolean;
    isEncrypted?: boolean;
    isEncryptedByMask?: boolean;
    metadata: {
        locale: string;
        description?: string;
        content: string;
        contentURI?: string;
    };
    stats?: {
        comments: number;
        mirrors: number;
        quotes: number;
        reactions: number;
        bookmarks?: number;
    };
    __original__?: unknown;
}

export interface Comment {
    commentId: string;
    timestamp: number;
    author: Profile;
    for: Post;
    profilesMentioned?: Profile[];
    hashTagsMentioned?: string[];
}

export interface Message {
    notificationId: string;
}

export interface MirrorNotification extends Message {
    type: 'mirror';
    mirror: Post;
    post: Post;
}

export interface QuoteNotification extends Message {
    type: 'quote';
    quote: Post;
    post: Post;
}

export interface ReactionNotification extends Message {
    type: 'reaction';
    reaction: string;
    reactor: Profile;
    post: Post;
}

export interface CommentNotification extends Message {
    type: 'comment';
    comment: Comment;
    post: Post;
}

export interface FollowNotification extends Message {
    type: 'follow';
    follower: Profile;
}

export interface MentionNotification extends Message {
    type: 'mention';
    post: Post;
}

export type Notification =
    | MirrorNotification
    | QuoteNotification
    | ReactionNotification
    | CommentNotification
    | FollowNotification
    | MentionNotification;

export interface Provider {
    type: Type;

    /**
     * Initiates the login process for the provider.
     *
     * @returns A promise that resolves to an Auth object upon successful login.
     */
    createSession: () => Promise<Session>;

    resumeSession: () => Promise<Session>;

    publishPost: (post: Post) => Promise<Post>;

    mirrorPost?: (postId: string) => Promise<Post>;

    quotePost?: (postId: string, intro: string) => Promise<Post>;

    collectPost?: (postId: string) => Promise<void>;

    commentPost?: (postId: string, comment: string) => Promise<void>;

    upvotePost: (postId: string) => Promise<Reaction>;

    unupvotePost: (postId: string) => Promise<void>;

    getProfileById: (profileId: string) => Promise<Profile>;

    getPostById: (postId: string) => Promise<Post>;

    /**
     * Timeline post in reverse chronological order.
     * @param profileId
     * @returns
     */
    getRecentPosts: (profileId: number, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    getPostsByProfileId: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    getPostsBeMentioned: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    getPostsLiked: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    getPostsReplies: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    getPostsByParentPostId: (postId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    __TODO__getReactorsByPostId: (postId: string, indicator?: PageIndicator) => Promise<Pageable<Profile>>;

    __TODO__getAllReactorsByPostId: (postId: string, indicator?: PageIndicator) => Promise<Pageable<Profile>>;

    /**
     * Let the current logged user to follow another user.
     * @param profileId User to follow
     * @returns
     */
    follow: (profileId: string) => Promise<void>;

    /**
     * Let the current logged user to unfollow another user.
     * @param profileId User to follow
     * @returns
     */
    unfollow: (profileId: string) => Promise<void>;

    getFollowers: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Profile>>;

    getFollowings: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Profile>>;

    isFollowedByMe?: (profileId: string) => Promise<boolean>;

    isFollowingMe?: (profileId: string) => Promise<boolean>;

    getNotifications: (indicator?: PageIndicator) => Promise<Pageable<Notification>>;

    getSuggestedFollows: (indicator?: PageIndicator) => Promise<Pageable<Profile>>;
}
