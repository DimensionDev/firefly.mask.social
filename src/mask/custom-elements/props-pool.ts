const propsMap = new Map<string, unknown>();

export function setProps(id: string, payloads: unknown) {
    propsMap.set(id, payloads);
    return () => {
        propsMap.delete(id);
    };
}

export function getProps(id: string) {
    return propsMap.get(id);
}
