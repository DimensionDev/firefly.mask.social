import { LinkIcon } from '@heroicons/react/24/outline';

import { classNames } from '@/helpers/classNames.js';
import { ActionType, type FrameButton } from '@/types/frame.js';

interface Props {
    button: FrameButton;
    disabled?: boolean;
    onClick?: () => void;
}

export function Button({ button, disabled = false, onClick }: Props) {
    return (
        <button
            className={classNames(
                'flex flex-1 justify-center rounded-md border border-line bg-white py-2 text-main disabled:opacity-70 dark:bg-darkBottom dark:text-white',
                {
                    'hover:bg-bg': !disabled,
                    'hover:cursor-pointer': !disabled,
                },
            )}
            disabled={disabled}
            key={button.index}
            onClick={(ev) => {
                ev.stopPropagation();
                ev.preventDefault();

                if (!disabled) onClick?.();
            }}
        >
            <span>{button.text}</span>
            {button.action === ActionType.PostRedirect ? <LinkIcon className=" ml-1" width={20} height={20} /> : null}
        </button>
    );
}
