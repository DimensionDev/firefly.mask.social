import { resolveValue } from '@/helpers/resolveValue.js';

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
    constructor(
        message: string,
        public url: string,
        public status: number,
        public statusText: string,
        public text: string,
    ) {
        super(message);
    }

    toThrow(): never {
        // for sentry will truncate the message if it's too long
        console.error(
            `[fetch error]: ${this.url} ${this.status} ${this.statusText} ${[this.message, this.text].join('\n')}`,
        );
        throw this;
    }

    static async from(input: RequestInfo | URL | string, response: Response, message?: string) {
        const text = await resolveValue(async () => {
            try {
                return await response.clone().text();
            } catch {
                return '';
            }
        });
        const method = typeof input === 'string' ? 'GET' : input instanceof URL ? 'GET' : input.method.toUpperCase();

        return new FetchError(
            message ??
                [
                    `[fetch] failed to fetch: ${method} ${response.status} ${response.statusText} ${response.url}`,
                    text,
                ].join('\n'),
            response.url,
            response.status,
            response.statusText,
            text,
        );
    }
}

export class FarcasterInvalidSignerKey extends Error {
    constructor(message?: string) {
        super(message ?? 'Invalid Farcaster signer key.');
    }
}

export class ContentTypeError extends Error {
    constructor(message?: string) {
        super(message ?? 'Content-Type is not multipart/form-data');
    }
}

export class UserRejectionError extends Error {
    constructor(message?: string) {
        super(message ?? 'User rejected.');
    }
}

export class TimeoutError extends Error {
    constructor(message?: string) {
        super(message ?? 'Timeout.');
    }
}

export class UnreachableError extends Error {
    constructor(label: string, value: unknown) {
        super(`Unreachable ${label} = ${value}.`);
    }
}

export class NotImplementedError extends Error {
    constructor(message?: string) {
        super(message ?? 'Not implemented.');
    }
}

export class NotAllowedError extends Error {
    constructor(message?: string) {
        super(message ?? 'Not allowed.');
    }
}

export class InvalidResultError extends Error {
    constructor() {
        super('Invalid result.');
    }
}

export class NotFoundError extends Error {
    constructor(message?: string) {
        super(message ?? 'Not Found.');
    }
}

export class RPC_Error extends Error {
    constructor(message?: string) {
        super(message ?? 'RPC Error.');
    }
}

export class SwitchChainError extends Error {
    constructor(chainName?: string) {
        super(
            chainName
                ? `Please switch to the ${chainName} network in your wallet.`
                : `Please switch to the correct network in your wallet.`,
        );
    }
}

export class CreateScheduleError extends Error {
    constructor(public override message: string) {
        super(message);
    }
}

export class SignlessRequireError extends Error {
    constructor(public override message: string) {
        super(message);
    }
}
