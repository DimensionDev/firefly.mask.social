import { parseJSON } from '@masknet/web3-providers/helpers';
import { z } from 'zod';
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

            const parsedState = parseJSON<{
                state: {
                    currentProfileSession: string | null;
                };
                version: number;
            }>(raw);
            if (!parsedState) return null;

            const schema = z.object({
                state: z.object({
                    currentProfileSession: z.string().nullable(),
                }),
                version: z.number(),
            });

            const output = schema.safeParse(parsedState);
            if (!output.success) {
                console.error([`[${name}] zod validation failure: ${output.error}`]);
                return null;
            }

            return {
                ...parsedState,
                state: {
                    ...parsedState.state,
                    currentProfileSession: parsedState.state.currentProfileSession
                        ? SessionFactory.createSession(parsedState.state.currentProfileSession)
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
