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
            <Headline>
                <Trans>More</Trans>
            </Headline>

            <div className=" flex w-full flex-col gap-4">
                {[
                    {
                        href: 'https://mask.notion.site/Privacy-Policy-2e903bb2220e4dcfb7c3e8fcbd983d2a',
                        title: t`Privacy Policy`,
                        icon: <SecurityIcon width={24} height={24} />,
                    },
                    {
                        href: 'https://mask.notion.site/Term-of-Service-bd035d18f7814a79b9d4d7682d9d2d30',
                        title: t`Term of Service`,
                        icon: <DocumentsIcon width={24} height={24} />,
                    },
                ].map((document) => (
                    <DocumentCard key={document.href} {...document} />
                ))}
            </div>
        </div>
    );
}
