'use client';

import { useAsyncFn } from 'react-use';

import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { IS_IOS } from '@/constants/bowser.js';
import { env } from '@/constants/env.js';
import { openAppSchemes } from '@/helpers/openAppSchemes.js';
import { DeviceType } from '@/types/device.js';

interface OpenAppButtonProps extends ClickableButtonProps {}

export function OpenFireflyAppButton(props: OpenAppButtonProps) {
    const [{ loading }, tryOpenApp] = useAsyncFn(async () => {
        await openAppSchemes({
            [DeviceType.Android]: env.external.NEXT_PUBLIC_FIREFLY_ANDROID_HOME,
            [DeviceType.IOS]: env.external.NEXT_PUBLIC_FIREFLY_IOS_HOME,
        });
    }, []);

    if (!IS_IOS) return null;

    return <ClickableButton {...props} onClick={tryOpenApp} disabled={loading} />;
}
