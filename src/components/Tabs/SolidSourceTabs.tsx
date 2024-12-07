'use client';

import { SolidTabs } from '@/components/Tabs/SolidTabs.js';
import type { Source } from '@/constants/enum.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

interface SolidSourceTabsProps {
    active: Source;
    sources: Array<{ source: Source; link?: string }>;
    onChange?: (source: Source) => void;
}

export function SolidSourceTabs({ active, sources, onChange }: SolidSourceTabsProps) {
    return (
        <SolidTabs<Source>
            data={sources.map(({ source }) => source)}
            link={(source) => sources.find((s) => s.source === source)?.link || ''}
            onChange={onChange}
            isSelected={(source) => source === active}
            itemRender={(source) => resolveSourceName(source)}
        />
    );
}
