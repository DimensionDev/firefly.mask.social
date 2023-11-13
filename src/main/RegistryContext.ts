import { createContext,  } from 'react';
import { type RenderConfig } from '@masknet/typed-message-react';


export const RegistryContext = createContext<(type: string) => undefined | RenderConfig<any>>(() => {
    console.error(
        '[@masknet/typed-message] Please create a TypedMessageRenderRegistry and provide it via RegistryContext',
    )
    return undefined
})