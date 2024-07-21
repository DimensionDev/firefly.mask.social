import { Message } from '@farcaster/core';
import urlcat from 'urlcat';

import { type SocialSource, Source } from '@/constants/enum.js';
import { HUBBLE_URL } from '@/constants/index.js';
import { safeUnreachable } from '@/helpers/controlFlow.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';

async function validateFarcasterMessage(messageBytes: string): Promise<boolean> {
    const url = urlcat(HUBBLE_URL, '/v1/validateMessage');
    const { valid } = await farcasterSessionHolder.fetchHubble<{ valid: boolean; message: Message }>(url, {
        method: 'POST',
        body: Buffer.from(messageBytes, 'hex'),
    });
    if (valid) return true;
    return false;
}

export async function validateMessage(messageBytes: string, source: SocialSource): Promise<boolean> {
    switch (source) {
        case Source.Farcaster:
            return validateFarcasterMessage(messageBytes);
        case Source.Lens:
            return true;
        case Source.Twitter:
            return true;
        default:
            safeUnreachable(source);
            return false;
    }
}
