'use client';

const bowser = typeof window !== 'undefined' ? window.bowser.getParser(window.navigator.userAgent) : undefined;

export const IS_SAFARI = !!bowser?.is('safari');
export const IS_APPLE = !!bowser?.is('apple');
