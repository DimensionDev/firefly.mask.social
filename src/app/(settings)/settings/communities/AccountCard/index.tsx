import { Image } from '@/esm/Image.js';
import { Link } from '@/esm/Link.js';

interface AccountCardProps {
    logo: string;
    link: string;
    content: string;
}
export function AccountCard({ logo, link, content }: AccountCardProps) {
    return (
        <div
            className="inline-flex h-[48px] w-full items-center justify-start gap-[8px] rounded-lg bg-white px-[12px] py-[8px]"
            style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
        >
            <Image src={logo} width={24} height={24} alt="security" />
            <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1">
                <div className=" text-[14px] font-bold leading-[18px] text-textMain">{content}</div>
            </div>
            <Link href={link} target="_blank">
                <Image src="/svg/link.svg" width={16} height={16} alt="link" />
            </Link>
        </div>
    );
}
