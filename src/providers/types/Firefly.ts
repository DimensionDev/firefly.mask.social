import type { NonFungibleAsset } from '@masknet/web3-shared-base';
import type { Address, Hex } from 'viem';

import {
    BookmarkType,
    FireflyPlatform,
    NetworkType,
    PolymarketBetType,
    S3ConvertStatus,
    type SocialSourceInURL,
    type Source,
    WalletSource,
} from '@/constants/enum.js';
import type { SimpleHash } from '@/providers/simplehash/type.js';
import type { SnapshotChoice } from '@/providers/snapshot/type.js';
import type { ArticlePlatform, ArticleType } from '@/providers/types/Article.js';
import type { Token as DebankToken } from '@/providers/types/Debank.js';
import type { ComposeType } from '@/types/compose.js';

export enum EmbedMediaType {
    IMAGE = 'image',
    NFT = 'nft',
    AUDIO = 'audio',
    FONT = 'font',
    VIDEO = 'video',
    TEXT = 'text',
    FRAME = 'frame',
    CAST = 'cast',
    APPLICATION = 'application',
    UNKNOWN = 'unknown',
}

export interface Cast {
    fid: string;
    hash: string;
    text: string;
    channel?: Channel;
    parent_hash?: string;
    parent_fid?: string;
    parent_url?: string;
    embeds: Array<{ url: string }>;
    embed_urls?: Array<{ url: string; type?: EmbedMediaType }>;
    mentions: string[];
    mentions_positions: number[];
    mentions_user: Array<{
        fid: string;
        handle: string;
    }>;
    created_at: string;
    /** example 2024-05-06T10:22:42.152Z */
    deleted_at: string | null;
    likeCount: number;
    recastCount: number;
    quotedCount: number;
    /** numeric string */
    replyCount: string;
    parentCast?: Cast;
    liked: boolean;
    recasted: boolean;
    bookmarked: boolean;
    author?: User;
    recastedBy?: User;
    timestamp?: string;
    rootParentCast?: Cast;
    root_parent_hash?: string;
    threads?: Cast[];
    quotedCast?: Cast;
    sendFrom: {
        display_name: string;
        name: string;
        bio: string;
        fid: number;
        pfp: string;
    };
}

export interface User {
    pfp: string;
    username: string;
    display_name: string;
    bio?: string;
    following: number;
    followers: number;
    addresses: string[];
    solanaAddresses: string[];
    fid: string;
    isFollowing?: boolean;
    /** if followed by the user, no relation to whether you follow the user or not */
    isFollowedBack?: boolean;
    isPowerUser?: boolean;
}

export interface Profile {
    platform_id: string;
    platform: FireflyPlatform;
    handle: string;
    name: string;
    hit: boolean;
    score: number;
    avatar?: string;
    owner?: string;
}

export interface UsersData {
    list: User[];
    next_cursor: string;
}

export enum NotificationType {
    CastBeLiked = 1,
    CastBeRecasted = 2,
    CastBeReplied = 3,
    BeFollowed = 4,
    BeMentioned = 5,
}

export interface Notification {
    cast: Cast | null;
    notificationType: NotificationType;
    user: User | null;
    users: User[] | null;
    timestamp: string;
}

export interface ChannelProfile {
    active_status: 'active' | Omit<string, 'active'>;
    custody_address: string;
    display_name: string;
    fid: number;
    username: string;
    follower_count: number;
    following_count: number;
    isFollowedBack?: boolean;
    isFollowing?: boolean;
    pfp_url: string;
    power_badge: boolean;
    profile?: {
        bio?: {
            text: string;
        };
    };
    verifications?: string[];
    verified_addresses?: Record<'eth_addresses' | 'sol_addresses', string[]>;
}

export interface Channel {
    id: string;
    image_url: string;
    name: string;
    // e.g., 1689888729
    createdAt?: number;
    created_at?: number;
    description: string;
    follower_count?: number;
    url: string;
    parent_url: string;
    lead?: ChannelProfile;
    hosts?: ChannelProfile[];
}

