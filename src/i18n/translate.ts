import { i18n, type MessageDescriptor } from '@lingui/core';

export function t(strings: TemplateStringsArray, ...values: Array<string | number>): string {
    const id = strings.join('');
    return i18n.t({
        id,
        values: Object.fromEntries(values.map((value, index) => [`var${index}`, value])),
    });
}

export function translate(id: string, descriptor?: MessageDescriptor) {
    return i18n.t({
        id,
        ...descriptor,
    });
}
