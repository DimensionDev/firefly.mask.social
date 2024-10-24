import { type ChangeEvent, useRef } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { Image } from '@/components/Image.js';
import { ALLOWED_IMAGES_MIMES } from '@/constants/index.js';
import { uploadToDirectory } from '@/services/uploadToS3.js';

interface ImageUploadProps {
    image?: string;
    onChange?: (image: string) => void;
}

export function ImageUpload({ image, onChange }: ImageUploadProps) {
    const imageInputRef = useRef<HTMLInputElement>(null);

    const [{ loading }, handleImageChange] = useAsyncFn(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            const url = await uploadToDirectory(file, 'advertisement');
            onChange?.(url);
        },
        [onChange],
    );

    return (
        <div
            className="relative flex h-[133px] max-w-[352px] cursor-pointer items-center justify-center overflow-hidden rounded-md bg-bg"
            onClick={() => {
                imageInputRef.current?.click();
            }}
        >
            {loading ? (
                <LoadingIcon className="h-10 w-10 animate-spin" />
            ) : image ? (
                <Image src={image} alt={image} width={352} height={133} className="h-full w-full object-contain" />
            ) : (
                <span className="text-lg text-secondary">Click to select Image</span>
            )}
            <input
                type="file"
                accept={ALLOWED_IMAGES_MIMES.join(', ')}
                multiple
                ref={imageInputRef}
                className="hidden"
                onChange={handleImageChange}
            />
        </div>
    );
}
