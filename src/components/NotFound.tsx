import type { ReactNode } from 'react';

import GhostHoleIcon from '@/assets/ghost.svg';
import { Comeback } from '@/components/Comeback.js';
import { SearchType } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { resolveSearchUrl } from '@/helpers/resolveSearchUrl.js';

interface NotFoundProps {
    text?: ReactNode;
    backText?: ReactNode;
    search?: {
        text: ReactNode;
        searchType: SearchType;
        searchText: string;
    };
}

export default function NotFound({ text, backText, search }: NotFoundProps) {
    return (
        <>
            {backText ? (
                <div className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-line bg-primaryBottom px-4">
                    <div className="flex items-center gap-7">
                        <Comeback />
                        <span className="text-xl font-black text-lightMain">{backText}</span>
                    </div>
                </div>
            ) : null}
            <div className="flex flex-col items-center py-12 text-secondary">
                <GhostHoleIcon width={200} height={143} className="text-third" />
                <div className="mt-3 break-words break-all text-center font-bold">
                    {text ? <div className="mt-10 text-sm">{text}</div> : null}
                    {search ? (
                        <Link
                            className="mt-3 flex h-10 items-center justify-center rounded-full border border-main px-5 text-medium text-main transition-all hover:opacity-80"
                            href={resolveSearchUrl(search.searchText, search.searchType)}
                        >
                            {search.text}
                        </Link>
                    ) : null}
                </div>
            </div>
        </>
    );
}
