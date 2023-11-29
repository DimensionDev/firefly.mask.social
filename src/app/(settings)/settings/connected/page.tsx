'use client';

import { Trans } from '@lingui/macro';

import { SocialPlatform } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';

import { AccountCard } from './AccountCard/index.js';

export default function Connected() {
    return (
        <div className="flex w-full flex-col items-center gap-[24px] p-[24px]">
            <div className=" flex w-full items-center justify-between gap-[24px]">
                <span className="text-[18px] font-bold leading-[24px] text-main">
                    <Trans>Connected Accounts</Trans>
                </span>
            </div>
            <div className="flex w-full items-center justify-between">
                <span className="text-base font-bold leading-[18px] text-main">
                    <Trans>Lens</Trans>
                </span>
                <div className="flex items-center gap-[4px]">
                    <span className="text-base font-bold leading-[18px] text-slate-500">0xabcd...1234</span>
                    <Image src="/svg/copy.svg" alt="copy" width={14} height={14} />
                </div>
            </div>
            <AccountCard
                avatar=""
                name="aaa"
                userName="aaaaa"
                isCurrent={false}
                type={SocialPlatform.Lens}
                logout={() => {}}
            />
        </div>
    );
}
