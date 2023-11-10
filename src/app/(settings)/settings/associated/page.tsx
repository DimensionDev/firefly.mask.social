import { AccountCard } from './AccountCard';

export default function Associated() {
    return (
        <div className="flex flex-col w-full p-[24px] items-center gap-[24px]">
            <div className="  w-full gap-[24px] flex items-center justify-between">
                <span className="text-main text-[18px] font-bold leading-[24px]">Associated Wallets</span>
            </div>
            <div className="w-full flex items-center justify-between">
                <span className="text-main text-base font-bold leading-[18px]">Connected in Firefly</span>
            </div>
            <AccountCard name="aaa" address="aaaaa" logout={() => {}} />
            <div className="flex gap-[16px] items-center">
                <button className="w-[200px] h-10 flex-col justify-center items-center inline-flex">
                    <div className="self-stretch h-10 px-[18px] py-[11px] bg-textMain rounded-2xl justify-center items-center gap-2 inline-flex">
                        <div className="text-white text-sm font-bold font-['Helvetica'] leading-[18px]">
                            Add an existing account
                        </div>
                    </div>
                </button>

                <button className="w-[200px] h-10 flex-col justify-start items-start inline-flex">
                    <div className="self-stretch h-10 px-[18px] py-[11px] bg-[#FF3545] rounded-2xl justify-center items-center gap-2 inline-flex">
                        <div className="text-white text-sm font-bold font-['Helvetica'] leading-[18px]">
                            Log out all
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}
