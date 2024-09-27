import { createContext } from 'react';

export interface ActivityContextValues {
    onClaim: () => void;
    goChecklist: () => void;
    type: 'dialog' | 'page';
}

export const ActivityContext = createContext<ActivityContextValues>({
    onClaim() {},
    goChecklist() {},
    type: 'page',
});
