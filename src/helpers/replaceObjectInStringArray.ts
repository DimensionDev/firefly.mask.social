export function replaceObjectInStringArray(str: string, params: Record<string, object>): Array<string | object> {
    if (str === '') {
        return [''];
    }

    if (Object.keys(params).length === 0) {
        return [str];
    }

    const regex = new RegExp(Object.keys(params).join('|'), 'g');
    const result: Array<string | object> = [];
    let lastIndex = 0;

    str.replace(regex, (match, offset) => {
        if (offset > lastIndex) {
            result.push(str.slice(lastIndex, offset));
        }

        if (params[match]) {
            result.push(params[match]);
        }

        lastIndex = offset + match.length;
        return match;
    });

    if (lastIndex < str.length) {
        result.push(str.slice(lastIndex));
    }

    return result;
}
