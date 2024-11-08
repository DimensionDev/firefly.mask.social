'use client';

import { BioMarkup } from '@/components/Markup/BioMarkup.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';

export function ChannelInfoBio({ description }: { description?: string }) {
    return (
        <BioMarkup className={classNames('text-medium max-md:-ml-[60px]')} source={Source.Farcaster}>
            {description ?? '-'}
        </BioMarkup>
    );
}