export interface ChannelProfileBrief {
    addresses: string[];
    bio: string;
    display_name: string;
    fid: number;
    followers: number;
    following: number;
    isFollowedBack: boolean;
    isFollowing: boolean;
    pfp: string;
    username: string;
}

export interface ChannelBrief {
    // e.g., 1710554170
    created_at?: number;
    // Different interfaces have different field names.
    createdAt?: number;
    description: string;
    id: string;
    image_url: string;
    name: string;
    parent_url: string;
    url: string;
    follower_count?: number;
    lead?: ChannelProfileBrief;
    hostFids?: number[];
}

export interface Article {
    timestamp: string;
    hash: string;
    owner: Address;
    digest: string;
    type: ArticleType;
    platform: ArticlePlatform;
    content: {
        body: string;
        title: string;
    };
    author: string;
    displayInfo: {
        ensHandle: string;
        avatarUrl: string;
    };
    authorship: {
        contributor: string;
    };
    related_urls: string[];
    article_id: string;
    cover_img_url: string | null;
    has_bookmarked?: boolean;
    followingSources: FollowingSource[];
    paragraph_raw_data?: {
        slug: string;
        staticHtml: string;
        json: string;
    };
}

export interface FireflySnapshotActivity {
    id: string;
    timestamp: string;
    hash: string;
    owner: Address;
    // only support vote type
    type: 'vote';
    related_urls: string[];
    metadata: {
        proposal_id: string;
        choice: SnapshotChoice;
        proposal_title: string;
        proposal_body: string;
    };
    displayInfo: { ensHandle: string; avatarUrl: string };
    followingSources: FollowingSource[];
    has_bookmarked: boolean;
}

export type DiscoverSnapshotsResponse = Response<{
    cursor: number;
    result: FireflySnapshotActivity[];
}>;

export interface Response<T> {
    code: number;
    data?: T;
    error?: string[];
}

export type Relationship = {
    id: string;
    address: string;
    snsId: string;
    snsPlatform: string;
};

export type UsersResponse = Response<UsersData>;

export type BlockedUsersResponse = Response<{
    page: number;
    nextPage: number;
    blocks: Relationship[];
}>;

export type BlockedChannelsResponse = Response<
    Array<{
        channel_id: string;
        channel_url: string;
        create_at: string;
    }>
>;

export type UserResponse = Response<User>;

export type ReactorsResponse = Response<{
    items: User[];
    nextCursor: string;
}>;

export type CastResponse = Response<Cast>;

export type CastsResponse = Response<{
    casts: Cast[];
    cursor: string;
}>;

export type SearchCastsResponse = Response<Cast[]>;

export type SearchProfileResponse = Response<{
    list: Array<Record<SocialSourceInURL | 'eth' | 'solana' | 'ens', Profile[] | null>>;
    cursor: number;
    size: number;
}>;

export type NotificationResponse = Response<{ notifications: Notification[]; cursor: string }>;

export type CommentsResponse = Response<{
    comments: Cast[];
    cursor: string;
}>;

export type UploadMediaTokenResponse = Response<{
    bucket: string;
    cdnHost: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
}>;

export type FriendshipResponse = Response<{
    isFollowing: boolean;
    isFollowedBack: boolean;
}>;

export type ThreadResponse = Response<{
    threads: Cast[];
}>;

export type LoginResponse = Response<{
    accessToken: string;
    accountId: string;
    farcaster_signer_public_key?: string;
    farcaster_signer_private_key?: string;
    isNew: boolean;
    fid?: number;
    telegram_username?: string;
    telegram_user_id?: string;
}>;

export type ThirdPartyLoginResponse = Response<{
    accessToken: string;
    accountId: string;
    isNew: boolean;
}>;

export type TelegramLoginBotResponse = Response<{
    url: string;
    tgUrl: string;
}>;

export type TelegramLoginResponse = Response<{
    accessToken: string;
    accountId: string;
    isNew: boolean;
    telegram_user_id: string;
    telegram_username: string;
}>;

export type MetricsDownloadResponse = Response<{
    ciphertext: string;
} | null>;

export type MetricsUploadResponse = Response<void>;

