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
    PostDetail = '/post/:source/:id',
    Events = '/events',
    ConnectWallet = '/connect-wallet',
}

export enum Source {
    Farcaster = 'Farcaster',
    Lens = 'Lens',
    Twitter = 'Twitter',
    Firefly = 'Firefly',
    Article = 'Article',
    Wallet = 'Wallet',
    NFTs = 'NFTs',
    Snapshot = 'Snapshot',
}

export enum SourceInURL {
    Farcaster = 'farcaster',
    Lens = 'lens',
    Twitter = 'twitter',
    Firefly = 'firefly',
    Article = 'article',
    Wallet = 'wallet',
    NFTs = 'nfts',
    Snapshot = 'snapshot',
}

export type SocialSource = Source.Farcaster | Source.Lens | Source.Twitter;
export type ProfileSource = Source.Farcaster | Source.Lens | Source.Twitter | Source.Firefly;
export type ProfilePageSource = Source.Farcaster | Source.Lens | Source.Twitter | Source.Wallet;
export type SocialSourceInURL = SourceInURL.Farcaster | SourceInURL.Lens | SourceInURL.Twitter;
export type SocialDiscoverSource = Source.Farcaster | Source.Lens;
export type DiscoverSource = SocialDiscoverSource | Source.NFTs | Source.Article | Source.Snapshot;
export type BookmarkSource = Source.Farcaster | Source.Lens | Source.Article | Source.Snapshot;

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
    DigestOpenGraphLink = '/v2/digestOpenGraphLink',
    DigestFrameLink = '/v2/digestFrameLink',
    GetLensThreadByPostId = '/v2/getLensThreadByPostId',
    RefreshLensThreadLock = '/v2/RefreshLensThreadLock',
    GetFollowings = '/v2/getFollowings',
    ConsumerSecret = '/v2/consumerSecret',
    GetBlink = '/v2/getBlink',

    CreateMetadataToken = '/v2/createMetadataToken',
    CreateMetadataPostById = '/v2/createPageMetadataById',
    CreateMetadataArticleById = '/v2/createMetadataArticleById',
    CreateMetadataProfileById = '/v2/createMetadataProfileById',
    CreateMetadataChannelById = '/v2/createMetadataChannelById',
    CreateMetadataEvent = '/v2/createMetadataEvent',
}

export enum SocialProfileCategory {
    Feed = 'feed',
    Replies = 'replies',
    Likes = 'likes',
    Media = 'media',
    Collected = 'collected',
    Channels = 'channels',
}

export enum WalletProfileCategory {
    Articles = 'articles',
    POAPs = 'poaps',
    NFTs = 'nfts',
    Activities = 'activities',
    DAO = 'DAO',
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
    SnapshotVotes = 'snapshot-votes',
    Activity = 'activity',
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

export enum MuteType {
    Profile = 'profile',
    Channel = 'channel',
    Wallet = 'wallet',
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

export type ProfileCategory = FollowCategory | SocialProfileCategory | WalletProfileCategory;

export enum ChannelTabType {
    Trending = 'trending',
    Recent = 'recent',
}

// async store needs to sync data from the server
export enum AsyncStatus {
    Idle = 'idle',
    Pending = 'pending',
}

export enum GiphyTabType {
    Gifs = 'gifs',
    Stickers = 'stickers',
    Text = 'text',
    Emoji = 'emoji',
}

export enum WalletSource {
    Farcaster = 'farcaster',
    Lens = 'lens',
    Twitter = 'twitter',
    Firefly = 'firefly',
    Article = 'article',
    Wallet = 'wallet',
    NFTs = 'nfts',
    LensContract = 'lens_contract',
    Particle = 'particle',
}

export enum AdvertisementType {
    Link = 'link',
    Function = 'function',
}

export enum AdFunctionType {
    OpenScan = 'openScan',
    OpenActivity = 'openActivity',
}

export enum UploadMediaStatus {
    Pending = 'pending',
    Uploading = 'in_progress',
    Success = 'succeeded',
    Failed = 'failed',
}

export enum FileMimeType {
    JPEG = 'image/jpeg',
    MP4 = 'video/mp4',
    MOV = 'video/quicktime',
    GIF = 'image/gif',
    PNG = 'image/png',
    WEBP = 'image/webp',
    BMP = 'image/bmp',
    MPEG = 'video/mpeg',
    // cspell: disable-next-line
    MS_VIDEO = 'video/x-msvideo',
    OGG = 'video/ogg',
    WEBM = 'video/webm',
    GPP = 'video/3gpp',
    GPP2 = 'video/3gpp2',
}

export enum FrameProtocol {
    OpenFrame = 'of',
    Farcaster = 'fc',
}

export enum S3ConvertStatus {
    Submitted = 'SUBMITTED',
    Progressing = 'PROGRESSING',
    Complete = 'COMPLETE',
    Canceled = 'CANCELED',
    Error = 'ERROR',
    StatusUpdate = 'STATUS_UPDATE',
}

export enum SimulateStatus {
    Pending = 'pending',
    Unverified = 'unverified',
    Unsafe = 'unsafe',
    Success = 'success',
    Error = 'error',
}

export enum SimulateType {
    Swap = 'swap',
    Send = 'send',
    Approve = 'approve',
    Receive = 'receive',
    Signature = 'signature',
    Unknown = 'unknown',
}

export enum ExternalSiteDomain {
    Warpcast = 'warpcast.com',
}

export enum LinkDigestType {
    Snapshot = 'snapshot',
}

export enum SnapshotState {
    Active = 'active',
    Closed = 'closed',
    Pending = 'pending',
}
