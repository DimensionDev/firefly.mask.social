/// <reference types="./src/maskbook/packages/encryption/src/internal.d.ts" />
/// <reference types="./src/maskbook/packages/polyfills/types/__all.d.ts" />
/// <reference types="./src/maskbook/packages/polyfills/types/dom.d.ts" />
/// <reference types="./src/maskbook/packages/polyfills/types/firefox.d.ts" />
/// <reference types="./src/maskbook/packages/web3-telemetry/src/env.d.ts" />

declare module 'dayjs-twitter' {
    import type { PluginFunc } from 'dayjs';

    declare const plugin: PluginFunc;
    export default plugin;

    declare module 'dayjs' {
        interface Dayjs {
            twitter(): string;
        }
    }
}

declare module '*.svg' {
    const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
    export default content;
}

namespace JSX {
    interface IntrinsicElements {
        'mask-page-inspector': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'mask-decrypted-post': React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLElement> & { props: string },
            HTMLElement
        >;
        'mask-post-inspector': React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLElement> & { props: string },
            HTMLElement
        >;
    }
}
