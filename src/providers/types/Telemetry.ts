import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';

export enum GroupID {
    Event = 'event',
    Exception = 'exception',
}

export enum EventType {
    Debug = 'debug',
    Access = 'access',
    Exit = 'exit',
    Interact = 'interact',
}

export enum ExceptionType {
    Error = 'Error',
}

export enum EventID {
    // For debug only
    Debug = 'Debug',
}

export enum ExceptionID {
    FetchError = 'FetchError',
    Debug = 'DebugError',
}

export interface NetworkOptions {
    chainId?: number;
    networkType?: string;
    providerType?: string;
}

export interface UserOptions {
    userID?: string;
    account?: string;
}

export type DeviceOptions = Record<never, never>;

export interface CommonOptions {
    user?: UserOptions;
    device?: DeviceOptions;
    network?: NetworkOptions;
    // default to 1 (100%)
    sampleRate?: number;
}

export interface EventOptions extends CommonOptions {
    eventType: EventType;
    eventID: EventID;
    message?: string;
}

export interface ExceptionOptions extends CommonOptions {
    exceptionType: ExceptionType;
    exceptionID: ExceptionID;
    error: Error;
}

export abstract class Provider {
    constructor(protected sampleRate = 1) {
        if (env.external.NEXT_PUBLIC_TELMETRY === STATUS.Enabled) {
            this.enable();
        } else {
            this.disable();
        }
    }

    // The sentry needs to be opened at the runtime.
    protected status: 'on' | 'off' = 'off';
    private userOptions?: UserOptions;
    private deviceOptions?: DeviceOptions;
    private networkOptions?: NetworkOptions;

    get user() {
        return {
            ...this.userOptions,
        };
    }

    set user(options: UserOptions) {
        this.userOptions = {
            ...this.userOptions,
            ...options,
        };
    }

    get device() {
        return {
            ...this.deviceOptions,
        };
    }

    set device(options: DeviceOptions) {
        this.deviceOptions = {
            ...this.deviceOptions,
            ...options,
        };
    }

    get network() {
        return {
            ...this.networkOptions,
        };
    }

    set network(options: NetworkOptions) {
        this.networkOptions = {
            ...this.networkOptions,
            ...options,
        };
    }

    protected getOptions(initials?: CommonOptions): CommonOptions {
        return {
            user: {
                ...this.userOptions,
                ...initials?.user,
            },
            device: {
                ...this.deviceOptions,
                ...initials?.device,
            },
            network: {
                ...this.networkOptions,
                ...initials?.network,
            },
        };
    }

    shouldRecord() {
        if (this.status === 'off') return false;

        const rate = this.sampleRate % 1;
        if (rate >= 1 || rate < 0) return true;
        return crypto.getRandomValues(new Uint8Array(1))[0] > 255 - Math.floor(255 * this.sampleRate);
    }

    enable() {
        this.status = 'on';
    }

    disable() {
        this.status = 'off';
    }

    abstract captureEvent(options: EventOptions): void;
    abstract captureException(options: ExceptionOptions): void;
}
