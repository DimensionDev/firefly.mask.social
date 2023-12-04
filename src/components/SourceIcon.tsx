import { useMemo } from 'react';

import type { SocialPlatform } from '@/constants/enum.js';
import { getSocialPlatformIconBySource } from '@/helpers/getSocialPlatformIconBySource.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

interface SourceIconProps {
    size?: number;
    source: SocialPlatform;
}

export function SourceIcon(props: SourceIconProps) {
    const { size = 16, source } = props;

    const { isDarkMode } = useDarkMode();
    const Icon = useMemo(() => getSocialPlatformIconBySource(source, isDarkMode), [source, isDarkMode]);

    if (!Icon) return null;
    return <Icon width={size} height={size} />;
}
