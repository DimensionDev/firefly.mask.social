import type { FungibleToken } from '@masknet/web3-shared-base';
import type { ChainId,SchemaType } from '@masknet/web3-shared-evm';
import type { BigNumber } from 'bignumber.js';

type WithoutChainId<T> = Omit<T, 'chain_id'>;
type WithNumberChainId<T> = WithoutChainId<T> & { chain_id: number };

// #region erc20 red packet
export interface RedPacketRecord {
    id: string;
    /** From twitter/facebook url */
    from: string;
    password?: string;
    contract_version: number;
}

export interface RedPacketRecordInDatabase extends RedPacketRecord {
    /** An unique record type in DB */
    type: 'red-packet';
}

export enum RedPacketStatus {
    claimed = 'claimed',
    expired = 'expired',
    empty = 'empty',
    refunded = 'refunded',
}

interface RedPacketBasic {
    contract_address: string;
    rpid: string;
    txid: string;
    /** RedPacket created via Firefly app omits the password field */
    password?: string;
    shares: number;
    is_random: boolean;
    total: string;
    creation_time: number;
    duration: number;
    block_number?: number;
}

export interface RedPacketJSONPayload extends RedPacketBasic {
    contract_version: number;
    sender: {
        address: string;
        name: string;
        message: string;
    };
    chainId?: ChainId;
    network?: string;
    token?: FungibleToken<ChainId, SchemaType>;
    /**
     * For contract_version === 1, payload has no token but token_type
     */
    token_type?: 0 | number;
    total_remaining?: string;
}

export interface RedPacketJSONPayloadFromChain extends Omit<RedPacketJSONPayload, 'token'> {
    token_address: string;
}

export interface RedpacketAvailability {
    token_address: string;
    balance: string;
    total: number;
    claimed: number;
    expired: boolean;
    claimed_amount: string;
}
// #endregion

export type CreateRedpacketParam = {
    _duration: BigNumber;
    _ifrandom: boolean;
    _message: string;
    _name: string;
    _number: BigNumber;
    _public_key: string;
    _seed: string;
    _token_addr: string;
    _token_type: BigNumber;
    _total_tokens: BigNumber;
};

export namespace FireflyRedPacketAPI {
    export enum PlatformType {
        lens = 'lens',
        farcaster = 'farcaster',
        twitter = 'twitter',
    }

    export enum ActionType {
        Send = 'send',
        Claim = 'claim',
    }

    export enum SourceType {
        All = 'all',
        FireflyAPP = 'firefly_app',
        FireflyPC = 'firefly_pc',
        MaskNetwork = 'mask_network',
    }

    export enum RedPacketStatus {
        View = 'VIEW',
        Refunding = 'REFUNDING',
        Refund = 'REFUND',
        Expired = 'EXPIRED',
        Empty = 'EMPTY',
        Send = 'SEND',
    }

    export enum StrategyType {
        profileFollow = 'profileFollow',
        postReaction = 'postReaction',
        nftOwned = 'nftOwned',
    }

    export interface StrategyPayload {
        type: StrategyType;
        payload: Array<ProfileFollowStrategyPayload | NftOwnedStrategyPayload> | PostReactionStrategyPayload;
    }

    export interface ProfileFollowStrategyPayload {
        platform: PlatformType;
        profileId: string;
        /**
         * Depends on the platform which created the redpacket
         * for example, Firefly APP doesn't provide it, but Firefly Web does
         */
        handle?: string;
    }

    export interface PostReactionStrategyPayload {
        params?: Array<{
            platform: PlatformType;
            postId: string;
            handle?: string;
        }>;
        reactions: string[];
    }

    export interface NftOwnedStrategyPayload {
        chainId: number;
        contractAddress: string;
    }

    export interface PostReaction {
        platform: PlatformType;
        postId: string;
    }

    export interface ProfileReaction {
        platform: PlatformType;
        profileId: string;
        lensToken?: string;
        farcasterSignature?: HexString;
        farcasterSigner?: HexString;
        farcasterMessage?: HexString;
    }

    export interface PostOn {
        platform: PlatformType;
        postId: string;
        handle: string;
    }

    export interface ClaimPlatform {
        platformName: PlatformType;
        platformId: string;
    }

    export interface RedPacketSentInfoItem {
        create_time: number;
        total_numbers: string;
        total_amounts: string;
        rp_msg: string;
        claim_numbers: string;
        claim_amounts: string;
        token_symbol: string;
        token_decimal: number;
        token_logo: string;
        redpacket_id: HexString;
        trans_hash: HexString;
        log_idx: number;
        chain_id: string;
        redpacket_status: RedPacketStatus;
        claim_strategy: StrategyPayload[];
        theme_id: string;
        share_from: string;
    }

