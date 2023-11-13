/// <reference types="./src/maskbook/packages/polyfills/types/__all.d.ts" />
/// <reference types="./src/maskbook/packages/polyfills/types/dom.d.ts" />
/// <reference types="./src/maskbook/packages/polyfills/types/firefox.d.ts" />

type Readwrite<T> = {
    -readonly [key in keyof T]: T[key];
};

interface WindowEventMap {
    scenechange: CustomEvent<{ scene: 'profile'; value: string }> | CustomEvent<{ scene: 'unknown' }>;
}

// https://github.com/microsoft/TypeScript/issues/29729#issuecomment-1483854699
interface Nothing {}

// We discard boolean as the default type.
type LiteralUnion<U, T = U extends string ? string : U extends number ? number : never> = U | (T & Nothing);