export type BindResponse = Response<{
    fid: number;
    farcaster_signer_public_key?: string;
    farcaster_signer_private_key?: string;
    account_id: string;
    account_raw_id: number;
    twitters: Array<{
        id: string;
        handle: string;
    }>;
    wallets: Array<{
        _id: number;
        id: string; // the wallet address as id
        createdAt: string;
        connectedAt: string;
        updatedAt: string;
        address: string;
        chain: string;
        ens: unknown;
    }>;
}>;

export type ChannelResponse = Response<{
    channel: ChannelBrief;
    blocked: boolean;
}>;

export type ChannelsResponse = Response<Channel[]>;

export type DiscoverChannelsResponse = Response<
    Array<{
        channel: Channel;
    }>
>;

export type DiscoverArticlesResponse = Response<{
    cursor: number;
    result: Article[];
}>;

export type GetArticleDetailResponse = Response<Article[]>;

export type GetFollowingArticlesResponse = Response<{
    cursor: number;
    result: Article[];
}>;

export type CastsOfChannelResponse = Response<{
    casts: Cast[];
    cursor: string;
    channel: Channel;
}>;

export type PostQuotesResponse = Response<{
    quotes: Cast[];
    cursor: string;
}>;

export type SearchChannelsResponse = Response<{
    channels: ChannelBrief[];
    cursor: string;
}>;

export enum RelatedWalletSource {
    firefly = 'firefly',
    cyber = 'cyber',
    hand_writing = 'hand_writing',
    opensea = 'opensea',
    pfp = 'pfp',
    rss3 = 'rss3',
    twitter_hexagon = 'twitter_hexagon',
    uniswap = 'uniswap',
    ethLeaderboard = 'web ens data',
    lens = 'lens',
    farcaster = 'farcaster',
    other = 'other',
    twitter = 'twitter',
    particle = 'particle',
}

export enum RelationPlatform {
    reddit = 'reddit',
    keybase = 'keybase',
    github = 'github',
}

export enum WatchType {
    Wallet = 'wallet',
    MaskX = 'maskx',
    Twitter = 'twitter',
    Lens = 'lens',
    Farcaster = 'farcaster',
}

export interface FollowingSource {
    id?: string;
    handle?: string;
    name?: string;
    type: WatchType;
    socialId?: string;
    walletAddress?: Address;
}

export interface WalletProfile {
    address: Address;
    ens?: string[];
    blockchain: NetworkType;
    is_connected: boolean;
    verifiedSources: Array<{
        source: RelatedWalletSource;
        provider: string;
        verifiedText: string;
    }>;
    avatar?: string;
    primary_ens?: string | null;
    blocked?: boolean;
}

export interface LensV3Profile {
    id: string;
    ownedBy: string;
    nameSpace: string;
    localName: string;
    fullHandle: string;
}

export interface FarcasterProfile {
    avatar: {
        url: string;
        verified: boolean;
    };
    bio: string;
    followerCount: number;
    followingCount: number;
    fid: number;
    username: string;
    display_name: string;
    isPowerUser: boolean;
    raw_data: string;
    signer_address: string;
    addresses: string[];
    id: number;
}

export interface FireflyFarcasterProfile {
    addresses: Address[];
    followers: number;
    following: number;
    isPowerUser: boolean;
    fid: number;
    username: string;
    display_name: string;
    bio: string;
    pfp: string;
    isFollowing: boolean;
    isFollowedBack: boolean;
}

export type FireflyFarcasterProfileResponse = Response<FireflyFarcasterProfile>;

export interface TwitterProfile {
    twitter_id: string;
    handle: string;
    source: string;
    provider: string;
}

export interface WalletProfiles {
    walletProfiles: WalletProfile[];
    solanaWalletProfiles: WalletProfile[];
    lensProfilesV3: LensV3Profile[];
    farcasterProfiles: FarcasterProfile[];
    twitterProfiles: TwitterProfile[];
    fireflyAccountId?: string;
}

export type PlatformIdentityKey =
    | 'twitterId'
    | 'twitterHandle'
    | 'walletAddress'
    | 'lensHandle'
    | 'farcasterUsername'
    | 'fid'
    | 'lensProfileId'
    | 'ens'
    | 'solanaAddress';

