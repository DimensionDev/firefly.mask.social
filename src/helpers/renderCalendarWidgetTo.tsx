import { createRoot } from 'react-dom/client';

export function renderCalendarWidgetTo(element: HTMLElement) {
    const root = createRoot(element);

    root.render(<div>Hello There</div>);

    return () => {
        root.unmount();
    };
}
