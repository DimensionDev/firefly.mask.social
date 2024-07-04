import { type IStorageProvider, LensClient as LensClientSDK, production } from '@lens-protocol/client';

import { SessionHolder } from '@/providers/base/SessionHolder.js';
import type { LensSession } from '@/providers/lens/Session.js';

const ls = typeof window === 'undefined' ? undefined : window.localStorage;

class LocalStorageProvider implements IStorageProvider {
    getItem(key: string) {
        return ls?.getItem(key) ?? null;
    }

    setItem(key: string, value: string) {
        ls?.setItem(key, value);
    }

    removeItem(key: string) {
        ls?.removeItem(key);
    }
}

class MemoryStorageProvider implements IStorageProvider {
    private storage = new Map<string, string>();

    getItem(key: string) {
        return this.storage.get(key) ?? null;
    }

    setItem(key: string, value: string) {
        this.storage.set(key, value);
    }

    removeItem(key: string) {
        this.storage.delete(key);
    }
}

class LensSessionHolder extends SessionHolder<LensSession> {
    private lensClientSDK: LensClientSDK | null = null;

    get sdk() {
        if (!this.lensClientSDK) {
            this.lensClientSDK = this.createSDK(true);
        }
        return this.lensClientSDK;
    }

    createSDK(persistent: boolean) {
        return new LensClientSDK({
            environment: production,
            storage: persistent ? new LocalStorageProvider() : new MemoryStorageProvider(),
        });
    }

    override async resumeSession(session: LensSession) {
        const refreshToken = session.refreshToken;
        if (!refreshToken) return;

        const now = Date.now();
        localStorage.setItem(
            'lens.production.credentials',
            JSON.stringify({
                data: {
                    refreshToken,
                },
                metadata: {
                    createdAt: now,
                    updatedAt: now,
                    version: 2,
                },
            }),
        );
    }
}

export const lensSessionHolder = new LensSessionHolder();
