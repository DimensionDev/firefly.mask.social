import type { FunctionComponent, SVGAttributes } from 'react';

import LinkIcon from '@/assets/link.svg';
import { Link } from '@/esm/Link.js';

interface LinkCardProps {
    logo: FunctionComponent<SVGAttributes<SVGElement>>;
    link: string;
    content: string;
}

export function LinkCard({ logo: Icon, link, content }: LinkCardProps) {
    return (
        <Link
            href={link}
            className="inline-flex h-[48px] w-full items-center justify-start gap-2 rounded-lg bg-white px-3 py-2 dark:bg-bg"
            style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
            target="_blank"
        >
            <Icon width={24} height={24} />
            <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1">
                <div className="text-[15px] font-bold leading-[18px] text-main">{content}</div>
            </div>
            <LinkIcon width={20} height={20} />
        </Link>
    );
}
