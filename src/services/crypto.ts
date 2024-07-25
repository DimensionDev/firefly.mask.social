import crypto from 'crypto';

import { env } from '@/constants/env.js';

export function decrypt(cipherText: string) {
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(env.internal.SESSION_CIPHER_KEY, 'hex'),
        Buffer.from(env.internal.SESSION_CIPHER_IV, 'hex'),
    );
    return [decipher.update(cipherText, 'hex', 'utf-8'), decipher.final('utf-8')].join('');
}

export function encrypt(plaintext: string) {
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(env.internal.SESSION_CIPHER_KEY, 'hex'),
        Buffer.from(env.internal.SESSION_CIPHER_IV, 'hex'),
    );
    return [cipher.update(plaintext, 'utf-8', 'hex'), cipher.final('hex')].join('');
}
