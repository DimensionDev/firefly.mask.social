import { NotAllowedError } from '@/constants/error.js';
import { BaseSession } from '@/providers/base/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export class WalletSession extends BaseSession implements Session {
    constructor(
        address: string,
        signature: string,
    ) {
        super(SessionType.Wallet, address, signature, 0, 0);
    }

    override async refresh(): Promise<void> {
        throw new NotAllowedError();
    }

    override async destroy(): Promise<void> {
        throw new NotAllowedError();
    }
}
