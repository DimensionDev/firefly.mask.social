import { Trans } from '@lingui/macro';
import { type ReactNode, useMemo, useState } from 'react';

import CheckIcon from '@/assets/check.svg';
import ExclamationShieldIcon from '@/assets/exclamation-shield.svg';
import InfoShieldIcon from '@/assets/info-shield.svg';
import LinkIcon from '@/assets/link-classic.svg';
import LoadingIcon from '@/assets/loading.svg';
import { Badge } from '@/components/Blink/ui/Badge.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Image } from '@/components/Image.js';
import { Linkable } from '@/components/Linkable.js';
import { Link } from '@/esm/Link.js';
import type { RegisteredAction } from '@/providers/types/Blink.js';

export type ActionType = RegisteredAction['state'] | 'unknown';

interface LayoutProps {
    image?: string;
    success?: string | null;
    websiteUrl?: string | null;
    websiteText?: string | null;
    disclaimer?: ReactNode;
    type: ActionType;
    title: string;
    description: string;
    buttons?: ButtonProps[];
    inputs?: InputProps[];
}
export interface ButtonProps {
    text: ReactNode;
    loading?: boolean;
    variant?: 'default' | 'success' | 'error';
    disabled?: boolean;
    onClick: (params?: Record<string, string>) => void;
}

export interface InputProps {
    placeholder?: string;
    name: string;
    disabled: boolean;
    button: ButtonProps;
}

export function ActionLayout({
    title,
    description,
    image,
    websiteUrl,
    websiteText,
    type,
    disclaimer,
    buttons,
    inputs,
    success,
}: LayoutProps) {
    return (
        <div
            className="shadow-action mt-3 w-full cursor-default overflow-hidden rounded-2xl border border-line bg-bg p-3"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {image ? (
                <Linkable url={websiteUrl}>
                    <Image
                        width={500}
                        height={500}
                        className="aspect-square w-full rounded-xl object-cover object-left"
                        src={image}
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
                            {websiteText ?? websiteUrl}
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
                {success ? (
                    <div className="mt-4 flex justify-center text-sm text-secondarySuccess">{success}</div>
                ) : null}
            </div>
        </div>
    );
}

function ActionInput({ placeholder, name, button, disabled }: InputProps) {
    const [value, onChange] = useState('');

    return (
        <div className="flex h-[52px] items-center gap-2 rounded-full border border-main p-1.5">
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                autoComplete="off"
                spellCheck="false"
                onChange={(e) => onChange(e.target.value)}
                className="ml-2.5 flex-1 truncate border-none bg-transparent p-0 text-[15px] placeholder:text-second focus:ring-0 disabled:text-third"
            />
            <div>
                <ActionButton
                    {...button}
                    onClick={() => button.onClick({ [name]: value })}
                    disabled={button.disabled || value === ''}
                />
            </div>
        </div>
    );
}

function ActionButton({ text, loading, disabled, variant, onClick }: ButtonProps) {
    const content = useMemo(() => {
        if (loading)
            return (
                <span className="flex flex-row items-center justify-center gap-2">
                    {text} <LoadingIcon width={16} height={16} className="animate-spin" />
                </span>
            );
        if (variant === 'success')
            return (
                <span className="flex flex-row items-center justify-center gap-2">
                    {text}
                    <CheckIcon width={16} height={16} className="h-4 w-4" />
                </span>
            );
        return text;
    }, [loading, variant, text]);

    return (
        <ClickableButton
            className="flex h-10 w-full items-center justify-center rounded-full bg-main px-5 text-sm font-bold leading-10 text-primaryBottom"
            disabled={disabled}
            onClick={() => onClick()}
        >
            {content}
        </ClickableButton>
    );
}
