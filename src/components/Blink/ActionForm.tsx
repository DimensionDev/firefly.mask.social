import { useState } from 'react';

import { ActionButton, type ButtonProps } from '@/components/Blink/ActionButton.js';
import { ActionInput, type InputProps } from '@/components/Blink/ActionInput.js';

export interface FormProps {
    inputs: Array<Omit<InputProps, 'button'>>;
    button: ButtonProps;
}

export function ActionForm({ inputs, button }: FormProps) {
    const [values, setValues] = useState(Object.fromEntries(inputs.map((i) => [i.name, ''])));

    const onChange = (name: string, value: string) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const disabled = inputs.some((i) => i.required && values[i.name] === '');

    return (
        <div className="flex flex-col gap-3">
            {inputs.map((input) => (
                <ActionInput key={input.name} {...input} onChange={(v) => onChange(input.name, v)} />
            ))}
            <ActionButton {...button} onClick={() => button.onClick(values)} disabled={button.disabled || disabled} />
        </div>
    );
}
