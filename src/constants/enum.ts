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
    Profile = 'profile-post-list',
    Bookmark = 'bookmark',
    Collected = 'profile-collected-list',
    Engagement = 'post-engagement',
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

// Learn more supported languages here:
// https://api.cognitive.microsofttranslator.com/languages?api-version=3.0
export enum Language {
    Afrikaans = 'af',
    Amharic = 'am',
    Arabic = 'ar',
    Assamese = 'as',
    Azerbaijani = 'az',
    Bashkir = 'ba',
    Bulgarian = 'bg',
    Bhojpuri = 'bho',
    Bangla = 'bn',
    Tibetan = 'bo',
    Bodo = 'brx',
    Bosnian = 'bs',
    Catalan = 'ca',
    Czech = 'cs',
    Welsh = 'cy',
    Danish = 'da',
    German = 'de',
    Dogri = 'doi',
    Lower_Sorbian = 'dsb',
    Divehi = 'dv',
    Greek = 'el',
    English = 'en',
    Spanish = 'es',
    Estonian = 'et',
    Basque = 'eu',
    Persian = 'fa',
    Finnish = 'fi',
    Filipino = 'fil',
    Fijian = 'fj',
    Faroese = 'fo',
    French = 'fr',
    French_Canada = 'fr-CA',
    Irish = 'ga',
    Galician = 'gl',
    Konkani = 'gom',
    Gujarati = 'gu',
    Hausa = 'ha',
    Hebrew = 'he',
    Hindi = 'hi',
    Croatian = 'hr',
    Upper_Sorbian = 'hsb',
    Haitian_Creole = 'ht',
    Hungarian = 'hu',
    Armenian = 'hy',
    Indonesian = 'id',
    Igbo = 'ig',
    Inuinnaqtun = 'ikt',
    Icelandic = 'is',
    Italian = 'it',
    Inuktitut = 'iu',
    Inuktitut_Latin = 'iu-Latn',
    Japanese = 'ja',
    Georgian = 'ka',
    Kazakh = 'kk',
    Khmer = 'km',
    Kurdish_Northern = 'kmr',
    Kannada = 'kn',
    Korean = 'ko',
    Kashmiri = 'ks',
    Kurdish_Central = 'ku',
    Kyrgyz = 'ky',
    Lingala = 'ln',
    Lao = 'lo',
    Lithuanian = 'lt',
    Ganda = 'lug',
    Latvian = 'lv',
    Chinese_Literary = 'lzh',
    Maithili = 'mai',
    Malagasy = 'mg',
    Māori = 'mi',
    Macedonian = 'mk',
    Malayalam = 'ml',
    Mongolian_Cyrillic = 'mn-Cyrl',
    Mongolian_Traditional = 'mn-Mong',
    Marathi = 'mr',
    Malay = 'ms',
    Maltese = 'mt',
    Hmong_Daw = 'mww',
    Myanmar_Burmese = 'my',
    Norwegian = 'nb',
    Nepali = 'ne',
    Dutch = 'nl',
    Sesotho_sa_Leboa = 'nso',
    Nyanja = 'nya',
    Odia = 'or',
    Querétaro_Otomi = 'otq',
    Punjabi = 'pa',
    Polish = 'pl',
    Dari = 'prs',
    Pashto = 'ps',
    Portuguese_Brazil = 'pt',
    Portuguese_Portugal = 'pt-PT',
    Romanian = 'ro',
    Russian = 'ru',
    Rundi = 'run',
    Kinyarwanda = 'rw',
    Sindhi = 'sd',
    Sinhala = 'si',
    Slovak = 'sk',
    Slovenian = 'sl',
    Samoan = 'sm',
    Shona = 'sn',
    Somali = 'so',
    Albanian = 'sq',
    Serbian_Cyrillic = 'sr-Cyrl',
    Serbian_Latin = 'sr-Latn',
    Sesotho = 'st',
    Swedish = 'sv',
    Swahili = 'sw',
    Tamil = 'ta',
    Telugu = 'te',
    Thai = 'th',
    Tigrinya = 'ti',
    Turkmen = 'tk',
    Klingon_Latin = 'tlh-Latn',
    Klingon_pIqaD = 'tlh-Piqd',
    Setswana = 'tn',
    Tongan = 'to',
    Turkish = 'tr',
    Tatar = 'tt',
    Tahitian = 'ty',
    Uyghur = 'ug',
    Ukrainian = 'uk',
    Urdu = 'ur',
    Uzbek_Latin = 'uz',
    Vietnamese = 'vi',
    Xhosa = 'xh',
    Yoruba = 'yo',
    Yucatec_Maya = 'yua',
    Cantonese_Traditional = 'yue',
    Chinese_Simplified = 'zh-Hans',
    Chinese_Traditional = 'zh-Hant',
    Zulu = 'zu',
}
