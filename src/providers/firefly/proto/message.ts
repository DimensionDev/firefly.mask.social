/* eslint-disable */
import * as _m0 from 'protobufjs/minimal';
import Long = require('long');

export const protobufPackage = '';

/** Type of hashing scheme used to produce a digest of MessageData */
export enum HashScheme {
    HASH_SCHEME_NONE = 0,
    /** HASH_SCHEME_BLAKE3 - Default scheme for hashing MessageData */
    HASH_SCHEME_BLAKE3 = 1,
    UNRECOGNIZED = -1,
}

export function hashSchemeFromJSON(object: any): HashScheme {
    switch (object) {
        case 0:
        case 'HASH_SCHEME_NONE':
            return HashScheme.HASH_SCHEME_NONE;
        case 1:
        case 'HASH_SCHEME_BLAKE3':
            return HashScheme.HASH_SCHEME_BLAKE3;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return HashScheme.UNRECOGNIZED;
    }
}

export function hashSchemeToJSON(object: HashScheme): string {
    switch (object) {
        case HashScheme.HASH_SCHEME_NONE:
            return 'HASH_SCHEME_NONE';
        case HashScheme.HASH_SCHEME_BLAKE3:
            return 'HASH_SCHEME_BLAKE3';
        case HashScheme.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}

/** Type of signature scheme used to sign the Message hash */
export enum SignatureScheme {
    SIGNATURE_SCHEME_NONE = 0,
    /** SIGNATURE_SCHEME_ED25519 - Ed25519 signature (default) */
    SIGNATURE_SCHEME_ED25519 = 1,
    /** SIGNATURE_SCHEME_EIP712 - ECDSA signature using EIP-712 scheme */
    SIGNATURE_SCHEME_EIP712 = 2,
    UNRECOGNIZED = -1,
}

export function signatureSchemeFromJSON(object: any): SignatureScheme {
    switch (object) {
        case 0:
        case 'SIGNATURE_SCHEME_NONE':
            return SignatureScheme.SIGNATURE_SCHEME_NONE;
        case 1:
        case 'SIGNATURE_SCHEME_ED25519':
            return SignatureScheme.SIGNATURE_SCHEME_ED25519;
        case 2:
        case 'SIGNATURE_SCHEME_EIP712':
            return SignatureScheme.SIGNATURE_SCHEME_EIP712;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return SignatureScheme.UNRECOGNIZED;
    }
}

export function signatureSchemeToJSON(object: SignatureScheme): string {
    switch (object) {
        case SignatureScheme.SIGNATURE_SCHEME_NONE:
            return 'SIGNATURE_SCHEME_NONE';
        case SignatureScheme.SIGNATURE_SCHEME_ED25519:
            return 'SIGNATURE_SCHEME_ED25519';
        case SignatureScheme.SIGNATURE_SCHEME_EIP712:
            return 'SIGNATURE_SCHEME_EIP712';
        case SignatureScheme.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}

/** Type of the MessageBody */
export enum MessageType {
    MESSAGE_TYPE_NONE = 0,
    /** MESSAGE_TYPE_CAST_ADD - Add a new Cast */
    MESSAGE_TYPE_CAST_ADD = 1,
    /** MESSAGE_TYPE_CAST_REMOVE - Remove an existing Cast */
    MESSAGE_TYPE_CAST_REMOVE = 2,
    /** MESSAGE_TYPE_REACTION_ADD - Add a Reaction to a Cast */
    MESSAGE_TYPE_REACTION_ADD = 3,
    /** MESSAGE_TYPE_REACTION_REMOVE - Remove a Reaction from a Cast */
    MESSAGE_TYPE_REACTION_REMOVE = 4,
    /** MESSAGE_TYPE_LINK_ADD - Add a new Link */
    MESSAGE_TYPE_LINK_ADD = 5,
    /** MESSAGE_TYPE_LINK_REMOVE - Remove an existing Link */
    MESSAGE_TYPE_LINK_REMOVE = 6,
    /** MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS - Add a Verification of an Ethereum Address */
    MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS = 7,
    /** MESSAGE_TYPE_VERIFICATION_REMOVE - Remove a Verification */
    MESSAGE_TYPE_VERIFICATION_REMOVE = 8,
    /**
     * MESSAGE_TYPE_USER_DATA_ADD - Deprecated
     *  MESSAGE_TYPE_SIGNER_ADD = 9; // Add a new Ed25519 key pair that signs messages for a user
     *  MESSAGE_TYPE_SIGNER_REMOVE = 10; // Remove an Ed25519 key pair that signs messages for a user
     */
    MESSAGE_TYPE_USER_DATA_ADD = 11,
    /** MESSAGE_TYPE_USERNAME_PROOF - Add or replace a username proof */
    MESSAGE_TYPE_USERNAME_PROOF = 12,
    UNRECOGNIZED = -1,
}

export function messageTypeFromJSON(object: any): MessageType {
    switch (object) {
        case 0:
        case 'MESSAGE_TYPE_NONE':
            return MessageType.MESSAGE_TYPE_NONE;
        case 1:
        case 'MESSAGE_TYPE_CAST_ADD':
            return MessageType.MESSAGE_TYPE_CAST_ADD;
        case 2:
        case 'MESSAGE_TYPE_CAST_REMOVE':
            return MessageType.MESSAGE_TYPE_CAST_REMOVE;
        case 3:
        case 'MESSAGE_TYPE_REACTION_ADD':
            return MessageType.MESSAGE_TYPE_REACTION_ADD;
        case 4:
        case 'MESSAGE_TYPE_REACTION_REMOVE':
            return MessageType.MESSAGE_TYPE_REACTION_REMOVE;
        case 5:
        case 'MESSAGE_TYPE_LINK_ADD':
            return MessageType.MESSAGE_TYPE_LINK_ADD;
        case 6:
        case 'MESSAGE_TYPE_LINK_REMOVE':
            return MessageType.MESSAGE_TYPE_LINK_REMOVE;
        case 7:
        case 'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS':
            return MessageType.MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS;
        case 8:
        case 'MESSAGE_TYPE_VERIFICATION_REMOVE':
            return MessageType.MESSAGE_TYPE_VERIFICATION_REMOVE;
        case 11:
        case 'MESSAGE_TYPE_USER_DATA_ADD':
            return MessageType.MESSAGE_TYPE_USER_DATA_ADD;
        case 12:
        case 'MESSAGE_TYPE_USERNAME_PROOF':
            return MessageType.MESSAGE_TYPE_USERNAME_PROOF;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return MessageType.UNRECOGNIZED;
    }
}

export function messageTypeToJSON(object: MessageType): string {
    switch (object) {
        case MessageType.MESSAGE_TYPE_NONE:
            return 'MESSAGE_TYPE_NONE';
        case MessageType.MESSAGE_TYPE_CAST_ADD:
            return 'MESSAGE_TYPE_CAST_ADD';
        case MessageType.MESSAGE_TYPE_CAST_REMOVE:
            return 'MESSAGE_TYPE_CAST_REMOVE';
        case MessageType.MESSAGE_TYPE_REACTION_ADD:
            return 'MESSAGE_TYPE_REACTION_ADD';
        case MessageType.MESSAGE_TYPE_REACTION_REMOVE:
            return 'MESSAGE_TYPE_REACTION_REMOVE';
        case MessageType.MESSAGE_TYPE_LINK_ADD:
            return 'MESSAGE_TYPE_LINK_ADD';
        case MessageType.MESSAGE_TYPE_LINK_REMOVE:
            return 'MESSAGE_TYPE_LINK_REMOVE';
        case MessageType.MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS:
            return 'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS';
        case MessageType.MESSAGE_TYPE_VERIFICATION_REMOVE:
            return 'MESSAGE_TYPE_VERIFICATION_REMOVE';
        case MessageType.MESSAGE_TYPE_USER_DATA_ADD:
            return 'MESSAGE_TYPE_USER_DATA_ADD';
        case MessageType.MESSAGE_TYPE_USERNAME_PROOF:
            return 'MESSAGE_TYPE_USERNAME_PROOF';
        case MessageType.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}

/** Farcaster network the message is intended for */
export enum FarcasterNetwork {
    FARCASTER_NETWORK_NONE = 0,
    /** FARCASTER_NETWORK_MAINNET - Public primary network */
    FARCASTER_NETWORK_MAINNET = 1,
    /** FARCASTER_NETWORK_TESTNET - Public test network */
    FARCASTER_NETWORK_TESTNET = 2,
    /** FARCASTER_NETWORK_DEVNET - Private test network */
    FARCASTER_NETWORK_DEVNET = 3,
    UNRECOGNIZED = -1,
}

export function farcasterNetworkFromJSON(object: any): FarcasterNetwork {
    switch (object) {
        case 0:
        case 'FARCASTER_NETWORK_NONE':
            return FarcasterNetwork.FARCASTER_NETWORK_NONE;
        case 1:
        case 'FARCASTER_NETWORK_MAINNET':
            return FarcasterNetwork.FARCASTER_NETWORK_MAINNET;
        case 2:
        case 'FARCASTER_NETWORK_TESTNET':
            return FarcasterNetwork.FARCASTER_NETWORK_TESTNET;
        case 3:
        case 'FARCASTER_NETWORK_DEVNET':
            return FarcasterNetwork.FARCASTER_NETWORK_DEVNET;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return FarcasterNetwork.UNRECOGNIZED;
    }
}

export function farcasterNetworkToJSON(object: FarcasterNetwork): string {
    switch (object) {
        case FarcasterNetwork.FARCASTER_NETWORK_NONE:
            return 'FARCASTER_NETWORK_NONE';
        case FarcasterNetwork.FARCASTER_NETWORK_MAINNET:
            return 'FARCASTER_NETWORK_MAINNET';
        case FarcasterNetwork.FARCASTER_NETWORK_TESTNET:
            return 'FARCASTER_NETWORK_TESTNET';
        case FarcasterNetwork.FARCASTER_NETWORK_DEVNET:
            return 'FARCASTER_NETWORK_DEVNET';
        case FarcasterNetwork.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}

/** Type of UserData */
export enum UserDataType {
    USER_DATA_TYPE_NONE = 0,
    /** USER_DATA_TYPE_PFP - Profile Picture for the user */
    USER_DATA_TYPE_PFP = 1,
    /** USER_DATA_TYPE_DISPLAY - Display Name for the user */
    USER_DATA_TYPE_DISPLAY = 2,
    /** USER_DATA_TYPE_BIO - Bio for the user */
    USER_DATA_TYPE_BIO = 3,
    /** USER_DATA_TYPE_URL - URL of the user */
    USER_DATA_TYPE_URL = 5,
    /** USER_DATA_TYPE_USERNAME - Preferred Name for the user */
    USER_DATA_TYPE_USERNAME = 6,
    UNRECOGNIZED = -1,
}

export function userDataTypeFromJSON(object: any): UserDataType {
    switch (object) {
        case 0:
        case 'USER_DATA_TYPE_NONE':
            return UserDataType.USER_DATA_TYPE_NONE;
        case 1:
        case 'USER_DATA_TYPE_PFP':
            return UserDataType.USER_DATA_TYPE_PFP;
        case 2:
        case 'USER_DATA_TYPE_DISPLAY':
            return UserDataType.USER_DATA_TYPE_DISPLAY;
        case 3:
        case 'USER_DATA_TYPE_BIO':
            return UserDataType.USER_DATA_TYPE_BIO;
        case 5:
        case 'USER_DATA_TYPE_URL':
            return UserDataType.USER_DATA_TYPE_URL;
        case 6:
        case 'USER_DATA_TYPE_USERNAME':
            return UserDataType.USER_DATA_TYPE_USERNAME;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return UserDataType.UNRECOGNIZED;
    }
}

export function userDataTypeToJSON(object: UserDataType): string {
    switch (object) {
        case UserDataType.USER_DATA_TYPE_NONE:
            return 'USER_DATA_TYPE_NONE';
        case UserDataType.USER_DATA_TYPE_PFP:
            return 'USER_DATA_TYPE_PFP';
        case UserDataType.USER_DATA_TYPE_DISPLAY:
            return 'USER_DATA_TYPE_DISPLAY';
        case UserDataType.USER_DATA_TYPE_BIO:
            return 'USER_DATA_TYPE_BIO';
        case UserDataType.USER_DATA_TYPE_URL:
            return 'USER_DATA_TYPE_URL';
        case UserDataType.USER_DATA_TYPE_USERNAME:
            return 'USER_DATA_TYPE_USERNAME';
        case UserDataType.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}

/** Type of Reaction */
export enum ReactionType {
    REACTION_TYPE_NONE = 0,
    /** REACTION_TYPE_LIKE - Like the target cast */
    REACTION_TYPE_LIKE = 1,
    /** REACTION_TYPE_RECAST - Share target cast to the user's audience */
    REACTION_TYPE_RECAST = 2,
    UNRECOGNIZED = -1,
}

export function reactionTypeFromJSON(object: any): ReactionType {
    switch (object) {
        case 0:
        case 'REACTION_TYPE_NONE':
            return ReactionType.REACTION_TYPE_NONE;
        case 1:
        case 'REACTION_TYPE_LIKE':
            return ReactionType.REACTION_TYPE_LIKE;
        case 2:
        case 'REACTION_TYPE_RECAST':
            return ReactionType.REACTION_TYPE_RECAST;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return ReactionType.UNRECOGNIZED;
    }
}

export function reactionTypeToJSON(object: ReactionType): string {
    switch (object) {
        case ReactionType.REACTION_TYPE_NONE:
            return 'REACTION_TYPE_NONE';
        case ReactionType.REACTION_TYPE_LIKE:
            return 'REACTION_TYPE_LIKE';
        case ReactionType.REACTION_TYPE_RECAST:
            return 'REACTION_TYPE_RECAST';
        case ReactionType.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}

export enum UserNameType {
    USERNAME_TYPE_NONE = 0,
    USERNAME_TYPE_FNAME = 1,
    USERNAME_TYPE_ENS_L1 = 2,
    UNRECOGNIZED = -1,
}

export function userNameTypeFromJSON(object: any): UserNameType {
    switch (object) {
        case 0:
        case 'USERNAME_TYPE_NONE':
            return UserNameType.USERNAME_TYPE_NONE;
        case 1:
        case 'USERNAME_TYPE_FNAME':
            return UserNameType.USERNAME_TYPE_FNAME;
        case 2:
        case 'USERNAME_TYPE_ENS_L1':
            return UserNameType.USERNAME_TYPE_ENS_L1;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return UserNameType.UNRECOGNIZED;
    }
}

export function userNameTypeToJSON(object: UserNameType): string {
    switch (object) {
        case UserNameType.USERNAME_TYPE_NONE:
            return 'USERNAME_TYPE_NONE';
        case UserNameType.USERNAME_TYPE_FNAME:
            return 'USERNAME_TYPE_FNAME';
        case UserNameType.USERNAME_TYPE_ENS_L1:
            return 'USERNAME_TYPE_ENS_L1';
        case UserNameType.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}

/**
 * A Message is a delta operation on the Farcaster network. The message protobuf is an envelope
 * that wraps a MessageData object and contains a hash and signature which can verify its authenticity.
 */
export interface Message {
    /** Contents of the message */
    data: MessageData | undefined;
    /** Hash digest of data */
    hash: Uint8Array;
    /** Hash scheme that produced the hash digest */
    hashScheme: HashScheme;
    /** Signature of the hash digest */
    signature: Uint8Array;
    /** Signature scheme that produced the signature */
    signatureScheme: SignatureScheme;
    /** Public key or address of the key pair that produced the signature */
    signer: Uint8Array;
    /** MessageData serialized to bytes if using protobuf serialization other than ts-proto */
    dataBytes?: Uint8Array | undefined;
}

/**
 * A MessageData object contains properties common to all messages and wraps a body object which
 * contains properties specific to the MessageType.
 */
export interface MessageData {
    /** Type of message contained in the body */
    type: MessageType;
    /** Farcaster ID of the user producing the message */
    fid: number;
    /** Farcaster epoch timestamp in seconds */
    timestamp: number;
    /** Farcaster network the message is intended for */
    network: FarcasterNetwork;
    castAddBody?: CastAddBody | undefined;
    castRemoveBody?: CastRemoveBody | undefined;
    reactionBody?: ReactionBody | undefined;
    verificationAddEthAddressBody?: VerificationAddEthAddressBody | undefined;
    verificationRemoveBody?: VerificationRemoveBody | undefined;
    /** SignerAddBody signer_add_body = 11; // Deprecated */
    userDataBody?: UserDataBody | undefined;
    /** SignerRemoveBody signer_remove_body = 13; // Deprecated */
    linkBody?: LinkBody | undefined;
    usernameProofBody?: UserNameProof | undefined;
}

/** Adds metadata about a user */
export interface UserDataBody {
    /** Type of metadata */
    type: UserDataType;
    /** Value of the metadata */
    value: string;
}

export interface Embed {
    url?: string | undefined;
    castId?: CastId | undefined;
}

/** Adds a new Cast */
export interface CastAddBody {
    /** URLs to be embedded in the cast */
    embedsDeprecated: string[];
    /** Fids mentioned in the cast */
    mentions: number[];
    /** Parent cast of the cast */
    parentCastId?: CastId | undefined;
    /** Parent URL */
    parentUrl?: string | undefined;
    /** Text of the cast */
    text: string;
    /** Positions of the mentions in the text */
    mentionsPositions: number[];
    /** URLs or cast ids to be embedded in the cast */
    embeds: Embed[];
}

/** Removes an existing Cast */
export interface CastRemoveBody {
    /** Hash of the cast to remove */
    targetHash: Uint8Array;
}

/** Identifier used to look up a Cast */
export interface CastId {
    /** Fid of the user who created the cast */
    fid: number;
    /** Hash of the cast */
    hash: Uint8Array;
}

/** Adds or removes a Reaction from a Cast */
export interface ReactionBody {
    /** Type of reaction */
    type: ReactionType;
    /** CastId of the Cast to react to */
    targetCastId?: CastId | undefined;
    /** URL to react to */
    targetUrl?: string | undefined;
}

/** Adds a Verification of ownership of an Ethereum Address */
export interface VerificationAddEthAddressBody {
    /** Ethereum address being verified */
    address: Uint8Array;
    /** Signature produced by the user's Ethereum address */
    ethSignature: Uint8Array;
    /** Hash of the latest Ethereum block when the signature was produced */
    blockHash: Uint8Array;
    /** Type of verification. 0 = EOA, 1 = contract */
    verificationType: number;
    /** 0 for EOA verifications, 1 or 10 for contract verifications */
    chainId: number;
}

/** Removes a Verification of any type */
export interface VerificationRemoveBody {
    /** Address of the Verification to remove */
    address: Uint8Array;
}

/** Adds or removes a Link */
export interface LinkBody {
    /** Type of link, <= 8 characters */
    type: string;
    /** User-defined timestamp that preserves original timestamp when message.data.timestamp needs to be updated for compaction */
    displayTimestamp?: number | undefined;
    /** The fid the link relates to */
    targetFid?: number | undefined;
}

export interface UserNameProof {
    timestamp: number;
    name: Uint8Array;
    owner: Uint8Array;
    signature: Uint8Array;
    fid: number;
    type: UserNameType;
}

function createBaseMessage(): Message {
    return {
        data: undefined,
        hash: new Uint8Array(0),
        hashScheme: 0,
        signature: new Uint8Array(0),
        signatureScheme: 0,
        signer: new Uint8Array(0),
        dataBytes: undefined,
    };
}

export const Message = {
    encode(message: Message, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.data !== undefined) {
            MessageData.encode(message.data, writer.uint32(10).fork()).ldelim();
        }
        if (message.hash.length !== 0) {
            writer.uint32(18).bytes(message.hash);
        }
        if (message.hashScheme !== 0) {
            writer.uint32(24).int32(message.hashScheme);
        }
        if (message.signature.length !== 0) {
            writer.uint32(34).bytes(message.signature);
        }
        if (message.signatureScheme !== 0) {
            writer.uint32(40).int32(message.signatureScheme);
        }
        if (message.signer.length !== 0) {
            writer.uint32(50).bytes(message.signer);
        }
        if (message.dataBytes !== undefined) {
            writer.uint32(58).bytes(message.dataBytes);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): Message {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMessage();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 10) {
                        break;
                    }

                    message.data = MessageData.decode(reader, reader.uint32());
                    continue;
                case 2:
                    if (tag !== 18) {
                        break;
                    }

                    message.hash = reader.bytes();
                    continue;
                case 3:
                    if (tag !== 24) {
                        break;
                    }

                    message.hashScheme = reader.int32() as any;
                    continue;
                case 4:
                    if (tag !== 34) {
                        break;
                    }

                    message.signature = reader.bytes();
                    continue;
                case 5:
                    if (tag !== 40) {
                        break;
                    }

                    message.signatureScheme = reader.int32() as any;
                    continue;
                case 6:
                    if (tag !== 50) {
                        break;
                    }

                    message.signer = reader.bytes();
                    continue;
                case 7:
                    if (tag !== 58) {
                        break;
                    }

                    message.dataBytes = reader.bytes();
                    continue;
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },

    fromJSON(object: any): Message {
        return {
            data: isSet(object.data) ? MessageData.fromJSON(object.data) : undefined,
            hash: isSet(object.hash) ? bytesFromBase64(object.hash) : new Uint8Array(0),
            hashScheme: isSet(object.hashScheme) ? hashSchemeFromJSON(object.hashScheme) : 0,
            signature: isSet(object.signature) ? bytesFromBase64(object.signature) : new Uint8Array(0),
            signatureScheme: isSet(object.signatureScheme) ? signatureSchemeFromJSON(object.signatureScheme) : 0,
            signer: isSet(object.signer) ? bytesFromBase64(object.signer) : new Uint8Array(0),
            dataBytes: isSet(object.dataBytes) ? bytesFromBase64(object.dataBytes) : undefined,
        };
    },

    toJSON(message: Message): unknown {
        const obj: any = {};
        if (message.data !== undefined) {
            obj.data = MessageData.toJSON(message.data);
        }
        if (message.hash.length !== 0) {
            obj.hash = base64FromBytes(message.hash);
        }
        if (message.hashScheme !== 0) {
            obj.hashScheme = hashSchemeToJSON(message.hashScheme);
        }
        if (message.signature.length !== 0) {
            obj.signature = base64FromBytes(message.signature);
        }
        if (message.signatureScheme !== 0) {
            obj.signatureScheme = signatureSchemeToJSON(message.signatureScheme);
        }
        if (message.signer.length !== 0) {
            obj.signer = base64FromBytes(message.signer);
        }
        if (message.dataBytes !== undefined) {
            obj.dataBytes = base64FromBytes(message.dataBytes);
        }
        return obj;
    },

    create<I extends Exact<DeepPartial<Message>, I>>(base?: I): Message {
        return Message.fromPartial(base ?? ({} as any));
    },
    fromPartial<I extends Exact<DeepPartial<Message>, I>>(object: I): Message {
        const message = createBaseMessage();
        message.data =
            object.data !== undefined && object.data !== null ? MessageData.fromPartial(object.data) : undefined;
        message.hash = object.hash ?? new Uint8Array(0);
        message.hashScheme = object.hashScheme ?? 0;
        message.signature = object.signature ?? new Uint8Array(0);
        message.signatureScheme = object.signatureScheme ?? 0;
        message.signer = object.signer ?? new Uint8Array(0);
        message.dataBytes = object.dataBytes ?? undefined;
        return message;
    },
};

function createBaseMessageData(): MessageData {
    return {
        type: 0,
        fid: 0,
        timestamp: 0,
        network: 0,
        castAddBody: undefined,
        castRemoveBody: undefined,
        reactionBody: undefined,
        verificationAddEthAddressBody: undefined,
        verificationRemoveBody: undefined,
        userDataBody: undefined,
        linkBody: undefined,
        usernameProofBody: undefined,
    };
}

export const MessageData = {
    encode(message: MessageData, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.type !== 0) {
            writer.uint32(8).int32(message.type);
        }
        if (message.fid !== 0) {
            writer.uint32(16).uint64(message.fid);
        }
        if (message.timestamp !== 0) {
            writer.uint32(24).uint32(message.timestamp);
        }
        if (message.network !== 0) {
            writer.uint32(32).int32(message.network);
        }
        if (message.castAddBody !== undefined) {
            CastAddBody.encode(message.castAddBody, writer.uint32(42).fork()).ldelim();
        }
        if (message.castRemoveBody !== undefined) {
            CastRemoveBody.encode(message.castRemoveBody, writer.uint32(50).fork()).ldelim();
        }
        if (message.reactionBody !== undefined) {
            ReactionBody.encode(message.reactionBody, writer.uint32(58).fork()).ldelim();
        }
        if (message.verificationAddEthAddressBody !== undefined) {
            VerificationAddEthAddressBody.encode(
                message.verificationAddEthAddressBody,
                writer.uint32(74).fork(),
            ).ldelim();
        }
        if (message.verificationRemoveBody !== undefined) {
            VerificationRemoveBody.encode(message.verificationRemoveBody, writer.uint32(82).fork()).ldelim();
        }
        if (message.userDataBody !== undefined) {
            UserDataBody.encode(message.userDataBody, writer.uint32(98).fork()).ldelim();
        }
        if (message.linkBody !== undefined) {
            LinkBody.encode(message.linkBody, writer.uint32(114).fork()).ldelim();
        }
        if (message.usernameProofBody !== undefined) {
            UserNameProof.encode(message.usernameProofBody, writer.uint32(122).fork()).ldelim();
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): MessageData {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMessageData();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 8) {
                        break;
                    }

                    message.type = reader.int32() as any;
                    continue;
                case 2:
                    if (tag !== 16) {
                        break;
                    }

                    message.fid = longToNumber(reader.uint64() as Long);
                    continue;
                case 3:
                    if (tag !== 24) {
                        break;
                    }

                    message.timestamp = reader.uint32();
                    continue;
                case 4:
                    if (tag !== 32) {
                        break;
                    }

                    message.network = reader.int32() as any;
                    continue;
                case 5:
                    if (tag !== 42) {
                        break;
                    }

                    message.castAddBody = CastAddBody.decode(reader, reader.uint32());
                    continue;
                case 6:
                    if (tag !== 50) {
                        break;
                    }

                    message.castRemoveBody = CastRemoveBody.decode(reader, reader.uint32());
                    continue;
                case 7:
                    if (tag !== 58) {
                        break;
                    }

                    message.reactionBody = ReactionBody.decode(reader, reader.uint32());
                    continue;
                case 9:
                    if (tag !== 74) {
                        break;
                    }

                    message.verificationAddEthAddressBody = VerificationAddEthAddressBody.decode(
                        reader,
                        reader.uint32(),
                    );
                    continue;
                case 10:
                    if (tag !== 82) {
                        break;
                    }

                    message.verificationRemoveBody = VerificationRemoveBody.decode(reader, reader.uint32());
                    continue;
                case 12:
                    if (tag !== 98) {
                        break;
                    }

                    message.userDataBody = UserDataBody.decode(reader, reader.uint32());
                    continue;
                case 14:
                    if (tag !== 114) {
                        break;
                    }

                    message.linkBody = LinkBody.decode(reader, reader.uint32());
                    continue;
                case 15:
                    if (tag !== 122) {
                        break;
                    }

                    message.usernameProofBody = UserNameProof.decode(reader, reader.uint32());
                    continue;
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },

    fromJSON(object: any): MessageData {
        return {
            type: isSet(object.type) ? messageTypeFromJSON(object.type) : 0,
            fid: isSet(object.fid) ? globalThis.Number(object.fid) : 0,
            timestamp: isSet(object.timestamp) ? globalThis.Number(object.timestamp) : 0,
            network: isSet(object.network) ? farcasterNetworkFromJSON(object.network) : 0,
            castAddBody: isSet(object.castAddBody) ? CastAddBody.fromJSON(object.castAddBody) : undefined,
            castRemoveBody: isSet(object.castRemoveBody) ? CastRemoveBody.fromJSON(object.castRemoveBody) : undefined,
            reactionBody: isSet(object.reactionBody) ? ReactionBody.fromJSON(object.reactionBody) : undefined,
            verificationAddEthAddressBody: isSet(object.verificationAddEthAddressBody)
                ? VerificationAddEthAddressBody.fromJSON(object.verificationAddEthAddressBody)
                : undefined,
            verificationRemoveBody: isSet(object.verificationRemoveBody)
                ? VerificationRemoveBody.fromJSON(object.verificationRemoveBody)
                : undefined,
            userDataBody: isSet(object.userDataBody) ? UserDataBody.fromJSON(object.userDataBody) : undefined,
            linkBody: isSet(object.linkBody) ? LinkBody.fromJSON(object.linkBody) : undefined,
            usernameProofBody: isSet(object.usernameProofBody)
                ? UserNameProof.fromJSON(object.usernameProofBody)
                : undefined,
        };
    },

    toJSON(message: MessageData): unknown {
        const obj: any = {};
        if (message.type !== 0) {
            obj.type = messageTypeToJSON(message.type);
        }
        if (message.fid !== 0) {
            obj.fid = Math.round(message.fid);
        }
        if (message.timestamp !== 0) {
            obj.timestamp = Math.round(message.timestamp);
        }
        if (message.network !== 0) {
            obj.network = farcasterNetworkToJSON(message.network);
        }
        if (message.castAddBody !== undefined) {
            obj.castAddBody = CastAddBody.toJSON(message.castAddBody);
        }
        if (message.castRemoveBody !== undefined) {
            obj.castRemoveBody = CastRemoveBody.toJSON(message.castRemoveBody);
        }
        if (message.reactionBody !== undefined) {
            obj.reactionBody = ReactionBody.toJSON(message.reactionBody);
        }
        if (message.verificationAddEthAddressBody !== undefined) {
            obj.verificationAddEthAddressBody = VerificationAddEthAddressBody.toJSON(
                message.verificationAddEthAddressBody,
            );
        }
        if (message.verificationRemoveBody !== undefined) {
            obj.verificationRemoveBody = VerificationRemoveBody.toJSON(message.verificationRemoveBody);
        }
        if (message.userDataBody !== undefined) {
            obj.userDataBody = UserDataBody.toJSON(message.userDataBody);
        }
        if (message.linkBody !== undefined) {
            obj.linkBody = LinkBody.toJSON(message.linkBody);
        }
        if (message.usernameProofBody !== undefined) {
            obj.usernameProofBody = UserNameProof.toJSON(message.usernameProofBody);
        }
        return obj;
    },

    create<I extends Exact<DeepPartial<MessageData>, I>>(base?: I): MessageData {
        return MessageData.fromPartial(base ?? ({} as any));
    },
    fromPartial<I extends Exact<DeepPartial<MessageData>, I>>(object: I): MessageData {
        const message = createBaseMessageData();
        message.type = object.type ?? 0;
        message.fid = object.fid ?? 0;
        message.timestamp = object.timestamp ?? 0;
        message.network = object.network ?? 0;
        message.castAddBody =
            object.castAddBody !== undefined && object.castAddBody !== null
                ? CastAddBody.fromPartial(object.castAddBody)
                : undefined;
        message.castRemoveBody =
            object.castRemoveBody !== undefined && object.castRemoveBody !== null
                ? CastRemoveBody.fromPartial(object.castRemoveBody)
                : undefined;
        message.reactionBody =
            object.reactionBody !== undefined && object.reactionBody !== null
                ? ReactionBody.fromPartial(object.reactionBody)
                : undefined;
        message.verificationAddEthAddressBody =
            object.verificationAddEthAddressBody !== undefined && object.verificationAddEthAddressBody !== null
                ? VerificationAddEthAddressBody.fromPartial(object.verificationAddEthAddressBody)
                : undefined;
        message.verificationRemoveBody =
            object.verificationRemoveBody !== undefined && object.verificationRemoveBody !== null
                ? VerificationRemoveBody.fromPartial(object.verificationRemoveBody)
                : undefined;
        message.userDataBody =
            object.userDataBody !== undefined && object.userDataBody !== null
                ? UserDataBody.fromPartial(object.userDataBody)
                : undefined;
        message.linkBody =
            object.linkBody !== undefined && object.linkBody !== null
                ? LinkBody.fromPartial(object.linkBody)
                : undefined;
        message.usernameProofBody =
            object.usernameProofBody !== undefined && object.usernameProofBody !== null
                ? UserNameProof.fromPartial(object.usernameProofBody)
                : undefined;
        return message;
    },
};

function createBaseUserDataBody(): UserDataBody {
    return { type: 0, value: '' };
}

export const UserDataBody = {
    encode(message: UserDataBody, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.type !== 0) {
            writer.uint32(8).int32(message.type);
        }
        if (message.value !== '') {
            writer.uint32(18).string(message.value);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): UserDataBody {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseUserDataBody();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 8) {
                        break;
                    }

                    message.type = reader.int32() as any;
                    continue;
                case 2:
                    if (tag !== 18) {
                        break;
                    }

                    message.value = reader.string();
                    continue;
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },

    fromJSON(object: any): UserDataBody {
        return {
            type: isSet(object.type) ? userDataTypeFromJSON(object.type) : 0,
            value: isSet(object.value) ? globalThis.String(object.value) : '',
        };
    },

    toJSON(message: UserDataBody): unknown {
        const obj: any = {};
        if (message.type !== 0) {
            obj.type = userDataTypeToJSON(message.type);
        }
        if (message.value !== '') {
            obj.value = message.value;
        }
        return obj;
    },

    create<I extends Exact<DeepPartial<UserDataBody>, I>>(base?: I): UserDataBody {
        return UserDataBody.fromPartial(base ?? ({} as any));
    },
    fromPartial<I extends Exact<DeepPartial<UserDataBody>, I>>(object: I): UserDataBody {
        const message = createBaseUserDataBody();
        message.type = object.type ?? 0;
        message.value = object.value ?? '';
        return message;
    },
};

function createBaseEmbed(): Embed {
    return { url: undefined, castId: undefined };
}

export const Embed = {
    encode(message: Embed, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.url !== undefined) {
            writer.uint32(10).string(message.url);
        }
        if (message.castId !== undefined) {
            CastId.encode(message.castId, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): Embed {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEmbed();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 10) {
                        break;
                    }

                    message.url = reader.string();
                    continue;
                case 2:
                    if (tag !== 18) {
                        break;
                    }

                    message.castId = CastId.decode(reader, reader.uint32());
                    continue;
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },

    fromJSON(object: any): Embed {
        return {
            url: isSet(object.url) ? globalThis.String(object.url) : undefined,
            castId: isSet(object.castId) ? CastId.fromJSON(object.castId) : undefined,
        };
    },

    toJSON(message: Embed): unknown {
        const obj: any = {};
        if (message.url !== undefined) {
            obj.url = message.url;
        }
        if (message.castId !== undefined) {
            obj.castId = CastId.toJSON(message.castId);
        }
        return obj;
    },

    create<I extends Exact<DeepPartial<Embed>, I>>(base?: I): Embed {
        return Embed.fromPartial(base ?? ({} as any));
    },
    fromPartial<I extends Exact<DeepPartial<Embed>, I>>(object: I): Embed {
        const message = createBaseEmbed();
        message.url = object.url ?? undefined;
        message.castId =
            object.castId !== undefined && object.castId !== null ? CastId.fromPartial(object.castId) : undefined;
        return message;
    },
};

function createBaseCastAddBody(): CastAddBody {
    return {
        embedsDeprecated: [],
        mentions: [],
        parentCastId: undefined,
        parentUrl: undefined,
        text: '',
        mentionsPositions: [],
        embeds: [],
    };
}

export const CastAddBody = {
    encode(message: CastAddBody, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        for (const v of message.embedsDeprecated) {
            writer.uint32(10).string(v!);
        }
        writer.uint32(18).fork();
        for (const v of message.mentions) {
            writer.uint64(v);
        }
        writer.ldelim();
        if (message.parentCastId !== undefined) {
            CastId.encode(message.parentCastId, writer.uint32(26).fork()).ldelim();
        }
        if (message.parentUrl !== undefined) {
            writer.uint32(58).string(message.parentUrl);
        }
        if (message.text !== '') {
            writer.uint32(34).string(message.text);
        }
        writer.uint32(42).fork();
        for (const v of message.mentionsPositions) {
            writer.uint32(v);
        }
        writer.ldelim();
        for (const v of message.embeds) {
            Embed.encode(v!, writer.uint32(50).fork()).ldelim();
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): CastAddBody {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCastAddBody();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 10) {
                        break;
                    }

                    message.embedsDeprecated.push(reader.string());
                    continue;
                case 2:
                    if (tag === 16) {
                        message.mentions.push(longToNumber(reader.uint64() as Long));

                        continue;
                    }

                    if (tag === 18) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.mentions.push(longToNumber(reader.uint64() as Long));
                        }

                        continue;
                    }

                    break;
                case 3:
                    if (tag !== 26) {
                        break;
                    }

                    message.parentCastId = CastId.decode(reader, reader.uint32());
                    continue;
                case 7:
                    if (tag !== 58) {
                        break;
                    }

                    message.parentUrl = reader.string();
                    continue;
                case 4:
                    if (tag !== 34) {
                        break;
                    }

                    message.text = reader.string();
                    continue;
                case 5:
                    if (tag === 40) {
                        message.mentionsPositions.push(reader.uint32());

                        continue;
                    }

                    if (tag === 42) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.mentionsPositions.push(reader.uint32());
                        }

                        continue;
                    }

                    break;
                case 6:
                    if (tag !== 50) {
                        break;
                    }

                    message.embeds.push(Embed.decode(reader, reader.uint32()));
                    continue;
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },

    fromJSON(object: any): CastAddBody {
        return {
            embedsDeprecated: globalThis.Array.isArray(object?.embedsDeprecated)
                ? object.embedsDeprecated.map((e: any) => globalThis.String(e))
                : [],
            mentions: globalThis.Array.isArray(object?.mentions)
                ? object.mentions.map((e: any) => globalThis.Number(e))
                : [],
            parentCastId: isSet(object.parentCastId) ? CastId.fromJSON(object.parentCastId) : undefined,
            parentUrl: isSet(object.parentUrl) ? globalThis.String(object.parentUrl) : undefined,
            text: isSet(object.text) ? globalThis.String(object.text) : '',
            mentionsPositions: globalThis.Array.isArray(object?.mentionsPositions)
                ? object.mentionsPositions.map((e: any) => globalThis.Number(e))
                : [],
            embeds: globalThis.Array.isArray(object?.embeds) ? object.embeds.map((e: any) => Embed.fromJSON(e)) : [],
        };
    },

    toJSON(message: CastAddBody): unknown {
        const obj: any = {};
        if (message.embedsDeprecated?.length) {
            obj.embedsDeprecated = message.embedsDeprecated;
        }
        if (message.mentions?.length) {
            obj.mentions = message.mentions.map((e) => Math.round(e));
        }
        if (message.parentCastId !== undefined) {
            obj.parentCastId = CastId.toJSON(message.parentCastId);
        }
        if (message.parentUrl !== undefined) {
            obj.parentUrl = message.parentUrl;
        }
        if (message.text !== '') {
            obj.text = message.text;
        }
        if (message.mentionsPositions?.length) {
            obj.mentionsPositions = message.mentionsPositions.map((e) => Math.round(e));
        }
        if (message.embeds?.length) {
            obj.embeds = message.embeds.map((e) => Embed.toJSON(e));
        }
        return obj;
    },

    create<I extends Exact<DeepPartial<CastAddBody>, I>>(base?: I): CastAddBody {
        return CastAddBody.fromPartial(base ?? ({} as any));
    },
    fromPartial<I extends Exact<DeepPartial<CastAddBody>, I>>(object: I): CastAddBody {
        const message = createBaseCastAddBody();
        message.embedsDeprecated = object.embedsDeprecated?.map((e) => e) || [];
        message.mentions = object.mentions?.map((e) => e) || [];
        message.parentCastId =
            object.parentCastId !== undefined && object.parentCastId !== null
                ? CastId.fromPartial(object.parentCastId)
                : undefined;
        message.parentUrl = object.parentUrl ?? undefined;
        message.text = object.text ?? '';
        message.mentionsPositions = object.mentionsPositions?.map((e) => e) || [];
        message.embeds = object.embeds?.map((e) => Embed.fromPartial(e)) || [];
        return message;
    },
};

