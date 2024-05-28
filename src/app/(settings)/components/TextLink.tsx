import { usePathname } from 'next/navigation.js';

import RightArrowIcon from '@/assets/right-arrow.svg';
import { Link } from '@/esm/Link.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';

interface TextLinkProps {
    name: JSX.Element | string;
    link: `/${string}`;
}

export function TextLink({ name, link }: TextLinkProps) {
    const pathname = usePathname();

    return (
        <Link
            className={`mb-6 flex items-center justify-between border-b border-line pb-1 text-[18px] leading-[24px] text-main hover:font-bold ${
                isRoutePathname(pathname, link) ? 'font-bold' : 'font-normal'
            }`}
            key={link}
            href={link}
        >
            {name} <RightArrowIcon width={20} height={20} />
        </Link>
    );
}
