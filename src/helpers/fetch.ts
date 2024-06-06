const { fetch: originalFetch } = globalThis;

export type Fetcher<T = Response> = (input: RequestInfo | URL, init?: RequestInit, next?: Fetcher) => Promise<T>;

export class FetchError extends Error {
    status: number;
    url: string;
    statusText: string;

    constructor(message: string, status: number, statusText: string, url: string) {
        super(message);
        this.status = status;
        this.statusText = statusText;
        this.url = url;
    }
}

export async function fetch(input: RequestInfo | URL, init?: RequestInit, fetchers: Fetcher[] = []): Promise<Response> {
    const fetcher = fetchers.reduceRight<Fetcher>(
        (ff, f) => (r, i) => f(r, i, ff),
        (input: RequestInfo | URL, init?: RequestInit | undefined) => {
            return originalFetch(input, {
                signal: AbortSignal.timeout(3 * 60 * 1000 /* 3 mins */),
                ...init,
            });
        },
    );

    const response = await fetcher(input, init);
    if (!response.ok) {
        const text = await response.text();
        throw new FetchError(
            [`[fetch] failed to fetch: ${response.status} ${response.statusText} ${response.url}`, text].join('\n'),
            response.status,
            response.statusText,
            response.url,
        );
    }
    return response;
}
