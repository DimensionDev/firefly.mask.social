export enum PageRoute {
    Home = '/',
    Following = '/following',
    Notifications = '/notifications',
    Profile = '/profile',
    Settings = '/settings',
    Developers = '/developers',
    Search = '/search',
}

export enum SocialPlatform {
    Farcaster = 'Farcaster',
    Lens = 'Lens',
}

export enum SourceInURL {
    Farcaster = 'farcaster',
    Lens = 'lens',
}

export enum SearchType {
    Users = 'users',
    Posts = 'posts',
}

export enum KeyType {
    DigestOpenGraphLink = 'digestOpenGraphLink',
    DigestFrameLink = 'digestFrameLink',
    GetPostOGById = 'getPostOGById',
    GetProfileOGById = 'getProfileOGById',
    UploadToBlob = 'uploadToBlob',
    GetLensThreadByPostId = 'getLensThreadByPostId',
}
