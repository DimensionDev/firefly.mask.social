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
}

export type TrendingUserSource = Source.Farcaster | Source.Lens;

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
    OnChainActivities = 'OnChainActivities',
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
    SuggestedUsers = 'suggested-users',
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

export enum SUPPORTED_EVM_CHAIN_IDS {
    // Mainnet
    Mainnet = 1,
    Ropsten = 3,
    Rinkeby = 4,
    Gorli = 5,
    Kovan = 42,

    // Base
    Base = 8453,
    Base_Goerli = 84531,

    // BSC
    BSC = 56,
    BSCT = 97,

    // Matic
    Matic = 137,
    Mumbai = 80001,

    // Arbitrum
    Arbitrum = 42161,
    Arbitrum_Rinkeby = 421611,
    Arbitrum_Nova = 42170,

    // xDai
    xDai = 100,

    // Avalanche
    Avalanche = 43114,
    Avalanche_Fuji = 43113,

    // Celo
    Celo = 42220,

    // Fantom
    Fantom = 250,

    // Aurora
    Aurora = 1313161554,
    Aurora_Testnet = 1313161555,

    // Fuse
    Fuse = 122,

    // Boba
    Boba = 288,

    // Metis
    Metis = 1088,
    Metis_Sepolia = 59902,

    // Optimism
    Optimism = 10,
    Optimism_Kovan = 69,
    Optimism_Goerli = 420,

    // Conflux
    Conflux = 1030,

    // Astar
    Astar = 592,

    Scroll = 534352,

    ZKSync_Alpha_Testnet = 280,

    Crossbell = 3737,

    Moonbeam = 1284,

    Pulse = 369,

    Klaytn = 8217,

    Harmony = 1666600000,

    Moonriver = 1285,

    Cronos = 25,

    Brise = 32520,

    Canto = 7700,

    DFK = 53935,

    Doge = 2000,

    Evmos = 9001,

    HuobiEco = 128,

    IoTex = 4689,

    Kava = 2222,

    Kcc = 321,

    Milkomeda = 2001,

    OKXChain = 66,

    Palm = 11297108109,

    RSK = 30,

    SmartBitcoinCash = 10000,

    Shiden = 336,

    SongbirdCanary = 19,

    Step = 1234,

    Telos = 40,

    Wanchain = 888,

    XLayer = 196,
    XLayer_Testnet = 195,

    /** BitTorrent Chain Mainnet */
    BitTorrent = 199,

    // For any chains not supported yet.
    Invalid = 0,

    Zora = 7777777,

    ZkSyncEra = 324,

    Linea = 59144,
};

export enum SUPPORTED_SOLANA_CHAIN_IDS {
    Mainnet = 101,
    Testnet = 102,
    Devnet = 103,
}
