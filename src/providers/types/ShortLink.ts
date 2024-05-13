export interface ShortLink {
    /**
     * Resolves the short link and stores the original URL that it redirects to.
     */
    resolve(): Promise<void>;

    /**
     * Resolves a specific short link and returns the original URL that it redirects to.
     * @param url
     */
    lookup(url: string | URL): Promise<string>;
}
