'use client';

import { t, Trans } from '@lingui/macro';
import { useRef } from 'react';
import { useMount } from 'react-use';

import { feedbackIntegration } from '@/configs/sentryClient.js';
import { Link } from '@/esm/Link.js';

export function LinkCloud() {
    const feedbackEl = useRef<HTMLSpanElement>(null);
    const attached = useRef(false);

    useMount(() => {
        if (feedbackEl.current && !attached.current) {
            attached.current = true;
            feedbackIntegration.attachTo(feedbackEl.current, {
                formTitle: t`Feedback`,
                nameLabel: t`Name (optional)`,
                namePlaceholder: t`Your name`,
                emailLabel: t`Email (optional)`,
                emailPlaceholder: t`your.email@example.org`,
                messageLabel: t`Description`,
                messagePlaceholder: t`Describe a bug or suggest an improvement`,
                submitButtonLabel: t`Send Feedback`,
                cancelButtonLabel: t`Cancel`,
            });
        }
    });

    return (
        <div className="flex flex-wrap gap-x-[12px] gap-y-2 px-3 pb-10 text-xs text-lightSecond lg:px-0">
            <span className=" font-bold text-gray-500">
                © {2024} {'Firefly'}
            </span>
            {[
                { name: t`Communities`, link: '/settings/communities' },
                {
                    name: t`Privacy Policy`,
                    link: 'https://mask.notion.site/Privacy-Policy-2e903bb2220e4dcfb7c3e8fcbd983d2a',
                },
                {
                    name: t`Term of Service`,
                    link: 'https://mask.notion.site/Term-of-Service-bd035d18f7814a79b9d4d7682d9d2d30',
                },
                {
                    name: t`Download app`,
                    link: 'https://firefly.social/#download',
                },
            ].map(({ name, link }) => (
                <Link href={link} key={link} className="outline-offset-4 hover:underline" target="_blank">
                    {name}
                </Link>
            ))}
            <Link className="cursor-pointer hover:underline" href="/developers/frame">
                <Trans>Developers</Trans>
            </Link>
            <span className="cursor-pointer hover:underline" ref={feedbackEl}>
                <Trans>Send a Feedback</Trans>
            </span>
        </div>
    );
}
