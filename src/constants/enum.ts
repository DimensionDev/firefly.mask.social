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
    Twitter = 'Twitter',
}

export enum SourceInURL {
    Farcaster = 'farcaster',
    Lens = 'lens',
    Twitter = 'twitter',
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
    GetChannelOGById = 'getChannelOGById',
    UploadToBlob = 'uploadToBlob',
    GetLensThreadByPostId = 'getLensThreadByPostId',
    RefreshLensThreadLock = 'RefreshLensThreadLock',
}

export enum ScrollListKey {
    Discover = 'discover-list',
    Following = 'following-list',
    Notification = 'notification-list',
    Search = 'search-list',
    Comment = 'comment-list',
    Profile = 'profile-post-list',
    Collected = 'profile-collected-list',
}
