import type { Address } from 'viem';

import { FireflyPlatform, type SocialSourceInURL, type Source } from '@/constants/enum.js';
import type { ArticlePlatform, ArticleType } from '@/providers/types/Article.js';
import type { CompositePost } from '@/store/useComposeStore.js';
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
    fid: string;
    isFollowing?: boolean;
    isFollowedBack?: boolean;
}

export interface Profile {
    platform_id: string;
    platform: SocialSourceInURL;
    handle: string;
    name: string;
    hit: boolean;
    score: number;
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
}

export interface Response<T> {
    code: number;
    data?: T;
    error?: string[];
}

export type UsersResponse = Response<UsersData>;

export type BlockedUsersResponse = Response<{
    page: number;
    nextPage: number;
    blocks: Array<{
        id: string;
        address: string;
        snsId: string;
        snsPlatform: string;
    }>;
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
    list: Array<Record<SocialSourceInURL, Profile[] | null>>;
    cursor: number;
    size: number;
}>;

export type NotificationResponse = Response<{ notifications: Notification[]; cursor: string }>;

export type CommentsResponse = Response<{
    comments: Cast[];
    cursor: string;
}>;

export type UploadMediaTokenResponse = Response<{
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

export type LensLoginResponse = Response<{
    accessToken: string;
    accountId: string;
}>;

export type FarcasterLoginResponse = Response<{
    accessToken?: string;
    accountId?: string;
    farcaster_signer_public_key?: string;
    farcaster_signer_private_key?: string;
    fid: string | number;
}>;

export type MetricsDownloadResponse = Response<{
    ciphertext: string;
} | null>;

export type BindResponse = Response<{
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
    ens: string[];
    blockchain: string;
    is_connected: boolean;
    verifiedSources: Array<{
        source: RelatedWalletSource;
        provider: string;
        verifiedText: string;
    }>;
    avatar: string;
    primary_ens: string | null;
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
    lensProfilesV3: LensV3Profile[];
    farcasterProfiles: FarcasterProfile[];
    twitterProfiles: TwitterProfile[];
}

export type WalletProfileResponse = Response<WalletProfiles>;

export interface FireflyProfile {
    identity: string;
    source: Source;
    displayName: string;
    __origin__: WalletProfile | LensV3Profile | FarcasterProfile | TwitterProfile | null;
}

export interface Relation {
    source: string[];
    identity: {
        uuid: string;
        platform: RelationPlatform;
        identity: string;
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

export type BlockFields = 'twitterId' | 'lensId' | 'fid' | 'address';
export type BlockUserResponse = Response<
    Array<{
        id: string;
        address: string;
        snsId: string;
        snsPlatform: string;
    }>
>;

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
    collections: Collection[];
}>;

export interface ImageProperties {
    width: number;
    height: number;
    size?: number;
    mime_type: string;
}

export interface MarketplacePage {
    marketplace_id: string;
    marketplace_name: string;
    marketplace_collection_id: string;
    collection_url: string;
    verified: boolean;
}

export interface CollectionDetails {
    collection_id: string;
    name: string;
    description?: string;
    image_url: string;
    image_properties: ImageProperties;
    banner_image_url?: string;
    category?: string;
    is_nsfw?: boolean;
    external_url?: string;
    twitter_username?: string;
    discord_url?: string;
    instagram_username: string;
    medium_username?: string;
    telegram_url?: string;
    marketplace_pages: MarketplacePage[];
    spam_score: number;
    floor_prices: FloorPrice[];
    distinct_owner_count: number;
    distinct_nft_count: number;
    total_quantity: number;
    chains: string[];
    top_contracts: string[];
    collection_royalties: CollectionRoyalty[];
}

export interface Previews {
    image_small_url: string;
    image_medium_url: string;
    image_large_url: string;
    image_opengraph_url: string;
    blurhash: string;
    predominant_color: string;
}

export interface Properties {
    number: number;
    name: string;
}

export interface Content {
    mime: string;
    uri: string;
}

export interface Attribute {
    trait_type: string;
    value: string;
    display_type?: string;
}

export interface ExtraMetadata {
    attributes: Attribute[];
    canvas_url?: string;
    content?: Content;
    image_original_url: string;
    animation_original_url?: string;
    metadata_original_url?: string;
    tokenId?: string;
    namehash?: string;
    image_url?: string;
    dna?: string;
    edition?: number;
    date?: number;
    compiler?: string;
    is_normalized?: boolean;
    name_length?: number;
    version?: number;
    background_image?: string;
    segment_length?: number;
    last_request_date?: number;
    properties?: Properties;
}

export interface Owner {
    owner_address: string;
    quantity: number;
    quantity_string: string;
    first_acquired_date: string;
    last_acquired_date: string;
}

export interface Contract {
    type: string;
    name?: string;
    symbol?: string;
    deployed_by: string;
    deployed_via_contract?: string;
    owned_by?: string;
    has_multiple_collections: boolean;
}

export interface Rarity {
    rank?: number;
    score?: number;
    unique_attributes?: number;
}

export interface Recipient {
    address: string;
    percentage: number;
    basis_points: number;
}

export interface Royalty {
    source: string;
    total_creator_fee_basis_points: number;
    recipients: Recipient[];
}

export interface PaymentToken {
    payment_token_id: string;
    name: string;
    symbol: string;
    address?: string;
    decimals: number;
}

export interface FloorPrice {
    marketplace_id: string;
    marketplace_name: string;
    value: number;
    payment_token: PaymentToken;
    value_usd_cents: number;
}

export interface CollectionRoyalty {
    source: string;
    total_creator_fee_basis_points: number;
    recipients: Recipient[];
}

export interface NftPreviewCollection {
    collection_id: string;
    name: string;
    description?: string;
    image_url: string;
    image_properties: ImageProperties;
    banner_image_url?: string;
    category?: string;
    is_nsfw?: boolean;
    external_url?: string;
    twitter_username?: string;
    discord_url?: string;
    instagram_username?: string;
    medium_username?: string;
    telegram_url?: string;
    marketplace_pages: MarketplacePage[];
    spam_score: number;
    floor_prices: FloorPrice[];
    distinct_owner_count: number;
    distinct_nft_count: number;
    total_quantity: number;
    chains: string[];
    top_contracts: string[];
    collection_royalties: CollectionRoyalty[];
}

export interface LastSale {
    from_address: null | string;
    to_address: string;
    quantity: number;
    quantity_string: string;
    timestamp: string;
    transaction: string;
    marketplace_id: string;
    marketplace_name: string;
    is_bundle_sale: boolean;
    payment_token: PaymentToken;
    unit_price: number;
    total_price: number;
    unit_price_usd_cents: number;
}

export interface FirstCreated {
    minted_to: string;
    quantity: number;
    quantity_string?: string;
    timestamp: string;
    block_number: number;
    transaction: string;
    transaction_initiator: string;
}

export interface NftPreview {
    nft_id: string;
    chain: string;
    contract_address: string;
    token_id: string;
    name: string;
    description?: string;
    previews: Previews;
    image_url: string;
    image_properties: ImageProperties;
    background_color?: string;
    external_url?: string;
    created_date: string;
    status: string;
    token_count: number;
    owner_count: number;
    owners: Owner[];
    contract: Contract;
    collection: NftPreviewCollection;
    last_sale?: LastSale;
    first_created: FirstCreated;
    rarity: Rarity;
    royalty: Royalty[];
    extra_metadata: ExtraMetadata;
}

export interface Collection {
    collection_id: string;
    distinct_nfts_owned: number;
    distinct_nfts_owned_string: string;
    total_copies_owned: number;
    total_copies_owned_string: string;
    last_acquired_date: string;
    nft_ids: string[];
    collection_details: CollectionDetails;
    nftPreviews?: NftPreview[];
}

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

export type SessionStatusResponse = Response<SessionStatus>;

export interface SchedulePostPayload {
    platform: SocialSourceInURL;
    platformUserId: string;
    payload: string;
}

export interface SchedulePostDisplayInfo {
    posts: CompositePost[];
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
