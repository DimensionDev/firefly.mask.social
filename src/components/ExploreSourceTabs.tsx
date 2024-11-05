import type { ExploreSource, ExploreType } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveExploreUrl } from '@/helpers/resolveExploreUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

export function ExploreSourceTabs({
    source,
    sources,
    type,
}: {
    source: ExploreSource;
    sources?: ExploreSource[];
    type: ExploreType;
}) {
    if (!sources) return null;
    return (
        <nav className="flex space-x-2 px-1.5 pb-1.5 pt-3" aria-label="Tabs">
            {sources.map((x) => (
                <Link
                    key={x}
                    href={resolveExploreUrl(type, x)}
                    replace
                    className={classNames(
                        'flex h-6 cursor-pointer list-none justify-center rounded-md px-1.5 text-xs leading-6 lg:flex-initial lg:justify-start',
                        source === x ? 'bg-highlight text-white' : 'bg-thirdMain text-second hover:text-highlight',
                    )}
                    aria-current={source === x ? 'page' : undefined}
                >
                    {resolveSourceName(x)}
                </Link>
            ))}
        </nav>
    );
}
