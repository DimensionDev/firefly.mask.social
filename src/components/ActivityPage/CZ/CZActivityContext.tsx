import { createContext } from 'react';

export interface CZActivityContextValues {
    onClaim: () => void;
    goChecklist: () => void;
    type: 'dialog' | 'page';
}

export const CZActivityContext = createContext<CZActivityContextValues>({
    onClaim() {},
    goChecklist() {},
    type: 'page',
});
