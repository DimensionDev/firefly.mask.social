'use client';

import { Trans } from '@lingui/react';

import { AccountCard } from './AccountCard/index.js';

export default function Associated() {
    return (
        <div className="flex w-full flex-col items-center gap-[24px] p-[24px]">
            <div className=" flex w-full items-center justify-between gap-[24px]">
                <span className="text-[18px] font-bold leading-[24px] text-main">
                    <Trans id="Associated Wallets" />
                </span>
            </div>
            <div className="flex w-full items-center justify-between">
                <span className="text-base font-bold leading-[18px] text-main">
                    <Trans id="Connected in Firefly" />
                </span>
            </div>
            <AccountCard name="aaa" address="aaaaa" logout={() => {}} />
            <div className="flex items-center gap-[16px]">
                <button className="inline-flex h-10 w-[200px] flex-col items-center justify-center">
                    <div className="inline-flex h-10 items-center justify-center gap-2 self-stretch rounded-2xl bg-lightMain px-[18px] py-[11px]">
                        <div className="font-['Helvetica'] text-sm font-bold leading-[18px] text-white">
                            <Trans id="Add an existing account" />
                        </div>
                    </div>
                </button>

                <button className="inline-flex h-10 w-[200px] flex-col items-start justify-start">
                    <div className="inline-flex h-10 items-center justify-center gap-2 self-stretch rounded-2xl bg-[#FF3545] px-[18px] py-[11px]">
                        <div className="font-['Helvetica'] text-sm font-bold leading-[18px] text-white">
                            <Trans id="Log out all" />
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}
