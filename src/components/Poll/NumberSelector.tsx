import { Popover, Transition } from '@headlessui/react';
import { Fragment, useMemo, useRef } from 'react';

import ArrowDownIcon from '@/assets/arrow-down.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';

interface NumberSelectorProps {
    value: number;
    label: string;
    numbers:
        | number[]
        | {
              min: number;
              max: number;
          };
    className?: string;
    disabled?: boolean;
    onChange: (value: number) => void;
}

export function NumberSelector({ value, label, numbers, onChange, className, disabled = false }: NumberSelectorProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const options = useMemo(
        () =>
            Array.isArray(numbers)
                ? numbers
                : Array.from({ length: numbers.max - numbers.min + 1 }, (_, i) => i + numbers.min),
        [numbers],
    );

    return (
        <Popover as="div" className={classNames('relative', className)}>
            {({ open, close }) => {
                if (open && panelRef.current) {
                    const selectedEl = panelRef.current.children[value - options[0]];
                    selectedEl?.scrollIntoView({ block: 'center' })
                };
                return (
                    <>
                        <Popover.Button
                            disabled={disabled}
                            className={classNames(
                                'w-full rounded-md border border-transparent bg-lightBg px-2 py-1.5 md:rounded-2xl md:px-3 md:py-2.5',
                                disabled ? 'opacity-50' : '',
                                open ? 'border-lightSecond' : '',
                            )}
                        >
                            <div className="text-left text-[13px] text-lightSecond">{label}</div>
                            <div className="mt-1 flex items-center justify-between">
                                <span className="text-base font-bold text-lightMain md:text-lg">{value}</span>
                                <ArrowDownIcon className={classNames('text-lightSecond', open ? 'rotate-180' : '')} />
                            </div>
                        </Popover.Button>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0 translate-y-1"
                        >
                            <Popover.Panel
                                className="absolute bottom-full right-0 flex max-h-[200px] w-full -translate-y-2 flex-col gap-2 overflow-y-auto rounded-lg bg-lightBottom py-3 text-[15px] shadow-popover dark:border dark:border-line dark:bg-darkBottom dark:shadow-none md:max-h-[300px]"
                                ref={panelRef}
                            >
                                {options.map((option) => (
                                    <ClickableButton
                                        key={option}
                                        className={classNames(
                                            'h-6 cursor-pointer text-center text-base font-bold leading-6 text-lightMain',
                                            value === option ? 'bg-lightBg' : '',
                                        )}
                                        onClick={() => {
                                            onChange(option);
                                            close();
                                        }}
                                    >
                                        {option}
                                    </ClickableButton>
                                ))}
                            </Popover.Panel>
                        </Transition>
                    </>
                );
            }}
        </Popover>
    );
}
