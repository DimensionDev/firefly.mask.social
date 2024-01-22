interface MessageTextProps {
    message?: string;
    ContainerStyle?: React.CSSProperties;
}

export function MessageText({ message = 'Best Wishes!', ...props }: MessageTextProps) {
    return (
        <div style={{ fontSize: 50, fontWeight: 400, position: 'absolute', ...props.ContainerStyle }}>{message}</div>
    );
}
