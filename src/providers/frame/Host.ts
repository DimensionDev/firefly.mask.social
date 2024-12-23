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
import { SITE_NAME } from '@/constants/index.js';
import { openWindow } from '@/helpers/openWindow.js';
import { resolveValue } from '@/helpers/resolveValue.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore } from '@/store/useProfileStore.js';
import type { FrameV2 } from '@/types/frame.js';

export class FarcasterFrameHost implements Omit<FrameHost, 'ethProviderRequestV2'> {
    constructor(
        private frame: FrameV2,
        private post: Post,
        private options?: {
            debug?: boolean;
            ready?: (options?: Partial<ReadyOptions>) => void;
            close?: () => void;
            setPrimaryButton?: SetPrimaryButton;
        },
    ) {}

    context = resolveValue(() => {
        const profile = useFarcasterStateStore.getState().currentProfile;
        if (!profile) throw new Error('Profile not found');

        return {
            user: {
                fid: (profile.profileId as unknown as number) ?? 0,
                username: profile.displayName,
                pfpUrl: profile.pfp,
                location: {
                    placeId: 'firefly',
                    description: SITE_NAME,
                },
            },
            location: {
                type: 'cast_embed',
                cast: {
                    fid: this.post.author.profileId as unknown as number,
                    hash: this.post.postId,
                },
            },
            client: {
                added: false,
                clientFid: 0,
            },
        } satisfies FrameContext;
    });

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
