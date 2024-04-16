'use client';

import { useRouter } from 'next/navigation.js';

import { Modal } from '@/components/Modal.js';

export default function PreviewPhotoModal() {
    const router = useRouter();
    return (
        <Modal
            open
            backdrop={false}
            onClose={() => {
                router.back();
            }}
        >
            <div
                className=" preview-actions fixed inset-0 flex transform-none flex-col items-center justify-center bg-black/90 bg-opacity-90 transition-all"
                onClick={() => router.back()}
            >
                Preview Image
            </div>
        </Modal>
    );
}
