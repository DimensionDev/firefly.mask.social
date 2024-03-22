import type React from 'react';

interface ClickableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    onClick?: () => void;
}

export function ClickableButton({ children, onClick, ...props }: ClickableButtonProps) {
    return (
        <button {...props} onClick={() => onClick?.()}>
            {children}
        </button>
    );
}