function createBaseCastRemoveBody(): CastRemoveBody {
    return { targetHash: new Uint8Array(0) };
}

export const CastRemoveBody = {
    encode(message: CastRemoveBody, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.targetHash.length !== 0) {
            writer.uint32(10).bytes(message.targetHash);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): CastRemoveBody {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCastRemoveBody();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 10) {
                        break;
                    }

                    message.targetHash = reader.bytes();
                    continue;
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },

    fromJSON(object: any): CastRemoveBody {
        return { targetHash: isSet(object.targetHash) ? bytesFromBase64(object.targetHash) : new Uint8Array(0) };
    },

    toJSON(message: CastRemoveBody): unknown {
        const obj: any = {};
        if (message.targetHash.length !== 0) {
            obj.targetHash = base64FromBytes(message.targetHash);
        }
        return obj;
    },

    create<I extends Exact<DeepPartial<CastRemoveBody>, I>>(base?: I): CastRemoveBody {
        return CastRemoveBody.fromPartial(base ?? ({} as any));
    },
    fromPartial<I extends Exact<DeepPartial<CastRemoveBody>, I>>(object: I): CastRemoveBody {
        const message = createBaseCastRemoveBody();
        message.targetHash = object.targetHash ?? new Uint8Array(0);
        return message;
    },
};

