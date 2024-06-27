import { type ReactNode, useState } from 'react';

import type { ExtendedActionState } from '@/components/SolanaBlinkRenderer/api/ActionsRegistry.js';
import { Badge } from '@/components/SolanaBlinkRenderer/ui/Badge.js';
import { Button } from '@/components/SolanaBlinkRenderer/ui/Button.js';
import { CheckIcon } from '@/components/SolanaBlinkRenderer/ui/icons/CheckIcon.js';
import { ExclamationShieldIcon } from '@/components/SolanaBlinkRenderer/ui/icons/ExclamationShieldIcon.js';
import { InfoShieldIcon } from '@/components/SolanaBlinkRenderer/ui/icons/InfoShieldIcon.js';
import { LinkIcon } from '@/components/SolanaBlinkRenderer/ui/icons/LinkIcon.js';
import { SpinnerDots } from '@/components/SolanaBlinkRenderer/ui/icons/SpinnerDots.js';

type ActionType = ExtendedActionState;

interface LayoutProps {
    image?: string;
    error?: string | null;
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
    text: string | null;
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

function Linkable({ url, children }: { url?: string | null; children: ReactNode | ReactNode[] }) {
    return url ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
            {children}
        </a>
    ) : (
        <>{children}</>
    );
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
    error,
    success,
}: LayoutProps) {
    return (
        <div
            className="shadow-action mt-3 w-full cursor-default overflow-hidden rounded-xl border border-line bg-bg"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {image ? (
                <Linkable url={websiteUrl}>
                    <img className="aspect-square w-full object-cover object-left" src={image} alt="action-image" />
                </Linkable>
            ) : null}
            <div className="flex flex-col p-5">
                <div className="mb-2 flex items-center gap-2">
                    {websiteUrl ? (
                        <a
                            href={websiteUrl}
                            target="_blank"
                            className="text-subtext text-twitter-neutral-50 inline-flex items-center truncate transition-colors hover:cursor-pointer hover:text-[#949CA4] hover:underline motion-reduce:transition-none"
                            rel="noopener noreferrer"
                        >
                            <LinkIcon className="mr-2" />
                            {websiteText ?? websiteUrl}
                        </a>
                    ) : null}
                    <a
                        href="https://docs.dialect.to/documentation/actions/security"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                    >
                        {type === 'malicious' && (
                            <Badge variant="error" icon={<ExclamationShieldIcon width={13} height={13} />}>
                                Blocked
                            </Badge>
                        )}
                        {type === 'trusted' && (
                            <Badge variant="default" icon={<InfoShieldIcon width={13} height={13} />} />
                        )}
                        {type === 'unknown' && (
                            <Badge variant="warning" icon={<InfoShieldIcon width={13} height={13} />} />
                        )}
                    </a>
                </div>
                <span className="mb-0.5 font-semibold text-main">{title}</span>
                <span className="mb-4 whitespace-pre-wrap text-sm text-main">{description}</span>
                {disclaimer ? <div className="mb-4">{disclaimer}</div> : null}
                <div className="flex flex-col gap-3">
                    {buttons && buttons.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                            {buttons?.map((it, index) => (
                                <div key={index} className="flex-auto">
                                    <ActionButton {...it} />
                                </div>
                            ))}
                        </div>
                    ) : null}
                    {inputs?.map((input) => <ActionInput key={input.name} {...input} />)}
                </div>
                {success ? <span className="mt-4 flex justify-center text-sm text-success">{success}</span> : null}
                {error && !success ? (
                    <span className="mt-4 flex justify-center text-sm text-danger">{error}</span>
                ) : null}
            </div>
        </div>
    );
}

function ActionInput({ placeholder, name, button, disabled }: InputProps) {
    const [value, onChange] = useState('');

    return (
        <div className="focus-within:border-twitter-accent flex items-center gap-2 rounded-full border border-[#3D4144] transition-colors motion-reduce:transition-none">
            <input
                placeholder={placeholder || 'Type here...'}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                className="placeholder:text-twitter-neutral-50 disabled:text-twitter-neutral-50 ml-4 flex-1 truncate bg-transparent outline-none"
            />
            <div className="my-2 mr-2">
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
    function ButtonContent() {
        if (loading)
            return (
                <span className="flex flex-row items-center justify-center gap-2">
                    {text} <SpinnerDots />
                </span>
            );
        if (variant === 'success')
            return (
                <span className="text-twitter-success flex flex-row items-center justify-center gap-2">
                    {text}
                    <CheckIcon />
                </span>
            );
        return text;
    }

    return (
        <Button onClick={() => onClick()} disabled={disabled} variant={variant}>
            <ButtonContent />
        </Button>
    );
}
