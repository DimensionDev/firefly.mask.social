import { parseJSON } from '@masknet/web3-providers/helpers';
import type { PersistStorage } from 'zustand/middleware';

import { SessionFactory } from '@/providers/base/SessionFactory.js';
import type { Session } from '@/providers/types/Session.js';

interface SessionState {
    currentProfileSession: Session | null;
}

export function createSessionStorage(): PersistStorage<SessionState> {
    return {
        getItem(name) {
            const raw = localStorage.getItem(name);
            if (!raw) return null;

            const parsed = parseJSON<{
                state: {
                    currentProfileSession: string | null;
                };
            }>(raw);
            if (!parsed) return null;

            return {
                state: {
                    ...parsed.state,
                    currentProfileSession: parsed.state.currentProfileSession
                        ? SessionFactory.createSession(parsed.state.currentProfileSession)
                        : null,
                },
            };
        },
        setItem(name, newValue) {
            const state = newValue.state as SessionState;
            localStorage.setItem(
                name,
                JSON.stringify({
                    ...newValue,
                    state: {
                        ...state,
                        currentProfileSession: state.currentProfileSession
                            ? state.currentProfileSession?.serialize()
                            : null,
                    },
                }),
            );
        },
        removeItem(name) {
            localStorage.removeItem(name);
        },
    };
}
