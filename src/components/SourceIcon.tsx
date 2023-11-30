import { useMemo } from 'react';
import { useDarkMode } from 'usehooks-ts';

import { Image } from '@/components/Image.js';
import type { SocialPlatform } from '@/constants/enum.js';
import { getSocialPlatformIconBySource } from '@/helpers/getSocialPlatformIconBySource.js';

interface SourceIconProps {
    size?: number;
    source: SocialPlatform;
}

export function SourceIcon(props: SourceIconProps) {
    const { size = 16, source } = props;

    const { isDarkMode } = useDarkMode();
    const sourceIcon = useMemo(() => getSocialPlatformIconBySource(source, isDarkMode), [source, isDarkMode]);

    if (!sourceIcon) return null;
    return <Image src={sourceIcon} width={size} height={size} alt={source} />;
}
