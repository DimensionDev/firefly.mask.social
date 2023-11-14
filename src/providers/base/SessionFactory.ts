import z from 'zod';
import { parseJSON } from '@/helpers/parseJSON.js';
import { Type } from '@/providers/types/SocialMedia.js';
import { WarpcastSession } from '@/providers/warpcast/Session.js';
import { LensSession } from '@/providers/lens/Session.js';

export class SessionFactory {
    /**
     * Creates a session instance based on the serialized session in string.
     *
     * @param serializedSession - The serialized session session in string.
     * @returns An instance of a session.
     */
    public static createSession(serializedSession: string) {
        const [type, json] = serializedSession.split(':') as [Type, string];

        const session = parseJSON<{
            type: Type;
            profileId: string;
            token: string;
            createdAt: number;
            expiresAt: number;
        }>(json);
        if (!session) throw new Error('Failed to parse session.');

        const schema = z.object({
            type: z.nativeEnum(Type),
            profileId: z.string(),
            token: z.string(),
            createdAt: z.number().nonnegative(),
            expiresAt: z.number().nonnegative(),
        });

        const { success } = schema.safeParse(session);
        if (!success) throw new Error('Malformed session.');

        switch (type) {
            case Type.Lens:
                return new LensSession(session.profileId, session.token, session.createdAt, session.expiresAt);
            case Type.Warpcast:
                return new WarpcastSession(session.profileId, session.token, session.createdAt, session.expiresAt);
            case Type.Twitter:
                throw new Error('Not implemented yet.');
            default:
                throw new Error('Unknown session type.');
        }
    }
}