function createBaseCastId(): CastId {
    return { fid: 0, hash: new Uint8Array(0) };
}

export const CastId = {
    encode(message: CastId, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.fid !== 0) {
            writer.uint32(8).uint64(message.fid);
        }
        if (message.hash.length !== 0) {
            writer.uint32(18).bytes(message.hash);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): CastId {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCastId();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 8) {
                        break;
                    }

                    message.fid = longToNumber(reader.uint64() as Long);
                    continue;
                case 2:
                    if (tag !== 18) {
                        break;
                    }

                    message.hash = reader.bytes();
                    continue;
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },

    fromJSON(object: any): CastId {
        return {
            fid: isSet(object.fid) ? globalThis.Number(object.fid) : 0,
            hash: isSet(object.hash) ? bytesFromBase64(object.hash) : new Uint8Array(0),
        };
    },

    toJSON(message: CastId): unknown {
        const obj: any = {};
        if (message.fid !== 0) {
            obj.fid = Math.round(message.fid);
        }
        if (message.hash.length !== 0) {
            obj.hash = base64FromBytes(message.hash);
        }
        return obj;
    },

    create<I extends Exact<DeepPartial<CastId>, I>>(base?: I): CastId {
        return CastId.fromPartial(base ?? ({} as any));
    },
    fromPartial<I extends Exact<DeepPartial<CastId>, I>>(object: I): CastId {
        const message = createBaseCastId();
        message.fid = object.fid ?? 0;
        message.hash = object.hash ?? new Uint8Array(0);
        return message;
    },
};

