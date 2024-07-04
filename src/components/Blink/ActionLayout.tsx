import { Trans } from '@lingui/macro';
import { type ReactNode } from 'react';

import ExclamationShieldIcon from '@/assets/exclamation-shield.svg';
import InfoShieldIcon from '@/assets/info-shield.svg';
import LinkIcon from '@/assets/link-classic.svg';
import { ActionButton, type ButtonProps } from '@/components/Blink/ActionButton.js';
import { ActionInput, type InputProps } from '@/components/Blink/ActionInput.js';
import { Badge } from '@/components/Blink/Badge.js';
import { Image } from '@/components/Image.js';
import { Linkable } from '@/components/Linkable.js';
import { Link } from '@/esm/Link.js';
import { parseURL } from '@/helpers/parseURL.js';
import type { Action, ActionType } from '@/types/blink.js';

interface LayoutProps {
    type: ActionType;
    action: Action;
    successMessage?: string | null;
    disclaimer?: ReactNode;
    buttons?: ButtonProps[];
    inputs?: InputProps[];
}

export function ActionLayout({ action, type, disclaimer, buttons, inputs, successMessage }: LayoutProps) {
    const { title, description, icon, websiteUrl } = action;

    return (
        <div
            className="shadow-action mt-3 w-full cursor-default overflow-hidden rounded-2xl border border-line bg-bg p-3"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {icon ? (
                <Linkable url={websiteUrl}>
                    <Image
                        width={500}
                        height={500}
                        className="aspect-square w-full rounded-xl object-cover object-left"
                        src={icon}
                        alt="action-image"
                    />
                </Linkable>
            ) : null}
            <div className="mt-3 flex flex-col space-y-1.5">
                <div className="flex items-center gap-2">
                    {websiteUrl ? (
                        <Link
                            href={websiteUrl}
                            target="_blank"
                            className="inline-flex cursor-pointer items-center truncate text-[15px] text-second hover:underline"
                            rel="noopener noreferrer"
                        >
                            <LinkIcon className="mr-2 h-4 w-4" />
                            {parseURL(websiteUrl)?.hostname ?? websiteUrl}
                        </Link>
                    ) : null}
                    <Link
                        href="https://docs.dialect.to/documentation/actions/security"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                    >
                        {type === 'malicious' && (
                            <Badge variant="error" icon={<ExclamationShieldIcon width={13} height={13} />}>
                                <Trans>Blocked</Trans>
                            </Badge>
                        )}
                        {type === 'trusted' && (
                            <Badge variant="default" icon={<InfoShieldIcon width={13} height={13} />} />
                        )}
                        {type === 'unknown' && (
                            <Badge variant="warning" icon={<InfoShieldIcon width={13} height={13} />} />
                        )}
                    </Link>
                </div>
                <div className="text-left text-[15px] font-semibold text-main">{title}</div>
                <div className="whitespace-pre-wrap text-left text-[15px] text-sm text-main">{description}</div>
                {disclaimer ? <div>{disclaimer}</div> : null}
                <div className="flex flex-col">
                    {buttons && buttons.length > 0 ? (
                        <ul className="flex flex-wrap items-center gap-3">
                            {buttons?.map((it, index) => (
                                <li key={index} className="flex-auto">
                                    <ActionButton {...it} />
                                </li>
                            ))}
                        </ul>
                    ) : null}
                    {inputs?.map((input) => <ActionInput key={input.name} {...input} />)}
                </div>
                {successMessage ? (
                    <div className="mt-4 flex justify-center text-sm text-secondarySuccess">{successMessage}</div>
                ) : null}
            </div>
        </div>
    );
}
