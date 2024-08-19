'use client';

import { type ChangeEvent, useRef } from 'react';
import { useAsyncFn } from 'react-use';

import { uploadVideoToTwitter } from '@/services/uploadToTwitter.js';

export default function Page() {
    const videoInputRef = useRef<HTMLInputElement>(null);
    const [{ loading }, handleVideoChange] = useAsyncFn(async (event: ChangeEvent<HTMLInputElement>) => {
        try {
            const files = event.target.files;
            if (files && files.length > 0) {
                await uploadVideoToTwitter(files[0]);
            }
        } catch (error) {
            console.log('Video Debug');
            console.error(error);
        }
    }, []);

    return (
        <div>
            {loading ? 'Uploading...' : ''}
            <input type="file" accept="video/mp4" ref={videoInputRef} onChange={handleVideoChange} />
        </div>
    );
}
