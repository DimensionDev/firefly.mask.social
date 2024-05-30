import { Session as DefaultSession } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session extends DefaultSession {}
}

declare module 'next-auth/jwt' {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    type JWT = DefaultJWT &
        Record<
            'twitter',
            {
                oauthToken?: string;
                oauthTokenSecret?: string;
            }
        >;
}
