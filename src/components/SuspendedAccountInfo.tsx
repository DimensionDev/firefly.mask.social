import { Trans } from '@lingui/macro';

import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import type { SocialSource } from '@/constants/enum.js';
import { Image as NextImage } from '@/esm/Image.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

export function SuspendedAccountInfo({ source }: { source: SocialSource }) {
    const { isDarkMode } = useDarkMode();
    const src = isDarkMode ? '/image/firefly-dark-avatar.png' : '/image/firefly-light-avatar.png';

    return (
        <div className="flex gap-3 p-3">
            <NextImage
                loading="lazy"
                unoptimized
                priority={false}
                className="relative z-10 h-20 w-20 max-w-none rounded-full bg-secondary object-cover"
                src={src}
                width={80}
                height={80}
                alt="suspended-account"
            />
            <div className="relative flex flex-1 flex-col justify-center gap-1.5">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-lightMain">
                        <Trans>Suspended account</Trans>
                    </span>
                    <SocialSourceIcon source={source} size={20} />
                </div>
            </div>
        </div>
    );
}
