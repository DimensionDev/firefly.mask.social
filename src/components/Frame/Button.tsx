import LinkIcon from '@/assets/link-square.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { useDetectOverflow } from '@/hooks/useDetectOverflow.js';
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
                <LinkIcon className="ml-1 flex-shrink-0 text-second" width={18} height={18} />
            ) : null}
        </ClickableButton>
    );
}
