import z from 'zod';
import urlcat from 'urlcat';
import { fetchJSON } from '@/helpers/fetchJSON';
import { Session } from '@/providers/types/Session';
import { parseJSON } from '@/helpers/parseJSON';
import { CustodyPayload } from '@/helpers/generateCustodyBearer';

const ROOT_URL = 'https://api.warpcast.com/v2';

export class FarcasterSession implements Session {
    private constructor(
        public token: string,
        public timestamp: number,
        public expiresAt: number,
    ) {}

    serialize(): string {
        return JSON.stringify({
            token: this.token,
            createdAt: this.timestamp,
            expiresAt: this.expiresAt,
        });
    }

    refresh(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async destroy(): Promise<void> {
        const response = await fetchJSON<{
            result: {
                success: boolean;
            };
        }>(urlcat(ROOT_URL, '/auth'), {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                metohd: 'revokeToken',
                params: {
                    timestamp: this.timestamp,
                },
            }),
        });

        if (!response.result.success) throw new Error('Failed to destroy the session.');
        return;
    }

    static from(token: string, payload: CustodyPayload) {
        return new FarcasterSession(token, payload.params.timestamp, payload.params.expiresAt);
    }

    static parse(session: string) {
        const parsed = parseJSON<{
            token: string;
            createdAt: number;
            expiresAt: number;
        }>(session);
        if (!parsed) throw new Error('Failed to parse session.');

        const schema = z.object({
            token: z.string(),
            timestamp: z.number().nonnegative(),
            expiresAt: z.number().nonnegative(),
        });

        const { success } = schema.safeParse(parsed);
        if (!success) throw new Error('Malformed session.');

        return new FarcasterSession(parsed.token, parsed.createdAt, parsed.expiresAt);
    }
}
