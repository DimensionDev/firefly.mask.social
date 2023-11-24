'use client';

import { memo } from 'react';

import * as controls from './controls.js';
import { FarcasterStatusModal } from './FarcasterStatusModal.js';
import { LensStatusModal } from './LensStatusModal.js';
import { LoginModal } from './LoginModal.js';

export const Modals = memo(function Modals() {
    return (
        <div>
            <LoginModal ref={controls.LoginModalRef.register} />
            <LensStatusModal ref={controls.LensStatusModalRef.register} />
            <FarcasterStatusModal ref={controls.FarcasterStatusModalRef.register} />
        </div>
    );
});
