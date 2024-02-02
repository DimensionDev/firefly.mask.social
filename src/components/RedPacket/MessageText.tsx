interface MessageTextProps {
    message: string;
    ContainerStyle?: React.CSSProperties;
}

export function MessageText({ message, ...props }: MessageTextProps) {
    return (
        <div style={{ fontSize: 50, fontWeight: 700, position: 'absolute', ...props.ContainerStyle }}>{message}</div>
    );
}
