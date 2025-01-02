import type { FunctionComponent, ReactNode, SVGAttributes } from 'react';

import LinkIcon from '@/assets/link.svg';
import { Link } from '@/components/Link.js';

interface LinkCardProps {
    title: ReactNode;
    link: string;
    logo: FunctionComponent<SVGAttributes<SVGElement>>;
}

export function LinkCard({ title, link, logo: Icon }: LinkCardProps) {
    return (
        <Link
            href={link}
            className="inline-flex h-[48px] w-full items-center justify-start gap-2 rounded-lg bg-white px-3 py-2 shadow-primary backdrop-blur dark:bg-bg"
            target="_blank"
        >
            <Icon width={24} height={24} />
            <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1">
                <div className="text-medium font-bold leading-[18px] text-main">{title}</div>
            </div>
            <LinkIcon width={20} height={20} />
        </Link>
    );
}
