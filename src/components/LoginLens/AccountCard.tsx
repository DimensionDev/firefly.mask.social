import DisableNoIcon from '@/assets/disable-no.svg';
import YesIcon from '@/assets/yes.svg';
import { Image } from '@/esm/Image.js';
import type { Account } from '@/types/index.js';

interface AccountCardProps extends Account {
    isCurrent: boolean;
    setAccount: (account: Account) => void;
}

export function AccountCard({ isCurrent, setAccount, ...account }: AccountCardProps) {
    const { avatar, name, profileId } = account;
    return (
        <div className="inline-flex h-[48px] w-full items-center justify-start gap-[16px]">
            <div
                className="flex h-[48px] w-[48px] items-center justify-center rounded-[99px]"
                style={{
                    background:
                        'radial-gradient(circle at center, rgba(255, 184, 224, 1), rgba(190, 158, 255, 1), rgba(136, 192, 252, 1), rgba(134, 255, 153, 1))',
                }}
            >
                <Image src={avatar} alt="avatar" width={46} height={46} className="rounded-[99px]" />
            </div>
            <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1">
                <div className=" text-base font-medium text-main">{name}</div>
                <div className=" text-[15px] font-normal text-neutral-500">@{profileId}</div>
            </div>
            {isCurrent ? (
                <YesIcon width={40} height={40} />
            ) : (
                <button
                    onClick={() => {
                        setAccount(account);
                    }}
                >
                    <DisableNoIcon width={20} height={20} />
                </button>
            )}
        </div>
    );
}
