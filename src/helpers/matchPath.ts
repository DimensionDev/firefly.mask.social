type PathParams<T extends string> = T extends `${string}:${infer ParamName}/${infer Rest}`
    ? { [K in ParamName | keyof PathParams<Rest>]: string }
    : T extends `${string}:${infer ParamName}`
      ? { [K in ParamName]: string }
      : {};

export function matchPath<T extends string>(template: T, path: string, fuzzy: boolean = false): PathParams<T> | null {
    const regexStr = template
        .replace(/\\/g, '\\\\')
        .replace(/:[a-zA-Z0-9_]+/g, '([a-zA-Z0-9_]+)')
        .replace(/\//g, '\\/');

    const regex = new RegExp(fuzzy ? `^${regexStr}` : `^${regexStr}$`);
    const match = path.match(regex);

    if (!match) return null;

    const paramNames = (template.match(/:([a-zA-Z0-9_]+)/g) || []).map((param) => param.substring(1));
    const result = {} as PathParams<T>;

    return paramNames.reduce((acc, paramName, index) => {
        return {
            ...acc,
            [paramName]: match[index + 1],
        };
    }, result);
}
