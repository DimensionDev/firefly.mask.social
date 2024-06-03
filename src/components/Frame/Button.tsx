import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

import { ClickableButton } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { ActionType, type FrameButton } from '@/types/frame.js';

interface Props {
    button: FrameButton;
    disabled?: boolean;
    onClick?: () => void;
}

export function Button({ button, disabled = false, onClick }: Props) {
    return (
        <ClickableButton
            className={classNames(
                'flex flex-1 items-center justify-center rounded-md border border-line bg-white py-2 text-main dark:bg-darkBottom dark:text-white',
                {
                    'hover:bg-bg': !disabled,
                    'hover:cursor-pointer': !disabled,
                },
            )}
            disabled={disabled}
            key={button.index}
            onClick={() => {
                if (!disabled) onClick?.();
            }}
        >
            <span>{button.text}</span>
            {[ActionType.PostRedirect, ActionType.Link].includes(button.action) ? (
                <ArrowTopRightOnSquareIcon className="ml-1" width={20} height={20} />
            ) : null}
        </ClickableButton>
    );
}
