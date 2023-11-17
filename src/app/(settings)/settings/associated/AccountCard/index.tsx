import { Image } from '@/esm/Image.js';

interface AccountCardProps {
    name: string;
    address: string;
    logout: () => void;
}
export function AccountCard({ name, address }: AccountCardProps) {
    return (
        <div className="inline-flex h-[63px] w-full items-center justify-start gap-[8px] rounded-lg bg-white px-[12px] py-[8px] shadow backdrop-blur-lg">
            <div className="h-[36px] w-[36px] rounded-[99px]">
                <Image src="/svg/wallet-verified.svg" alt="wallet" width={36} height={36} />
            </div>
            <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1">
                <div className="font-['PingFang SC'] text-base font-medium text-neutral-900">{name}</div>
                <div className="font-['PingFang SC'] text-[15px] font-normal text-neutral-500">{address}</div>
            </div>
            <button className="text-right font-['Inter'] text-xs font-medium leading-none text-neutral-900">
                <Image src="/svg/disconnect.svg" alt="wallet" width={20} height={20} />
            </button>
        </div>
    );
}
