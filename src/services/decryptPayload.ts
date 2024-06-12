import type { AESCryptoKey } from '@masknet/base';
import {
    decrypt as lib_decrypt,
    DecryptErrorReasons,
    DecryptProgressKind,
    parsePayload,
    type PayloadParseResult,
    TwitterDecoder,
} from '@masknet/encryption';
import { decodeArrayBuffer, encodeArrayBuffer } from '@masknet/kit';
import type { TypedMessage } from '@masknet/typed-message';

import { NotImplementedError } from '@/constants/error.js';
import type { EncryptedPayload } from '@/helpers/getEncryptedPayload.js';

const cache = new Map<string, AESCryptoKey>();

async function parsePayloadText(encoded: string) {
    let payload = TwitterDecoder(
        'https://mask.io/?PostData_v1=' +
            encodeURI(encoded).replaceAll(/@$/g, '%40').replaceAll('%2F', '/').replaceAll('%3D', '='),
    ).unwrapOr('');
    if (typeof payload === 'string') {
        payload = payload.replaceAll('%20', '+');
    }
    return (await parsePayload(payload)).unwrapOr(null);
}

function toUint8Array(data: Record<number, number> | Uint8Array) {
    if (data instanceof Uint8Array) return data;
    const hasLength = 'length' in data;
    const length = Object.keys(data).length;
    const size = hasLength ? length - 1 : length;
    const u8 = new Uint8Array(hasLength ? length - 1 : length);
    u8.set({
        ...data,
        length: size,
    });

    return u8;
}

async function parsePayloadBinary(encoded: string | Uint8Array) {
    const buffer =
        typeof encoded === 'string'
            ? new Uint8Array(decodeArrayBuffer(decodeURIComponent(encoded)))
            : toUint8Array(encoded);
    return (await parsePayload(buffer)).unwrapOr(null);
}

async function decrypt(cacheKey: string, payload: PayloadParseResult.Payload): Promise<TypedMessage | Error> {
    const decryptProgress = lib_decrypt(
        { message: payload },
        {
            async getPostKeyCache() {
                return cache.get(cacheKey) ?? null;
            },
            async setPostKeyCache(key) {
                cache.set(cacheKey, key);
            },
            async hasLocalKeyOf() {
                return false;
            },
            async decryptByLocalKey() {
                throw new NotImplementedError();
            },
            async queryAuthorPublicKey() {
                return null;
            },
            async queryPostKey_version40() {
                return null;
            },
            async *queryPostKey_version39() {
                throw new NotImplementedError();
            },
            async *queryPostKey_version38() {
                throw new NotImplementedError();
            },
            async *queryPostKey_version37() {
                throw new NotImplementedError();
            },
            async deriveAESKey() {
                throw new NotImplementedError();
            },
        },
    );
    for await (const progress of decryptProgress) {
        if (progress.type === DecryptProgressKind.Success) return progress.content;
        if (progress.type === DecryptProgressKind.Error) return progress;
    }
    throw new TypeError('unreachable');
}

export type DecryptResult = [Error | null, boolean, TypedMessage | null];

export async function decryptPayload([data, version]: EncryptedPayload): Promise<DecryptResult> {
    const getResult = async () => {
        if (version !== '1' && version !== '2') return false;

        const payload =
            version === '1' && typeof data === 'string' ? await parsePayloadText(data) : await parsePayloadBinary(data);
        if (!payload) return false;

        if (payload.encryption.isOk() && payload.encryption.value.type === 'E2E')
            return new Error(DecryptErrorReasons.PrivateKeyNotFound);

        return decrypt(typeof data === 'string' ? data : encodeArrayBuffer(data), payload);
    };

    const result = await getResult();

    if (typeof result === 'boolean') return [new Error(DecryptErrorReasons.PayloadBroken), false, null];
    if (result instanceof Error) return [result, result.message === DecryptErrorReasons.PrivateKeyNotFound, null];
    return [null, false, result];
}
