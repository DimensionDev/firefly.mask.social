export class AbortError extends Error {
    constructor() {
        super('Aborted');
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
