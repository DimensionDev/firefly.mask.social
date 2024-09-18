import type { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

interface SourceTabsProps<S extends Source> {
    sources: S[];
    source: Source;
    href: (source: S) => string;
}

export function SourceTabs<S extends Source>({ sources, source, href }: SourceTabsProps<S>) {
    return (
        <div className="no-scrollbar sticky top-[54px] z-40 w-full overflow-x-auto overflow-y-hidden border-b border-line bg-primaryBottom px-4 md:top-0">
            <nav className="flex space-x-4 text-xl" aria-label="Tabs">
                {sources.map((x) => (
                    <Link
                        key={x}
                        href={href(x)}
                        className={classNames(
                            'h-[43px] cursor-pointer border-b-2 px-4 text-center font-bold leading-[43px] hover:text-main active:bg-main/10 md:h-[60px] md:py-[18px] md:leading-6',
                            x === source ? 'border-farcasterPrimary text-main' : 'border-transparent text-third',
                        )}
                        aria-current={source === x ? 'page' : undefined}
                    >
                        {resolveSourceName(x)}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
