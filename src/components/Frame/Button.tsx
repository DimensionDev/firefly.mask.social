import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { useDetectOverflow } from '@masknet/theme';

import { ClickableButton } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { ActionType, type FrameButton } from '@/types/frame.js';

interface Props {
    button: FrameButton;
    disabled?: boolean;
    onClick?: () => void;
}

export function Button({ button, disabled = false, onClick }: Props) {
    const [overflow, ref] = useDetectOverflow();
    return (
        <ClickableButton
            className={classNames(
                'box-border flex flex-1 items-center justify-center overflow-auto rounded-md border border-line bg-white p-2 text-main dark:bg-darkBottom dark:text-white',
                {
                    'hover:cursor-pointer hover:bg-bg': !disabled,
                },
            )}
            disabled={disabled}
            key={button.index}
            onClick={() => {
                if (!disabled) onClick?.();
            }}
            title={overflow ? button.text : undefined}
        >
            <span className="overflow-hidden text-ellipsis whitespace-nowrap" ref={ref}>
                {button.text}
            </span>
            {[ActionType.PostRedirect, ActionType.Link].includes(button.action) ? (
                <ArrowTopRightOnSquareIcon className="ml-1 flex-shrink-0" width={20} height={20} />
            ) : null}
        </ClickableButton>
    );
}
