import type { Profile } from '@/providers/types/SocialMedia.js';

export class AbortError extends Error {
    constructor() {
        super('Aborted');
    }

    static is(error: unknown) {
        return error instanceof AbortError || (error instanceof DOMException && error.name === 'AbortError');
    }
}

export class MalformedError extends Error {
    constructor(message?: string) {
        super(message ?? 'Malformed request');
    }
}

export class UnauthorizedError extends Error {
    constructor(message?: string) {
        super(message ?? 'Unauthorized');
    }
}

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

/**
 * Connected a profile that is not logged firefly before.
 */
export class ProfileNotConnectedError extends Error {
    constructor(
        public profile: Profile | null,
        public override message: string,
    ) {
        super(message);
    }
}

export class ContentTypeError extends Error {
    constructor(message?: string) {
        super(message ?? 'Content-Type is not multipart/form-data');
    }
}
