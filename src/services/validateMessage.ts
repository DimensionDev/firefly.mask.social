import { Message } from '@farcaster/core';
import urlcat from 'urlcat';

import { HUBBLE_URL } from '@/constants/index.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';

export async function validateMessage(messageBytes: string) {
    const url = urlcat(HUBBLE_URL, '/v1/validateMessage');
    const { valid, message } = await farcasterSessionHolder.fetchHubble<{ valid: boolean; message: Message }>(url, {
        method: 'POST',
        body: Buffer.from(messageBytes, 'hex'),
    });
    if (valid) return true;
    return false;
}
