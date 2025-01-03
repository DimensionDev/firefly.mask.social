import { memo } from "react";

interface PopoverProps {
    open: boolean
    onClose: () => void
    children: React.ReactNode;
}

export const Popover = memo(function Popover(props: PopoverProps) {
    return <div>{props.children}</div>
})
