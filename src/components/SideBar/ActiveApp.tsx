'use client';

import { Trans } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { ClickableButton } from '@/components/ClickableButton.js';

const waitDuration = 2500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function ActiveApp() {
    const [{ loading }, tryOpenApp] = useAsyncFn(async () => {
        location.href = 'firefly:';
        await sleep(waitDuration);
        if (document.visibilityState === 'visible') {
            location.href = 'https://5euxu.app.link/PHvNiyVemIb';
            await sleep(waitDuration);
        }
    }, []);

    return (
        <ClickableButton
            className='p-2 w-full text-center border border-fireflyBrand rounded-2xl text-fireflyBrand font-bold text-xl dark:text-white dark:bg-fireflyBrand'
            onClick={tryOpenApp}
            disabled={loading}
        >
            {
                loading ? <Trans>Opening...</Trans> : <Trans>Open Firefly App</Trans>
            }
        </ClickableButton>
    )
}
