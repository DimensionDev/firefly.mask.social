import Image from 'next/image.js';
import Link from 'next/link.js';

const settings = [
    { name: 'Display', link: '/display' },
    { name: 'Associated Wallets', link: '/associated' },
    { name: 'Connected Accounts', link: '/connected' },
    { name: 'Communities', link: '/communities' },
    { name: 'More', link: '/more' },
];

export function SettingList() {
    return (
        <div className="flex flex-col min-w-[280px] p-[24px] border-r border-gray-200 min-h-full">
            <div className=" text-[20px] font-bold leading-[24px] text-textMain pb-[24px]">Settings</div>
            {settings.map(({ name, link }) => (
                <Link
                    className="flex items-center justify-between border-b border-gray-200 mb-[24px] text-main text-[18px] leading-[24px] pb-[4px]"
                    key={name}
                    href={`/settings${link}`}
                >
                    {name} <Image src="/svg/rightArrow.svg" width={20} height={20} alt="right arrow" />
                </Link>
            ))}
        </div>
    );
}
