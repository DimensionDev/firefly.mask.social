import LinkIcon from '@/assets/link.svg';
import { Link } from '@/esm/Link.js';

interface DocumentCardProps {
    href: string;
    title: string;
    icon: React.ReactNode;
}

export function DocumentCard({ title, href, icon }: DocumentCardProps) {
    return (
        <Link
            href={href}
            target="_blank"
            className="inline-flex h-[48px] w-full items-center justify-start gap-2 rounded-lg bg-white px-3 py-2 dark:bg-bg"
            style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
        >
            {icon}
            <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1">
                <div className="text-[15px] font-bold leading-[18px] text-main">{title}</div>
            </div>
            <LinkIcon width={20} height={20} />
        </Link>
    );
}
