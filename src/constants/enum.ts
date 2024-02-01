export enum PageRoutes {
    Home = '/',
    Following = '/following',
    Notifications = '/notifications',
    Profile = '/profile',
    Settings = '/settings',
    Search = '/search',
}

export enum SocialPlatform {
    Lens = 'Lens',
    Farcaster = 'Farcaster',
}

export enum SearchType {
    Profiles = 'profiles',
    Posts = 'posts',
}

export enum KeyType {
    DigestOpenGraphLink = 'digestOpenGraphLink',
    DigestFrameLink = 'digestFrameLink',
    GetPostOGById = 'getPostOGById',
    GetProfileOGById = 'getProfileOGById',
    UploadToBlob = 'uploadToBlob',
}
