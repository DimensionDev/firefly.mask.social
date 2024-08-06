export enum NODE_ENV {
    Production = 'production',
    Development = 'development',
    Test = 'test',
}

export enum VERCEL_NEV {
    Production = 'production',
    Preview = 'preview',
    Development = 'development',
}

export enum STATUS {
    Enabled = 'enabled',
    Disabled = 'disabled',
}

// The maskbook blockchain network plugin ID
export enum NetworkPluginID {
    PLUGIN_EVM = 'com.mask.evm',
    PLUGIN_FLOW = 'com.mask.flow',
    PLUGIN_SOLANA = 'com.mask.solana',
}

// The maskbook supported enhanceable websites
export enum EnhanceableSite {
    Localhost = 'localhost',
    Twitter = 'twitter.com',
    Facebook = 'facebook.com',
    Minds = 'minds.com',
    Instagram = 'instagram.com',
    OpenSea = 'opensea.io',
    Mirror = 'mirror.xyz',
    Firefly = 'firefly.mask.social',
}

export type ThemeMode = 'light' | 'dark' | 'default';

export enum Locale {
    en = 'en',
    zhHans = 'zh-Hans',
    zhHant = 'zh-Hant',
}

export enum PageRoute {
    Home = '/',
    Following = '/following',
    Notifications = '/notifications',
    Profile = '/profile',
    Bookmarks = '/bookmarks',
    Settings = '/settings',
    Developers = '/developers',
    Search = '/search',
}

export enum Source {
    Farcaster = 'Farcaster',
    Lens = 'Lens',
    Twitter = 'Twitter',
    Firefly = 'Firefly',
    Article = 'Article',
    Wallet = 'Wallet',
    NFTs = 'NFTs',
}

export enum SourceInURL {
    Farcaster = 'farcaster',
    Lens = 'lens',
    Twitter = 'twitter',
    Firefly = 'firefly',
    Article = 'article',
    Wallet = 'wallet',
    NFTs = 'nfts',
}

export type SocialSource = Source.Farcaster | Source.Lens | Source.Twitter;
export type ProfileSource = Source.Farcaster | Source.Lens | Source.Twitter | Source.Firefly;
export type SocialSourceInURL = SourceInURL.Farcaster | SourceInURL.Lens | SourceInURL.Twitter;

export enum DiscoverType {
    ForYou = 'for-you',
    Recent = 'recent',
    Trending = 'trending',
    TopProfiles = 'top-profiles',
    TopChannels = 'top-channels',
}

export enum SearchType {
    Profiles = 'users',
    Posts = 'posts',
    Channels = 'channels',
}

export enum KeyType {
    DigestOpenGraphLink = 'digestOpenGraphLink',
    DigestFrameLink = 'digestFrameLink',
    GetPostOGById = 'getPostOGById',
    GetArticleOGById = 'getArticleOGById',
    GetProfileOGById = 'getProfileOGById',
    GetChannelOGById = 'getChannelOGById',
    GetLensThreadByPostId = 'getLensThreadByPostId',
    RefreshLensThreadLock = 'RefreshLensThreadLock',
    GetFollowings = 'getFollowings',
    ConsumerSecret = 'consumerSecret',
    GetBlink = 'getBlink',
}

export type TrendingUserSource = Source.Farcaster | Source.Lens;

export enum ProfileTabType {
    Feed = 'feed',
    Replies = 'replies',
    Liked = 'liked',
    Media = 'media',
    Collected = 'collected',
    Channels = 'channels',
}

export enum WalletProfileTabType {
    Articles = 'articles',
    POAPs = 'poaps',
    NFTs = 'nfts',
    OnChainActivities = 'on_chain_activities',
}

export enum EngagementType {
    Mirrors = 'mirrors',
    Quotes = 'quotes',
    Recasts = 'recasts',
    Likes = 'likes',
}

export enum RestrictionType {
    Everyone = 0,
    OnlyPeopleYouFollow = 1,
    MentionedProfiles = 2,
}

export enum ScrollListKey {
    Discover = 'discover-list',
    ForYou = 'for-you',
    Recent = 'recent',
    Following = 'following-list',
    Followers = 'followers-list',
    MutualFollowers = 'mutual-followers-list',
    Notification = 'notification-list',
    Search = 'search-list',
    Comment = 'comment-list',
    Channel = 'channel-post-list',
    Profile = 'profile-list',
    Bookmark = 'bookmark',
    Collected = 'profile-collected-list',
    Engagement = 'post-engagement',
    NFTList = 'nft-list',
    TopCollectors = 'top-collectors',
    SuggestedUsers = 'suggested-users',
    SchedulePosts = 'schedule-posts',
}

export enum FarcasterSignType {
    // connect with warpcast
    GrantPermission = 'grant_permission',
    // reconnect with firefly
    RelayService = 'relay_service',
    // recovery phrase
    RecoveryPhrase = 'recovery_phrase',
}
export enum BookmarkType {
    All = 'all',
    Text = 'text',
    Video = 'video',
    Audio = 'audio',
    Image = 'image',
}

export { SourceInURL as FireflyPlatform };

export enum MuteMenuId {
    FarcasterProfiles = '1',
    FarcasterChannels = '2',
    LensProfiles = '3',
    XProfiles = '4',
}

export enum NetworkType {
    Ethereum = 'ethereum',
    Solana = 'solana',
}

export enum CryptoUsage {
    Encrypt = 'encrypt',
    Decrypt = 'decrypt',
}

export const enum FollowCategory {
    Following = 'following',
    Followers = 'followers',
    Mutuals = 'mutuals',
}

export enum ChannelTabType {
    Trending = 'trending',
    Recent = 'recent',
}

// async store needs to sync data from the server
export enum AsyncStoreStatus {
    Idle = 'idle',
    Pending = 'pending',
}