    export interface RedPacketClaimedInfoItem {
        redpacket_id: HexString;
        received_time: string;
        rp_msg: string;
        token_amounts: string;
        token_symbol: string;
        token_decimal: number;
        token_logo: string;
        trans_hash: HexString;
        log_idx: string;
        creator: HexString;
        chain_id: string;
        redpacket_status: RedPacketStatus;
        ens_name: string;
    }

    export interface RedPacketClaimedInfo extends WithNumberChainId<RedPacketClaimedInfoItem> {}
    export interface RedPacketSentInfo extends WithNumberChainId<RedPacketSentInfoItem> {}
    export interface RedPacketClaimListInfo extends WithNumberChainId<RedPacketClaimListInfoItem> {}

    export interface ClaimList {
        creator: string;
        claim_platform: Platform[];
        token_amounts: string;
        token_symbol: string;
        token_decimal: number;
    }

    export interface Platform {
        platformName: PlatformType;
        platformId: string;
        platform_handle: string;
    }

    export interface RedPacketClaimListInfoItem {
        list: ClaimList[];
        creator: string;
        create_time: number;
        rp_msg: string;
        claim_numbers: string;
        claim_amounts: string;
        total_numbers: string;
        total_amounts: string;
        token_symbol: string;
        token_decimal: number;
        token_logo: string;
        chain_id: string;
        cursor: string;
        size: string;
        ens_name: string;
    }

    export interface Theme {
        themeId: string;
        payloadUrl: string;
        coverUrl: string;
    }

    export type ThemeSettings = {
        [key in 'title1' | 'title2' | 'title3' | 'title4' | 'title_symbol']: {
            color: '#F1D590';
            font_size: 55;
            font_family: 'Helvetica';
            font_weight: 700;
            line_height: 63.25;
        };
    } & {
        bg_color: string;
        bg_image: string;
        logo_image: string;
    };

    export interface ThemeGroupSettings {
        /** theme id */
        tid: string;
        cover: ThemeSettings;
        normal: ThemeSettings;
        /** Redpacket without theme settings preset, current ones are default */
        is_default?: boolean;
    }

    export interface Response<T> {
        code: number;
        data: T;
    }

    export type PublicKeyResponse = Response<{
        publicKey: HexString;
    }>;

    export type ClaimResponse = Response<{
        signedMessage: HexString;
    }>;

    export type HistoryResponse = Response<{
        cursor: number;
        size: number;
        list: RedPacketSentInfo[] | RedPacketClaimedInfo[];
    }>;

    export type ClaimHistoryResponse = Response<RedPacketClaimListInfo>;

    export interface ParseOptions {
        text?: string;
        image?: {
            imageUrl: string;
        };
        walletAddress?: string;
        platform?: PlatformType;
        profileId?: string;
    }
    export interface ParseResult {
        content: string;
        /** only `text` for now */
        type: string;
        /** only 1 for now */
        version: number;
        serializable: true;
        meta: object;
        redpacket: {
            /** the same as meta */
            payload: object;
            canClaim: boolean;
            canRefund: boolean;
            canSend: boolean;
            isPasswordValid: boolean;
            isClaimed: boolean;
            isEmpty: boolean;
            isExpired: boolean;
            isRefunded: boolean;
            claimedNumber: number;
            claimedAmount: string;
        } | null;
    }
    export type ParseResponse = Response<ParseResult>;

    export type CheckClaimStrategyStatusOptions = {
        rpid: string;
        profile: {
            needLensAndFarcasterHandle?: boolean;
            platform: PlatformType;
            profileId?: string;
            lensToken?: string;
            farcasterSignature?: HexString;
            farcasterSigner?: HexString;
            farcasterMessage?: HexString;
        };
        wallet: {
            address: string;
        };
    };
    export type PostReactionKind = 'like' | 'repost' | 'quote' | 'comment' | 'collect';
    export type ClaimStrategyStatus =
        | {
              type: 'profileFollow';
              payload: Array<{ platform: PlatformType; profileId: string; handle: string }>;
              result: boolean;
          }
        | {
              type: 'nftOwned';
              payload: Array<{
                  chainId: number;
                  contractAddress: HexString;
                  collectionName: string;
              }>;
              result: boolean;
          }
        | {
              type: 'postReaction';
              payload: {
                  reactions: PostReactionKind[];
                  params: Array<
                      [
                          {
                              platform: PlatformType;
                              postId: string;
                          },
                      ]
                  >;
              };
              result: {
                  conditions: Array<{ key: PostReactionKind; value: boolean }>;
                  hasPassed: boolean;
              };
          };
    export type CheckClaimStrategyStatusResponse = Response<{
        claimStrategyStatus: ClaimStrategyStatus[];
        canClaim: boolean;
    }>;

    export type ThemeListResponse = Response<{
        list: ThemeGroupSettings[];
    }>;

    export type ThemeByIdResponse = Response<ThemeGroupSettings>;
}