export type WalletProfileResponse = Response<WalletProfiles>;

export interface FireflyProfile {
    identity: FireflyIdentity;
    displayName: string;
    __origin__: WalletProfile | LensV3Profile | FarcasterProfile | TwitterProfile | null;
}

export interface Relation {
    source: string[];
    identity: {
        uuid: string;
        identity: string;
        platform: RelationPlatform;
        displayName: string;
    };
}

export type RelationResponse = Response<Relation[]>;

export type BookmarkResponse<T> = Response<{
    cursor: number;
    list: Array<{
        account_id: string;
        /** e.g. twitter, lens, farcaster, article */
        platform: string;
        platform_id: string;
        post_id: string;
        post_content?: T;
    }>;
}>;

export type DigestResponse = Response<{
    type: string;
    paragraph?: {
        id: string;
    };
}>;

export type BlockFields = 'twitterId' | 'lensId' | 'fid' | 'address';
export type BlockUserResponse = Response<Relationship[]>;

export type BlockChannelResponse = Response<{
    identifiers: Array<{ channel_id: string; account_id: string }>;
    generatedMaps: Array<{ create_at: string; update_at: string }>;
    raw: Array<{ create_at: string; update_at: string }>;
}>;

export type BlockRelationResponse = Response<
    Array<{
        snsId: string;
        snsPlatform: FireflyPlatform;
        blocked: boolean;
    }>
>;

export type ReportCrossPostResponse = Response<void>;

export type NFTCollectionsResponse = Response<{
    cursor: string;
    collections: SimpleHash.LiteCollection[];
}>;

export type NFTAsset = NonFungibleAsset<number, number> & {
    hasBookmarked?: boolean;
    externalUrl?: string;
};

export type TwitterFollowStatusResponse = Response<{
    isFollowed: boolean;
}>;

export type WalletsFollowStatusResponse = Response<
    Array<{
        address: string;
        is_followed: boolean;
    }>
>;

export interface ReportPostParams {
    platform: FireflyPlatform;
    platform_id: string;
    post_type: 'text' | 'video' | 'audio' | 'image';
    post_id: string;
}

export interface LinkInfo {
    link: string;
    session: string;
}

export type LinkInfoResponse = Response<LinkInfo>;

export type SessionStatus =
    | {
          status: 'confirm';
          accountId: string;
          accessToken: string;
      }
    | {
          status: 'cancel';
      }
    | {
          status: 'expired';
      }
    | {
          status: 'pending';
      };

export type EmptyResponse = Response<void>;

export type HexResponse = Response<Hex>;

export type SessionStatusResponse = Response<SessionStatus>;

export type DebankTokensResponse = Response<{
    list: DebankToken[];
}>;

export interface SchedulePostPayload {
    platform: SocialSourceInURL;
    platformUserId: string;
    payload: string;
}

export interface SchedulePostDisplayInfo {
    content: string;
    type: ComposeType;
}

export type ScheduleStatus = 'pending' | 'fail';
export interface ScheduleTask {
    uuid: string;
    publish_timestamp: string;
    status: ScheduleStatus;
    updated_at: string;
    created_at: string;
    account_id: number;
    display_info: SchedulePostDisplayInfo;
    schedulePosts: Array<{
        uuid: string;
        platform: SocialSourceInURL;
        status: ScheduleStatus;
        updated_at: string;
        created_at: string;
        job_id: string;
    }>;
    platforms: SocialSourceInURL[];
}

export type ScheduleTasksResponse = Response<{
    tasks: ScheduleTask[];
    cursor: string | null;
}>;

export type BindWalletResponse = Response<{
    id: string;
    address: Address;
    ens: string;
    is_connected: boolean;
    blockchain: NetworkType;
    signMessage: string;
    signature: string;
}>;

export type IsMutedAllResponse = Response<{
    isBlockAll: boolean;
}>;

export type MuteAllResponse = Response<Relationship[]>;