function createBaseReactionBody(): ReactionBody {
    return { type: 0, targetCastId: undefined, targetUrl: undefined };
}

export const ReactionBody = {
    encode(message: ReactionBody, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.type !== 0) {
            writer.uint32(8).int32(message.type);
        }
        if (message.targetCastId !== undefined) {
            CastId.encode(message.targetCastId, writer.uint32(18).fork()).ldelim();
        }
        if (message.targetUrl !== undefined) {
            writer.uint32(26).string(message.targetUrl);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): ReactionBody {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseReactionBody();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 8) {
                        break;
                    }

                    message.type = reader.int32() as any;
                    continue;
                case 2:
                    if (tag !== 18) {
                        break;
                    }

                    message.targetCastId = CastId.decode(reader, reader.uint32());
                    continue;
                case 3:
                    if (tag !== 26) {
                        break;
                    }

                    message.targetUrl = reader.string();
                    continue;
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },

    fromJSON(object: any): ReactionBody {
        return {
            type: isSet(object.type) ? reactionTypeFromJSON(object.type) : 0,
            targetCastId: isSet(object.targetCastId) ? CastId.fromJSON(object.targetCastId) : undefined,
            targetUrl: isSet(object.targetUrl) ? globalThis.String(object.targetUrl) : undefined,
        };
    },

    toJSON(message: ReactionBody): unknown {
        const obj: any = {};
        if (message.type !== 0) {
            obj.type = reactionTypeToJSON(message.type);
        }
        if (message.targetCastId !== undefined) {
            obj.targetCastId = CastId.toJSON(message.targetCastId);
        }
        if (message.targetUrl !== undefined) {
            obj.targetUrl = message.targetUrl;
        }
        return obj;
    },

    create<I extends Exact<DeepPartial<ReactionBody>, I>>(base?: I): ReactionBody {
        return ReactionBody.fromPartial(base ?? ({} as any));
    },
    fromPartial<I extends Exact<DeepPartial<ReactionBody>, I>>(object: I): ReactionBody {
        const message = createBaseReactionBody();
        message.type = object.type ?? 0;
        message.targetCastId =
            object.targetCastId !== undefined && object.targetCastId !== null
                ? CastId.fromPartial(object.targetCastId)
                : undefined;
        message.targetUrl = object.targetUrl ?? undefined;
        return message;
    },
};

