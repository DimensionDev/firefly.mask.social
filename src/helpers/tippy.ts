import type { TippyProps } from "@tippyjs/react";

const DURATION = [100, 0] as [number, number]

export function getInteractiveTippyProps(overrides?: TippyProps): TippyProps {
    return {
        duration: DURATION,
        delay: 1000,
        arrow: false,
        trigger: "mouseenter",
        hideOnClick: true,
        interactive: true,
        ...overrides,
    } satisfies TippyProps
}
