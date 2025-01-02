'use client';

import { useAsyncFn } from 'react-use';

import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { env } from '@/constants/env.js';
import { openAppSchemes } from '@/helpers/openAppSchemes.js';
import { DeviceType, type Schemes } from '@/types/device.js';

interface OpenAppButtonProps extends ClickableButtonProps {
    schemes?: Schemes;
}

export function OpenFireflyAppButton({ schemes, ref, ...props }: OpenAppButtonProps) {
    const [{ loading }, tryOpenApp] = useAsyncFn(async () => {
        await openAppSchemes(
            schemes ?? {
                [DeviceType.Android]: env.external.NEXT_PUBLIC_FIREFLY_ANDROID_HOME,
                [DeviceType.IOS]: env.external.NEXT_PUBLIC_FIREFLY_IOS_HOME,
            },
        );
    }, [schemes]);

    return <ClickableButton {...props} onClick={tryOpenApp} disabled={loading} />;
}