export interface FarcasterSuggestedFollowUser {
    pfp: string;
    display_name: string;
    bio: string;
    username: string;
    following: number;
    followers: number;
    addresses: string[];
    fid: number;
    isFollowing: boolean;
    isFollowedBack: boolean;
    solanaAddresses: string[];
}

export type GetFarcasterSuggestedFollowUserResponse = Response<{
    suggestedFollowList: FarcasterSuggestedFollowUser[];
    cursor: number;
}>;

export type GetLensSuggestedFollowUserResponse = Response<{
    suggestedFollowList: Array<[LensV3Profile]>;
    cursor: number;
}>;

export type LensConnection = LensV3Profile;

export interface FarcasterConnection {
    bio: string;
    connectedAddresses: string[];
    display_name: string;
    fid: number;
    pfp: string;
    username: string;
}

export interface TwitterConnection {
    handle: string;
    id: string;
    name: string;
    platform: string;
}

export interface WalletConnection {
    address: string;
    avatar: string;
    canReport: boolean;
    ens: string[];
    platform: 'eth' | 'solana';
    provider: string;
    source: WalletSource;
    sources: WalletProfile['verifiedSources'];
    twitterId: string;
}

export interface FireflyIdentity {
    id: string;
    source: Source;
}

export type FireflyWalletConnection = WalletConnection & {
    identities: FireflyIdentity[];
};

export type AllConnections = {
    account: Array<{
        account_id: { high: number; low: number };
        id: string;
        name: string;
        platform: string;
    }>;
    farcaster: Record<'connected' | 'unconnected', FarcasterConnection[]>;
    lens: Record<
        'connected' | 'unconnected',
        Array<{
            address: string;
            lens: LensConnection[];
        }>
    >;
    twitter: Record<
        'connected' | 'unconnected',
        Array<{
            address: string;
            twitters: TwitterConnection[];
        }>
    >;
    wallet: Record<'connected' | 'unconnected', WalletConnection[]>;
};

export type GetAllConnectionsResponse = Response<AllConnections>;

export type MessageToSignResponse = Response<{
    message: string;
}>;

export type ConvertM3u8Response = Response<{
    m3u8Url: string;
    jobId: string;
}>;

export type ConvertM3u8StatusResponse = Response<{
    code: boolean;
    jobId: string;
    status: S3ConvertStatus;
}>;

export enum ActivityStatus {
    Upcoming = 0,
    Active = 1,
    Ended = 2,
}

export interface ActivityListItem {
    id: number;
    name: string;
    title: string;
    sub_title: string;
    description: string;
    url: string;
    banner_url: string;
    cover_url: string;
    icon_url: string;
    ext: string;
    start_time: string;
    end_time: string;
    status: ActivityStatus;
}

export type ActivityListResponse = Response<{
    list: ActivityListItem[];
    cursor: number;
    size: number;
}>;

export enum TwitterUserInfoLabelType {
    BusinessLabel = 'BusinessLabel',
}

export enum TwitterUserInfoLabelDisplayType {
    Badge = 'Badge',
}

export enum TwitterUserInfoLabelUrlType {
    DeepLink = 'DeepLink',
}

export enum TwitterUserInfoVerifiedType {
    Government = 'Government',
}

export interface TwitterUserInfoLabel {
    url: {
        url: string;
        urlType: TwitterUserInfoLabelUrlType;
    };
    badge: {
        url: string;
    };
    description: string;
    userLabelType: TwitterUserInfoLabelType;
    userLabelDisplayType: TwitterUserInfoLabelDisplayType;
}

export interface TwitterUserInfoEntities {
    display_url: string;
    expanded_url: string;
    url: string;
    indices: number[];
}

export enum TwitterUserInfoProfileImageShape {
    Square = 'Square',
    Circle = 'Circle',
}

