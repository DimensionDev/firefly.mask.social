/* eslint-disable react/no-danger */

interface PlayerProps {
    html: string;
}

export default function Player({ html }: PlayerProps) {
    return (
        <div className="mt-4 w-full text-sm">
            <div className="oembed-player" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    );
}
