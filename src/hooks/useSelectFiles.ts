import { useCallback } from 'react';

export function useSelectFiles(accept?: string) {
    const selectFiles = useCallback(async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.hidden = true;
        if (accept) input.accept = accept;
        return new Promise<FileList>((resolve) => {
            input.addEventListener('input', function onInput(event) {
                resolve((event.currentTarget as any).files as FileList);
                input.removeEventListener('input', onInput);
                document.body.removeChild(input);
            });
            input.click();
            document.body.append(input);
        });
    }, [accept]);
    return selectFiles;
}