function createBaseVerificationAddEthAddressBody(): VerificationAddEthAddressBody {
    return {
        address: new Uint8Array(0),
        ethSignature: new Uint8Array(0),
        blockHash: new Uint8Array(0),
        verificationType: 0,
        chainId: 0,
    };
}

export const VerificationAddEthAddressBody = {
    encode(message: VerificationAddEthAddressBody, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.address.length !== 0) {
            writer.uint32(10).bytes(message.address);
        }
        if (message.ethSignature.length !== 0) {
            writer.uint32(18).bytes(message.ethSignature);
        }
        if (message.blockHash.length !== 0) {
            writer.uint32(26).bytes(message.blockHash);
        }
        if (message.verificationType !== 0) {
            writer.uint32(32).uint32(message.verificationType);
        }
        if (message.chainId !== 0) {
            writer.uint32(40).uint32(message.chainId);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): VerificationAddEthAddressBody {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseVerificationAddEthAddressBody();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 10) {
                        break;
                    }

                    message.address = reader.bytes();
                    continue;
                case 2:
                    if (tag !== 18) {
                        break;
                    }

                    message.ethSignature = reader.bytes();
                    continue;
                case 3:
                    if (tag !== 26) {
                        break;
                    }

                    message.blockHash = reader.bytes();
                    continue;
                case 4:
                    if (tag !== 32) {
                        break;
                    }

                    message.verificationType = reader.uint32();
                    continue;
                case 5:
                    if (tag !== 40) {
                        break;
                    }

                    message.chainId = reader.uint32();
                    continue;
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },

    fromJSON(object: any): VerificationAddEthAddressBody {
        return {
            address: isSet(object.address) ? bytesFromBase64(object.address) : new Uint8Array(0),
            ethSignature: isSet(object.ethSignature) ? bytesFromBase64(object.ethSignature) : new Uint8Array(0),
            blockHash: isSet(object.blockHash) ? bytesFromBase64(object.blockHash) : new Uint8Array(0),
            verificationType: isSet(object.verificationType) ? globalThis.Number(object.verificationType) : 0,
            chainId: isSet(object.chainId) ? globalThis.Number(object.chainId) : 0,
        };
    },

    toJSON(message: VerificationAddEthAddressBody): unknown {
        const obj: any = {};
        if (message.address.length !== 0) {
            obj.address = base64FromBytes(message.address);
        }
        if (message.ethSignature.length !== 0) {
            obj.ethSignature = base64FromBytes(message.ethSignature);
        }
        if (message.blockHash.length !== 0) {
            obj.blockHash = base64FromBytes(message.blockHash);
        }
        if (message.verificationType !== 0) {
            obj.verificationType = Math.round(message.verificationType);
        }
        if (message.chainId !== 0) {
            obj.chainId = Math.round(message.chainId);
        }
        return obj;
    },

    create<I extends Exact<DeepPartial<VerificationAddEthAddressBody>, I>>(base?: I): VerificationAddEthAddressBody {
        return VerificationAddEthAddressBody.fromPartial(base ?? ({} as any));
    },
    fromPartial<I extends Exact<DeepPartial<VerificationAddEthAddressBody>, I>>(
        object: I,
    ): VerificationAddEthAddressBody {
        const message = createBaseVerificationAddEthAddressBody();
        message.address = object.address ?? new Uint8Array(0);
        message.ethSignature = object.ethSignature ?? new Uint8Array(0);
        message.blockHash = object.blockHash ?? new Uint8Array(0);
        message.verificationType = object.verificationType ?? 0;
        message.chainId = object.chainId ?? 0;
        return message;
    },
};

