'use client';

import { t, Trans } from '@lingui/macro';

import { DocumentCard } from '@/app/(settings)/components/DocumentCard.js';
import { Headline } from '@/app/(settings)/components/Headline.js';
import DocumentsIcon from '@/assets/documents.svg';
import SecurityIcon from '@/assets/security.svg';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';

export default function More() {
    useNavigatorTitle(t`More`);

    return (
        <div className="flex w-full flex-col items-center gap-6 p-6">
            <Headline title={<Trans>More</Trans>} />

            <div className="flex w-full flex-col gap-4">
                {[
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
                ].map((document) => (
                    <DocumentCard key={document.href} {...document} />
                ))}
            </div>
        </div>
    );
}
