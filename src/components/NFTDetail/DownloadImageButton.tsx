'use client';

import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';

import DownloadIcon from '@/assets/download.svg';

export function DownloadImageButton({ url }: { url: string }) {
    const { data: blobUrl } = useQuery({
        queryKey: ['download-image', url],
        async queryFn() {
            const blob = await fetch(url).then((response) => response.blob());
            return URL.createObjectURL(blob);
        },
    });

    return (
        <a
            className="flex cursor-pointer select-none items-center gap-1 rounded-full border border-line bg-lightBg px-2 py-1 font-inter text-xs leading-[14px] hover:bg-primaryBottom"
            href={blobUrl}
            target="_blank"
            download={url}
        >
            <DownloadIcon className="h-3 w-3" />
            <Trans>Download image</Trans>
        </a>
    );
}
