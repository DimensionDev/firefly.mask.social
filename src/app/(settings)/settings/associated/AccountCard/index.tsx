// CC @harlan I cannot find disconnect icon in the repo, use discover icon instead
import DisconnectIcon from '@/assets/discover.svg';
import WalletVerifiedIcon from '@/assets/wallet-verified.svg';

interface AccountCardProps {
    name: string;
    address: string;
    logout: () => void;
}

export function AccountCard({ name, address }: AccountCardProps) {
    return (
        <div className="inline-flex h-[63px] w-full items-center justify-start gap-[8px] rounded-lg bg-white px-[12px] py-[8px] shadow backdrop-blur-lg">
            <div className="h-[36px] w-[36px] rounded-[99px]">
                <WalletVerifiedIcon width={36} height={36} />
            </div>
            <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1">
                <div className=" text-base font-medium text-neutral-900">{name}</div>
                <div className=" text-[15px] font-normal text-neutral-500">{address}</div>
            </div>
            <button className="text-right font-['Inter'] text-xs font-medium leading-none text-neutral-900">
                <DisconnectIcon width={20} height={20} />
            </button>
        </div>
    );
}
