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
                messagePlaceholder: t`Discribe a bug or suggest an improvement`,
                submitButtonLabel: t`Send Feedback`,
                cancelButtonLabel: t`Cancel`,
            });
        }
    });

    return (
        <div className="flex flex-wrap gap-x-[12px] gap-y-2 px-3 pb-10 text-sm text-lightMain lg:px-0">
            <span className=" font-bold text-gray-500">
                © {2024} {'Firefly'}
            </span>
            {[
                { name: t`X`, link: 'https://x.com/intent/user?screen_name=thefireflyapp' },
                { name: t`Discord`, link: 'https://discord.com/invite/pufMbBGQZN' },
                { name: t`Telegram`, link: 'https://t.me/+mz9T_4YOYhoyYmYx' },
                { name: t`Privacy Policy`, link: 'https://legal.mask.io/maskbook/privacy-policy-browser.html' },
                {
                    name: t`Terms of Service`,
                    link: 'https://legal.mask.io/maskbook/service-agreement-beta-browser.html',
                },
            ].map(({ name, link }) => (
                <Link href={link} key={link} className="outline-offset-4 hover:underline" target="_blank">
                    {name}
                </Link>
            ))}
            <span className="cursor-pointer hover:underline" ref={feedbackEl}>
                <Trans>Feedback</Trans>
            </span>
        </div>
    );
}
