import { z } from 'zod';
import type { PersistStorage } from 'zustand/middleware';

import { parseJSON } from '@/helpers/parseJSON.js';
import { SessionFactory } from '@/providers/base/SessionFactory.js';
import type { Account } from '@/providers/types/Account.js';
import type { Session } from '@/providers/types/Session.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface SessionState {
    accounts: Account[];
    currentProfile: Profile | null;
    currentProfileSession: Session | null;
}

export function createSessionStorage(): PersistStorage<SessionState> {
    return {
        getItem(name) {
            const raw = localStorage.getItem(name);
            if (!raw) return null;

            const parsedState = parseJSON<{
                state: {
                    // for legacy version don't have accounts field
                    accounts?: Array<{
                        profile: Profile;
                        session: string;
                    }>;
                    currentProfile: Profile | null;
                    currentProfileSession: string | null;
                };
                version: number;
            }>(raw);
            if (!parsedState) return null;

            const schema = z.object({
                state: z.object({
                    accounts: z.array(
                        z.object({
                            session: z.string().nullable(),
                        }),
                    ),
                    currentProfileSession: z.string().nullable(),
                }),
                version: z.number(),
            });

            const output = schema.safeParse({
                ...parsedState,
                state: {
                    ...parsedState.state,
                    // for legacy version don't have accounts field
                    // so we need to provide a default value to bypass the schema validation
                    accounts: parsedState.state.accounts ?? [],
                },
            });
            if (!output.success) {
                console.error([`[${name}] zod validation failure: ${output.error}`]);
                return null;
            }

            return {
                ...parsedState,
                state: {
                    ...parsedState.state,
                    accounts:
                        parsedState.state.accounts?.map((account) => ({
                            ...account,
                            session: SessionFactory.createSession(account.session),
                        })) ?? [],
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
                        accounts: state.accounts.map((account) => ({
                            ...account,
                            session: account.session.serialize(),
                        })),
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
