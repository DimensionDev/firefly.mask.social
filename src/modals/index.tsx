'use client';

import { memo } from 'react';

import * as controls from '@/modals/controls.js';
import { FarcasterStatusModal } from '@/modals/FarcasterStatusModal.js';
import { LensStatusModal } from '@/modals/LensStatusModal.js';
import { LoginModal } from '@/modals/LoginModal.js';
import { LogoutModal } from '@/modals/LogoutModal.js';
import { PreviewImagesModal } from '@/modals/PreviewImagesModal.js';

export const Modals = memo(function Modals() {
    return (
        <div>
            <LoginModal ref={controls.LoginModalRef.register} />
            <LensStatusModal ref={controls.LensStatusModalRef.register} />
            <FarcasterStatusModal ref={controls.FarcasterStatusModalRef.register} />
            <LogoutModal ref={controls.LogoutModalRef.register} />
            <PreviewImagesModal ref={controls.PreviewImageModalRef.register} />
        </div>
    );
});
