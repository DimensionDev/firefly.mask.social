'use client';

import { t, Trans } from '@lingui/macro';
import { useRef } from 'react';
import { useMount } from 'react-use';

import { feedbackIntegration } from '@/configs/sentryClient.js';
import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { Link } from '@/esm/Link.js';
import { compact } from 'lodash-es';

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
            <span className="font-bold text-gray-500">© {2024} Firefly</span>
            {compact([
                { name: <Trans>Communities</Trans>, link: '/settings/more', self: true },
                env.external.NEXT_PUBLIC_DEVELOPERS !== STATUS.Disabled
                    ? { name: <Trans>Developers</Trans>, link: '/developers/general', self: true }
                    : null,
                {
                    name: <Trans>Privacy Policy</Trans>,
                    link: 'https://mask.notion.site/Privacy-Policy-2e903bb2220e4dcfb7c3e8fcbd983d2a',
                },
                {
                    name: <Trans>Terms of Service</Trans>,
                    link: 'https://mask.notion.site/Terms-of-Service-bd035d18f7814a79b9d4d7682d9d2d30',
                },
                {
                    name: <Trans>Download App</Trans>,
                    link: 'https://firefly.social/#download',
                },
            ]).map(({ name, link, self }) => (
                <Link
                    href={link}
                    key={link}
                    className="font-medium outline-offset-4 hover:underline"
                    target={self ? '_self' : '_blank'}
                >
                    {name}
                </Link>
            ))}
            {env.external.NEXT_PUBLIC_FEEDBACK !== STATUS.Disabled ? (
                <span className="cursor-pointer font-medium hover:underline" ref={feedbackEl} role="button">
                    <Trans>Feedback</Trans>
                </span>
            ) : null}
        </div>
    );
}
