export enum Type {
    Twitter = 'Twitter',
}

export interface Session<T = string> {
    // Specifies the type of authentication source or method (e.g., Twitter).
    type: Type;

    /**
     * Represents the unique identifier for the authenticated account.
     * This can be a user ID, username, or any unique value related to the account.
     */
    identifier: T;

    /**
     * The user's display name or nickname associated with the authenticated account.
     */
    name: string;

    /**
     * URL of the account's avatar or logo.
     * This is typically used to display a user's profile picture or brand logo
     * for the authentication source.
     */
    image: string;

    /**
     * Specifies when the authentication or session will expire.
     * It's represented as a UNIX timestamp, which counts the number of seconds
     * since January 1, 1970 (known as the UNIX epoch).
     */
    expiresAt: number;
}

export interface Provider<T = string> {
    /**
     * Checks if the user associated with the given identifier is currently logged in.
     *
     * @param identifier - The unique identifier of the account to check.
     * @returns A promise that resolves to true if the user is logged in, false otherwise.
     */
    isLogin: (identifier: T) => Promise<boolean>;

    /**
     * Initiates the login process for the provider.
     *
     * @returns A promise that resolves to an Auth object upon successful login.
     */
    login: () => Promise<Session<T>>;

    /**
     * Initiates the logout process for the specified account.
     *
     * @param identifier - The unique identifier of the account to log out.
     * @returns A promise that resolves once the logout process is completed.
     */
    logout: (identifier: T) => Promise<void>;
}
