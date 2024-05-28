'use client';

import { Trans } from '@lingui/macro';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Image } from '@/esm/Image.js';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <Image src="/image/radar.png" width={200} height={106} alt="Something went wrong. Please try again." />
            <div className="mt-11 text-sm font-bold">
                <Trans>Something went wrong. Please try again.</Trans>
            </div>
            <ClickableButton
                className="mt-6 whitespace-nowrap rounded-2xl bg-main px-4 py-1 text-sm font-semibold leading-6 text-primaryBottom"
                onClick={() => reset()}
            >
                <LoadingIcon width={16} height={16} className={'mr-2 inline-block'} />
                <Trans>Refresh</Trans>
            </ClickableButton>
        </div>
    );
}
