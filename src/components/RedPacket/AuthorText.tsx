interface AuthorTextProps {
    from?: string;
    ContainerStyle?: React.CSSProperties;
}

export function AuthorText({ from = 'unknown', ...props }: AuthorTextProps) {
    const authorText = `From ${from}`;

    return <div style={{ position: 'absolute', right: 40, bottom: 40, ...props.ContainerStyle }}>{authorText}</div>;
}
