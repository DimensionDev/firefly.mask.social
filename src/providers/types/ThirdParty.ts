import type { SessionType } from '@/providers/types/SocialMedia.js';

export type ThirdPartySessionType = {
    type: SessionType.Apple | SessionType.Google | SessionType.Telegram;
    nonce: string;
    id_token: string;
    createdAt: number;
    expiresAt: number;
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        id?: string;
    };
    expires: string;
};
