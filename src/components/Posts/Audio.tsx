import { memo, useRef, useState } from 'react';

interface AudioProps {
    src: string;
    poster: string;
}

export const Audio = memo(function Audio() {
    const [playing, setPlaying] = useState(false);
    const playerRef = useRef(null);
    const imageRef = useRef(null);

    return null;
});
