'use client';

const ua = typeof window !== 'undefined' ? window.navigator.userAgent : undefined;

export const IS_SAFARI = ua?.toLowerCase().includes('safari');
export const IS_APPLE = ua?.toLowerCase().includes('apple');
