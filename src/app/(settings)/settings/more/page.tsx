'use client';

import { Trans, t } from '@lingui/macro';

import { DocumentCard } from '@/app/(settings)/components/DocumentCard.js';
import DocumentsIcon from '@/assets/documents.svg';
import SecurityIcon from '@/assets/security.svg';

const documents = [
    {
        href: 'https://legal.mask.io/maskbook/privacy-policy-browser.html',
        title: t`Privacy Policy`,
        icon: <SecurityIcon width={24} height={24} />,
    },
    {
        href: 'https://legal.mask.io/maskbook/service-agreement-beta-browser.html',
        title: t`Terms of Service`,
        icon: <DocumentsIcon width={24} height={24} />,
    },
];

export default function More() {
    return (
        <div className="flex w-full flex-col items-center gap-[12px] p-[24px]">
            <div className=" flex w-full items-center justify-between gap-[24px]">
                <span className="text-[18px] font-bold leading-[24px] text-main">
                    <Trans>More</Trans>
                </span>
            </div>
            {documents.map((document) => (
                <DocumentCard key={document.href} {...document} />
            ))}
        </div>
    );
}
