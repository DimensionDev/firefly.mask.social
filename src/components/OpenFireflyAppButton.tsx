'use client';

import { useAsyncFn } from 'react-use';

import { ClickableButton } from '@/components/ClickableButton.js';
import { env } from '@/constants/env.js';
import { openAppIfInstalled } from '@/helpers/openAppIfInstalled.js';

export type ComposedScheme = {
    ios: string;
    android: string;
};

interface OpenAppButtonProps {
    scheme: ComposedScheme;
    downloadUrl: string;
    children: React.ReactNode;
    className?: string;
    waitDuration?: number;
}

function OpenAppButton({ scheme, downloadUrl, waitDuration, children, className }: OpenAppButtonProps) {
    const [{ loading }, tryOpenApp] = useAsyncFn(async () => {
        await openAppIfInstalled(scheme, downloadUrl, waitDuration);
    }, []);

    return (
        <ClickableButton className={className} onClick={tryOpenApp} disabled={loading}>
            {children}
        </ClickableButton>
    );
}

interface OpenFireflyAppButtonProps {
    children: React.ReactNode;
    scheme?: Partial<ComposedScheme>;
    className?: string;
}

export function OpenFireflyAppButton({
    // TODO: Android doesn't have home url scheme
    scheme = {
        ios: env.external.NEXT_PUBLIC_FIREFLY_IOS_HOME,
        android: env.external.NEXT_PUBLIC_FIREFLY_ANDROID_HOME,
    },
    className,
    children,
}: OpenFireflyAppButtonProps) {
    const { android, ios } = scheme;
    if (!ios || !android) {
        return null;
    }
    return (
        <OpenAppButton className={className} scheme={{ ios, android }} downloadUrl="https://5euxu.app.link/PHvNiyVemIb">
            {children}
        </OpenAppButton>
    );
}
