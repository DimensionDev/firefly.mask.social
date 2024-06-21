'use client';

import { useAsyncFn } from 'react-use';

import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { env } from '@/constants/env.js';
import { openAppScheme } from '@/helpers/openAppScheme.js';
import { DeviceType } from '@/types/device.js';

interface OpenAppButtonProps extends ClickableButtonProps {}

export function OpenFireflyAppButton(props: OpenAppButtonProps) {
    const [{ loading }, tryOpenApp] = useAsyncFn(async () => {
        await openAppScheme({
            [DeviceType.Android]: env.external.NEXT_PUBLIC_FIREFLY_ANDROID_HOME,
            [DeviceType.IOS]: env.external.NEXT_PUBLIC_FIREFLY_IOS_HOME,
        });
    }, []);

    return <ClickableButton {...props} onClick={tryOpenApp} disabled={loading} />;
}
