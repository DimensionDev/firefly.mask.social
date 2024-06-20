'use client';

import { useAsyncFn } from 'react-use';

import { ClickableButton } from '@/components/ClickableButton.js';
import { openAppIfInstalled } from '@/helpers/openAppIfInstalled.js';

interface OpenAppButtonProps {
    scheme: string;
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
    className?: string;
    children: React.ReactNode;
}

export function OpenFireflyAppButton({ className, children }: OpenFireflyAppButtonProps) {
    return (
        <OpenAppButton className={className} scheme="firefly://" downloadUrl="https://5euxu.app.link/PHvNiyVemIb">
            {children}
        </OpenAppButton>
    );
}
