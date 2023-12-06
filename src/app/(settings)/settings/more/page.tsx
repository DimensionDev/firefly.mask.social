'use client';

import { Trans } from '@lingui/macro';
import Link from 'next/link.js';

import DocumentsIcon from '@/assets/documents.svg';
import LinkIcon from '@/assets/link.svg';
import SecurityIcon from '@/assets/security.svg';

export default function More() {
    return (
        <div className="flex w-full flex-col items-center gap-[12px] p-[24px]">
            <div className=" flex w-full items-center justify-between gap-[24px]">
                <span className="text-[18px] font-bold leading-[24px] text-main">
                    <Trans>More</Trans>
                </span>
            </div>
            <Link
                href="https://legal.mask.io/maskbook/privacy-policy-browser.html"
                target="_blank"
                className="inline-flex h-[48px] w-full items-center justify-start gap-[8px]  rounded-lg bg-white px-[12px] py-[8px]"
                style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
            >
                <SecurityIcon width={24} height={24} />
                <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1">
                    <div className=" text-[14px] font-bold leading-[18px] text-main dark:text-primaryBottom">
                        <Trans>Privacy Policy</Trans>
                    </div>
                </div>
                <LinkIcon width={16} height={16} />
            </Link>
            <Link
                href="https://legal.mask.io/maskbook/service-agreement-beta-browser.html"
                target="_blank"
                className="inline-flex h-[48px] w-full items-center justify-start gap-[8px] rounded-lg bg-white px-[12px] py-[8px]"
                style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
            >
                <DocumentsIcon width={24} height={24} />
                <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1">
                    <div className=" text-[14px] font-bold leading-[18px] text-main dark:text-primaryBottom">
                        <Trans>Terms of Service</Trans>
                    </div>
                </div>
                <LinkIcon width={16} height={16} />
            </Link>
        </div>
    );
}
