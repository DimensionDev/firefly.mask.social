'use client';

import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { forwardRef, type HTMLProps } from 'react';

import DownloadIcon from '@/assets/download-round.svg';
import LoadingIcon from '@/assets/loading.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';

interface DownloadImageButtonProps extends HTMLProps<HTMLButtonElement> {
    url: string;
    onClick?: () => void;
}

export const DownloadImageButton = forwardRef<HTMLButtonElement, DownloadImageButtonProps>(function DownloadImageButton(
    { url, onClick },
    ref,
) {
    const { data: blobUrl, isLoading } = useQuery({
        queryKey: ['download-image', url],
        staleTime: Infinity,
        async queryFn() {
            const blob = await fetch(url).then((response) => response.blob());
            return URL.createObjectURL(blob);
        },
    });

    return (
        <MenuButton
            ref={ref}
            disabled={isLoading}
            className={isLoading ? 'opacity-50' : ''}
            onClick={() => {
                if (isLoading) return;
                const a = document.createElement('a');
                a.href = blobUrl || url;
                a.download = url;
                a.click();
                onClick?.();
            }}
        >
            {isLoading ? (
                <LoadingIcon className="animate-spin" width={18} height={18} />
            ) : (
                <DownloadIcon width={18} height={18} />
            )}
            <span className="font-bold leading-[22px] text-main">
                <Trans>Download media</Trans>
            </span>
        </MenuButton>
    );
});
