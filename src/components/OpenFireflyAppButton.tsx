'use client';

import { useAsyncFn } from 'react-use';

import { ClickableButton } from '@/components/ClickableButton.js';
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
    scheme?: ComposedScheme;
    className?: string;
}

export function OpenFireflyAppButton({
    // TODO: Android doesn't have home url scheme
    scheme = { ios: 'firefly://', android: 'firefly://LoginToDesktop/ConfirmDialog' },
    className,
    children,
}: OpenFireflyAppButtonProps) {
    return (
        <OpenAppButton className={className} scheme={scheme} downloadUrl="https://5euxu.app.link/PHvNiyVemIb">
            {children}
        </OpenAppButton>
    );
}