function createBaseVerificationRemoveBody(): VerificationRemoveBody {
    return { address: new Uint8Array(0) };
}

export const VerificationRemoveBody = {
    encode(message: VerificationRemoveBody, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.address.length !== 0) {
            writer.uint32(10).bytes(message.address);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): VerificationRemoveBody {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseVerificationRemoveBody();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 10) {
                        break;
                    }

                    message.address = reader.bytes();
                    continue;
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },

    fromJSON(object: any): VerificationRemoveBody {
        return { address: isSet(object.address) ? bytesFromBase64(object.address) : new Uint8Array(0) };
    },

    toJSON(message: VerificationRemoveBody): unknown {
        const obj: any = {};
        if (message.address.length !== 0) {
            obj.address = base64FromBytes(message.address);
        }
        return obj;
    },

    create<I extends Exact<DeepPartial<VerificationRemoveBody>, I>>(base?: I): VerificationRemoveBody {
        return VerificationRemoveBody.fromPartial(base ?? ({} as any));
    },
    fromPartial<I extends Exact<DeepPartial<VerificationRemoveBody>, I>>(object: I): VerificationRemoveBody {
        const message = createBaseVerificationRemoveBody();
        message.address = object.address ?? new Uint8Array(0);
        return message;
    },
};

function createBaseLinkBody(): LinkBody {
    return { type: '', displayTimestamp: undefined, targetFid: undefined };
}

