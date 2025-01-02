import { Link } from '@/components/Link.js';
import { classNames } from '@/helpers/classNames.js';

type SourceNavProps<T> = {
    sources: T[];
    source: T;
    urlResolver: (source: T) => string;
    nameResolver: (source: T) => string;
    className?: string;
};

export function SourceNav<T>({ source, sources, urlResolver, className, nameResolver }: SourceNavProps<T>) {
    if (!sources) return null;
    return (
        <nav className={classNames('flex space-x-2 px-1.5 pb-1.5 pt-3', className)} aria-label="Tabs">
            {sources.map((x, index) => (
                <Link
                    key={index}
                    href={urlResolver(x)}
                    replace
                    className={classNames(
                        'flex h-6 cursor-pointer list-none justify-center rounded-md px-1.5 text-xs leading-6 lg:flex-initial lg:justify-start',
                        source === x ? 'bg-highlight text-white' : 'bg-thirdMain text-second hover:text-highlight',
                    )}
                    aria-current={source === x ? 'page' : undefined}
                >
                    {nameResolver(x)}
                </Link>
            ))}
        </nav>
    );
}
