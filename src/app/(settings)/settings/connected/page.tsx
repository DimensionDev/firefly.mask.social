import { Image } from '@/esm/Image.js';
import { AccountCard } from '@/app/(settings)/settings/connected/AccountCard/index.js';

export default function Connected() {
    return (
        <div className="flex flex-col w-full p-[24px] items-center gap-[24px]">
            <div className="  w-full gap-[24px] flex items-center justify-between">
                <span className="text-main text-[18px] font-bold leading-[24px]">Connected Accounts</span>
            </div>
            <div className="w-full flex items-center justify-between">
                <span className="text-main text-base font-bold leading-[18px]">Lens</span>
                <div className="flex items-center gap-[4px]">
                    <span className="text-slate-500 text-base font-bold leading-[18px]">0xabcd...1234</span>
                    <Image src="/svg/copy.svg" alt="copy" width={14} height={14} />
                </div>
            </div>
            <AccountCard avatar="" name="aaa" userName="aaaaa" isCurrent={false} type="lens" logout={() => {}} />
        </div>
    );
}