export interface TwitterUserInfo {
    __typename: string;
    id: string;
    rest_id: string;
    affiliates_highlighted_label: {
        label?: TwitterUserInfoLabel;
    };
    has_graduated_access: boolean;
    is_blue_verified: boolean;
    profile_image_shape: TwitterUserInfoProfileImageShape;
    legacy: {
        following: boolean;
        can_dm: boolean;
        can_media_tag: boolean;
        created_at: string;
        default_profile: boolean;
        default_profile_image: boolean;
        description: string;
        entities: {
            description: {
                urls: TwitterUserInfoEntities[];
            };
            url: {
                urls: TwitterUserInfoEntities[];
            };
        };
        fast_followers_count: number;
        favourites_count: number;
        followers_count: number;
        friends_count: number;
        has_custom_timelines: boolean;
        is_translator: boolean;
        listed_count: number;
        location: string;
        media_count: number;
        name: string;
        normal_followers_count: number;
        pinned_tweet_ids_str: string[];
        possibly_sensitive: boolean;
        profile_banner_url: string;
        profile_image_url_https: string;
        profile_interstitial_type: string;
        screen_name: string;
        statuses_count: number;
        translator_type: string;
        url: string;
        verified: boolean;
        verified_type?: TwitterUserInfoVerifiedType;
        want_retweets: boolean;
    };
    professional: {
        rest_id: string;
        professional_type: string;
        category: Array<{
            id: number;
            name: string;
            icon_name: string;
        }>;
    };
    tipjar_settings: {
        is_enabled: boolean;
        bitcoin_handle: string;
        ethereum_handle: string;
    };
    smart_blocked_by: boolean;
    smart_blocking: boolean;
    legacy_extended_profile: {
        birthdate: {
            year: number;
            visibility: string;
            year_visibility: string;
        };
    };
    is_profile_translatable: boolean;
    has_hidden_subscriptions_on_profile: boolean;
    verification_info: {
        is_identity_verified: boolean;
        reason: {
            description: {
                text: string;
                entities: Array<{
                    from_index: number;
                    to_index: number;
                    ref: {
                        url: string;
                        url_type: string;
                    };
                }>;
            };
            verified_since_msec: string;
        };
    };
    highlights_info: {
        can_highlight_tweets: boolean;
        highlighted_tweets: string;
    };
    user_seed_tweet_count: number;
    business_account: {};
    creator_subscriptions_count: number;
}

export type TwitterUserInfoResponse = Response<{
    data: {
        user: {
            result: TwitterUserInfo;
        };
    };
}>;

export interface UserV2 {
    id: string;
    name: string;
    username: string;
    created_at?: string;
    protected?: boolean;
    withheld?: {
        country_codes?: string[];
        scope?: 'user';
    };
    location?: string;
    url?: string;
    description?: string;
    verified?: boolean;
    verified_type?: 'none' | 'blue' | 'business' | 'government';
    entities?: {
        url?: {
            urls: unknown[];
        };
        description: {
            urls?: unknown[];
            hashtags?: unknown[];
            cashtags?: unknown[];
            mentions?: unknown[];
        };
    };
    profile_image_url?: string;
    public_metrics?: {
        followers_count?: number;
        following_count?: number;
        tweet_count?: number;
        listed_count?: number;
        like_count?: number;
    };
    pinned_tweet_id?: string;
    connection_status?: string[];
}

export type TwitterUserV2Response = Response<UserV2>;

export type ActivityInfoResponse = Response<{
    id: number;
    name: string;
    title: string;
    sort: number;
    is_offline: number;
    sub_title: string;
    description: string;
    url: string;
    banner_url: string;
    cover_url: string;
    icon_url: string;
    ext: string;
    start_time: string;
    end_time: string;
    open_graph_url: string;
    status: ActivityStatus;
}>;

export type VotingResultResponse = Response<{
    trump: number;
    harris: number;
    tokenIdCount: number;
}>;

export type PolymarketActivity = {
    asset: string;
    blockNumber: number;
    blockNumberSort: number;
    conditionId: string;
    conditionOutcomePrices: string[];
    conditionOutcomes: string[];
    conditionRawData: {};
    displayInfo: {
        avatarUrl: string;
        ensHandle: string;
    };
    endDate: string;
    eventSlug: string;
    followingSources: FollowingSource[];
    icon: string;
    image: string;
    outcome: string;
    outcomeIndex: number;
    owner: string;
    price: string;
    proxyWallet: string;
    side: PolymarketBetType;
    size: string;
    slug: string;
    timestamp: number;
    title: string;
    transactionHash: string;
    umaResolutionStatus: string;
    usdcSize: string;
    volume: string;
    wallet: string;
};