export const LinkBody = {
    encode(message: LinkBody, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.type !== '') {
            writer.uint32(10).string(message.type);
        }
        if (message.displayTimestamp !== undefined) {
            writer.uint32(16).uint32(message.displayTimestamp);
        }
        if (message.targetFid !== undefined) {
            writer.uint32(24).uint64(message.targetFid);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): LinkBody {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseLinkBody();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 10) {
                        break;
                    }

                    message.type = reader.string();
                    continue;
                case 2:
                    if (tag !== 16) {
                        break;
                    }

                    message.displayTimestamp = reader.uint32();
                    continue;
                case 3:
                    if (tag !== 24) {
                        break;
                    }

                    message.targetFid = longToNumber(reader.uint64() as Long);
                    continue;
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },

    fromJSON(object: any): LinkBody {
        return {
            type: isSet(object.type) ? globalThis.String(object.type) : '',
            displayTimestamp: isSet(object.displayTimestamp) ? globalThis.Number(object.displayTimestamp) : undefined,
            targetFid: isSet(object.targetFid) ? globalThis.Number(object.targetFid) : undefined,
        };
    },

    toJSON(message: LinkBody): unknown {
        const obj: any = {};
        if (message.type !== '') {
            obj.type = message.type;
        }
        if (message.displayTimestamp !== undefined) {
            obj.displayTimestamp = Math.round(message.displayTimestamp);
        }
        if (message.targetFid !== undefined) {
            obj.targetFid = Math.round(message.targetFid);
        }
        return obj;
    },

    create<I extends Exact<DeepPartial<LinkBody>, I>>(base?: I): LinkBody {
        return LinkBody.fromPartial(base ?? ({} as any));
    },
    fromPartial<I extends Exact<DeepPartial<LinkBody>, I>>(object: I): LinkBody {
        const message = createBaseLinkBody();
        message.type = object.type ?? '';
        message.displayTimestamp = object.displayTimestamp ?? undefined;
        message.targetFid = object.targetFid ?? undefined;
        return message;
    },
};

