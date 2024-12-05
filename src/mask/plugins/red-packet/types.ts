import type { ChainId } from '@masknet/web3-shared-evm';

export enum NFTSelectOption {
    All = 'All',
    Partial = 'Partial',
}

export enum RequirementType {
    Follow = 'Follow',
    Like = 'Like',
    Repost = 'Repost',
    Comment = 'Comment',
    TokenHolder = 'TokenHolder',
    NFTHolder = 'NFTHolder',
    FarcasterChannelMember = 'FarcasterChannelMember',
    LensClubMember = 'LensClubMember',
}

export type FireflyRedpacketSettings = {
    requirements: RequirementType[];
    nftHolderContract?: string;
    nftCollectionName?: string;
    nftChainId?: ChainId;
};

export type FireflySocialProfile = {
    profileId: string;
    displayName: string;
    handle: string;
    fullHandle: string;
    pfp: string;
    address?: string;
    ownedBy?: string;
};

export interface FireflyContext {
    currentLensProfile?: FireflySocialProfile | null;
    currentFarcasterProfile?: FireflySocialProfile | null;
    currentTwitterProfile?: FireflySocialProfile | null;
}

export enum FireflyAccountSource {
    Lens = 'Lens',
    Farcaster = 'Farcaster',
    Wallet = 'Wallet',
}
