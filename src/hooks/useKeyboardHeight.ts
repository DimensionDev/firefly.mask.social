import { useEffect, useState } from 'react';

export function useKeyboardHeight() {
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        try {
            const handler = (event: { target: { boundingRect: DOMRect } }) => {
                setKeyboardHeight(event.target.boundingRect.height || 0);
            };
            if (navigator && 'virtualKeyboard' in navigator) {
                setKeyboardHeight(navigator.virtualKeyboard?.boundingRect?.height || 0);
                navigator.virtualKeyboard.addEventListener?.('geometrychange', handler);
            }

            return () => {
                if (navigator && 'virtualKeyboard' in navigator) {
                    navigator.virtualKeyboard.removeEventListener?.('geometrychange', handler);
                }
            };
        } catch (error) {
            console.error('useKeyboardHeight error:', error);
            setKeyboardHeight(0);
            return () => {};
        }
    }, []);

    return keyboardHeight;
}