function createBaseUserNameProof(): UserNameProof {
    return {
        timestamp: 0,
        name: new Uint8Array(0),
        owner: new Uint8Array(0),
        signature: new Uint8Array(0),
        fid: 0,
        type: 0,
    };
}

export const UserNameProof = {
    encode(message: UserNameProof, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.timestamp !== 0) {
            writer.uint32(8).uint64(message.timestamp);
        }
        if (message.name.length !== 0) {
            writer.uint32(18).bytes(message.name);
        }
        if (message.owner.length !== 0) {
            writer.uint32(26).bytes(message.owner);
        }
        if (message.signature.length !== 0) {
            writer.uint32(34).bytes(message.signature);
        }
        if (message.fid !== 0) {
            writer.uint32(40).uint64(message.fid);
        }
        if (message.type !== 0) {
            writer.uint32(48).int32(message.type);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): UserNameProof {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseUserNameProof();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 8) {
                        break;
                    }

                    message.timestamp = longToNumber(reader.uint64() as Long);
                    continue;
                case 2:
                    if (tag !== 18) {
                        break;
                    }

                    message.name = reader.bytes();
                    continue;
                case 3:
                    if (tag !== 26) {
                        break;
                    }

                    message.owner = reader.bytes();
                    continue;
                case 4:
                    if (tag !== 34) {
                        break;
                    }

                    message.signature = reader.bytes();
                    continue;
                case 5:
                    if (tag !== 40) {
                        break;
                    }

                    message.fid = longToNumber(reader.uint64() as Long);
                    continue;
                case 6:
                    if (tag !== 48) {
                        break;
                    }

                    message.type = reader.int32() as any;
                    continue;
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },

    fromJSON(object: any): UserNameProof {
        return {
            timestamp: isSet(object.timestamp) ? globalThis.Number(object.timestamp) : 0,
            name: isSet(object.name) ? bytesFromBase64(object.name) : new Uint8Array(0),
            owner: isSet(object.owner) ? bytesFromBase64(object.owner) : new Uint8Array(0),
            signature: isSet(object.signature) ? bytesFromBase64(object.signature) : new Uint8Array(0),
            fid: isSet(object.fid) ? globalThis.Number(object.fid) : 0,
            type: isSet(object.type) ? userNameTypeFromJSON(object.type) : 0,
        };
    },

    toJSON(message: UserNameProof): unknown {
        const obj: any = {};
        if (message.timestamp !== 0) {
            obj.timestamp = Math.round(message.timestamp);
        }
        if (message.name.length !== 0) {
            obj.name = base64FromBytes(message.name);
        }
        if (message.owner.length !== 0) {
            obj.owner = base64FromBytes(message.owner);
        }
        if (message.signature.length !== 0) {
            obj.signature = base64FromBytes(message.signature);
        }
        if (message.fid !== 0) {
            obj.fid = Math.round(message.fid);
        }
        if (message.type !== 0) {
            obj.type = userNameTypeToJSON(message.type);
        }
        return obj;
    },

    create<I extends Exact<DeepPartial<UserNameProof>, I>>(base?: I): UserNameProof {
        return UserNameProof.fromPartial(base ?? ({} as any));
    },
    fromPartial<I extends Exact<DeepPartial<UserNameProof>, I>>(object: I): UserNameProof {
        const message = createBaseUserNameProof();
        message.timestamp = object.timestamp ?? 0;
        message.name = object.name ?? new Uint8Array(0);
        message.owner = object.owner ?? new Uint8Array(0);
        message.signature = object.signature ?? new Uint8Array(0);
        message.fid = object.fid ?? 0;
        message.type = object.type ?? 0;
        return message;
    },
};

function bytesFromBase64(b64: string): Uint8Array {
    if (globalThis.Buffer) {
        return Uint8Array.from(globalThis.Buffer.from(b64, 'base64'));
    } else {
        const bin = globalThis.atob(b64);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; ++i) {
            arr[i] = bin.charCodeAt(i);
        }
        return arr;
    }
}

function base64FromBytes(arr: Uint8Array): string {
    if (globalThis.Buffer) {
        return globalThis.Buffer.from(arr).toString('base64');
    } else {
        const bin: string[] = [];
        arr.forEach((byte) => {
            bin.push(globalThis.String.fromCharCode(byte));
        });
        return globalThis.btoa(bin.join(''));
    }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin
    ? T
    : T extends globalThis.Array<infer U>
      ? globalThis.Array<DeepPartial<U>>
      : T extends ReadonlyArray<infer U>
        ? ReadonlyArray<DeepPartial<U>>
        : T extends {}
          ? { [K in keyof T]?: DeepPartial<T[K]> }
          : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
    ? P
    : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToNumber(long: Long): number {
    if (long.gt(globalThis.Number.MAX_SAFE_INTEGER)) {
        throw new globalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER');
    }
    return long.toNumber();
}

if (_m0.util.Long !== Long) {
    _m0.util.Long = Long as any;
    _m0.configure();
}

function isSet(value: any): boolean {
    return value !== null && value !== undefined;
}

const CastAddBodyEIP712Type = {
    Embed: [
        { name: 'url', type: 'string' },
        { name: 'castId', type: 'CastId' },
    ],
    CastId: [
        { name: 'fid', type: 'uint64' },
        { name: 'hash', type: 'bytes32' },
    ],
    CastAddBody: [
        { name: 'embedsDeprecated', type: 'string[]' },
        { name: 'mentions', type: 'uint64[]' },
        { name: 'parentCastId', type: 'CastId' },
        { name: 'parentUrl', type: 'string' },
        { name: 'text', type: 'string' },
        { name: 'mentionsPositions', type: 'uint32[]' },
        { name: 'embeds', type: 'Embed[]' },
    ],
};
export const MessageDataEIP712Type = {
    ...CastAddBodyEIP712Type,
    MessageData: [
        { name: 'type', type: 'uint32' },
        { name: 'fid', type: 'uint64' },
        { name: 'timestamp', type: 'uint32' },
        { name: 'network', type: 'uint32' },
        { name: 'castAddBody', type: 'CastAddBody' },
    ],
};
