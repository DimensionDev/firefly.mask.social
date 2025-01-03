import type {
    AddFrame,
    EthProviderRequest,
    FrameContext,
    FrameHost,
    ReadyOptions,
    SetPrimaryButton,
    SignIn,
    SignInOptions,
} from '@farcaster/frame-host';
import { noop } from 'lodash-es';

import { NotImplementedError } from '@/constants/error.js';
import { openWindow } from '@/helpers/openWindow.js';

export class FarcasterFrameHost implements Omit<FrameHost, 'ethProviderRequestV2'> {
    constructor(
        public context: FrameContext,
        private options?: {
            debug?: boolean;
            ready?: (options?: Partial<ReadyOptions>) => void;
            close?: () => void;
            setPrimaryButton?: SetPrimaryButton;
        },
    ) {
        if (this.options?.debug) console.log('[frame host] init', context);
    }

    addFrame = (): ReturnType<AddFrame> => {
        if (this.options?.debug) console.log('[frame host] add frame');
        throw new NotImplementedError();
    };

    close = () => {
        if (this.options?.debug) console.log('[frame host] close');
        this.options?.close?.();
    };

    openUrl = (url: string) => {
        if (this.options?.debug) console.log('[frame host] openUrl', url);
        openWindow(url);
    };

    ready = (options?: Partial<ReadyOptions>) => {
        if (this.options?.debug) console.log('[frame host] ready', options);
        this.options?.ready?.(options);
    };

    setPrimaryButton = (options: Parameters<SetPrimaryButton>[0]) => {
        if (this.options?.debug) console.log('[frame host] set primary button', options);
        this.options?.setPrimaryButton?.(options);
    };

    signIn = (options: SignInOptions): ReturnType<SignIn.SignIn> => {
        if (this.options?.debug) console.log('[frame host] sign in', options);
        throw new NotImplementedError();
    };

    ethProviderRequest = noop as EthProviderRequest;
}
