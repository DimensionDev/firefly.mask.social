'use client';

const bowser = window.bowser.getParser(window.navigator.userAgent);

export const IS_SAFARI = bowser.is('safari');
export const IS_APPLE = bowser.is('apple');
