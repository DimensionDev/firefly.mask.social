import { NotImplementedError } from '@/constants/error.js';
import { openWindow } from '@/helpers/openWindow.js';
import type {
    AddFrame,
    EthProviderRequest,
    FrameHost,
    ReadyOptions,
    RpcTransport,
    SetPrimaryButton,
    SignIn,
    SignInOptions,
} from '@farcaster/frame-host';
import { noop } from 'lodash-es';

export class FarcasterFrameHost implements FrameHost {
    get context() {
        return null!;
    }

    async addFrame(): ReturnType<AddFrame> {
        throw new NotImplementedError();
    }

    close() {
        throw new NotImplementedError();
    }

    openUrl(url: string) {
        openWindow(url);
    }

    ready(options?: Partial<ReadyOptions>) {
        throw new NotImplementedError();
    }

    setPrimaryButton(options: Parameters<SetPrimaryButton>[0]) {
        throw new NotImplementedError();
    }

    signIn(options: SignInOptions): ReturnType<SignIn.SignIn> {
        throw new NotImplementedError();
    }

    ethProviderRequest = noop as EthProviderRequest;
    ethProviderRequestV2 = noop as RpcTransport;
}
