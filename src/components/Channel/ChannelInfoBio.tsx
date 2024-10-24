'use client';

import { BioMarkup } from '@/components/Markup/BioMarkup.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

export function ChannelInfoBio({ description }: { description?: string }) {
    const isMedium = useIsMedium();

    return (
        <BioMarkup
            className={classNames('text-medium', {
                '-ml-[60px]': !isMedium,
            })}
            source={Source.Farcaster}
        >
            {description ?? '-'}
        </BioMarkup>
    );
}
