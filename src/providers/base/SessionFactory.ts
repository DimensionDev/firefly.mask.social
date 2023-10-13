import z from 'zod';
import { parseJSON } from '@/helpers/parseJSON';
import { Type } from '@/providers/types/SocialMedia';
import { FarcasterSession } from '@/providers/farcaster/Session';
import { WarpcastSession } from '@/providers/warpcast/Session';

export class SessionFactory {
    /**
     * Creates a session instance based on the serialized string.
     *
     * @param serializedSession - The serialized session string.
     * @returns An instance of a session.
     */
    public static createSession(serializedSession: string) {
        const [type, json] = serializedSession.split(':') as [Type, string];

        const session = parseJSON<{
            type: Type;
            token: string;
            createdAt: number;
            expiresAt: number;
        }>(json);
        if (!session) throw new Error('Failed to parse session.');

        const schema = z.object({
            token: z.string(),
            timestamp: z.number().nonnegative(),
            expiresAt: z.number().nonnegative(),
        });

        const { success } = schema.safeParse(session);
        if (!success) throw new Error('Malformed session.');

        switch (type) {
            case Type.Farcaster:
                return new FarcasterSession(session.token, session.createdAt, session.expiresAt);
            case Type.Warpcast:
                return new WarpcastSession(session.token, session.createdAt, session.expiresAt);
            case Type.Twitter:
                throw new Error('Not implemented yet.');
            default:
                throw new Error('Unknown session type.');
        }
    }
}
