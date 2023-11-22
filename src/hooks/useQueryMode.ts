import { useMedia } from 'react-use';

// TODO: local theme mode state
export function useQueryMode() {
    const prefersDarkMode = useMedia('(prefers-color-scheme: dark)');

    return prefersDarkMode ? 'dark' : 'light';
}
