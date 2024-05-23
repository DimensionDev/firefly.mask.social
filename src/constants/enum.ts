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

export enum PageRoute {
    Home = '/',
    Following = '/following',
    Notifications = '/notifications',
    Profile = '/profile',
    Bookmarks = '/bookmarks',
    Settings = '/settings',
    Developers = '/developers',
    Search = '/search',
    ChannelTrending = '/trending',
}

export enum Source {
    Farcaster = 'Farcaster',
    Lens = 'Lens',
    Twitter = 'Twitter',
    Article = 'Article',
    Wallet = 'Wallet',
}

export enum SourceInURL {
    Farcaster = 'farcaster',
    Lens = 'lens',
    Twitter = 'twitter',
    Article = 'article',
    Wallet = 'wallet',
}

export type SocialSource = Source.Farcaster | Source.Lens | Source.Twitter;
export type SocialSourceInURL = SourceInURL.Farcaster | SourceInURL.Lens | SourceInURL.Twitter;

export enum SearchType {
    Users = 'users',
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
    UploadToBlob = 'uploadToBlob',
    GetLensThreadByPostId = 'getLensThreadByPostId',
    RefreshLensThreadLock = 'RefreshLensThreadLock',
    GetFollowings = 'getFollowings',
}

export enum ProfileTabType {
    Feed = 'Feed',
    Replies = 'Replies',
    Liked = 'Liked',
    Media = 'Media',
    Collected = 'Collected',
    Channels = 'Channels',
}

export enum WalletProfileTabType {
    Articles = 'Articles',
    POAPs = 'POAPs',
    NFTs = 'NFTs',
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
    MentionedUsers = 2,
}

export enum ScrollListKey {
    Discover = 'discover-list',
    Following = 'following-list',
    Followers = 'followers-list',
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
}

export enum FarcasterSignType {
    // connect with warpcast
    GrantPermission = 'grant_permission',
    // reconnect with firefly
    RelayService = 'relay_service',
    // recovery phrase
    RecoveryPhrase = 'recovery_phrase',
    // custody wallet
    CustodyWallet = 'custody_wallet',
}
export enum BookmarkType {
    All = 'all',
    Text = 'text',
    Video = 'video',
    Audio = 'audio',
    Image = 'image',
}

export { SourceInURL as FireflyPlatform };
