import { SourceTab } from '@/components/SourceTabs/SourceTab.js';
import { IS_APPLE, IS_SAFARI } from '@/constants/bowser.js';
import type { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

interface SourceTabsProps<S extends Source> {
    sources: S[];
    source: Source;
    href: (source: S) => string;
}

export function SourceTabs<S extends Source>({ sources, source, href }: SourceTabsProps<S>) {
    return (
        <div
            className={
                'no-scrollbar sticky top-[53px] z-40 w-full overflow-x-auto overflow-y-hidden border-b border-line bg-primaryBottom px-4 md:top-0'
            }
        >
            <nav className="flex space-x-4 text-xl" aria-label="Tabs">
                {sources.map((x) => (
                    <SourceTab key={x} href={href(x)} isActive={x === source}>
                        {resolveSourceName(x)}
                    </SourceTab>
                ))}
            </nav>
        </div>
    );
}
