'use client';

import { useRef } from 'react';
import { useMount } from 'react-use';

import { feedbackIntegration } from '@/configs/sentryClient.js';

export function LinkCloud() {
    const feedbackEl = useRef<HTMLSpanElement>(null);
    const attached = useRef(false);

    useMount(() => {
        if (feedbackEl.current && !attached.current) {
            attached.current = true;
            feedbackIntegration.attachTo(feedbackEl.current);
        }
    });

    return (
        <div className="flex flex-wrap gap-x-[12px] gap-y-2 px-3 pb-10 text-sm text-lightMain lg:px-0">
            <span className=" font-bold text-gray-500">
                © {2024} {'Firefly'}
            </span>
            {[
                { name: 'Twitter', link: 'https://twitter.com/intent/user?screen_name=thefireflyapp' },
                { name: 'Firefly', link: 'https://firefly.social' },
                { name: 'Discord', link: 'https://discord.com/invite/pufMbBGQZN' },
                { name: 'Telegram', link: 'https://t.me/+mz9T_4YOYhoyYmYx' },
                { name: 'Policy', link: 'https://legal.mask.io/maskbook/privacy-policy-browser.html' },
                { name: 'Terms', link: 'https://legal.mask.io/maskbook/service-agreement-beta-browser.html' },
            ].map(({ name, link }) => (
                <a href={link} key={link} className="outline-offset-4">
                    {name}
                </a>
            ))}
            <span className="cursor-pointer" ref={feedbackEl}>
                Feedback
            </span>
        </div>
    );
}