export type PolymarketActivityTimeline = Response<{
    result: PolymarketActivity[];
    cursor?: string;
}>;

export type SearchableNFT = {
    amounts_total: number;
    attributes: unknown[];
    banner_url?: string;
    collections_with_same_name: unknown[];
    contract_address: string;
    deploy_block_number: number;
    description: string;
    discord?: string;
    email?: string;
    erc_type: string;
    featured_url: string;
    floor_price: number;
    github?: string;
    instagram?: string;
    is_spam: boolean;
    items_total: number;
    large_image_url: string;
    logo_url: string;
    medium?: string;
    name: string;
    opensea_floor_price: number;
    opensea_slug: string;
    opensea_verified: boolean;
    owner: string;
    owners_total: number;
    price_symbol: string;
    royalty: number;
    symbol: string;
    telegram?: string;
    twitter?: string;
    verified: boolean;
    website?: string;
};

export type SearchNFTResponse = Response<{
    list: SearchableNFT[];
}>;

export type SearchableToken = {
    api_symbol: string;
    id: string;
    large: string;
    market_cap_rank: number;
    name: string;
    symbol: string;
    thumb: string;
};

export type SearchTokenResponse = Response<{
    coins: SearchableToken[];
}>;

export type GenerateFarcasterSignatureResponse = Response<{
    sponsorSignature: Hex;
    signedKeyRequestSignature: Hex;
    requestFid: number;
}>;

export enum NotificationPushType {
    All = 'all',
    Follows = 'follows',
    Recasts = 'recasts',
    Likes = 'likes',
    Mention = 'mention',
    Reply = 'reply',
    Lens = 'lens',
    Farcaster = 'farcaster',
    Priority = 'priority',
}

export enum NotificationPlatform {
    Priority = 'priority',
    Lens = 'lens',
}

export enum NotificationTitle {
    NotificationsMode = 'Notifications Mode',
    Farcaster = 'Farcaster',
    Lens = 'Lens',
}

export type NotificationPushSwitchResponse = Response<{
    push_switch: boolean;
    list: Array<{
        title: NotificationTitle;
        device_id?: string;
        list: Array<{
            account_id: string;
            platform: NotificationPlatform;
            push_type: NotificationPushType;
            title: string;
            state: boolean;
        }>;
    }>;
}>;

export interface SetNotificationPushSwitchParams {
    list: Array<{
        device_id?: string;
        token?: string;
        platform: NotificationPlatform;
        push_type: NotificationPushType;
        state: boolean;
    }>;
}

export type LinkDigestResponse = Response<{
    link: string;
    type: string;
    nft?: SimpleHash.NFT;
    lensPost?: unknown;
    farcasterPost?: unknown;
    mirror?: unknown;
    paragraph?: unknown;
    snapshot?: unknown;
    twitter?: unknown;
    twitterXQT?: unknown;
    farcasterFrames?: unknown;
}>;

export type GetBookmarksResponse = Response<{
    list: Array<{
        has_book_marked: boolean;
        platform: string;
        platform_id: string;
        post_id: string;
        post_type: BookmarkType;
    }>;
}>;

export type SponsorMintOptions = {
    platformType?: string;
    walletAddress: string;
    contractAddress: string;
    tokenId: string;
    chainId: number;
    buyCount: number;
    vectorId?: number;
    color?: string;
    contractExt?: unknown;
};

export type MintMetadata = {
    mintStatus: number;
    mintPrice: string;
    platformFee: string;
    txData: {
        gasLimit: string;
        inputData: string;
        to: string;
        value: string;
    };
    mintCount: number;
    perLimitCount: number;
    chainId: number;
    gasStatus: boolean;
    tokenPrice: unknown;
    nativePrice: number;
};

export type GetSponsorMintStatusResponse = Response<MintMetadata>;

export type MintBySponsorResponse = Response<{
    status: boolean;
    hash: string;
    errormessage: string;
    gasStatus: boolean;
}>;
